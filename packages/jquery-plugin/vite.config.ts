import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'TouchSpinJqueryPlugin',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
    },
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      external: ['jquery', '@touchspin/core'],
      output: {
        globals: {
          jquery: 'jQuery',
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});

