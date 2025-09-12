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
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'TouchSpinCore',
      formats: ['es', 'cjs'],
      fileName: (format: 'es' | 'cjs') => (format === 'es' ? 'index.mjs' : 'index.cjs'),
    },
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      // Build an additional entry for renderer typings and CJS/ES
      input: {
        index: path.resolve(__dirname, 'src/index.ts'),
        renderer: path.resolve(__dirname, 'src/renderer.ts'),
      },
      external: [],
      output: {
        inlineDynamicImports: false,
        entryFileNames: (chunk) => {
          if (chunk.name === 'renderer') return '[name].' + (chunk.format === 'es' ? 'mjs' : 'cjs');
          return chunk.format === 'es' ? 'index.mjs' : 'index.cjs';
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
