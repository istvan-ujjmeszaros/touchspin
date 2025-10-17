# @touchspin/renderer-bootstrap4

Bootstrap 4 renderer for TouchSpin. Provides ESM entry points plus compiled CSS for quick integration.

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

## CDN (ESM)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap4@5/dist/touchspin-bootstrap4.css">
<script type="module">
  import { TouchSpin } from 'https://cdn.jsdelivr.net/npm/@touchspin/core@5/dist/index.js';
  import Bootstrap4Renderer from 'https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap4@5/dist/index.js';

  TouchSpin(document.querySelector('#quantity'), {
    renderer: Bootstrap4Renderer,
    min: 0,
    max: 100,
    step: 1,
  });
</script>
```

## Exports & Files

- ESM: `@touchspin/renderer-bootstrap4`
- CSS shortcut: `@touchspin/renderer-bootstrap4/css`
- Package manifest: `@touchspin/renderer-bootstrap4/package.json`

## Metadata

- Peer dependencies: `bootstrap@>=4.6.0 <5`, optional `jquery@>=3.5.0`, optional `popper.js@>=1.16.1`
- Engines: Node 18.17+
- All npm tarballs include `LICENSE` and the CSS assets listed above.
