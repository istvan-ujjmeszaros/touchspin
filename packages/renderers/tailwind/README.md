# @touchspin/renderer-tailwind

Tailwind-themed renderer for TouchSpin. Outputs an ESM build, CSS, and a UMD bundle for non-bundler environments.

## Install

```bash
npm install @touchspin/renderer-tailwind @touchspin/core
# Optional: npm install tailwindcss
```

## Usage (ESM)

```ts
import { TouchSpin } from '@touchspin/core';
import TailwindRenderer from '@touchspin/renderer-tailwind';
import '@touchspin/renderer-tailwind/css';

TouchSpin(document.querySelector('#quantity'), {
  renderer: TailwindRenderer,
  min: 0,
  max: 100,
  step: 1,
});
```

## CDN / UMD

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-tailwind@5.0.0/dist/touchspin-tailwind.css">
<script src="https://cdn.jsdelivr.net/npm/@touchspin/renderer-tailwind@5.0.0/dist/umd/touchspin-tailwind.umd.js"></script>
```

The UMD build exposes `TouchSpinTailwind` on `window`.

## Exports & Files

- ESM entry: `@touchspin/renderer-tailwind`
- CSS shortcut: `@touchspin/renderer-tailwind/css`
- UMD bundle: `dist/umd/touchspin-tailwind.umd.js`
- Package manifest: `@touchspin/renderer-tailwind/package.json`

## Metadata

- Optional peer: `tailwindcss@>=3.0.0` for design token alignment (not required at runtime)
- Engines: Node 18.17+
- npm tarballs include the CSS, UMD bundle, and license

