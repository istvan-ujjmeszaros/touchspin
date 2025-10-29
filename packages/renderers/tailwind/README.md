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

TailwindRenderer uses **replace semantics** for all styling knobs: when you supply a class string the defaults disappear (structural markers such as `ts-wrapper`, `ts-input`, `ts-addon`, and `tailwind-btn` are always preserved). This keeps Tailwind’s “what you set is what you get” behavior intact.

### Wrapper / input overrides

Override the container and input utilities with the renderer-specific options:

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

When you override the utility classes you become responsible for paddings, borders, and focus/hover states—only the structural markers remain so CSS variables or scoped styles can still target the component.

### Addon overrides (prefix / postfix)

Use the Tailwind-specific override options to replace addon styling. The renderer still injects `ts-addon ts-prefix` / `ts-addon ts-postfix` for hooks:

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

> **Note:** The legacy `prefix_extraclass` / `postfix_extraclass` settings have been removed because they conflicted with replace semantics. Use the override options instead.

### Button overrides

`buttonup_class`, `buttondown_class`, `verticalupclass`, and `verticaldownclass` also use replace semantics. The renderer prepends the `tailwind-btn` + `ts-btn*` markers so tests and custom CSS can still target them:

```ts
TouchSpin(inputEl, {
  renderer: TailwindRenderer,
  buttonup_class:
    'px-4 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold transition-colors',
  buttondown_class:
    'px-4 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold transition-colors',
});
```

### Default classes

Unless overridden, TailwindRenderer ships with the following utility sets:

- Wrapper: `flex rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:disabled]:opacity-60 has-[:disabled]:bg-gray-50 has-[:read-only]:bg-gray-50 overflow-hidden`
- Input: `flex-1 px-3 py-2 border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500`
- Prefix/postfix addons: `inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0`
- Horizontal buttons: `tailwind-btn ts-btn ts-btn--up|down` + `inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-medium border-0 disabled:opacity-50 disabled:cursor-not-allowed`
- Vertical buttons: `tailwind-btn ts-btn ts-btn--vertical ts-btn--vertical-up|down` + `inline-flex items-center justify-center w-full px-3 py-1 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-medium border-0 disabled:opacity-50 disabled:cursor-not-allowed`
