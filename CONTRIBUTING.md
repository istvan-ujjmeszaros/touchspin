# Contributing to Bootstrap TouchSpin

Thank you for your interest in contributing to Bootstrap TouchSpin! This guide covers how to propose changes, coding standards, our testing approach, and how to author new renderers.

## How to Contribute

### Reporting Issues
- Use GitHub Issues: describe the problem clearly and concisely.
- Include environment details: OS, browser(s)/version(s), Node/Yarn versions.
- Provide reproduction steps and a minimal example (HTML/JS snippet or CodeSandbox link).
- Attach console logs, screenshots, or videos if relevant.
- Mention which package(s) are affected (core, renderer-bootstrap5, jquery-plugin, etc.).

### Submitting Pull Requests
- Fork the repo and create a topic branch from `master`:
  - Example: `feat/renderer-<flavor>` or `fix/core-<short-desc>`
- Keep PRs focused and small; one logical change per PR.
- Follow commit best practices: concise subject, informative body.
- Ensure everything builds and tests pass locally:
  - `yarn install`
  - `yarn build` (all packages must build cleanly)
  - `yarn test` (comprehensive Gherkin-style tests)
  - `yarn test:guard` (validate test/checklist consistency)
- Do not commit built artifacts in `dist/`; CI/build will produce them.
- Use Yarn 4 (Berry) with PnP (already configured in the repo).

### Our Testing Philosophy
We use a **Gherkin-style testing approach** with comprehensive behavior documentation:

- **Plan first**: Start with `test.skip()` scenarios documenting all behaviors
- **One behavior per test**: Focus on single, testable outcomes
- **Helper-driven**: Use our Step Lexicon for consistent interactions
- **Coverage-focused**: Aim for 100% test coverage on new features

See our [Writing Gherkin Tests Guide](docs/WRITING_GHERKIN_TESTS.md) for detailed guidance.

### Coding Standards
- TypeScript, strict and explicit: prefer explicit types; avoid `any`.
- SOLID principles: small, composable, single-responsibility units.
- Naming:
  - Interfaces: `Renderer`, `RendererOptions` (no `I` prefix).
  - Abstract classes: `AbstractRenderer`.
  - Files: `Renderer.ts`, `AbstractRenderer.ts`, `RendererOptions.ts` for option bags.
- Renderer event wiring via `data-touchspin-injected` attributes (no class-based wiring).
- Side effects: keep minimal; prefer pure functions where possible.

## Renderer Authoring Guide

Renderers provide the UI layer around the input element and delegate all logic to core. They must align with the canonical core API exported from `@touchspin/core/renderer`.

### Contract and Base Class

```ts
import { AbstractRenderer, type Renderer } from '@touchspin/core/renderer';

export default class MyRenderer extends AbstractRenderer implements Renderer {
  init(): void {
    // 1) Build DOM and set this.wrapper
    this.wrapper = this.buildUI();

    // 2) Locate UI controls
    const up = this.wrapper.querySelector('[data-touchspin-injected="up"]') as HTMLElement | null;
    const down = this.wrapper.querySelector('[data-touchspin-injected="down"]') as HTMLElement | null;

    // 3) Delegate events to core
    this.core.attachUpEvents(up);
    this.core.attachDownEvents(down);

    // 4) React to settings
    this.core.observeSetting('prefix', (v) => this.updatePrefix(v));
    this.core.observeSetting('postfix', (v) => this.updatePostfix(v));
  }
}
```

Notes:
- Implement `init()`; `finalizeWrapperAttributes()` is called by core after initialization.
- Optionally implement `teardown()` for renderer-specific cleanup; call `super.teardown()` when overriding.

### Naming Conventions
- Package name: `@touchspin/renderer-<flavor>` (e.g., `@touchspin/renderer-bootstrap5`).
- Default export: export your renderer class as the default.
- CSS filename: emit `dist/touchspin-<flavor>.css` (documented in README and `package.json` via `style` field and `./css` export if applicable).

### Examples and Examples Hub
- Add a runnable example under `packages/renderer-<flavor>/example/index.html`.
- Ensure it imports the built UMD or module output and the CSS.
- The global examples hub (`yarn dev`) lists examples recursively; verify your example appears and works.
- Each renderer package can also be run individually via `yarn dev:<flavor>` if configured.

### Smoke Tests (Playwright)
- Add basic Playwright smoke tests that:
  - Load the example page.
  - Wait for `data-touchspin-injected` attributes to indicate readiness.
  - Click up/down buttons and assert input value changes.
  - Cover vertical buttons and disabled/readonly states where applicable.
- Run locally with `yarn test` (or `yarn test:dev` to iterate).

### Quality Checklist
- Builds cleanly: `yarn build`.
- Dist artifacts are stable (CSS/JS names).
- Example appears in `/examples` hub and works in major browsers.
- Adheres to canonical `Renderer` interface; extends `AbstractRenderer`.
- Minimal DOM side effects; only use `data-touchspin-injected` for event wiring.

## Build & Types Rules

- **ESM-only.** No CJS/`require`. jQuery plugin ships an extra IIFE file for script-tag users; it is not exported.
- **Dual-build:**
  - Prod: `tsup` JS + `tsc --emitDeclarationOnly` for `.d.ts`.
  - Tests/Coverage: plain `tsc` → `devdist` with `sourceMap + inlineSources`.
- **Topological builds:** Always run `yarn build:types:all` then `yarn build:js:all`. Never parallelize types.
- **Type resolution:** Consumers use `moduleResolution: "Bundler"`; do **not** use `tsconfig.paths` to reach `core`.
- **Exports:** For every public subpath, declare `{ types, import }` in `package.json#exports`. Core exposes `"."` and `"./renderer"`.
- **Tests:** Use `PLAYWRIGHT_TSCONFIG=tsconfig.playwright.json` and `TS_BUILD_TARGET=dev`.
- **Coverage:** `yarn coverage` runs run+merge+report+open; always uses `devdist`.

## Local Dev Server & Base URL

- The dev server runs on `http://localhost:8866` by convention and is started by `yarn dev`.
- In browser-evaluated helpers (e.g., inside `page.evaluate`), prefer origin-relative resolution:
  - Example: `const origin = location.origin; await import(new URL(coreUrl, origin).href)`
  - Avoid hard-coding `http://localhost:8866` inside evaluated code.
- Developer utilities such as `scripts/inspect.mjs` currently assume `http://localhost:8866` when constructing URLs.
  - Proposed improvement: allow overriding via an environment variable (e.g., `DEV_BASE_URL`) with a sensible default to `http://localhost:8866`.
  - If/when introduced, document the variable in tool help text and README.

## Porting Policy (Parity with Source)

When porting behavior between the legacy jQuery plugin (`src/jquery.bootstrap-touchspin.js`) and the new core/wrapper packages:
- In PR descriptions, include links or references to the exact source lines that the change mirrors.
- Call out any intentional deviations in behavior and justify them.
- Prefer moving code and preserving semantics over rewrites to minimize drift.
