# @touchspin/renderer-vanilla

Modern, framework‑agnostic renderer for TouchSpin using CSS variables. Works with any wrapper (jQuery, Web Component, React, Angular).

- Minimal markup, accessible buttons
- Data roles and testids for reliable targeting
- Theme via `--ts-*` CSS variables (light/dark ready)

Usage
```js
import { TouchSpin } from '@touchspin/core'
import { VanillaRenderer } from '@touchspin/renderer-vanilla'
import '@touchspin/renderer-vanilla/src/vanilla.css'

globalThis.TouchSpinDefaultRenderer = VanillaRenderer

const input = document.querySelector('#qty')
TouchSpin(input, { min: 0, max: 10 })
```

Example app
- See `packages/renderers/vanilla/example` for a Vite app that:
  - Shows the component with live API controls
  - Logs events
  - Displays on‑page source code
  - Lets you tweak CSS variables interactively

