import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const port = process.env.PORT ? Number(process.env.PORT) : 8866;

const server = http.createServer(async (req, res) => {
  try {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    let fsPath = path.join(root, url);
    const st = await stat(fsPath).catch(() => null);
    if (!st) {
      res.statusCode = 404; res.end('Not found'); return;
    }
    if (st.isDirectory()) {
      // Minimal index for directories
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(`<!doctype html><meta charset=\"utf-8\"><title>Index</title><h1>Index of ${url}</h1>`);
      return;
    }
    // Basic content-type guessing
    const setType = (t) => res.setHeader('Content-Type', `${t}; charset=utf-8`);
    if (fsPath.endsWith('.html')) setType('text/html');
    else if (fsPath.endsWith('.js') || fsPath.endsWith('.mjs')) setType('application/javascript');
    else if (fsPath.endsWith('.css')) setType('text/css');
    else if (fsPath.endsWith('.json')) setType('application/json');
    else if (fsPath.endsWith('.svg')) setType('image/svg+xml');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    const buf = await readFile(fsPath);
    res.end(buf);
  } catch (err) {
    res.statusCode = 500; res.end(String(err));
  }
});

server.listen(port, () => {
  console.log(`[static] Serving ${root} on http://localhost:${port}`);
});
