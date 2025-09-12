# AGENTS.md

This document guides contributors (human and AI assistants) on how to work effectively in this repository.

## Why we use agents
- Accelerate repetitive development tasks (build wiring, examples, boilerplate)
- Improve developer experience (DX) by keeping scripts, docs and examples in sync
- Assist with refactors while preserving architecture constraints

## Safety checklist for agents and contributors
- Always work under Yarn 4 (Berry) with PnP and workspaces
- Only change code under `packages/`; legacy root `src/` is reference‑only
- Use port `8866` for dev servers; per‑package Vite is configured with `server.open`
- Before pushing:
  - Run `yarn build` (all packages must build cleanly)
  - Run `yarn test` (or `yarn test:dev` during local iteration)
  - Ensure per‑package `dist/` outputs exist and have stable names (CSS + JS)
- Prefer local assets over CDNs in examples to avoid network stalls in tests
- Review diffs carefully; keep changes minimal and scoped

## How to run locally
- Install: `yarn install`
- Global examples hub: `yarn dev` (opens `/examples/` on port 8866)
- Per‑package dev (auto‑opens `/example/index.html`):
  - `yarn dev:bootstrap3` | `:bootstrap4` | `:bootstrap5` | `:tailwind` | `:vanilla` | `:web-component`
- Tests:
  - `yarn test` — single run
  - `yarn test:watch` — Playwright UI
  - `yarn test:dev` (aka `yarn dev:test`) — run dev server + Playwright UI together

## Conventions and architecture
- Core (`@touchspin/core`): framework‑agnostic logic; builds ESM+CJS; subpath export `@touchspin/core/renderer`
- Renderers: Bootstrap 3/4/5, Tailwind, Vanilla
  - Build ESM+CJS+UMD with `touchspin-<flavor>.umd.js`
  - Emit predictable CSS: `dist/touchspin-<flavor>.css`
  - SCSS/CSS HMR in dev by importing from `src/styles/` (or `src/themes/` for vanilla)
- Web Component: standards‑based custom element using the core + vanilla styles
- jQuery plugin: thin wrapper forwarding callable events to the core API

## Current roadmap (high‑level)

Build system
- Keep stable artifact names for CDN (UMD) and predictable CSS filenames
- Ensure DTS generation stays consistent across packages; prefer consuming core’s built types

Testing
- Expand Playwright coverage for edge cases (RTL, vertical buttons, disabled/readonly)
- Add targeted visual checks for renderers where feasible

Documentation
- Strengthen examples for every renderer and the web component (already scaffolded)
- Keep README and scripts aligned with real workflows (`dev`, `build`, `test:dev`)

Developer Experience
- `/examples` hub lists all examples recursively (works today)
- Maintain per‑package `server.open` behavior for faster iteration

Framework wrappers (future)
- Thin wrappers for React/Vue/Angular that set a default renderer and expose idiomatic APIs

Guidelines
- Renderers must use `data-touchspin-injected` attributes to allow core to bind events (no class‑based event wiring)
- Avoid modifying legacy root `src/`; all source lives in `packages/*`

