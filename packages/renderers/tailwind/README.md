@touchspin/renderer-tailwind
===========================

Tailwind renderer for TouchSpin.

## Install

```
npm i @touchspin/renderer-tailwind @touchspin/core
# or
yarn add @touchspin/renderer-tailwind @touchspin/core
```

## Usage (ESM)

```ts
import { TouchSpin } from '@touchspin/core';
import TailwindRenderer from '@touchspin/renderer-tailwind';

TouchSpin(document.querySelector('input') as HTMLInputElement, { renderer: TailwindRenderer });
```

## CDN (UMD)

```html
<script src="/dist/index.umd.js"></script>
<link rel="stylesheet" href="/dist/touchspin-tailwind.css">
```

## Notes
- CSS is emitted as `dist/touchspin-tailwind.css`.
- DOM event wiring uses `data-touchspin-injected` attributes.
- See example: `/packages/renderers/tailwind/example/index.html`.
