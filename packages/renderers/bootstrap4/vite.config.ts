import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'TouchSpinBootstrap4Renderer',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
    },
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      external: ['@touchspin/core'],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'touchspin-bootstrap4.css';
          }
          return assetInfo.name ?? '[name].[ext]';
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});

