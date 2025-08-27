# TouchSpin Architecture (Current → Planned)

This document explains the current codebase layout and the multi‑package plan.

## Current Layout

- Single source: `src/jquery.bootstrap-touchspin.js` (UMD jQuery plugin).  
  - Emits callable jQuery events and exposes the Command API.  
  - Modern facade provided via `src/wrappers/modern-facade.js` (appended in UMD builds by default).
- Renderers: `src/renderers/*` for Bootstrap 3/4/5 and Tailwind.
- Wrappers (dev-only today): `src/wrappers/*` with a jQuery bridge and the modern facade.
- Experimental core: `src/core/TouchSpinCore.js` (scaffold only; not yet authoritative).

## Target Architecture (Multi‑Package)

Monorepo with npm packages (names subject to change):

- `@touchspin/core`: Pure, framework‑agnostic logic. No jQuery. ESM.  
  Exposes a class like `TouchSpinCore(el, options)` with lifecycle + methods.

- `@touchspin/renderers-*`: Packages for UI frameworks or design systems  
  Examples: `renderer-bootstrap3`, `renderer-bootstrap4`, `renderer-bootstrap5`, `renderer-tailwind`.  
  Responsibility: produce DOM + classes and return handles for the core.

- `@touchspin/jquery-plugin`: Thin wrapper that adapts the core to jQuery plugin surface  
  - Preserves callable events and the historical Command API.  
  - Depends on `@touchspin/core` + a renderer.

- `@touchspin/react`, `@touchspin/angular`, `@touchspin/webcomponent`: Framework wrappers  
  - Render via a selected renderer (or framework‑native styles).  
  - Bind to core methods and lifecycle.  
  - Publish as idiomatic components.

## Build Variants (End State)

- Core ESM: `@touchspin/core` (tree‑shakable, no jQuery).  
- UMD jQuery plugin builds: one per renderer (`-bs3`, `-bs4`, `-bs5`, `-tailwind`).  
  - Optionally include modern facade in UMD (on by default currently).  
- React/Angular/Web Component packages consume core and a renderer.

## Migration Path (High Level)

1. Wrapper‑first extraction (complete): move modern facade to wrapper, add build hooks.  
2. Core extraction (in progress plan): gradually move logic from the UMD plugin into `@touchspin/core`.  
   - Keep UMD plugin as a thin jQuery wrapper delegating to core.  
   - Maintain callable event parity.  
3. Renderer modules: extract existing renderers into packages.  
4. Framework wrappers: build and publish React/Angular/Web Component packages.  
5. Split builds: ship “with jQuery” (UMD plugin) and “without jQuery” (core) variants with clear filenames.

