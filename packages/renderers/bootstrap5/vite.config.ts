import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'node:path';

export default defineConfig({
  plugins: [
    dts({ entryRoot: 'src', outDir: 'dist', insertTypesEntry: true, skipDiagnostics: true }),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@touchspin/core/renderer': path.resolve(__dirname, '../../core/src/renderer.ts'),
      '@touchspin/core': path.resolve(__dirname, '../../core/src/index.ts'),
    },
  },
  server: {
    open: '/example/index.html',
    port: 8866,
    strictPort: true,
    fs: { allow: [path.resolve(__dirname, '../../../..')] }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'TouchSpinBootstrap5Renderer',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      external: () => false, // bundle all dependencies
      output: [
        { format: 'es', exports: 'named', entryFileNames: 'index.js', inlineDynamicImports: false },
        { format: 'cjs', exports: 'named', entryFileNames: 'index.cjs', inlineDynamicImports: false }
      ],
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
