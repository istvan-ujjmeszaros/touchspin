@touchspin/renderer-bootstrap4
==============================

Bootstrap 4 renderer for TouchSpin.

## Install

```
yarn add @touchspin/renderer-bootstrap4 @touchspin/core
```

## Usage (ESM)

```ts
import { TouchSpin } from '@touchspin/core';
import Bootstrap4Renderer from '@touchspin/renderer-bootstrap4';

TouchSpin(document.querySelector('input') as HTMLInputElement, { renderer: Bootstrap4Renderer });
```

## CDN (UMD)

```html
<script src="https://cdn.jsdelivr.net/npm/@touchspin/core/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap4/dist/index.umd.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap4/dist/touchspin-bootstrap4.css" />
```

## Notes
- CSS is emitted as `dist/touchspin-bootstrap4.css`.
- DOM event wiring uses `data-touchspin-injected` attributes.
- See example: `/packages/renderers/bootstrap4/example/index.html`.
 - This renderer extends `AbstractRenderer` and implements the core `Renderer` contract.
