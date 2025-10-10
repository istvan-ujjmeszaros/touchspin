# Migrating from Bootstrap TouchSpin v4.x to TouchSpin v5

Use this guide to move from the legacy `bootstrap-touchspin@4.6.2` package to the modular v5 release. The focus is packaging and consumption; behavioral differences remain documented in `docs/architecture/migration-guide.md`.

## 1. Fast path (drop-in replacement)

If you only need to keep the existing jQuery + Bootstrap setup running, replace the old CDN/local assets with the new UMD bundles—the API, data attributes, and event names remain unchanged.

```html
<!-- Legacy: bootstrap-touchspin.min.js + CSS -->
<!-- New: drop-in replacement -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5.0.0/dist/touchspin-bootstrap5.css">
<script src="https://cdn.jsdelivr.net/npm/@touchspin/jquery@5.0.0/dist/jquery-touchspin-bs5.js"></script>
```

The legacy filenames (`jquery-touchspin-bs*.js`) still exist and forward to the new `dist/umd/touchspin-*.umd.js` bundles, so any existing `<script>` tags pointing at `jquery.bootstrap-touchspin-bs*.js` continue to work after swapping the package name or file location.

Once the new files are in place the rest of the integration runs as before—no code changes required.

## 2. Choose your integration path

| Legacy usage | Recommended v5 path |
|--------------|---------------------|
| Global `<script>` + jQuery + Bootstrap | Swap to the new UMD file (`dist/jquery-touchspin-bs*.js`) or import `dist/umd/touchspin-bootstrapX.umd.js` |
| Bundler-based jQuery project | `@touchspin/jquery` (ESM) + renderer ESM + peer-installed Bootstrap |
| Modern framework / vanilla JS | `@touchspin/core` + renderer package (ESM) |
| Need framework-free custom element | `@touchspin/web-component` + `@touchspin/renderer-vanilla` |

## 2. Install the right packages

```bash
# Example: Bootstrap 5 + jQuery
npm install @touchspin/jquery @touchspin/renderer-bootstrap5 jquery bootstrap

# Example: Framework-free ESM
npm install @touchspin/core @touchspin/renderer-vanilla
```

Each renderer declares peer dependencies that mirror its framework requirements:

- `@touchspin/renderer-bootstrap3` → `bootstrap@^3.4`, optional `jquery`
- `@touchspin/renderer-bootstrap4` → `bootstrap@^4.6`, optional `jquery` and `popper.js`
- `@touchspin/renderer-bootstrap5` → `bootstrap@^5.3`, optional `@popperjs/core`
- `@touchspin/renderer-tailwind` → optional `tailwindcss`

Install peers explicitly in your app to satisfy package managers.

## 3. Update initialization code (if leaving the fast path)

### jQuery wrapper

```ts
import { installWithRenderer } from '@touchspin/jquery';
import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';
import '@touchspin/renderer-bootstrap5/css';
import 'jquery';

declare const jQuery: typeof import('jquery');
installWithRenderer(Bootstrap5Renderer, { jQuery });

jQuery('#quantity').TouchSpin({
  renderer: 'bootstrap5',
  min: 0,
  max: 100,
  step: 1,
});
```

The jQuery plugin continues to expose the legacy command API (`TouchSpin('get')`, `trigger('touchspin.uponce')`, etc.). Renderers now register via data attributes instead of class-based selectors.

### Core + renderer (no jQuery)

```ts
import { TouchSpin } from '@touchspin/core';
import VanillaRenderer from '@touchspin/renderer-vanilla';
import '@touchspin/renderer-vanilla/css';

TouchSpin(document.querySelector('#quantity'), {
  renderer: VanillaRenderer,
  min: 0,
  max: 100,
});
```

## 4. Replace legacy assets

- Swap `<script src="bootstrap-touchspin.min.js">` for the package-specific UMD bundle, e.g. `@touchspin/jquery/dist/umd/jquery-touchspin-bs5.js`.
- Replace the single legacy stylesheet with the renderer stylesheet (`@touchspin/renderer-*/dist/touchspin-*.css`).
- If you relied on CDN auto-updates, prefer jsDelivr or unpkg URLs documented in the package READMEs.

## 5. Revisit configuration differences

- Data attributes use the `data-touchspin-*` prefix (e.g., `data-touchspin-step`) instead of `data-bts-*`.
- Formatting callbacks now emit warnings unless `callback_before_calculation` and `callback_after_calculation` are provided together.
- Events are forwarded through the core event bus; avoid binding directly to DOM nodes created by renderers.
- Renderers use `data-touchspin-injected` markers for DOM patching—custom themes must preserve those attributes.

## 6. Validate and promote

- Run through the quick packaging checklist in [docs/releasing.md](docs/releasing.md) (npm pack, CDN smoke test).
- When adopting from v4, start with `alpha` dist-tags, then graduate to `beta`/`latest` as packaging gaps close.

For an in-depth architectural migration (boundary checks, event timing, renderer internals), consult `docs/architecture/migration-guide.md`.
