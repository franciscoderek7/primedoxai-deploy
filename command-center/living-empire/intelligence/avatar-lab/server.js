const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const ROOT = path.resolve(__dirname, "../..");
const LAB = __dirname;
const INT = path.join(ROOT, "intelligence");
const ENGINE = path.join(INT, "council/council-engine.js");

const PORT = 8787;
const HOST = "127.0.0.1";

const avatars = ["primedox", "vigilax", "soulstack"];

function json(res, code, data) {
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(data, null, 2));
}

function safeAvatar(name) {
  return avatars.includes(name) ? name : null;
}

function readAvatar(name) {
  const file = path.join(INT, "avatars", `${name}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function runCouncil(question, callback) {
  if (!fs.existsSync(ENGINE)) {
    return callback(new Error("Council engine not found."));
  }

  execFile(
    process.execPath,
    [ENGINE, question],
    {
      cwd: ROOT,
      timeout: 30000,
      maxBuffer: 1024 * 1024
    },
    (error, stdout, stderr) => {
      if (error) {
        return callback(new Error(stderr || error.message));
      }

      callback(null, {
        output: stdout.trim(),
        stderr: stderr.trim()
      });
    }
  );
}

function serveFile(res, file) {
  if (!fs.existsSync(file)) {
    res.writeHead(404);
    return res.end("Not found");
  }

  const ext = path.extname(file);
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8"
  };

  res.writeHead(200, {
    "Content-Type": types[ext] || "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });

  fs.createReadStream(file).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);

  if (req.method === "GET" && url.pathname === "/api/avatars") {
    try {
      const data = avatars.map(readAvatar);
      return json(res, 200, { ok: true, avatars: data });
    } catch (e) {
      return json(res, 500, { ok: false, error: e.message });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/council") {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
      if (body.length > 10000) req.destroy();
    });

    req.on("end", () => {
      try {
        const parsed = JSON.parse(body);
        const question = String(parsed.question || "").trim();

        if (!question) {
          return json(res, 400, {
            ok: false,
            error: "A question is required."
          });
        }

        if (question.length > 4000) {
          return json(res, 400, {
            ok: false,
            error: "Question exceeds 4000 characters."
          });
        }

        runCouncil(question, (error, result) => {
          if (error) {
            return json(res, 500, {
              ok: false,
              error: error.message,
              mode: "council-unavailable"
            });
          }

          json(res, 200, {
            ok: true,
            mode: "proposal-only",
            humanApprovalRequired: true,
            result
          });
        });
      } catch (e) {
        json(res, 400, { ok: false, error: "Invalid JSON request." });
      }
    });

    return;
  }

  let requested = url.pathname === "/" ? "/index.html" : url.pathname;

  // Prevent path traversal.
  const file = path.resolve(LAB, "." + requested);

  if (!file.startsWith(LAB + path.sep) && file !== path.join(LAB, "index.html")) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  serveFile(res, file);
});

server.listen(PORT, HOST, () => {
  console.log("");
  console.log("============================================================");
  console.log("FHI EXECUTIVE WAR ROOM v0.2");
  console.log("============================================================");
  console.log(`LOCAL ONLY: http://${HOST}:${PORT}`);
  console.log("");
  console.log("PrimeDox  = Scholar");
  console.log("Vigilax   = Sentinel");
  console.log("SoulStack = Strategist");
  console.log("");
  console.log("COUNCIL MODE: PROPOSAL ONLY");
  console.log("HUMAN APPROVAL: REQUIRED");
  console.log("PAYMENTS: NO ACCESS");
  console.log("CREDENTIALS: NO ACCESS");
  console.log("PRODUCTION: NO ACCESS");
  console.log("DEPLOYMENT: NO ACCESS");
  console.log("============================================================");
});
