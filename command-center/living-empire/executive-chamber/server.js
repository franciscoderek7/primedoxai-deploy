const http = require("http");
const fs = require("fs");
const path = require("path");

const HOST = "127.0.0.1";
const PORT = 8790;

const WAR_ROOM_HOST = "127.0.0.1";
const WAR_ROOM_PORT = 8787;

const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function json(res, status, body) {
  const payload = JSON.stringify(body, null, 2);

  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });

  res.end(payload);
}

function proxy(req, res) {
  const options = {
    hostname: WAR_ROOM_HOST,
    port: WAR_ROOM_PORT,
    path: req.url,
    method: req.method,
    headers: {
      "content-type": req.headers["content-type"] || "application/json"
    }
  };

  const upstream = http.request(options, upstreamRes => {
    res.writeHead(upstreamRes.statusCode || 502, {
      "Content-Type":
        upstreamRes.headers["content-type"] ||
        "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    });

    upstreamRes.pipe(res);
  });

  upstream.on("error", err => {
    json(res, 502, {
      ok: false,
      error: "WAR_ROOM_UNAVAILABLE",
      message: err.message
    });
  });

  req.pipe(upstream);
}

function serveFile(req, res) {
  let requested = req.url.split("?")[0];

  if (requested === "/" || requested === "") {
    requested = "/index.html";
  }

  const normalized = path.normalize(requested).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, normalized);

  if (!filePath.startsWith(ROOT)) {
    return json(res, 403, {
      ok: false,
      error: "FORBIDDEN"
    });
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      return json(res, 404, {
        ok: false,
        error: "NOT_FOUND"
      });
    }

    const ext = path.extname(filePath).toLowerCase();

    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });

    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  if (
    (req.method === "GET" && req.url.startsWith("/api/avatars")) ||
    (req.method === "POST" && req.url.startsWith("/api/council"))
  ) {
    return proxy(req, res);
  }

  if (req.url.startsWith("/api/")) {
    return json(res, 403, {
      ok: false,
      error: "EXECUTIVE_CHAMBER_API_BOUNDARY",
      message: "This bridge exposes only the validated avatar and council proposal endpoints."
    });
  }

  serveFile(req, res);
});

server.listen(PORT, HOST, () => {
  console.log("");
  console.log("============================================================");
  console.log("FHI EXECUTIVE CHAMBER");
  console.log("============================================================");
  console.log(`LOCAL:     http://${HOST}:${PORT}`);
  console.log(`WAR ROOM:  http://${WAR_ROOM_HOST}:${WAR_ROOM_PORT}`);
  console.log("");
  console.log("EXPOSED:");
  console.log("GET  /api/avatars");
  console.log("POST /api/council");
  console.log("");
  console.log("BLOCKED:");
  console.log("financial execution");
  console.log("legal execution");
  console.log("security execution");
  console.log("production deployment");
  console.log("credential access");
  console.log("destructive actions");
  console.log("============================================================");
});
