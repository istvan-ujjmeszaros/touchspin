# TouchSpin v5

> **Formerly Bootstrap TouchSpin** — Now a modern ESM-first monorepo

[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa)](https://github.com/sponsors/istvan-ujjmeszaros)

TouchSpin (formerly **Bootstrap TouchSpin**) is a modern rewrite of the popular spinner component. The v5 line ships as an ESM-first monorepo with framework-specific packages so you can pick the delivery mode that fits your stack—core logic, renderer bundles, a jQuery bridge, or a Web Component.

## 💖 Support This Project

**TouchSpin v5 represents nearly 1,000 hours of development work** — a complete ground-up rewrite to bring modern ESM architecture, tree-shaking, and multi-framework support to this popular component.

**[⭐ Become a Sponsor](https://github.com/sponsors/istvan-ujjmeszaros)** to help sustain ongoing development, faster bug fixes, and new features.

Your sponsorship keeps this project:
- ✅ **Free and open-source** for everyone
- 🚀 **Actively maintained** with regular updates
- 🐛 **Well-tested** with comprehensive test coverage
- 📚 **Well-documented** with migration guides

*Every contribution, no matter the size, makes a real difference!*

---

## Packages at a Glance

| Package | Purpose | Primary Entry | Bundled Assets |
|---------|---------|---------------|----------------|
| `@touchspin/core` | Framework-agnostic logic + renderer contracts | `dist/index.js` (ESM) | Declarations only |
| `@touchspin/standalone` | Standalone mount API (core + renderer) | `dist/index.js` (ESM) | Per-renderer subpaths + UMD bundles |
| `@touchspin/jquery` | Drop-in jQuery wrapper | `dist/index.js` (ESM) | `dist/umd/jquery.touchspin-*.js`, legacy compatibility |
| `@touchspin/webcomponent` | `<touchspin-input>` custom element | Per-renderer subpaths | Per-renderer UMD bundles |
| `@touchspin/renderer-bootstrap3` | Bootstrap 3 renderer + CSS | `dist/index.js` (ESM) | `dist/touchspin-bootstrap3.css` |
| `@touchspin/renderer-bootstrap4` | Bootstrap 4 renderer + CSS | `dist/index.js` (ESM) | `dist/touchspin-bootstrap4.css` |
| `@touchspin/renderer-bootstrap5` | Bootstrap 5 renderer + CSS | `dist/index.js` (ESM) | `dist/touchspin-bootstrap5.css` |
| `@touchspin/renderer-tailwind` | Tailwind-friendly renderer | `dist/index.js` (ESM) | `dist/touchspin-tailwind.css` |
| `@touchspin/renderer-vanilla` | Framework-free renderer + theme | `dist/index.js` (ESM) | `dist/touchspin-vanilla.css`, `dist/themes/vanilla.css` |

All packages declare `"type": "module"`, target Node 22 (the configuration used for builds), and include licenses in the published tarballs. Renderer packages list their CSS under `files` and expose the stylesheet via `exports."./css"`.

## Framework Adapters (Separate Repositories)

**React** and **Angular** adapters are now maintained in separate repositories with native framework tooling:

- **[@touchspin/react](https://github.com/istvan-ujjmeszaros/touchspin-react)** (v5.0.1-alpha.0)
  - Repository: https://github.com/istvan-ujjmeszaros/touchspin-react
  - Installation: `npm install @touchspin/react@alpha @touchspin/core@alpha`
  - Per-renderer subpath imports with controlled/uncontrolled patterns

- **[@touchspin/angular](https://github.com/istvan-ujjmeszaros/touchspin-angular)** (v5.0.1-alpha.0)
  - Repository: https://github.com/istvan-ujjmeszaros/touchspin-angular
  - Installation: `npm install @touchspin/angular@alpha @touchspin/core@alpha`
  - ControlValueAccessor integration with Angular forms

These adapters are independently versioned starting at v5.0.1-alpha.0 to match core compatibility.

## Quick Install

### Standalone Adapter (Recommended)

The simplest way to use TouchSpin with a mount API:

```bash
npm install @touchspin/standalone
```

```ts
import { mount } from '@touchspin/standalone/bootstrap5';

const api = mount('#quantity', {
  min: 0,
  max: 100,
  step: 1
});
```

**UMD/Global (Browser)**:
```html
<script src="https://cdn.jsdelivr.net/npm/@touchspin/standalone@5.0.0/dist/umd/bootstrap5.global.js"></script>
<script>
  TouchSpinStandaloneBootstrap5.mount('#quantity', { min: 0, max: 100 });
</script>
```

### Modern (ESM) projects

For advanced use with direct core access:

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
npm install @touchspin/jquery jquery
```

**UMD (Browser)**:
```html
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@touchspin/jquery@5.0.0/dist/umd/jquery.touchspin-bootstrap5.js"></script>
<script>
  // Canonical (recommended)
  $('#quantity').touchspin({ min: 0, max: 100 });

  // Legacy alias (still supported)
  $('#quantity').TouchSpin({ min: 0, max: 100 });
</script>
```

**ESM**:
```ts
import { autoInstall } from '@touchspin/jquery';
import { mount } from '@touchspin/standalone/bootstrap5';
import $ from 'jquery';

autoInstall(mount);
$('#quantity').touchspin({ min: 0, max: 100 });
```

### Web Component

```bash
npm install @touchspin/webcomponent
```

```ts
import '@touchspin/webcomponent/bootstrap5';
```

```html
<touchspin-input min="0" max="100" value="42"></touchspin-input>
```

### React

```bash
npm install @touchspin/react react react-dom
```

**Controlled:**
```tsx
import { useState } from 'react';
import TouchSpin from '@touchspin/react/bootstrap5';

function App() {
  const [value, setValue] = useState(50);
  return <TouchSpin value={value} onChange={setValue} min={0} max={100} />;
}
```

**Uncontrolled:**
```tsx
import TouchSpin from '@touchspin/react/vanilla';

<TouchSpin defaultValue={25} onChange={(val) => console.log(val)} />
```

**Imperative API:**
```tsx
import { useRef } from 'react';
import TouchSpin from '@touchspin/react/tailwind';
import type { TouchSpinHandle } from '@touchspin/react/tailwind';

const ref = useRef<TouchSpinHandle>(null);
<TouchSpin ref={ref} defaultValue={10} />
ref.current?.increment();
```

**Per-renderer imports:** `bootstrap3`, `bootstrap4`, `bootstrap5`, `tailwind`, `vanilla`
**SSR-safe:** Works with Next.js, Remix, and other React frameworks
**Example app:** [touchspin-react-example](https://github.com/istvan-ujjmeszaros/touchspin-react-example)

See the [@touchspin/react repository](https://github.com/istvan-ujjmeszaros/touchspin-react) for complete API documentation.

### Angular

```bash
npm install @touchspin/angular @angular/core @angular/common @angular/forms
```

**Template-driven forms:**
```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TouchSpinBootstrap5Component } from '@touchspin/angular/bootstrap5';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [FormsModule, TouchSpinBootstrap5Component],
  template: `
    <touch-spin
      [(ngModel)]="quantity"
      [min]="0"
      [max]="100"
      [step]="1"
    ></touch-spin>
  `
})
export class ExampleComponent {
  quantity = 50;
}
```

**Reactive forms:**
```typescript
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TouchSpinBootstrap5Component } from '@touchspin/angular/bootstrap5';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ReactiveFormsModule, TouchSpinBootstrap5Component],
  template: `<touch-spin [formControl]="amountControl"></touch-spin>`
})
export class ExampleComponent {
  amountControl = new FormControl(50);
}
```

**Imperative API:**
```typescript
import { Component, ViewChild } from '@angular/core';
import { TouchSpinBootstrap5Component, TouchSpinHandle } from '@touchspin/angular/bootstrap5';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [TouchSpinBootstrap5Component],
  template: `<touch-spin #spinner [(ngModel)]="value"></touch-spin>`
})
export class ExampleComponent {
  @ViewChild('spinner') spinner?: TouchSpinHandle;
  value = 0;

  increment() {
    this.spinner?.increment();
  }
}
```

**Per-renderer imports:** `bootstrap3`, `bootstrap4`, `bootstrap5`, `tailwind`, `vanilla`
**ControlValueAccessor:** Full integration with Angular forms
**SSR-safe:** Compatible with Angular Universal

See the [@touchspin/angular repository](https://github.com/istvan-ujjmeszaros/touchspin-angular) for complete API documentation.

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

- Start with the workspace overview in [`../AGENTS.md`](../AGENTS.md) for cross-repo structure and expectations.
- Read [CONTRIBUTING.md](CONTRIBUTING.md) for workspace guidelines, required build steps, and Changesets usage.
- Packaging or security concerns? Follow the disclosure process in [SECURITY.md](SECURITY.md).
- Dev server, scripts, and architecture references remain in the `/docs` tree for contributors—see [docs/index.md](docs/index.md) for a full sitemap.

TouchSpin is MIT-licensed. Every published package carries its own `LICENSE` file generated from the project’s root license.
