# @touchspin/core

Framework-agnostic TouchSpin logic that powers every renderer. The package exposes ESM-only entry points and ships TypeScript declarations in `dist/`.

## Install

```bash
npm install @touchspin/core
```

## Usage

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
  cancelable: true  // Enable cancelable change events
});

// Listen to events
input.addEventListener('change:start', (event) => {
  // Can prevent the change from happening
  if (shouldPreventChange()) {
    event.preventDefault();
  }
});

input.addEventListener('speedchange', (event) => {
  console.log('Spin speed changed to:', event.detail.speed);
});
```

`TouchSpin` attaches the instance directly to the DOM element and returns the API object (methods such as `upOnce`, `downOnce`, `updateSettings`, `destroy`). Retrieve an existing instance with `getTouchSpin(element)` when needed.

## Exports

- `@touchspin/core` → `dist/index.js` (ESM) with `dist/index.d.ts`
- `@touchspin/core/renderer` → renderer contracts and base classes (`dist/renderer.js`, `dist/renderer.d.ts`)
- `package.json` is exposed for tooling via `exports['./package.json']`

## Packaging Notes

- `sideEffects: false` enables tree-shaking for bundlers.
- Supported runtimes: Node 18.17+ (LTS versions 18, 20, 22), evergreen browsers.
- No UMD bundle is produced—load the core through native ESM or a bundler/import map.

## Related Packages

- jQuery bridge: [`@touchspin/jquery`](../adapters/jquery/README.md)
- Renderers: [`packages/renderers`](../renderers/README.md)
- Web component: [`@touchspin/web-component`](../web-component/README.md)

For implementation details and extension guidelines, see `docs/architecture/renderer-guide.md`.

