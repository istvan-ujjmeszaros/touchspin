import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    bootstrap3: 'src/bootstrap3/index.ts',
    bootstrap4: 'src/bootstrap4/index.ts',
    bootstrap5: 'src/bootstrap5/index.ts',
    tailwind: 'src/tailwind/index.ts',
    vanilla: 'src/vanilla/index.ts',
  },
  format: ['esm'],
  dts: false, // TypeScript compiler handles types
  sourcemap: true,
  clean: false, // We clean manually before build
  external: [
    '@angular/core',
    '@angular/common',
    '@angular/forms',
    '@touchspin/core',
    '@touchspin/renderer-bootstrap3',
    '@touchspin/renderer-bootstrap4',
    '@touchspin/renderer-bootstrap5',
    '@touchspin/renderer-tailwind',
    '@touchspin/renderer-vanilla',
  ],
});
