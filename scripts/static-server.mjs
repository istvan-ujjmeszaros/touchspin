import { readFile, stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

const root = process.cwd();
const port = process.env.PORT ? Number(process.env.PORT) : 8866;

/**
 * HTML escape utility to prevent XSS
 */
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate that the resolved path is within the root directory (prevents path traversal)
 */
function isPathSafe(resolvedPath, rootPath) {
  return resolvedPath.startsWith(rootPath);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    // Resolve the path and validate it's within root (prevents path traversal attacks)
    const fsPath = path.resolve(root, url.slice(1)); // Remove leading slash

    if (!isPathSafe(fsPath, root)) {
      res.statusCode = 403;
      res.end('Forbidden: Path traversal detected');
      return;
    }

    const st = await stat(fsPath).catch(() => null);
    if (!st) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    if (st.isDirectory()) {
      // Minimal index for directories
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      // Escape URL to prevent XSS attacks
      res.end(
        `<!doctype html><meta charset="utf-8"><title>Index</title><h1>Index of ${escapeHtml(url)}</h1>`
      );
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
    res.statusCode = 500;
    res.end(String(err));
  }
});

server.listen(port, () => {
  console.log(`[static] Serving ${root} on http://localhost:${port}`);
});
