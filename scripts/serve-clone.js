/**
 * Local server for the Revonix site clone with Next.js hydration support.
 * - Serves project root
 * - Resolves /path -> /path/index.html
 * - Serves /_next/image?url=... from local assets
 * - Proxies missing /_next/* and /assets/* to the live origin as fallback
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.env.PORT || 4173);
const ORIGIN = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, "clone-meta.json"), "utf8")).origin;
  } catch {
    return "https://revonix.co";
  }
})();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".mp4": "video/mp4",
  ".map": "application/json",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function contentType(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent(reqPath.split("?")[0]);
  const cleaned = decoded.replace(/^\/+/, "");
  const full = path.normalize(path.join(root, cleaned));
  if (!full.startsWith(root)) return null;
  return full;
}

function resolveLocal(reqPath) {
  const bare = reqPath.split("?")[0];
  let file = safeJoin(ROOT, bare);
  if (!file) return null;
  if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    const idx = path.join(file, "index.html");
    if (fs.existsSync(idx)) return idx;
  }
  const asIndex = safeJoin(ROOT, bare.replace(/\/?$/, "/") + "index.html");
  if (asIndex && fs.existsSync(asIndex)) return asIndex;
  return null;
}

async function proxyOrigin(reqPathWithQuery) {
  const url = ORIGIN + reqPathWithQuery;
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const type = res.headers.get("content-type") || "application/octet-stream";
  return { buf, type };
}

function handleNextImage(searchParams) {
  const raw = searchParams.get("url");
  if (!raw) return null;
  let assetPath;
  try {
    assetPath = decodeURIComponent(raw);
  } catch {
    return null;
  }
  if (!assetPath.startsWith("/")) return null;
  return resolveLocal(assetPath);
}

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url || "/", `http://localhost:${PORT}`);
    const pathname = u.pathname;

    if (pathname === "/_next/image") {
      const local = handleNextImage(u.searchParams);
      if (local) {
        return send(res, 200, fs.readFileSync(local), {
          "Content-Type": contentType(local),
          "Cache-Control": "public, max-age=86400",
        });
      }
      const proxied = await proxyOrigin(req.url);
      if (proxied) {
        return send(res, 200, proxied.buf, {
          "Content-Type": proxied.type,
          "Cache-Control": "public, max-age=3600",
        });
      }
      return send(res, 404, "image not found");
    }

    const local = resolveLocal(pathname);
    if (local) {
      return send(res, 200, fs.readFileSync(local), {
        "Content-Type": contentType(local),
        "Cache-Control": pathname.startsWith("/_next/")
          ? "public, max-age=31536000, immutable"
          : "no-cache",
      });
    }

    if (pathname.startsWith("/_next/") || pathname.startsWith("/assets/")) {
      const proxied = await proxyOrigin(pathname + u.search);
      if (proxied) {
        const dest = safeJoin(ROOT, pathname);
        if (dest) {
          try {
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.writeFileSync(dest, proxied.buf);
          } catch {
            /* ignore */
          }
        }
        return send(res, 200, proxied.buf, {
          "Content-Type": proxied.type,
          "Cache-Control": "public, max-age=3600",
        });
      }
    }

    send(res, 404, "Not found: " + pathname, { "Content-Type": "text/plain; charset=utf-8" });
  } catch (e) {
    console.error(e);
    send(res, 500, "Server error", { "Content-Type": "text/plain; charset=utf-8" });
  }
});

server.listen(PORT, () => {
  console.log(`Revonix at http://localhost:${PORT}`);
  console.log(`Origin fallback: ${ORIGIN}`);
  console.log(`Root: ${ROOT}`);
});
