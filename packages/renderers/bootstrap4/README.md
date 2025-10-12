# @touchspin/renderer-bootstrap4

Bootstrap 4 renderer for TouchSpin. Provides ESM and UMD builds plus compiled CSS for quick integration.

## Install

```bash
npm install @touchspin/renderer-bootstrap4 bootstrap@^4.6 jquery popper.js @touchspin/core
```

jQuery and Popper are optional for TouchSpin itself but required by Bootstrap 4’s components; install them to avoid peer warnings.

## Usage (ESM)

```ts
import { TouchSpin } from '@touchspin/core';
import Bootstrap4Renderer from '@touchspin/renderer-bootstrap4';
import '@touchspin/renderer-bootstrap4/css';

TouchSpin(document.querySelector('#quantity'), {
  renderer: Bootstrap4Renderer,
  min: 0,
  max: 100,
  step: 1,
});
```

## CDN / UMD

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap4@5.0.0/dist/touchspin-bootstrap4.css">
<script src="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap4@5.0.0/dist/umd/touchspin-bootstrap4.umd.js"></script>
```

The global bundle registers `TouchSpinBootstrap4` on `window` for legacy loaders.

## Exports & Files

- ESM: `@touchspin/renderer-bootstrap4`
- CSS shortcut: `@touchspin/renderer-bootstrap4/css`
- UMD bundle: `dist/umd/touchspin-bootstrap4.umd.js`
- Package manifest: `@touchspin/renderer-bootstrap4/package.json`

## Metadata

- Peer dependencies: `bootstrap@>=4.6.0 <5`, optional `jquery@>=3.5.0`, optional `popper.js@>=1.16.1`
- Engines: Node 18.17+
- All npm tarballs include `LICENSE` and the CSS/UMD assets listed above.

