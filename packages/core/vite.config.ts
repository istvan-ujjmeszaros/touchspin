import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'node:path';

export default defineConfig({
  plugins: [
    dts({ entryRoot: 'src', outDir: 'dist', insertTypesEntry: true, skipDiagnostics: true }),
  ],
  server: {
    port: 8866,
    strictPort: true,
    fs: { allow: [path.resolve(__dirname, '../../..')] }
  },
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        renderer: path.resolve(__dirname, 'src/renderer.ts'),
      },
      name: 'TouchSpinCore',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        if (format === 'es') {
          return entryName === 'renderer' ? 'renderer.js' : 'index.js';
        } else {
          return entryName === 'renderer' ? 'renderer.cjs' : 'index.cjs';
        }
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
