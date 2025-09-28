import { create as createBrowserSync } from 'browser-sync';
import path from 'node:path';

const bs = createBrowserSync();

// Configuration
const PROXY_PORT = process.env.DEV_PORT || 8866;
const HOT_RELOAD_PORT = process.env.HOT_RELOAD_PORT || 3000;
const PROJECT_ROOT = process.cwd();

// Files to watch for changes
const watchFiles = [
  // Watch devdist folders for compiled changes
  'packages/*/devdist/**/*',
  'packages/renderers/*/devdist/**/*',

  // Watch HTML files in examples and test fixtures
  'packages/*/example/**/*.html',
  'packages/*/tests/fixtures/**/*.html',
  'packages/*/tests/__shared__/fixtures/**/*.html',

  // Watch any other HTML files that might exist
  '**/*.html',

  // Ignore node_modules and other unnecessary directories
  '!node_modules/**/*',
  '!dist/**/*',
  '!coverage/**/*',
  '!reports/**/*'
];

console.log(`🔥 Starting hot-reload server...`);
console.log(`📡 Proxying: http://localhost:${PROXY_PORT}`);
console.log(`🌐 Hot-reload: http://localhost:${HOT_RELOAD_PORT}`);

bs.init({
  // Proxy the existing static server
  proxy: `localhost:${PROXY_PORT}`,

  // Port for the hot-reload server
  port: HOT_RELOAD_PORT,

  // Files to watch
  files: watchFiles.map(pattern => path.join(PROJECT_ROOT, pattern)),

  // Browser-sync options
  open: false, // Don't auto-open browser (user can do it manually)
  notify: false, // Disable the "Connected to Browser-sync" notification
  logLevel: 'info',

  // Advanced options
  reloadDelay: 100, // Small delay to batch rapid changes
  reloadDebounce: 300, // Prevent multiple reloads in quick succession

  // Inject CSS changes without page reload
  injectChanges: true,

  // Custom middleware for better logging
  middleware: [
    {
      route: '',
      handle: (req, res, next) => {
        // Log requests to help with debugging
        if (req.url !== '/browser-sync/socket.io/' && !req.url.startsWith('/browser-sync/')) {
          console.log(`🔄 ${req.method} ${req.url}`);
        }
        next();
      }
    }
  ],

  // UI configuration
  ui: {
    port: HOT_RELOAD_PORT + 1 // Browser-sync UI on port 3001
  }
});

// Enhanced logging for file changes
bs.watch(watchFiles).on('change', (file) => {
  const relativePath = path.relative(PROJECT_ROOT, file);
  const fileType = path.extname(file);

  if (fileType === '.css') {
    console.log(`💄 CSS changed: ${relativePath} (injecting)`);
  } else if (fileType === '.js' || fileType === '.mjs') {
    console.log(`⚡ JS changed: ${relativePath} (reloading)`);
  } else if (fileType === '.html') {
    console.log(`📄 HTML changed: ${relativePath} (reloading)`);
  } else {
    console.log(`📁 File changed: ${relativePath} (reloading)`);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down hot-reload server...');
  bs.exit();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down hot-reload server...');
  bs.exit();
  process.exit(0);
});

console.log(`✅ Hot-reload server ready!`);
console.log(`   Open: http://localhost:${HOT_RELOAD_PORT}`);
console.log(`   UI:   http://localhost:${HOT_RELOAD_PORT + 1}`);
console.log(`   Ctrl+C to stop`);