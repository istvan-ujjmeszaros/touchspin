import { defineConfig } from 'vite';

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
  optimizeDeps: {
    include: [],
  },
});

