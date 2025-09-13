import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

// Root dev server for examples across all packages
// - Serves the repository as a static site with HMR for TS/JS modules
// - Keep dev port at 8866 (strict) for local tooling compatibility
export default defineConfig({
  server: {
    open: '/examples/',
    port: 8866,
    strictPort: true,
    fs: {
      // Allow serving files from the project root (monorepo)
      strict: true,
      allow: [process.cwd()]
    }
  },
  plugins: [
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
    {
      name: 'touchspin-examples-index',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '/';
          if (url === '/examples' || url === '/examples/') {
            // Recursively find example/index.html under packages/**/example/
            const pkgsDir = path.resolve(process.cwd(), 'packages');
            const exampleLinks: Array<{ label: string; href: string }> = [];

            function walk(dir: string, rel = '') {
              const entries = fs.readdirSync(dir, { withFileTypes: true });
              for (const e of entries) {
                if (e.name.startsWith('.')) continue;
                const full = path.join(dir, e.name);
                const relPath = path.join(rel, e.name);
                if (e.isDirectory()) {
                  const exampleDir = path.join(full, 'example');
                  if (fs.existsSync(exampleDir) && fs.statSync(exampleDir).isDirectory()) {
                    const files = fs.readdirSync(exampleDir).filter((f) => f.toLowerCase().endsWith('.html'));
                    for (const f of files) {
                      exampleLinks.push({
                        label: `${relPath}/example/${f}`,
                        href: `/packages/${relPath}/example/${f}`,
                      });
                    }
                  }
                  walk(full, relPath);
                }
              }
            }

            walk(pkgsDir);
            exampleLinks.sort((a, b) => a.label.localeCompare(b.label));
            const html = `<!doctype html><meta charset="utf-8"><title>Examples</title><h1>Examples</h1><ul>${exampleLinks
              .map((l) => `<li><a href="${l.href}">${l.label}</a></li>`)
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
