import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  server: {
    port: 8866,
    strictPort: true,
    fs: { allow: [path.resolve(__dirname, '../../..')] }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'TouchSpinWebComponent',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => (format === 'es' ? 'index.mjs' : format === 'cjs' ? 'index.cjs' : 'index.umd.js'),
    },
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      external: ['@touchspin/core', '@touchspin/vanilla-renderer'],
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
