# Migration Guide: v4 → v5

This guide covers the **packaging and path changes** from v4.x to v5.x. The core API, settings, events, and callbacks remain **100% compatible** - only the package structure and import paths have changed.

For detailed architectural changes (boundary logic, event timing, renderer internals), see [docs/architecture/migration-guide.md](architecture/migration-guide.md).

## What Changed in v5

### Packaging Structure

**v4.x (Legacy)**:
- Single monolithic package: `bootstrap-touchspin`
- Complete bundles with everything included
- Per-package devdist paths: `packages/core/devdist/`, `packages/renderers/*/devdist/`
- Multiple Web Component tags: `<touchspin-bootstrap3>`, `<touchspin-bootstrap4>`, `<touchspin-bootstrap5>`

**v5.x (New)**:
- Modular packages: `@touchspin/{core,standalone,jquery,webcomponent,renderer-*}`
- Choose your adapter: standalone, jQuery, or Web Component
- Single-root devdist: `/devdist/<package-subpath>/` (for contributors)
- Unified Web Component tag: `<touchspin-input>` (renderer chosen by import)

---

## Migration Paths

### Fast Path: jQuery Drop-in Replacement

If you only need to keep existing jQuery + Bootstrap working, swap the CDN/local assets:

**Before (v4)**:
```html
<link rel="stylesheet" href="bootstrap-touchspin.min.css">
<script src="bootstrap-touchspin.min.js"></script>

<script>
  $('#quantity').TouchSpin({ min: 0, max: 100 });
</script>
```

**After (v5)**:
```html
<!-- Load the matching Bootstrap version (3, 4, or 5) -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Load jQuery adapter for Bootstrap 5 -->
<script src="https://cdn.jsdelivr.net/npm/@touchspin/jquery@5.0.0/dist/umd/jquery.touchspin-bootstrap5.js"></script>

<script>
  // Canonical (recommended)
  $('#quantity').touchspin({ min: 0, max: 100 });

  // Legacy alias (still supported)
  $('#quantity').TouchSpin({ min: 0, max: 100 });
</script>
```

**No code changes required** - the API remains 100% compatible.

---

## Package Comparison

| Legacy (v4) | New (v5) | Purpose |
|-------------|----------|---------|
| `bootstrap-touchspin` (complete bundle) | `@touchspin/standalone` | Core + renderer, mount API |
| `bootstrap-touchspin` (jQuery plugin) | `@touchspin/jquery` | jQuery adapter with legacy API |
| N/A | `@touchspin/webcomponent` | `<touchspin-input>` custom element |
| N/A | `@touchspin/core` | Framework-agnostic core (advanced users) |
| N/A | `@touchspin/renderer-bootstrap5` | Bootstrap 5 renderer only |

---

## Path Changes

### Complete Bundles → Standalone/jQuery/Web Component

**Old (v4):**
```html
<script src="dist/complete-bundle-bs5.js"></script>
```

**New (v5):**
```html
<!-- Standalone adapter -->
<script src="https://cdn.jsdelivr.net/npm/@touchspin/standalone@5.0.0/dist/umd/bootstrap5.global.js"></script>
<!-- Global: window.TouchSpinStandaloneBootstrap5 -->

<!-- jQuery adapter -->
<script src="https://cdn.jsdelivr.net/npm/@touchspin/jquery@5.0.0/dist/umd/jquery.touchspin-bootstrap5.js"></script>
<!-- Auto-installs $.fn.touchspin -->

<!-- Web Component -->
<script src="https://cdn.jsdelivr.net/npm/@touchspin/webcomponent@5.0.0/dist/umd/bootstrap5.global.js"></script>
<!-- Registers <touchspin-input> custom element -->
```

### Developer Paths (Contributors Only)

**Old per-package devdist**:
```
packages/core/devdist/index.js
packages/renderers/bootstrap5/devdist/Bootstrap5Renderer.js
```

**New single-root devdist**:
```
/devdist/core/index.js
/devdist/renderers/bootstrap5/Bootstrap5Renderer.js
```

These paths only matter if you're **contributing to the project**. Published packages use `/dist/` and work the same way.

---

## Web Component Tag Changes

**Old (v4):**
```html
<!-- Each renderer had its own tag -->
<touchspin-bootstrap3 min="0" max="100"></touchspin-bootstrap3>
<touchspin-bootstrap4 min="0" max="100"></touchspin-bootstrap4>
<touchspin-bootstrap5 min="0" max="100"></touchspin-bootstrap5>
```

**New (v5):**
```html
<!-- Unified tag, renderer determined by import -->
<script type="module">
  import '@touchspin/webcomponent/bootstrap5';
</script>

<touchspin-input min="0" max="100"></touchspin-input>
```

---

## Installation Examples

### Standalone Adapter (ESM)

```bash
npm install @touchspin/standalone
```

```ts
import { mount } from '@touchspin/standalone/bootstrap5';

const api = mount('#quantity', {
  min: 0,
  max: 100
});
```

### jQuery Adapter (ESM)

```bash
npm install @touchspin/jquery jquery
```

```ts
import { autoInstall } from '@touchspin/jquery';
import { mount } from '@touchspin/standalone/bootstrap5';

autoInstall(mount);

$('#quantity').touchspin({ min: 0, max: 100 });
```

### Web Component (ESM)

```bash
npm install @touchspin/webcomponent
```

```ts
import '@touchspin/webcomponent/bootstrap5';
```

```html
<touchspin-input min="0" max="100"></touchspin-input>
```

---

## UMD File Naming Reference

### Standalone Adapter

| Renderer | UMD File | Global Name |
|----------|----------|-------------|
| Bootstrap 3 | `umd/bootstrap3.global.js` | `TouchSpinStandaloneBootstrap3` |
| Bootstrap 4 | `umd/bootstrap4.global.js` | `TouchSpinStandaloneBootstrap4` |
| Bootstrap 5 | `umd/bootstrap5.global.js` | `TouchSpinStandaloneBootstrap5` |
| Tailwind | `umd/tailwind.global.js` | `TouchSpinStandaloneTailwind` |
| Vanilla | `umd/vanilla.global.js` | `TouchSpinStandaloneVanilla` |

### jQuery Adapter

| Renderer | UMD File | Notes |
|----------|----------|-------|
| Bootstrap 3 | `umd/jquery.touchspin-bootstrap3.js` | Auto-installs `$.fn.touchspin` |
| Bootstrap 4 | `umd/jquery.touchspin-bootstrap4.js` | Auto-installs `$.fn.touchspin` |
| Bootstrap 5 | `umd/jquery.touchspin-bootstrap5.js` | Auto-installs `$.fn.touchspin` |
| Tailwind | `umd/jquery.touchspin-tailwind.js` | Auto-installs `$.fn.touchspin` |
| Vanilla | `umd/jquery.touchspin-vanilla.js` | Auto-installs `$.fn.touchspin` |

### Web Component

| Renderer | UMD File | Registers |
|----------|----------|-----------|
| Bootstrap 3 | `umd/bootstrap3.global.js` | `<touchspin-input>` |
| Bootstrap 4 | `umd/bootstrap4.global.js` | `<touchspin-input>` |
| Bootstrap 5 | `umd/bootstrap5.global.js` | `<touchspin-input>` |
| Tailwind | `umd/tailwind.global.js` | `<touchspin-input>` |
| Vanilla | `umd/vanilla.global.js` | `<touchspin-input>` |

---

## API Compatibility

### No Breaking Changes

All of these continue to work exactly as before:

```js
// Settings
{ min: 0, max: 100, step: 1, decimals: 2, prefix: '$', postfix: '.00' }

// Methods (jQuery)
$('#input').touchspin('setValue', 42);
$('#input').touchspin('getValue');
$('#input').touchspin('uponce');
$('#input').touchspin('destroy');

// Events (jQuery)
$('#input').on('touchspin.on.change', handler);
$('#input').on('touchspin.on.max', handler);

// Callbacks
callback_before_calculation: (value) => value * 2
callback_after_calculation: (value) => `${value} items`
```

### Method Name Convention

The jQuery adapter supports both:
- **`.touchspin()`** (lowercase) - **Recommended**
- **`.TouchSpin()`** (CamelCase) - Legacy alias, still supported

---

## Verification Checklist

After migration:

- [ ] **jQuery users**: Swap to `@touchspin/jquery` UMD file, test existing code works unchanged
- [ ] **Standalone users**: Install `@touchspin/standalone`, use `mount()` API
- [ ] **Web Component users**: Update tags to `<touchspin-input>`, import correct renderer
- [ ] **All users**: Ensure only **one renderer** is loaded per page
- [ ] **Contributors**: Update devdist paths to `/devdist/` root if working with test builds

---

## Getting Help

- **Package-specific docs**: Each package now has its own README with examples
- **Architectural details**: See [docs/architecture/migration-guide.md](architecture/migration-guide.md) for boundary logic, event timing, and renderer internals
- **API reference**: All v4 options, methods, and events work identically in v5

## Summary

**What changed**: Package names, file paths, import structure
**What didn't change**: API, settings, events, callbacks, behavior

The migration is primarily a **packaging change**. Your existing initialization code, settings, event handlers, and callbacks all continue to work without modification.
