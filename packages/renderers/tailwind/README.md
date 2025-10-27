# @touchspin/renderer-tailwind

Tailwind-themed renderer for TouchSpin. Outputs an ESM build and CSS for non-bundler environments.

## Install

```bash
npm install @touchspin/renderer-tailwind @touchspin/core
# Optional: npm install tailwindcss
```

## Usage (ESM)

```ts
import { TouchSpin } from '@touchspin/core';
import TailwindRenderer from '@touchspin/renderer-tailwind';
import '@touchspin/renderer-tailwind/css';

TouchSpin(document.querySelector('#quantity'), {
  renderer: TailwindRenderer,
  min: 0,
  max: 100,
  step: 1,
});
```

## CDN (ESM)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-tailwind@5/dist/touchspin-tailwind.css">
<script type="module">
  import { TouchSpin } from 'https://cdn.jsdelivr.net/npm/@touchspin/core@5/dist/index.js';
  import TailwindRenderer from 'https://cdn.jsdelivr.net/npm/@touchspin/renderer-tailwind@5/dist/index.js';

  TouchSpin(document.querySelector('#quantity'), {
    renderer: TailwindRenderer,
    min: 0,
    max: 100,
    step: 1,
  });
</script>
```

## Exports & Files

- ESM entry: `@touchspin/renderer-tailwind`
- CSS shortcut: `@touchspin/renderer-tailwind/css`
- Package manifest: `@touchspin/renderer-tailwind/package.json`

## Metadata

- Optional peer: `tailwindcss@>=3.0.0` for design token alignment (not required at runtime)
- Engines: Node 18.17+
- npm tarballs include the CSS and license

## Customizing utility classes

The renderer adds sensible Tailwind defaults for the wrapper and input, but you can override them with renderer-specific options:

```ts
TouchSpin(inputEl, {
  renderer: TailwindRenderer,
  // Replace the default input utility classes (ts-input is always preserved)
  input_classes: 'flex-1 px-4 py-2 text-slate-900 placeholder-slate-500 focus:outline-none',
  // Replace the default wrapper utility classes (ts-wrapper is always preserved)
  wrapper_classes:
    'flex items-stretch rounded-2xl border border-blue-500 bg-white shadow-[0_18px_36px_rgba(15,23,42,0.12)] focus-within:border-blue-700 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.35)] overflow-hidden',
});
```

The renderer automatically removes the built-in utility classes when you supply your own, so you can take full control without worrying about conflicting styles. The `.ts-wrapper`, `.ts-wrapper--vertical`, and `.ts-input` classes remain available so you can still layer CSS variables on top (for example, when matching the vanilla theme).

When you override the utility classes you become responsible for padding, borders, and focus/hover states—only the structural `ts-*` hooks stay in place.

### Default classes used by the renderer

Unless you override them, the renderer adds the following utility sets:

- Wrapper defaults: `flex rounded-md shadow-sm border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:disabled]:opacity-60 has-[:disabled]:bg-gray-50 has-[:read-only]:bg-gray-50 overflow-hidden`
- Input defaults: `flex-1 px-3 py-2 border-0 bg-transparent focus:outline-none text-gray-900 placeholder-gray-500`
- Addon defaults (prefix/postfix): `inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0`

Use the `prefix_extraclass`/`postfix_extraclass` settings to append utilities to those defaults. If you want to replace them entirely, use the renderer-specific overrides:

```ts
TouchSpin(inputEl, {
  renderer: TailwindRenderer,
  prefix: '$',
  postfix: 'USD',
  prefix_classes_override: 'inline-flex items-center px-4 py-1 bg-blue-900 text-white rounded-l-lg',
  postfix_classes_override:
    'inline-flex items-center px-4 py-1 bg-blue-900 text-white rounded-r-lg uppercase tracking-wide',
});
```
