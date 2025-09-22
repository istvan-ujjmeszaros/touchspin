# @touchspin/renderer-bootstrap4

> [!NOTE]
> This is an alpha version of Bootstrap TouchSpin v5. The package is not yet published to npm.

Bootstrap 4 renderer for TouchSpin.

This package provides a renderer that creates a Bootstrap 4-compatible UI for the TouchSpin component. It uses `input-group-prepend` and `input-group-append` for the layout.

📚 See [`docs/architecture/renderer-guide.md`](../../../docs/architecture/renderer-guide.md) for renderer contracts and extension tips.

## Installation

### Alpha Version from NPM

```bash
npm install @touchspin/renderer-bootstrap4@next
```

## Usage

```html
<input id="my-spinner" type="number" value="50">

<script type="module">
  import { TouchSpin } from '@touchspin/core';
  import Bootstrap4Renderer from '@touchspin/renderer-bootstrap4';

  const input = document.getElementById('my-spinner');
  TouchSpin(input, {
    renderer: Bootstrap4Renderer,
    min: 0,
    max: 100,
    step: 5,
    buttonup_class: 'btn btn-primary',
    buttondown_class: 'btn btn-primary'
  });
</script>
```

## Features

-   Uses `input-group-prepend` and `input-group-append` for Bootstrap 4 compatibility.
-   Supports all core TouchSpin features.
-   Can be used with the jQuery plugin or the core API.

## CDN (UMD)

```html
<script src="https://cdn.jsdelivr.net/npm/@touchspin/core@5.0.0-alpha.1/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap4@5.0.0-alpha.1/dist/index.umd.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap4@5.0.0-alpha.1/dist/touchspin-bootstrap4.css" />
```

## Notes
- CSS is emitted as `dist/touchspin-bootstrap4.css`.
- DOM event wiring uses `data-touchspin-injected` attributes.
- See example: `/packages/renderers/bootstrap4/example/index.html`.
 - This renderer extends `AbstractRenderer` and implements the core `Renderer` contract.