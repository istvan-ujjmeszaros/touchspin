# @touchspin/jquery-plugin

Drop-in jQuery wrapper for the TouchSpin core. It preserves the legacy `$('input').TouchSpin(...)` API while delegating runtime logic to `@touchspin/core` and renderer packages.

## Install

```bash
npm install @touchspin/jquery-plugin @touchspin/renderer-bootstrap5 jquery
```

Bootstrap renderers require you to install the matching Bootstrap major (e.g. `bootstrap@^5.3` when using the Bootstrap 5 renderer).

## Usage (ESM)

```ts
import { installWithRenderer } from '@touchspin/jquery-plugin';
import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';
import '@touchspin/renderer-bootstrap5/css';
import 'jquery';

declare const jQuery: typeof import('jquery');
installWithRenderer(Bootstrap5Renderer, { jQuery });

jQuery('#quantity').TouchSpin({
  renderer: 'bootstrap5',
  min: 0,
  max: 100,
});
```

The wrapper exposes the familiar command interface:

```js
$('input').TouchSpin('get');
$('input').TouchSpin('set', 42);
$('input').TouchSpin('destroy');
$('input').trigger('touchspin.uponce');
```

## CDN / UMD bundles

Each Bootstrap variant ships a self-contained UMD bundle under `dist/umd/` alongside legacy aliases for backward compatibility:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5.0.0/dist/touchspin-bootstrap5.css">
<script src="https://cdn.jsdelivr.net/npm/@touchspin/jquery-plugin@5.0.0/dist/umd/touchspin-bootstrap5.umd.js"></script>
```

Legacy filenames (`dist/jquery-touchspin-bs5.js`) continue to exist and point to the new bundle so existing CDN links keep working.

## Exports & Types

- Default export (`@touchspin/jquery-plugin`) → `dist/index.js` (ESM) with `dist/index.d.ts`
- Package manifest is exposed as `@touchspin/jquery-plugin/package.json`
- Type declarations for renderer shims live in `dist/types`

## Packaging metadata

- `sideEffects` lists the global bundles to ensure bundlers preserve them
- Peer dependency: `jquery >=1.7`
- Engines: Node 18.17+

For renderer selection guidance and migration advice, check [MIGRATION.md](../../MIGRATION.md).

