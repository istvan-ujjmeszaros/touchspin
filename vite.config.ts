import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

// Root dev server for examples across all packages
// - Serves the repository as a static site with HMR for TS/JS modules
// - Keep dev port at 8866 (strict) for local tooling compatibility
export default defineConfig({
  server: {
    port: 8866,
    strictPort: true,
    fs: {
      // Allow serving files from the project root (monorepo)
      strict: true,
      allow: [process.cwd()]
    }
  },
  plugins: [
    {
      name: 'touchspin-examples-index',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '/';
          if (url === '/examples' || url === '/examples/') {
            // List packages with example folders
            const pkgsDir = path.resolve(process.cwd(), 'packages');
            const entries = fs.readdirSync(pkgsDir, { withFileTypes: true });
            const withExamples = entries
              .filter((d) => d.isDirectory())
              .filter((d) => fs.existsSync(path.join(pkgsDir, d.name, 'example')))
              .map((d) => d.name)
              .sort();
            const html = `<!doctype html><meta charset="utf-8"><title>Examples</title><h1>Examples</h1><ul>${withExamples
              .map((n) => `<li><a href="/examples/${n}/">${n}</a></li>`)
              .join('')}</ul>`;
            res.setHeader('Content-Type', 'text/html');
            res.end(html);
            return;
          }

          const m = url.match(/^\/examples\/([^/]+)\/?$/);
          if (m) {
            const pkg = m[1];
            const dir = path.resolve(process.cwd(), 'packages', pkg, 'example');
            if (!fs.existsSync(dir)) {
              res.statusCode = 404;
              res.end('Not found');
              return;
            }
            const files = fs
              .readdirSync(dir)
              .filter((f) => f.toLowerCase().endsWith('.html'))
              .sort();
            const html = `<!doctype html><meta charset="utf-8"><title>${pkg} Examples</title><h1>${pkg} Examples</h1><ul>${files
              .map((f) => `<li><a href="/packages/${pkg}/example/${f}">${f}</a></li>`)
              .join('')}</ul>`;
            res.setHeader('Content-Type', 'text/html');
            res.end(html);
            return;
          }
          next();
        });
      },
    },
  ],
  optimizeDeps: {
    include: [],
  },
});
