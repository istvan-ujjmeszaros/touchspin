# CDN Asset Reference

All TouchSpin packages are published to npm and can be consumed directly from CDNs such as [jsDelivr](https://www.jsdelivr.com/package/npm/@touchspin/core) or [unpkg](https://unpkg.com/@touchspin/core/). The tables below list the canonical entry points that are bundled with each package. Replace `@5` with a specific version if you need to pin to an exact release.

> ℹ️  The monorepo is ESM-first. Only the jQuery and Web Component adapters ship browser globals. All renderer packages expose CSS files that can be linked directly from the CDN.

## Core & Standalone

| Package | CDN ESM entry | Notes |
|---------|---------------|-------|
| `@touchspin/core` | `https://cdn.jsdelivr.net/npm/@touchspin/core@5/dist/index.js` | Framework-agnostic API. Import renderers separately. |
| `@touchspin/standalone` | `https://cdn.jsdelivr.net/npm/@touchspin/standalone@5/dist/index.js` | Provides `mount` helpers; per-renderer entries are available at `/dist/{bootstrap3\|bootstrap4\|bootstrap5\|tailwind\|vanilla}.js`. |

## Renderer Packages

| Package | CDN ESM entry | CDN CSS |
|---------|---------------|---------|
| `@touchspin/renderer-bootstrap3` | `https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap3@5/dist/index.js` | `https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap3@5/dist/touchspin-bootstrap3.css` |
| `@touchspin/renderer-bootstrap4` | `https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap4@5/dist/index.js` | `https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap4@5/dist/touchspin-bootstrap4.css` |
| `@touchspin/renderer-bootstrap5` | `https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5/dist/index.js` | `https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5/dist/touchspin-bootstrap5.css` |
| `@touchspin/renderer-tailwind` | `https://cdn.jsdelivr.net/npm/@touchspin/renderer-tailwind@5/dist/index.js` | `https://cdn.jsdelivr.net/npm/@touchspin/renderer-tailwind@5/dist/touchspin-tailwind.css` |
| `@touchspin/renderer-vanilla` | `https://cdn.jsdelivr.net/npm/@touchspin/renderer-vanilla@5/dist/index.js` | `https://cdn.jsdelivr.net/npm/@touchspin/renderer-vanilla@5/dist/touchspin-vanilla.css` (theme at `dist/themes/vanilla.css`) |

## Adapters with Browser Globals

| Package | CDN ESM entry | UMD bundles |
|---------|---------------|-------------|
| `@touchspin/jquery` | `https://cdn.jsdelivr.net/npm/@touchspin/jquery@5/dist/index.js` | `https://cdn.jsdelivr.net/npm/@touchspin/jquery@5/dist/umd/jquery.touchspin-{bootstrap3\|bootstrap4\|bootstrap5\|tailwind\|vanilla}.umd.js` |
| `@touchspin/webcomponent` | `https://cdn.jsdelivr.net/npm/@touchspin/webcomponent@5/dist/index.js` | `https://cdn.jsdelivr.net/npm/@touchspin/webcomponent@5/dist/umd/{bootstrap3\|bootstrap4\|bootstrap5\|tailwind\|vanilla}.touchspin.umd.js` |

## Example: Browser ESM via CDN

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

For additional examples, see the package READMEs or Import Map snippet in the root `README.md`.

## Framework Adapters (External Repositories)

These libraries live in dedicated repositories but follow the same CDN patterns.

| Package | CDN ESM entry | Notes |
|---------|---------------|-------|
| `@touchspin/react` | `https://cdn.jsdelivr.net/npm/@touchspin/react@0/dist/vanilla.js` (and `/dist/{bootstrap3\|bootstrap4\|bootstrap5\|tailwind}.js`) | Published from [`touchspin-react`](https://github.com/istvan-ujjmeszaros/touchspin-react). Use ESM imports inside `<script type="module">` blocks. |
| `@touchspin/angular` | Distributed via Angular CLI libraries; prefer installing from npm and building locally. CDN delivery is not officially supported. |
