@touchspin/renderer-tailwind
===========================

Tailwind renderer for TouchSpin.

📚 See [`docs/architecture/renderer-guide.md`](../../../docs/architecture/renderer-guide.md) for renderer contracts and extension tips.

## Install

```
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
<script src="https://cdn.jsdelivr.net/npm/@touchspin/core/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@touchspin/renderer-tailwind/dist/index.umd.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-tailwind/dist/touchspin-tailwind.css" />
```

## Notes
- CSS is emitted as `dist/touchspin-tailwind.css`.
- DOM event wiring uses `data-touchspin-injected` attributes.
- See example: `/packages/renderers/tailwind/example/index.html`.
 - This renderer extends `AbstractRenderer` and implements the core `Renderer` contract.
