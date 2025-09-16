import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'TouchSpinJqueryPlugin',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => (format === 'es' ? 'index.js' : format === 'cjs' ? 'index.cjs' : 'index.umd.js'),
    },
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      external: ['jquery', '@touchspin/core'],
      output: {
        globals: {
          jquery: 'jQuery',
          '@touchspin/core': 'TouchSpinCore',
        },
        exports: 'named',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
