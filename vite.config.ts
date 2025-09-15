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
          return `<!doctype html><meta charset="utf-8"><title>${title}</title><h1>${title}</h1><ul>${list}</ul>`;
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
