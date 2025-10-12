# Migrating from Bootstrap TouchSpin v4.x to TouchSpin v5

Use this guide to move from the legacy `bootstrap-touchspin@4.6.2` package to the modular v5 release. The focus is packaging and consumption; behavioral differences remain documented in `docs/architecture/migration-guide.md`.

## 1. Fast path (drop-in replacement)

If you only need to keep the existing jQuery + Bootstrap setup running, replace the old CDN/local assets with the new UMD bundles—the API, data attributes, and event names remain unchanged.

```html
<!-- Legacy: bootstrap-touchspin.min.js + CSS -->
<!-- New: drop-in replacement -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5.0.0/dist/touchspin-bootstrap5.css">
<script src="https://cdn.jsdelivr.net/npm/@touchspin/jquery@5.0.0/dist/umd/jquery.touchspin-bootstrap5.js"></script>
```

The new UMD bundles follow the pattern `jquery.touchspin-bootstrap{3,4,5,tailwind,vanilla}.js`—swap the package source and file path but retain the jQuery API patterns (`$('#input').touchspin({...})`). No code changes required.

Once the new files are in place the rest of the integration runs as before—no code changes required.

## 2. Choose your integration path

| Legacy usage | Recommended v5 path |
|--------------|---------------------|
| Global `<script>` + jQuery + Bootstrap | Swap to the new UMD file (`@touchspin/jquery/dist/umd/jquery.touchspin-bootstrap5.js`) |
| Bundler-based jQuery project | `@touchspin/jquery` (ESM) + `@touchspin/standalone` + peer-installed Bootstrap |
| Modern framework / vanilla JS | `@touchspin/standalone` + ESM mount API |
| Need framework-free custom element | `@touchspin/webcomponent` + `@touchspin/renderer-vanilla` |

## 2. Install the right packages

```bash
# Example: Bootstrap 5 + jQuery
npm install @touchspin/jquery @touchspin/standalone jquery bootstrap

# Example: Bootstrap 5 + standalone (no jQuery)
npm install @touchspin/standalone

# Example: Framework-free ESM
npm install @touchspin/standalone

# Example: Web component
npm install @touchspin/webcomponent
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
import { autoInstall } from '@touchspin/jquery';
import { mount } from '@touchspin/standalone/bootstrap5';
import $ from 'jquery';

autoInstall(mount);

// Canonical (recommended)
$('#quantity').touchspin({
  min: 0,
  max: 100,
  step: 1,
});

// Legacy alias (still supported)
$('#quantity').TouchSpin({
  min: 0,
  max: 100,
});
```

The jQuery adapter continues to expose the legacy command API (`$('#input').touchspin('getValue')`, etc.) and events (`touchspin.on.change`, `touchspin.on.max`, etc.). Use `.touchspin()` (lowercase) as the canonical method name, with `.TouchSpin()` (CamelCase) supported as a legacy alias.

### Standalone adapter (no jQuery)

```ts
import { mount } from '@touchspin/standalone/bootstrap5';

const api = mount('#quantity', {
  min: 0,
  max: 100,
  step: 1,
});

// Use the API
api.setValue(50);
console.log(api.getValue()); // 50
```

The standalone adapter provides a simple mount API that bundles core + renderer together. For advanced usage with direct core access, use `@touchspin/core` + individual renderer packages.

## 4. Replace legacy assets

- Swap `<script src="bootstrap-touchspin.min.js">` for the package-specific UMD bundle, e.g. `@touchspin/jquery/dist/umd/jquery.touchspin-bootstrap5.js`.
- Replace the single legacy stylesheet with the renderer stylesheet (`@touchspin/renderer-*/dist/touchspin-*.css`).
- If you relied on CDN auto-updates, prefer jsDelivr or unpkg URLs documented in the package READMEs and `docs/migration-5.x.md`.

## 5. Revisit configuration differences

- Data attributes use the `data-touchspin-*` prefix (e.g., `data-touchspin-step`) instead of `data-bts-*`.
- Formatting callbacks now emit warnings unless `callback_before_calculation` and `callback_after_calculation` are provided together.
- Events are forwarded through the core event bus; avoid binding directly to DOM nodes created by renderers.
- Renderers use `data-touchspin-injected` markers for DOM patching—custom themes must preserve those attributes.

## 6. Validate and promote

- Run through the quick packaging checklist in [docs/releasing.md](docs/releasing.md) (npm pack, CDN smoke test).
- When adopting from v4, start with `alpha` dist-tags, then graduate to `beta`/`latest` as packaging gaps close.

For an in-depth architectural migration (boundary checks, event timing, renderer internals), consult `docs/architecture/migration-guide.md`.
