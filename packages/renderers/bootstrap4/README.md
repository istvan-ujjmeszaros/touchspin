@touchspin/renderer-bootstrap4
==============================

Bootstrap 4 renderer for TouchSpin.

## Install

```
npm i @touchspin/renderer-bootstrap4 @touchspin/core
# or
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
<script src="/dist/index.umd.js"></script>
<link rel="stylesheet" href="/dist/touchspin-bootstrap4.css">
```

## Notes
- CSS is emitted as `dist/touchspin-bootstrap4.css`.
- DOM event wiring uses `data-touchspin-injected` attributes.
- See example: `/packages/renderers/bootstrap4/example/index.html`.

