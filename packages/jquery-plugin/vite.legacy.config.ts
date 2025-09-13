import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const flavor = mode || 'bootstrap5';
  const entryMap = {
    bootstrap3: path.resolve(__dirname, 'src/legacy/bootstrap3.ts'),
    bootstrap4: path.resolve(__dirname, 'src/legacy/bootstrap4.ts'),
    bootstrap5: path.resolve(__dirname, 'src/legacy/bootstrap5.ts'),
    tailwind: path.resolve(__dirname, 'src/legacy/tailwind.ts'),
  } as const;
  const entry = entryMap[flavor as keyof typeof entryMap];
  if (!entry) throw new Error(`Unknown legacy flavor: ${flavor}`);

  return {
    build: {
      sourcemap: true,
      minify: 'esbuild',
      rollupOptions: {
        input: { [`jquery.touchspin-${flavor}`]: entry },
        external: ['jquery'],
        output: {
          format: 'umd',
          entryFileNames: '[name].umd.js',
          globals: { jquery: 'jQuery' },
          name: 'TouchSpinJqueryLegacy',
          exports: 'named',
        },
      },
      outDir: 'dist',
      emptyOutDir: false,
    },
  };
});
