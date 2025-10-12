# @touchspin/renderer-vanilla

Framework-free renderer and theme for TouchSpin. Ideal for projects that do not rely on Bootstrap or Tailwind.

## Install

```bash
npm install @touchspin/renderer-vanilla @touchspin/core
```

## Usage (ESM)

```ts
import { TouchSpin } from '@touchspin/core';
import VanillaRenderer from '@touchspin/renderer-vanilla';
import '@touchspin/renderer-vanilla/css';

TouchSpin(document.querySelector('#quantity'), {
  renderer: VanillaRenderer,
  min: 0,
  max: 100,
  step: 1,
});
```

## CDN / UMD

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-vanilla@5.0.0/dist/touchspin-vanilla.css">
<script src="https://cdn.jsdelivr.net/npm/@touchspin/renderer-vanilla@5.0.0/dist/umd/touchspin-vanilla.umd.js"></script>
```

The bundle exposes `TouchSpinVanilla` on `window` and sets the vanilla renderer as the default for legacy loaders.

## Exports & Files

- ESM entry: `@touchspin/renderer-vanilla`
- CSS shortcut: `@touchspin/renderer-vanilla/css`
- Theme asset: `@touchspin/renderer-vanilla/themes/vanilla` → `dist/themes/vanilla.css`
- UMD bundle: `dist/umd/touchspin-vanilla.umd.js`
- Manifest: `@touchspin/renderer-vanilla/package.json`

## Metadata

- No additional peer dependencies beyond `@touchspin/core`
- Engines: Node 18.17+
- `dist/themes/vanilla.css` is included for projects that want to import the stylesheet manually

