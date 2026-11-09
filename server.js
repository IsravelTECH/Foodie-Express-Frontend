const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(urlObj.pathname);

  // Normalize path
  if (pathname.endsWith('/') || pathname === '') {
    pathname += 'index.html';
  }

  let filePath = path.join(ROOT, pathname);

  // If path doesn't have an extension, try appending .html
  if (!path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  // Prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Check customer fallback
      const customerFilePath = path.join(ROOT, 'customer', pathname);
      if (fs.existsSync(customerFilePath) && fs.statSync(customerFilePath).isFile()) {
        serveFile(customerFilePath, res, req);
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${pathname}`);
      return;
    }

    serveFile(filePath, res, req);
  });
});

function serveFile(filePath, res, req) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Handle Range requests for video
  const stat = fs.statSync(filePath);
  const total = stat.size;
  const range = req.headers.range;

  if (range && (ext === '.mp4' || ext === '.webm')) {
    const parts = range.replace(/bytes=/, '').split('-');
    const partialstart = parts[0];
    const partialend = parts[1];

    const start = parseInt(partialstart, 10);
    const end = partialend ? parseInt(partialend, 10) : total - 1;
    const chunksize = (end - start) + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    const fileStream = fs.createReadStream(filePath, { start, end });
    fileStream.pipe(res);
    return;
  }

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': total,
    'Access-Control-Allow-Origin': '*'
  });

  fs.createReadStream(filePath).pipe(res);
}

server.listen(PORT, () => {
  console.log(`Foodie Express Frontend server running at http://localhost:${PORT}`);
  console.log(`- Customer Portal: http://localhost:${PORT}/customer/index.html`);
  console.log(`- Admin Portal:    http://localhost:${PORT}/admin/dashboard.html`);
  console.log(`- Supervisor:      http://localhost:${PORT}/supervisor/dashboard.html`);
});
