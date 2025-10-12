# @touchspin/renderer-bootstrap3

Bootstrap 3 renderer for TouchSpin. Ships compiled CSS and a UMD bundle for older environments alongside the ESM build.

## Install

```bash
npm install @touchspin/renderer-bootstrap3 bootstrap@^3.4 jquery @touchspin/core
```

## Usage (ESM)

```ts
import { TouchSpin } from '@touchspin/core';
import Bootstrap3Renderer from '@touchspin/renderer-bootstrap3';
import '@touchspin/renderer-bootstrap3/css';

TouchSpin(document.querySelector('#quantity'), {
  renderer: Bootstrap3Renderer,
  min: 0,
  max: 100,
  step: 1,
  buttonup_class: 'btn btn-default',
  buttondown_class: 'btn btn-default'
});
```

## CDN / UMD

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap3@5.0.0/dist/touchspin-bootstrap3.css">
<script src="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap3@5.0.0/dist/umd/touchspin-bootstrap3.umd.js"></script>
```

## Exports & Files

- ESM entry: `@touchspin/renderer-bootstrap3`
- CSS shortcut: `@touchspin/renderer-bootstrap3/css`
- UMD bundle: `dist/umd/touchspin-bootstrap3.umd.js`
- Manifest: `@touchspin/renderer-bootstrap3/package.json`

## Metadata

- Peer dependencies: `bootstrap@>=3.4.0 <4`, optional `jquery@>=1.9.0`
- Engines: Node 18.17+
- npm tarballs include CSS, UMD, and `LICENSE`

