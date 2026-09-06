const http = require("http");
const fs   = require("fs");
const path = require("path");

const HOST = "127.0.0.1";
const PORT = 8790;

const WAR_ROOM_HOST = "127.0.0.1";
const WAR_ROOM_PORT = 8787;

const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
};

// ── ElevenLabs voice configuration ───────────────────────────────────────────
// Set these environment variables before starting the Chamber:
//   ELEVENLABS_API_KEY          — your ElevenLabs secret key
//   ELEVENLABS_VOICE_PRIMEDOX   — voice ID for PrimeDox AI  (The Scholar)
//   ELEVENLABS_VOICE_VIGILAX    — voice ID for Vigilax AI   (The Sentinel)
//   ELEVENLABS_VOICE_SOULSTACK  — voice ID for SoulStack AI (The Strategist)
//
// Voice IDs come from your ElevenLabs dashboard → Voices → click a voice → ID.
// Leave unset to serve audio gracefully degraded (TTS endpoint returns 503).
const VOICE_IDS = {
  primedox:  process.env.ELEVENLABS_VOICE_PRIMEDOX  || null,
  vigilax:   process.env.ELEVENLABS_VOICE_VIGILAX   || null,
  soulstack: process.env.ELEVENLABS_VOICE_SOULSTACK || null,
};

const ALLOWED_EXECUTIVES = ["primedox", "vigilax", "soulstack"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function json(res, status, body) {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    "Content-Type":  "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(payload);
}

function proxy(req, res) {
  const options = {
    hostname: WAR_ROOM_HOST,
    port:     WAR_ROOM_PORT,
    path:     req.url,
    method:   req.method,
    headers: {
      "content-type": req.headers["content-type"] || "application/json",
    },
  };

  const upstream = http.request(options, upstreamRes => {
    res.writeHead(upstreamRes.statusCode || 502, {
      "Content-Type":
        upstreamRes.headers["content-type"] ||
        "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    upstreamRes.pipe(res);
  });

  upstream.on("error", err => {
    json(res, 502, {
      ok:      false,
      error:   "WAR_ROOM_UNAVAILABLE",
      message: err.message,
    });
  });

  req.pipe(upstream);
}

function serveFile(req, res) {
  let requested = req.url.split("?")[0];
  if (requested === "/" || requested === "") requested = "/index.html";

  const normalized = path.normalize(requested).replace(/^(\.\.[/\\])+/, "");
  const filePath   = path.join(ROOT, normalized);

  if (!filePath.startsWith(ROOT)) {
    return json(res, 403, { ok: false, error: "FORBIDDEN" });
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      return json(res, 404, { ok: false, error: "NOT_FOUND" });
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type":  MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

// ── ElevenLabs TTS endpoint ───────────────────────────────────────────────────
// Server reads ELEVENLABS_API_KEY from process.env only.
// The key is never logged, never sent to the browser, never included in any
// response body or header visible to the client.
async function handleVoiceToken(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    return json(res, 503, {
      ok:    false,
      error: "TTS_UNAVAILABLE",
      hint:  "Set ELEVENLABS_API_KEY to enable voice output.",
    });
  }

  let body = "";
  req.on("data", chunk => {
    body += chunk;
    if (body.length > 8192) req.destroy();  // guard against oversized requests
  });

  req.on("end", async () => {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      return json(res, 400, { ok: false, error: "INVALID_JSON" });
    }

    const { text, executive_id } = parsed;

    // Validate executive ID against exact allowlist
    if (!ALLOWED_EXECUTIVES.includes(executive_id)) {
      return json(res, 400, { ok: false, error: "INVALID_EXECUTIVE_ID" });
    }

    // Validate and sanitise text
    const rawText = String(text || "");
    if (!rawText.trim()) {
      return json(res, 400, { ok: false, error: "EMPTY_TEXT" });
    }
    // Strip control characters, cap at 2000 chars (TTS billing protection)
    const safeText = rawText
      .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "")
      .slice(0, 2000);

    const voiceId = VOICE_IDS[executive_id];
    if (!voiceId) {
      return json(res, 503, {
        ok:    false,
        error: "VOICE_ID_NOT_CONFIGURED",
        hint:  `Set ELEVENLABS_VOICE_${executive_id.toUpperCase()} to enable voice for this executive.`,
      });
    }

    try {
      const upstream = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "xi-api-key":   key,        // key stays server-side
            "Content-Type": "application/json",
            "Accept":       "audio/mpeg",
          },
          body: JSON.stringify({
            text:       safeText,
            model_id:   "eleven_flash_v2_5",
            voice_settings: {
              stability:        0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!upstream.ok) {
        return json(res, 502, { ok: false, error: "TTS_UPSTREAM_ERROR" });
      }

      res.writeHead(200, {
        "Content-Type":  "audio/mpeg",
        "Cache-Control": "no-store",
      });

      // Stream audio bytes to browser without buffering the full response
      const reader = upstream.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) { res.end(); break; }
          if (!res.write(Buffer.from(value))) {
            await new Promise(r => res.once("drain", r));
          }
        }
      };
      pump().catch(() => res.end());

    } catch (err) {
      json(res, 500, { ok: false, error: "TTS_INTERNAL_ERROR" });
    }
  });
}

// ── Request router ────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {

  // 1. War Room proxy — avatars and council only
  if (
    (req.method === "GET"  && req.url.startsWith("/api/avatars")) ||
    (req.method === "POST" && req.url.startsWith("/api/council"))
  ) {
    return proxy(req, res);
  }

  // 2. ElevenLabs TTS — server-mediated, key never exposed to client
  if (req.url.startsWith("/api/voice-token")) {
    return handleVoiceToken(req, res);
  }

  // 3. All other /api/* paths blocked — boundary preserved
  if (req.url.startsWith("/api/")) {
    return json(res, 403, {
      ok:      false,
      error:   "EXECUTIVE_CHAMBER_API_BOUNDARY",
      message: "This bridge exposes only the validated avatar, council, and voice endpoints.",
    });
  }

  // 4. Static file serving (index.html, app.js, style.css)
  serveFile(req, res);
});

server.listen(PORT, HOST, () => {
  const voiceReady = ALLOWED_EXECUTIVES
    .filter(id => VOICE_IDS[id])
    .map(id => id);

  console.log("");
  console.log("============================================================");
  console.log("FHI EXECUTIVE CHAMBER — Phase 1 Voice Vertical Slice");
  console.log("============================================================");
  console.log(`LOCAL:     http://${HOST}:${PORT}`);
  console.log(`WAR ROOM:  http://${WAR_ROOM_HOST}:${WAR_ROOM_PORT}`);
  console.log("");
  console.log("EXPOSED:");
  console.log("GET  /api/avatars      → War Room proxy");
  console.log("POST /api/council      → War Room proxy");
  console.log("POST /api/voice-token  → ElevenLabs TTS (server-side key)");
  console.log("");
  console.log("VOICE:");
  if (process.env.ELEVENLABS_API_KEY) {
    console.log(`  API key:    configured`);
    console.log(`  Voices ready: ${voiceReady.length ? voiceReady.join(", ") : "none — set ELEVENLABS_VOICE_* vars"}`);
  } else {
    console.log("  TTS: UNAVAILABLE — set ELEVENLABS_API_KEY to enable");
  }
  console.log("");
  console.log("BLOCKED:");
  console.log("financial execution  |  legal execution");
  console.log("security execution   |  production deployment");
  console.log("credential access    |  destructive actions");
  console.log("============================================================");
});
