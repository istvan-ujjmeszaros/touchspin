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
      name: 'TouchSpinCore',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format: 'es' | 'cjs' | 'umd') => (format === 'es' ? 'index.mjs' : format === 'cjs' ? 'index.cjs' : 'index.umd.js'),
    },
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'src/index.ts'),
        renderer: path.resolve(__dirname, 'src/renderer.ts'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'renderer') return '[name].' + (chunk.format === 'es' ? 'mjs' : chunk.format === 'cjs' ? 'cjs' : 'umd.js');
          return chunk.format === 'es' ? 'index.mjs' : chunk.format === 'cjs' ? 'index.cjs' : 'index.umd.js';
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      external: [],
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
