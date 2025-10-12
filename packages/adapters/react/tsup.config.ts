import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    bootstrap3: 'src/bootstrap3.tsx',
    bootstrap4: 'src/bootstrap4.tsx',
    bootstrap5: 'src/bootstrap5.tsx',
    tailwind: 'src/tailwind.tsx',
    vanilla: 'src/vanilla.tsx',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  target: 'es2020',
  splitting: false,
  treeshake: true,
});
