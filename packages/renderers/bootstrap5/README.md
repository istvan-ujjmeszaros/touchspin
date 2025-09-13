@touchspin/renderer-bootstrap5
==============================

Bootstrap 5 renderer for TouchSpin.

## Install

```
npm i @touchspin/renderer-bootstrap5 @touchspin/core
# or
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
<script src="/dist/index.umd.js"></script>
<link rel="stylesheet" href="/dist/touchspin-bootstrap5.css">
```

## Notes
- CSS is emitted as `dist/touchspin-bootstrap5.css`.
- DOM event wiring uses `data-touchspin-injected` attributes.
- See example: `/packages/renderers/bootstrap5/example/index.html`.
