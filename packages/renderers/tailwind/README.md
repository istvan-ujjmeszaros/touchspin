# @touchspin/renderer-tailwind

Tailwind-themed renderer for TouchSpin. Outputs an ESM build and CSS for non-bundler environments.

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

## CDN (ESM)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-tailwind@5/dist/touchspin-tailwind.css">
<script type="module">
  import { TouchSpin } from 'https://cdn.jsdelivr.net/npm/@touchspin/core@5/dist/index.js';
  import TailwindRenderer from 'https://cdn.jsdelivr.net/npm/@touchspin/renderer-tailwind@5/dist/index.js';

  TouchSpin(document.querySelector('#quantity'), {
    renderer: TailwindRenderer,
    min: 0,
    max: 100,
    step: 1,
  });
</script>
```

## Exports & Files

- ESM entry: `@touchspin/renderer-tailwind`
- CSS shortcut: `@touchspin/renderer-tailwind/css`
- Package manifest: `@touchspin/renderer-tailwind/package.json`

## Metadata

- Optional peer: `tailwindcss@>=3.0.0` for design token alignment (not required at runtime)
- Engines: Node 18.17+
- npm tarballs include the CSS and license
