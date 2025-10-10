# TouchSpin v5

[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa)](https://github.com/sponsors/istvan-ujjmeszaros)

TouchSpin is a modern rewrite of the original “Bootstrap TouchSpin” spinner. The v5 line ships as an ESM-first monorepo with framework-specific packages so you can pick the delivery mode that fits your stack—core logic, renderer bundles, a jQuery bridge, or a Web Component.

## Packages at a Glance

| Package | Purpose | Primary Entry | Bundled Assets |
|---------|---------|---------------|----------------|
| `@touchspin/core` | Framework-agnostic logic + renderer contracts | `dist/index.js` (ESM) | Declarations only |
| `@touchspin/jquery` | Drop-in jQuery wrapper | `dist/index.js` (ESM) | `dist/umd/jquery-touchspin-bs{3,4,5}.js`, legacy compatibility |
| `@touchspin/renderer-bootstrap3` | Bootstrap 3 renderer + CSS | `dist/index.js` (ESM) | `dist/umd/touchspin-bootstrap3.umd.js`, `dist/touchspin-bootstrap3.css` |
| `@touchspin/renderer-bootstrap4` | Bootstrap 4 renderer + CSS | `dist/index.js` (ESM) | `dist/umd/touchspin-bootstrap4.umd.js`, `dist/touchspin-bootstrap4.css` |
| `@touchspin/renderer-bootstrap5` | Bootstrap 5 renderer + CSS | `dist/index.js` (ESM) | `dist/umd/touchspin-bootstrap5.umd.js`, `dist/touchspin-bootstrap5.css` |
| `@touchspin/renderer-tailwind` | Tailwind-friendly renderer | `dist/index.js` (ESM) | `dist/umd/touchspin-tailwind.umd.js`, `dist/touchspin-tailwind.css` |
| `@touchspin/renderer-vanilla` | Framework-free renderer + theme | `dist/index.js` (ESM) | `dist/umd/touchspin-vanilla.umd.js`, `dist/touchspin-vanilla.css`, `dist/themes/vanilla.css` |
| `@touchspin/web-component` | `<touchspin-input>` custom element | `dist/index.js` (ESM) | Declarations only |

All packages declare `"type": "module"`, target Node 22 (the configuration used for builds), and include licenses in the published tarballs. Renderer packages list their CSS under `files` and expose the stylesheet via `exports."./css"`.

## Quick Install

### Modern (ESM) projects

```bash
npm install @touchspin/core @touchspin/renderer-bootstrap5
```

```ts
import { TouchSpin } from '@touchspin/core';
import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';
import '@touchspin/renderer-bootstrap5/css';

const input = document.querySelector('#quantity');
TouchSpin(input, {
  renderer: Bootstrap5Renderer,
  min: 0,
  max: 100,
  step: 1,
});
```

### jQuery integration

```bash
npm install @touchspin/jquery @touchspin/renderer-bootstrap5 jquery
```

```ts
import { installWithRenderer } from '@touchspin/jquery';
import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';
import '@touchspin/renderer-bootstrap5/css';
import 'jquery';

declare const jQuery: typeof import('jquery');
installWithRenderer(Bootstrap5Renderer, { jQuery });

jQuery('#quantity').TouchSpin({
  min: 0,
  max: 100,
  step: 1,
});
```

### Web Component

```bash
npm install @touchspin/web-component @touchspin/renderer-vanilla
```

```ts
import '@touchspin/web-component';
import '@touchspin/renderer-vanilla/css';
```

```html
<touchspin-input min="0" max="100" value="42"></touchspin-input>
```

## CDN Builds

UMD bundles are emitted under `dist/umd/` with predictable names for each package.

```html
<!-- jsDelivr (pin) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5.0.0/dist/touchspin-bootstrap5.css">
<script src="https://cdn.jsdelivr.net/npm/@touchspin/jquery@5.0.0/dist/umd/jquery-touchspin-bs5.js"></script>

<!-- unpkg (latest) -->
<script src="https://unpkg.com/@touchspin/renderer-bootstrap5/dist/umd/touchspin-bootstrap5.umd.js"></script>
```

For native ESM in the browser, supply an import map:

```html
<script type="importmap">
  {
    "imports": {
      "@touchspin/core": "https://cdn.jsdelivr.net/npm/@touchspin/core@5.0.0/dist/index.js",
      "@touchspin/renderer-bootstrap5": "https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5.0.0/dist/index.js"
    }
  }
</script>
```

## Renderer Selection

- **Bootstrap projects**: pick the renderer matching your Bootstrap major and include Bootstrap + Popper according to Bootstrap’s own peer dependencies.
- **Headless/vanilla apps**: use `@touchspin/renderer-vanilla` for a lightweight, framework-free theme.
- **Utility-first CSS**: `@touchspin/renderer-tailwind` ships a Tailwind-flavoured stylesheet you can scope or customize.

All renderers attach `data-touchspin-injected` attributes so the core can wire events without relying on framework-specific selectors.

## Release Channels & Dist-Tags

| Tag | Intended audience | Notes |
|-----|-------------------|-------|
| `alpha` | packaging in flux | Current default while we stabilize exports and docs. |
| `beta` | freeze candidate | Set once packaging + docs are finalized. |
| `next` | rolling canary | Use for CI smoke tests and early adopters. |
| `latest` | production | Published only after graduating from beta. |

Publishing is orchestrated through Changesets and the GitHub Actions workflow in `.github/workflows/release.yml`. See [docs/releasing.md](docs/releasing.md) for the release playbook, dist-tag promotion policy, and provenance requirements.

## Migration from v4

Moving from the legacy `bootstrap-touchspin@4.x` package? Start with the concise [MIGRATION.md](MIGRATION.md) and consult deeper architectural notes in `docs/architecture/migration-guide.md` if you need step-by-step coverage of custom renderers or event differences.

## Contributing & Support

- Read [CONTRIBUTING.md](CONTRIBUTING.md) for workspace guidelines, required build steps, and Changesets usage.
- Packaging or security concerns? Follow the disclosure process in [SECURITY.md](SECURITY.md).
- Dev server, scripts, and architecture references remain in the `/docs` tree for contributors—see [docs/index.md](docs/index.md) for a full sitemap.

TouchSpin is MIT-licensed. Every published package carries its own `LICENSE` file generated from the project’s root license.
