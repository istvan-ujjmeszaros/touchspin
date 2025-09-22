# @touchspin/renderer-bootstrap3

> [!NOTE]
> This is an alpha version of Bootstrap TouchSpin v5. The package is not yet published to npm.

Bootstrap 3 renderer for TouchSpin.

This package provides a renderer that creates a Bootstrap 3-compatible UI for the TouchSpin component. It uses `input-group-btn` and `input-group-addon` for the layout.

📚 See [`docs/architecture/renderer-guide.md`](../../../docs/architecture/renderer-guide.md) for renderer contracts and extension tips.

## Installation

### Alpha Version from NPM

```bash
npm install @touchspin/renderer-bootstrap3@next
```

## Usage

```html
<input id="my-spinner" type="number" value="50">

<script type="module">
  import { TouchSpin } from '@touchspin/core';
  import Bootstrap3Renderer from '@touchspin/renderer-bootstrap3';

  const input = document.getElementById('my-spinner');
  TouchSpin(input, {
    renderer: Bootstrap3Renderer,
    min: 0,
    max: 100,
    step: 5,
    buttonup_class: 'btn btn-primary',
    buttondown_class: 'btn btn-primary'
  });
</script>
```

## Features

-   Uses `input-group-btn` and `input-group-addon` for Bootstrap 3 compatibility.
-   Supports all core TouchSpin features.
-   Can be used with the jQuery plugin or the core API.

## CDN (UMD)

```html
<script src="https://cdn.jsdelivr.net/npm/@touchspin/core@5.0.0-alpha.1/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap3@5.0.0-alpha.1/dist/index.umd.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap3@5.0.0-alpha.1/dist/touchspin-bootstrap3.css" />
```

## Notes
- CSS is emitted as `dist/touchspin-bootstrap3.css`.
- DOM event wiring uses `data-touchspin-injected` attributes.
 - This renderer extends `AbstractRenderer` and implements the core `Renderer` contract.