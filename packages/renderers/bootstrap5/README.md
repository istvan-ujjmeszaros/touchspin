@touchspin/renderer-bootstrap5
==============================

Bootstrap 5 renderer for TouchSpin.

📚 See [`docs/architecture/renderer-guide.md`](../../../docs/architecture/renderer-guide.md) for renderer contracts and extension tips.

## Install

```
yarn add @touchspin/renderer-bootstrap5 @touchspin/core
```

## Usage (ESM)

```ts
import { TouchSpin } from '@touchspin/core';
import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';

TouchSpin(document.querySelector('input') as HTMLInputElement, { renderer: Bootstrap5Renderer });
```

## CDN (UMD)

```html
<script src="https://cdn.jsdelivr.net/npm/@touchspin/core/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5/dist/index.umd.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5/dist/touchspin-bootstrap5.css" />
```

## Notes
- CSS is emitted as `dist/touchspin-bootstrap5.css`.
- DOM event wiring uses `data-touchspin-injected` attributes.
- See example: `/packages/renderers/bootstrap5/example/index.html`.
 - This renderer extends `AbstractRenderer` and implements the core `Renderer` contract.
