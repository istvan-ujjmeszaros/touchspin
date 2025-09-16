import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

// Root dev server for examples across all packages
// - Serves the repository as a static site with HMR for TS/JS modules
// - Keep dev port at 8866 (strict) for local tooling compatibility
export default defineConfig({
  server: {
    open: '/',
    port: 8866,
    strictPort: true,
    fs: {
      // Allow serving files from the project root (monorepo)
      strict: true,
      allow: [process.cwd()]
    }
  },
  plugins: [
    // Virtual index pages to browse HTML files during development
    {
      name: 'touchspin-html-indexes',
      configureServer(server) {
        const fsAllow = process.cwd();
        const exts = ['.html', '.htm'];
        const path = require('node:path');
        const fs = require('node:fs');

        const EXCLUDE_DIRS = new Set([
          '.git', '.yarn', 'node_modules', 'dist', 'reports', 'coverage', 'tmp', 'off', '.idea'
        ]);

        function walk(dir, out) {
          let entries: Array<import('node:fs').Dirent> = [];
          try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
          } catch {
            return;
          }
          for (const e of entries) {
            if (e.name.startsWith('.DS_')) continue;
            const full = path.join(dir, e.name);
            const rel = path.relative(fsAllow, full);
            if (e.isDirectory()) {
              if (EXCLUDE_DIRS.has(e.name)) continue;
              walk(full, out);
            } else if (e.isFile()) {
              const ext = path.extname(e.name).toLowerCase();
              if (exts.includes(ext)) out.push('/' + rel.replace(/\\/g, '/'));
            }
          }
        }

        function renderIndex(title: string, items: Array<{ href: string; label?: string }>) {
          const list = items
            .map(i => `<li><a href="${i.href}">${i.label || i.href}</a></li>`)
            .join('');
          const total = items.length;
          return `<!doctype html>
<meta charset="utf-8">
<title>${title}</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; margin: 24px; line-height: 1.45; }
  h1 { margin: 0 0 12px; font-size: 20px; }
  #filter { padding: 8px 10px; width: 100%; max-width: 520px; border: 1px solid #ccc; border-radius: 6px; }
  #meta { margin: 8px 0 16px; color: #666; font-size: 12px; }
  ul { list-style: none; padding: 0; margin: 0; }
  li { margin: 6px 0; }
  a { text-decoration: none; }
  a:hover { text-decoration: underline; }
  #warning { margin: 8px 0 16px; padding: 10px 12px; border: 1px solid #e3b341; background: #fff8e1; border-radius: 6px; font-size: 13px; }
  #warning code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
  @media (prefers-color-scheme: dark) {
    #filter { border-color: #555; background: #111; color: #eee; }
    #meta { color: #aaa; }
    #warning { background: #2a230a; border-color: #6a560c; }
  }
  .path { color: #888; font-size: 12px; }
  .path::before { content: '\\00a0'; }
  .dim { opacity: .65; }
  .hidden { display: none; }
  .group { margin-top: 16px; }
  .group h2 { font-size: 14px; margin: 12px 0 6px; color: #666; }
}
</style>
<h1>${title}</h1>
<div id="warning" role="note">
  <strong>Note:</strong> Many test HTML files reference built artifacts under <code>packages/*/dist</code> for CI parity.
  If you don’t see your latest TypeScript changes reflected, run <code>yarn build</code> to regenerate the bundles
  (or create a dev-only HTML that imports from <code>src/</code> when using Vite).
</div>
<input id="filter" type="search" placeholder="Filter by name or path…" autofocus>
<div id="meta">Showing <span id="count"></span> of ${total}</div>
<ul id="list">${list}</ul>
<script>
  const input = document.getElementById('filter');
  const list = document.getElementById('list');
  const count = document.getElementById('count');
  const items = Array.from(list.children);
  function update() {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    for (const li of items) {
      const text = li.textContent.toLowerCase();
      const ok = !q || text.includes(q);
      li.style.display = ok ? '' : 'none';
      if (ok) shown++;
    }
    count.textContent = String(shown);
  }
  input.addEventListener('input', update);
  // Support pressing '/' to focus the filter, similar to GitHub.
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
    }
  });
  update();
  // Auto-select first item with Enter when filter has focus.
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = items.find(li => li.style.display !== 'none');
      if (first) {
        const a = first.querySelector('a');
        if (a) a.click();
      }
    }
  });
<\/script>`;
        }

        server.middlewares.use((req, res, next) => {
          const url = (req.url || '/').split('?')[0];

          // Root and aliases list ALL html files
          if (url === '/' || url === '/html' || url === '/html/' || url === '/examples' || url === '/examples/') {
            const files: string[] = [];
            walk(fsAllow, files);
            files.sort((a, b) => a.localeCompare(b));
            const html = renderIndex('All HTML files', files.map(href => ({ href })));
            res.setHeader('Content-Type', 'text/html');
            res.end(html);
            return;
          }

          // No separate /tests or /examples index; root shows everything.

          next();
        });
      },
    },
    // Silence noisy sourcemap requests for vendored Bootstrap assets used by tests
    // These files reference .map files we do not ship. Respond with a minimal
    // empty sourcemap to avoid console noise during dev.
    {
      name: 'silence-bootstrap-sourcemaps',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          if (url.startsWith('/__tests__/html/assets/bootstrap/') && url.endsWith('.map')) {
            res.setHeader('Content-Type', 'application/json');
            res.end('{"version":3,"sources":[],"names":[],"mappings":""}');
            return;
          }
          next();
        });
      },
    },
    // Examples hub removed; use root '/' to browse all HTML files.
  ],
  optimizeDeps: {
    include: [],
  },
});
