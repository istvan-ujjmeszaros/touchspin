# @touchspin/renderer-bootstrap5

Bootstrap 5 renderer for TouchSpin. Ships ESM entry points and a CSS stylesheet.

## Install

```bash
npm install @touchspin/renderer-bootstrap5 bootstrap @touchspin/core
```

Bootstrap 5 requires `@popperjs/core` for dropdown positioning; install it if you use tooltips or dropdowns alongside TouchSpin.

## Usage (ESM)

```ts
import { TouchSpin } from '@touchspin/core';
import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';
import '@touchspin/renderer-bootstrap5/css';

TouchSpin(document.querySelector('#quantity'), {
  renderer: Bootstrap5Renderer,
  min: 0,
  max: 100,
  step: 1,
  buttondown_class: 'btn btn-outline-secondary',
  buttonup_class: 'btn btn-outline-secondary'
});
```

## CDN (ESM)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5/dist/touchspin-bootstrap5.css">
<script type="module">
  import { TouchSpin } from 'https://cdn.jsdelivr.net/npm/@touchspin/core@5/dist/index.js';
  import Bootstrap5Renderer from 'https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5/dist/index.js';

  TouchSpin(document.querySelector('#quantity'), {
    renderer: Bootstrap5Renderer,
    min: 0,
    max: 100,
    step: 1,
  });
</script>
```

## Exports & Files

- `@touchspin/renderer-bootstrap5` → `dist/index.js` (ESM)
- `@touchspin/renderer-bootstrap5/css` → `dist/touchspin-bootstrap5.css`
- Package manifest: `@touchspin/renderer-bootstrap5/package.json`

## Metadata

- Peer dependencies: `bootstrap@>=5.3.0 <6`, optional `@popperjs/core@>=2.11.8`
- Engines: Node 18.17+
- `files` include `dist/` and `LICENSE` for npm consumers

For migration tips and renderer architecture details, see `MIGRATION.md` and `docs/architecture/renderer-guide.md`.
