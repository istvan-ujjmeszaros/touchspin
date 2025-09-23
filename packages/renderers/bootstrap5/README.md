# @touchspin/renderer-bootstrap5



Bootstrap 5 renderer for TouchSpin.

This package provides a renderer that creates a Bootstrap 5-compatible UI for the TouchSpin component.

📚 See [`docs/architecture/renderer-guide.md`](../../../docs/architecture/renderer-guide.md) for renderer contracts and extension tips.

## Installation

### Alpha Version from NPM

```bash
npm install @touchspin/renderer-bootstrap5
```

## Usage

```html
<input id="my-spinner" type="number" value="50">

<script type="module">
  import { TouchSpin } from '@touchspin/core';
  import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';

  const input = document.getElementById('my-spinner');
  TouchSpin(input, {
    renderer: Bootstrap5Renderer,
    min: 0,
    max: 100,
    step: 5,
    buttonup_class: 'btn btn-primary',
    buttondown_class: 'btn btn-primary'
  });
</script>
```

## Features

-   Simplified structure for Bootstrap 5.
-   Supports all core TouchSpin features.
-   Can be used with the jQuery plugin or the core API.

## CDN (UMD)

```html
<script src="https://cdn.jsdelivr.net/npm/@touchspin/5.0.0/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5.0.0-alpha.1/dist/index.umd.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5.0.0-alpha.1/dist/touchspin-bootstrap5.css" />
```

## Notes
- CSS is emitted as `dist/touchspin-bootstrap5.css`.
- DOM event wiring uses `data-touchspin-injected` attributes.
- See example: `/packages/renderers/bootstrap5/example/index.html`.
 - This renderer extends `AbstractRenderer` and implements the core `Renderer` contract.