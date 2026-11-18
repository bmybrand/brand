const fs = require("fs");
const path = require("path");

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

module.exports = (req, res) => {
  try {
    const raw = typeof req.query.url === "string" ? req.query.url : "";
    if (!raw || !raw.startsWith("/") || raw.includes("..")) {
      res.statusCode = 400;
      return res.end("bad url");
    }

    const filePath = path.join(process.cwd(), raw.replace(/^\/+/, ""));
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.statusCode = 404;
      return res.end("not found");
    }

    const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.setHeader("Content-Type", type);
    res.setHeader("Cache-Control", "public, max-age=86400");
    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    res.statusCode = 500;
    res.end("error");
  }
};
