import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@touchspin/core': path.resolve(__dirname, '../core/src/index.ts'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'TouchSpinJqueryPlugin',
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      external: (id) => id === 'jquery', // keep jquery external only
      output: [
        { format: 'es', exports: 'named', entryFileNames: 'index.js', inlineDynamicImports: false },
        { format: 'cjs', exports: 'named', entryFileNames: 'index.cjs', inlineDynamicImports: false }
      ],
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
