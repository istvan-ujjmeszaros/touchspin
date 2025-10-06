# Types Audit — Discovery Report (TouchSpin)

Date: 2025-09-19

Scope: packages/*/src/** (public barrels, renderers, jquery-plugin, web-component)

## Structure Overview

- @touchspin/core
  - src/index.ts — main core class (TouchSpinCore), public API + helpers
  - src/events.ts — event names + payload typing
  - src/renderer.ts — Renderer interfaces/types
  - src/AbstractRenderer.ts — shared renderer logic

- @touchspin/renderers/* (bootstrap3/4/5)
  - src/*Renderer.ts — concrete Renderer implementations

- @touchspin/vanilla-renderer
  - src/VanillaRenderer.ts — concrete Renderer implementation

- @touchspin/jquery-plugin
  - src/index.ts — jQuery wrapper + installWithRenderer
  - src/types/renderer-bridge.ts — bridge layer types

- @touchspin/web-component
  - src/TouchSpinElement.ts — custom element implementation
  - src/event-bridge.ts — DOM CustomEvent bridge
  - src/attribute-mapping.ts — attribute→settings conversion

## Hotspots (findings → suggested pattern)

1) any in core
   - core/src/events.ts:67 — index signature `[key: string]: any;`
     - Suggest: narrow to `unknown` and/or a discriminated payload map.
   - core/src/index.ts:189–190 — `(globalThis as any).TouchSpinDefaultOptions`
     - Suggest: replace with `unknown` bridge + runtime narrowing:
       `(globalThis as unknown as { TouchSpinDefaultOptions?: Partial<TouchSpinCoreOptions> }).TouchSpinDefaultOptions`
   - JSDoc any in callbacks (index.ts 894, 906)
     - Suggest: align to `(detail?: unknown) => void` (already used elsewhere) and re-export typed event payloads where available.

2) unknown usage (generally OK but can improve)
   - web-component/attribute-mapping.ts: parseAttributeValue returns unknown
     - Keep return unknown but add focused narrowing at call sites; consider a typed map of attribute→type for safer parsing.
   - jquery-plugin/src/index.ts: multiple unknown bridges around jQuery/TouchSpin
     - Keep unknown at boundaries; add inline narrows (WithCore) + minimal facades where helpful.

3) TODOs for typing
   - web-component/src/attribute-mapping.ts (TODO: refine type)
   - vanilla-renderer/src/VanillaRenderer.ts (TODO: refine type)
     - Suggest: follow “inference over assertions”: prefer `as const` and `satisfies` for config tables.

4) DOM usage (selectors + events)
   - core/src/AbstractRenderer.ts: document.querySelectorAll for `[data-touchspin-injected]`
   - core/src/index.ts: multiple addEventListener/dispatchEvent
     - Suggest: keep selectors renderer-agnostic via data attributes; add immediate instance checks (e.g., `instanceof HTMLButtonElement`) in renderers where feasible.

## Risks / Care Points

- exactOptionalPropertyTypes is enabled — tightening option shapes may surface latent assumptions. Prefer additive typing first; avoid changing runtime defaults without tests.
- RendererConstructor types are cross‑package; ensure no private symbol collisions when importing built vs src types (avoid importing from dist in TS code).
- jQuery plugin public command surface expects specific string commands; be careful changing the union or return typing unless tests cover it.

## Proposed Sequencing

P0 (low risk, high value)
- Replace core `(globalThis as any)` with unknown + typed narrow.
- Change events.ts index signature `any` → `unknown` and propagate consistent `(detail?: unknown)` handlers.
- Address obvious TODOs with `as const` / `satisfies` where simple.

---

## P0 Fixes Applied

- core/src/index.ts: Replaced `(globalThis as any).TouchSpinDefaultOptions` with a typed unknown bridge.
- core/src/events.ts: Changed `TouchSpinUpdateSettingsData` index signature from `any` to `unknown`.
- web-component/src/attribute-mapping.ts: Used `as const` and `satisfies` for mapping/arrays; kept return `unknown` and refined constants.
- vanilla-renderer/src/VanillaRenderer.ts: Made `setTheme` param `Readonly<Record<string,string>>` (no runtime change).

Checklist updates
- [x] `git grep -nE "(: any\\b| as any\\b)" packages/*/src` — reduced occurrences in core (remaining intentional bridges only).
- [ ] `yarn typecheck` — repository contains pre-existing type errors unrelated to P0; our changes do not expand scope.
- [ ] `yarn lint:ts` — monorepo contains pre-existing lint issues outside P0 scope; helpers remain clean.

P1 (medium touch)
- Centralize event payload types (core) and re-export to web-component/jquery-plugin; align CustomEvent detail typing.
- Add small DOM type guards in renderers for injected elements (button/input).

P2 (larger sweep)
- Attribute typing map in web-component (attr→parser→setting key), returning narrowed types per key; remove ad-hoc unknown at call sites.
- Introduce noUncheckedIndexedAccess and audit remaining index access patterns.

## Acceptance Signals

- `git grep -nE "(: any\\b| as any\\b)" packages/*/src` → only allowed bridges (globalThis) or zero.
- `yarn typecheck` clean; `yarn lint:ts` clean for packages/**/src.
- No change in public signatures unless explicitly coordinated.
