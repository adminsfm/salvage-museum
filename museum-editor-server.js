const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = process.env.PORT || 4173;
const BACKUP_DIR = path.join(ROOT, ".editor-backups");

function send(res, status, body, type = "application/json") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function json(res, status, data) {
  send(res, status, JSON.stringify(data), "application/json");
}

function readRequest(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function pagePath(file) {
  const clean = path.basename(String(file || ""));
  if (!clean.endsWith(".html")) {
    throw new Error("Only website pages ending in .html can be edited.");
  }
  return path.join(ROOT, clean);
}

function imagePath(file) {
  const clean = path.basename(String(file || ""));
  return path.join(ROOT, "images", clean);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "new-page";
}

function titleFromHtml(html, fallback) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, " ").trim() : fallback;
}

function backup(file, content) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.writeFileSync(path.join(BACKUP_DIR, `${path.basename(file)}.${stamp}.bak`), content);
}

function commonNav() {
  return `<nav>
<a href="index.html">Home</a>
<a href="history.html">History</a>
<a href="exhibits.html">Exhibits</a>
<a href="collection.html">Collection</a>
<a href="discover.html">Discover</a>
<a href="gift-shop.html">Gift Shop</a>
<a href="support.html">Support</a>
<a href="contact.html">Contact</a>
</nav>`;
}

function newPageTemplate(title) {
  const safeTitle = escapeHtml(title);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${safeTitle} | Salvage Fisherman's Museum</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
<header>
<div class="logo">
<h1>Salvage Fisherman's Museum</h1>
<p>${safeTitle}</p>
</div>
${commonNav()}
</header>
<section class="page-header">
<h2>${safeTitle}</h2>
<p>Add a short introduction here.</p>
</section>
<section class="content">
<h2>New Section</h2>
<p>Start writing your page content here.</p>
</section>
<footer>
<p>Salvage Fisherman's Museum</p>
<p>52 Mountainview Rd, Salvage, NL, A0G 0J2</p>
<p><a href="mailto:salvagefishermansmuseum@gmail.com">salvagefishermansmuseum@gmail.com</a></p>
</footer>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseMultipart(buffer, contentType) {
  const boundaryMatch = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || "");
  if (!boundaryMatch) {
    throw new Error("No upload boundary found.");
  }

  const boundary = Buffer.from(`--${boundaryMatch[1] || boundaryMatch[2]}`);
  const parts = [];
  let start = buffer.indexOf(boundary);

  while (start !== -1) {
    start += boundary.length;
    if (buffer[start] === 45 && buffer[start + 1] === 45) break;
    if (buffer[start] === 13 && buffer[start + 1] === 10) start += 2;

    const next = buffer.indexOf(boundary, start);
    if (next === -1) break;

    let part = buffer.slice(start, next);
    if (part[part.length - 2] === 13 && part[part.length - 1] === 10) {
      part = part.slice(0, -2);
    }

    const divider = part.indexOf(Buffer.from("\r\n\r\n"));
    if (divider !== -1) {
      const headers = part.slice(0, divider).toString("latin1");
      const body = part.slice(divider + 4);
      const name = /name="([^"]+)"/i.exec(headers);
      const filename = /filename="([^"]*)"/i.exec(headers);
      parts.push({
        name: name && name[1],
        filename: filename && filename[1],
        body
      });
    }

    start = next;
  }

  return parts;
}

function listPages() {
  const hiddenPages = new Set([
    "staff-editor.html",
    "gallery.html",
    "products.html"
  ]);

  return fs.readdirSync(ROOT)
    .filter(file => file.endsWith(".html"))
    .filter(file => !hiddenPages.has(file))
    .sort((a, b) => (a === "index.html" ? -1 : b === "index.html" ? 1 : a.localeCompare(b)))
    .map(file => {
      const html = fs.readFileSync(path.join(ROOT, file), "utf8");
      return { file, title: titleFromHtml(html, file) };
    });
}

function listImages() {
  const dir = path.join(ROOT, "images");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(file => /\.(png|jpe?g|gif|webp|svg)$/i.test(file))
    .sort()
    .map(file => `images/${file}`);
}

function appHtml() {
  const editorPath = path.join(ROOT, "staff-editor.html");
  if (fs.existsSync(editorPath)) {
    return fs.readFileSync(editorPath, "utf8");
  }
  return "<!DOCTYPE html><html><body><h1>Missing staff-editor.html</h1><p>Place staff-editor.html in the same folder as museum-editor-server.js.</p></body></html>";
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/pages") {
    return json(res, 200, listPages());
  }

  if (req.method === "GET" && url.pathname === "/api/images") {
    return json(res, 200, listImages());
  }

  if (req.method === "GET" && url.pathname === "/api/page") {
    const file = url.searchParams.get("file");
    const target = pagePath(file);
    if (!fs.existsSync(target)) return json(res, 404, { error: "Page not found." });
    return json(res, 200, { file: path.basename(target), html: fs.readFileSync(target, "utf8") });
  }

  if (req.method === "POST" && url.pathname === "/api/page") {
    const body = JSON.parse((await readRequest(req)).toString("utf8"));
    const target = pagePath(body.file);
    const html = String(body.html || "");
    if (!html.includes("<html") || !html.includes("</html>")) {
      return json(res, 400, { error: "That does not look like a complete webpage." });
    }
    if (fs.existsSync(target)) backup(target, fs.readFileSync(target, "utf8"));
    fs.writeFileSync(target, html);
    return json(res, 200, { ok: true });
  }

  if (req.method === "POST" && url.pathname === "/api/create-page") {
    const body = JSON.parse((await readRequest(req)).toString("utf8"));
    const title = String(body.title || "").trim();
    if (!title) return json(res, 400, { error: "A page title is required." });

    let filename = `${slugify(title)}.html`;
    let counter = 2;
    while (fs.existsSync(pagePath(filename))) {
      filename = `${slugify(title)}-${counter}.html`;
      counter += 1;
    }

    fs.writeFileSync(pagePath(filename), newPageTemplate(title));
    return json(res, 200, { file: filename });
  }

  if (req.method === "POST" && url.pathname === "/api/delete-page") {
    const body = JSON.parse((await readRequest(req)).toString("utf8"));
    const filename = path.basename(String(body.file || ""));
    const protectedPages = new Set([
      "index.html",
      "staff-editor.html",
      "products.html",
      "gallery.html"
    ]);

    if (!filename.endsWith(".html")) return json(res, 400, { error: "Only website pages can be deleted." });
    if (protectedPages.has(filename)) return json(res, 400, { error: "That page is protected and cannot be deleted here." });

    const target = pagePath(filename);
    if (!fs.existsSync(target)) return json(res, 404, { error: "Page not found." });
    backup(target, fs.readFileSync(target, "utf8"));
    fs.unlinkSync(target);
    return json(res, 200, { ok: true });
  }

  if (req.method === "POST" && url.pathname === "/api/upload-image") {
    const buffer = await readRequest(req);
    const parts = parseMultipart(buffer, req.headers["content-type"]);
    const image = parts.find(part => part.filename);
    if (!image) return json(res, 400, { error: "No image was uploaded." });

    fs.mkdirSync(path.join(ROOT, "images"), { recursive: true });
    const ext = path.extname(image.filename).toLowerCase() || ".jpg";
    const base = slugify(path.basename(image.filename, ext));
    let filename = `${base}${ext}`;
    let counter = 2;
    while (fs.existsSync(imagePath(filename))) {
      filename = `${base}-${counter}${ext}`;
      counter += 1;
    }
    fs.writeFileSync(imagePath(filename), image.body);
    return json(res, 200, { src: `images/${filename}` });
  }

  if (req.method === "POST" && url.pathname === "/api/payment") {
    const body = JSON.parse((await readRequest(req)).toString("utf8"));
    const embed = String(body.embed || "").trim();
    if (!embed) return json(res, 400, { error: "Embed code is required." });

    const target = pagePath("support.html");
    let html = fs.readFileSync(target, "utf8");
    backup(target, html);
    const replacement = `<section id="donate" class="content">
<h2>Donation Portal</h2>
${embed}
</section>`;
    if (/<section id="donate" class="content">[\s\S]*?<\/section>/i.test(html)) {
      html = html.replace(/<section id="donate" class="content">[\s\S]*?<\/section>/i, replacement);
    } else {
      html = html.replace(/<\/body>/i, `${replacement}\n</body>`);
    }
    fs.writeFileSync(target, html);
    return json(res, 200, { ok: true });
  }

  return json(res, 404, { error: "Not found." });
}

function serveStatic(req, res, url) {
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const target = path.normalize(path.join(ROOT, requested));
  if (!target.startsWith(ROOT)) return send(res, 403, "Forbidden", "text/plain");
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    return send(res, 404, "Not found", "text/plain");
  }

  const ext = path.extname(target).toLowerCase();
  const type = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml"
  }[ext] || "application/octet-stream";

  send(res, 200, fs.readFileSync(target), type);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/editor") {
      return send(res, 200, appHtml(), "text/html; charset=utf-8");
    }
    if (url.pathname.startsWith("/api/")) {
      return handleApi(req, res, url);
    }
    return serveStatic(req, res, url);
  } catch (error) {
    return json(res, 500, { error: error.message });
  }
});

server.on("error", error => {
  if (error.code === "EADDRINUSE") {
    console.log(`The editor already appears to be running at http://localhost:${PORT}/editor`);
    console.log("Open that address in your browser, or close the other editor window and try again.");
    return;
  }
  console.error("The editor could not start:");
  console.error(error.message);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Museum editor is running at http://localhost:${PORT}/editor`);
  console.log("Press Ctrl+C to stop it.");
});
