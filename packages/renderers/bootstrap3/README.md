@touchspin/renderer-bootstrap3
==============================

Bootstrap 3 renderer for TouchSpin.

## Install

```
npm i @touchspin/renderer-bootstrap3 @touchspin/core
# or
yarn add @touchspin/renderer-bootstrap3 @touchspin/core
```

## Usage (ESM)

```ts
import { TouchSpin } from '@touchspin/core';
import Bootstrap3Renderer from '@touchspin/renderer-bootstrap3';

TouchSpin(document.querySelector('input') as HTMLInputElement, { renderer: Bootstrap3Renderer });
```

## CDN (UMD)

```html
<script src="https://cdn.jsdelivr.net/npm/@touchspin/core/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap3/dist/index.umd.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap3/dist/touchspin-bootstrap3.css">
```

## Notes
- CSS is emitted as `dist/touchspin-bootstrap3.css`.
- DOM event wiring uses `data-touchspin-injected` attributes.
