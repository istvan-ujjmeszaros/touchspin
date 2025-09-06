# TouchSpin Roadmap

Status markers
- [x] Done  - [~] Partially done  - [ ] Planned  - [!] Decision needed

## Completed
- [x] Wrapper‑first extraction: modern facade moved out of plugin (LGTM‑7a).  
- [x] Build hooks to append wrappers (APPEND_WRAPPERS) (LGTM‑7b).  
- [x] Default builds append modern facade; plugin trimmed (LGTM‑8).  
- [x] ESM manual page fix: facade waits for plugin to register.

## In Progress / Near Term
- [x] Docs sweep (README/PLAN/CHECKLIST)  
- [x] Release prep (version bump, CHANGELOG)
- [x] VanillaRenderer with CSS variables and theme editor
- [ ] Web Components package for framework-agnostic usage

## Completed Milestones
1) Core extraction (Phase A) ✅
- ✅ Migrated internal state, value pipeline, and events to `@touchspin/core`
- ✅ jQuery plugin is now a thin wrapper over the core
- ✅ All tests remain green with comprehensive core test coverage

2) Renderer packages (Phase B) ✅
- ✅ Extracted Bootstrap 3/4/5 and Tailwind renderers into versioned packages
- ✅ Added VanillaRenderer with CSS variables for framework-agnostic styling
- ✅ Maintain identical markup and class semantics per current renderers

## Next Phase
3) Framework wrappers (Phase C)
- [ ] Web Component: custom element with attributes/events (Priority: High)
- [ ] React: idiomatic component with props mapping to options  
- [ ] Angular: component/directive; Rx outputs for events

4) Build Variants (Phase D)
- [ ] Ship explicit artifacts:
  - UMD jQuery plugin builds per renderer, e.g., `touchspin.jquery.bs5.js`.  
  - Core‑only ESM build, e.g., `@touchspin/core`.  
  - Optional UMD wrapper bundle for non‑module consumers (no jQuery).

5) Docs and site (Phase E)
- [ ] Package READMEs, migration guides, examples per framework.  
- [ ] Visual test matrix for renderers.

## Naming Proposal (subject to change)
- UMD jQuery plugin: `dist/touchspin.jquery.bsX(.min).js`  
- UMD no‑framework (if shipped): `dist/touchspin.umdwrapper(.min).js`  
- Core ESM: `@touchspin/core`  
- Renderers: `@touchspin/renderer-bootstrap5` etc.  
- React: `@touchspin/react`  
- Angular: `@touchspin/angular`  
- Web Component: `@touchspin/webcomponent`

