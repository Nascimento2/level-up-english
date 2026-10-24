// Servidor simples para o Render (serviço web): entrega os arquivos da pasta public/.
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "public");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".webmanifest": "application/manifest+json", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json" };
http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || "/").split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const file = path.join(ROOT, path.normalize(p).replace(/^(\.\.[\/\\])+/, ""));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { fs.readFile(path.join(ROOT, "index.html"), (e2, d2) => { res.writeHead(e2 ? 404 : 200, { "Content-Type": TYPES[".html"] }); res.end(d2 || "Não encontrado"); }); return; }
    const ext = path.extname(file);
    res.writeHead(200, { "Content-Type": TYPES[ext] || "application/octet-stream", "Cache-Control": ext === ".html" || file.endsWith("sw.js") ? "no-cache" : "public, max-age=3600" });
    res.end(data);
  });
}).listen(process.env.PORT || 3000, () => console.log("Level Up English no ar"));
