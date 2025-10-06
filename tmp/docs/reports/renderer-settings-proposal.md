# Renderer-Specific Settings — Discovery & Proposal

Date: 2025-09-19

## Discovery (summary)

- Renderer-specific keys (examples): buttonup_txt, buttondown_txt, buttonup_class, buttondown_class, verticalbuttons, verticalup/down (+ classes), prefix/postfix (_extraclass), focusablebuttons.
- Flow today:
  - Options are flat on TouchSpinCoreOptions (core). Wrappers (jQuery, web-component) pass them through flat as well.
  - Renderers consume keys directly via `this.settings` inside each concrete renderer.
  - Attribute parsing (web-component) maps kebab-case to flat settings; no renderer-specific typing at source.
- Issues:
  - Core is aware of renderer-oriented keys in its global options shape.
  - Renderers duplicate ad-hoc access and defaulting logic.
  - DX: limited autocomplete/validation for renderer keys; core option surface is noisy.

## Design Options

1) AbstractRenderer-anchored schema (recommended)
- Ownership: Each renderer defines a small typed schema (key → kind/default spec) next to the renderer. AbstractRenderer offers a helper to project a typed view over flat `settings`.
- Flow: Core keeps flat options. Renderer calls `this.projectRendererOptions(schema)` to get a typed view; uses it for rendering. No coercion by default; optional validation per renderer later.
- Typing: Inferred types via `as const` schema and a mapped `InferOptionsFromSchema` type. Autocomplete for known keys; unknown keys ignored.
- Extensibility: Add keys by editing the renderer-local schema only. No core changes.
- Back-compat: Flat input unchanged.

2) Renderer self-describing getOptionSchema()
- Ownership: Renderer exposes a static `getOptionSchema()`; AbstractRenderer asks for it.
- Flow/Typing: Similar to (1), but slightly heavier coupling (class statics).
- Extensibility: Similar to (1); core still unaware.

3) Global flat map + typed projection module
- Ownership: A shared module maintains a global registry for all renderer keys.
- Flow: Import and filter by active renderer.
- Typing: Centralized, but adds cross-package coupling and potential drift.
- Extensibility: Requires touching the registry for each renderer; less ideal.

## Recommendation

Option 1 — AbstractRenderer-anchored, renderer-local schema with a small helper to project a typed view.
- Smallest change surface, no core awareness of specific keys, good DX, evolutionary.

## First Increment (implemented)

- Added `InferOptionsFromSchema` and `projectRendererOptions` to AbstractRenderer (no runtime changes beyond a helper).
- Bootstrap 5 renderer declares a minimal schema for four keys (button texts + classes) and uses the typed view in template assembly.
- Flat options remain; behavior unchanged.

## Next Steps (future increments)

- Expand schemas per renderer; introduce optional validation/coercion helpers (boolean/number/enum kind guards).
- Consider typed helpers for prefix/postfix elements and vertical layout flags.
- Optionally surface a tiny `getOptionSchema()` static for discoverability (without making core depend on it).

## Tests

- Existing Playwright setup; future tests can verify that attribute-driven and programmatic options still render the same DOM while benefiting from typing internally.

### How to add a renderer key (Bootstrap 5 example)

1. Declare a local schema and freeze it next to the renderer:

```
const schema = Object.freeze({
  buttonup_txt: { kind: 'string' },
  // ...
} as const satisfies RendererOptionSchema);
```

2. Project a typed view in the renderer and keep it fresh on rebuild paths:

```
private opts!: Readonly<Partial<InferOptionsFromSchema<typeof schema>>>;
private refreshOpts() { this.opts = this.projectRendererOptions(schema); }

init() {
  // Read schema keys via `opts`; live updates flow through `settings`.
  this.refreshOpts();
  // ...
}
```

3. Use `this.opts.key` in templates; keep public options flat. No coercion, no behavior change — just a typed view for DX.
