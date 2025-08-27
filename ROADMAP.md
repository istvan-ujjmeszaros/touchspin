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
- [ ] Decide naming scheme for future split builds (see below).

## Upcoming Milestones
1) Core extraction (Phase A)
- [ ] Migrate internal state, value pipeline, and events to `@touchspin/core`.  
- [ ] Ensure jQuery plugin becomes a thin wrapper over the core.  
- [ ] Keep tests fully green; add targeted tests for core.

2) Renderer packages (Phase B)
- [ ] Extract Bootstrap/Tailwind renderers into versioned packages.  
- [ ] Maintain identical markup and class semantics per current renderers.

3) Framework wrappers (Phase C)
- [ ] React: idiomatic component with props mapping to options.  
- [ ] Angular: component/directive; Rx outputs for events.  
- [ ] Web Component: custom element with attributes/events.

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

