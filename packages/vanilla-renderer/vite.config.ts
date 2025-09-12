import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'node:path';

export default defineConfig({
  plugins: [
    dts({ entryRoot: 'src', outDir: 'dist', insertTypesEntry: true, skipDiagnostics: true }),
  ],
  server: {
    open: '/example/index.html',
    port: 8866,
    strictPort: true,
    fs: { allow: [path.resolve(__dirname, '../../..')] }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'TouchSpinVanillaRenderer',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => (format === 'es' ? 'index.mjs' : format === 'cjs' ? 'index.cjs' : 'index.umd.js'),
    },
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      external: ['@touchspin/core', '@touchspin/core/renderer'],
      output: {
        exports: 'named',
        globals: {
          '@touchspin/core': 'TouchSpinCore',
          '@touchspin/core/renderer': 'TouchSpinCoreRenderer',
        },
        // Keep CSS filename stable when imported in library entry
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'touchspin-vanilla.css';
          }
          return assetInfo.name ?? '[name].[ext]';
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
