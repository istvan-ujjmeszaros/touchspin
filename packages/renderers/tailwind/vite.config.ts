import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'TouchSpinTailwindRenderer',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
    },
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      external: ['@touchspin/core'],
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});

