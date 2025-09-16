#!/usr/bin/env node
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import url from 'node:url';

const args = process.argv.slice(2);
let port = 8866;
for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--port' || args[i] === '-p') && args[i + 1]) {
    port = Number(args[i + 1]);
    i++;
  }
}

const root = process.cwd();
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.cjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8'
};

function send(res, code, body, type = 'text/plain') {
  res.writeHead(code, {
    'Content-Type': type,
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  try {
    const parsed = url.parse(req.url || '/');
    let pathname = decodeURIComponent(parsed.pathname || '/');

    // Default to examples hub if root
    if (pathname === '/' || pathname === '') pathname = '/examples/index.html';

    const filePath = path.join(root, pathname);
    // Prevent path traversal
    if (!filePath.startsWith(root)) return send(res, 403, 'Forbidden');

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const type = mime[ext] || 'application/octet-stream';
      fs.createReadStream(filePath).on('error', () => send(res, 500, 'Read error')).pipe(res);
      res.writeHead(200, { 'Content-Type': type });
    } else if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      if (fs.existsSync(indexPath)) {
        fs.createReadStream(indexPath).on('error', () => send(res, 500, 'Read error')).pipe(res);
        res.writeHead(200, { 'Content-Type': mime['.html'] });
      } else {
        send(res, 404, 'Not Found');
      }
    } else {
      send(res, 404, 'Not Found');
    }
  } catch (e) {
    send(res, 500, 'Server error');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`[static-server] Serving ${root} on http://localhost:${port}`);
});

