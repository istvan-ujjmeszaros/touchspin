# @touchspin/web-component

Standards-based `<touchspin-input>` custom element built on top of `@touchspin/core` and the vanilla renderer.

## Install

```bash
npm install @touchspin/web-component @touchspin/renderer-vanilla
```

## Usage

```ts
import '@touchspin/web-component';
import '@touchspin/renderer-vanilla/css';
```

```html
<touchspin-input min="0" max="100" value="42" step="1"></touchspin-input>
```

Attributes map directly to the core settings API. Programmatic access is available via the `value` property and a `touchspin` controller exposed on the element:

```ts
const el = document.querySelector('touchspin-input');
el.value = 10;
el.touchspin.updateSettings({ step: 5 });
```

## Packaging

- ESM entry: `dist/index.js`
- Declarations: `dist/index.d.ts`
- `files` include `dist/`, `LICENSE`, and `README.md`
- Depends on `@touchspin/core` and `@touchspin/renderer-vanilla` at runtime
- Engines: Node 18.17+

For renderer customization or slotted content guidance, refer to `docs/architecture/web-component.md`.

