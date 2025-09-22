# @touchspin/renderer-tailwind

> [!NOTE]
> This is an alpha version of Bootstrap TouchSpin v5. The package is not yet published to npm.

Tailwind CSS renderer for TouchSpin.

This package provides a renderer that creates a Tailwind CSS-compatible UI for the TouchSpin component.

📚 See [`docs/architecture/renderer-guide.md`](../../../docs/architecture/renderer-guide.md) for renderer contracts and extension tips.

## Installation

### Alpha Version from NPM

```bash
npm install @touchspin/renderer-tailwind@next
```

## Usage

```html
<input id="my-spinner" type="number" value="50">

<script type="module">
  import { TouchSpin } from '@touchspin/core';
  import TailwindRenderer from '@touchspin/renderer-tailwind';

  const input = document.getElementById('my-spinner');
  TouchSpin(input, {
    renderer: TailwindRenderer,
    min: 0,
    max: 100,
    step: 5
  });
</script>
```

## Features

-   Uses Tailwind CSS utility classes for styling.
-   Supports all core TouchSpin features.
-   Can be used with the jQuery plugin or the core API.

## CDN (UMD)

```html
<script src="https://cdn.jsdelivr.net/npm/@touchspin/core@5.0.0-alpha.1/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@touchspin/renderer-tailwind@5.0.0-alpha.1/dist/index.umd.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-tailwind@5.0.0-alpha.1/dist/touchspin-tailwind.css" />
```

## Notes
- CSS is emitted as `dist/touchspin-tailwind.css`.
- DOM event wiring uses `data-touchspin-injected` attributes.
- See example: `/packages/renderers/tailwind/example/index.html`.
 - This renderer extends `AbstractRenderer` and implements the core `Renderer` contract.