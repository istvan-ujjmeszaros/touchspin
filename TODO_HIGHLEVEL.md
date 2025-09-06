# TODO High-Level Goals

Guiding principles
- Preserve behavior and public API during the transition: callable jQuery events, Command API, DOM/CSS hooks, and modern facade remain stable.
- Execute wrapper‑first extraction to avoid regressions; keep tests green at each step.
- Provide clear migration and artifact naming for “with jQuery” vs “core only”.

End‑state architecture (multi‑package) - ✅ COMPLETED
- ✅ `@touchspin/core`: framework‑agnostic core (ESM), no jQuery
- ✅ `@touchspin/renderer-*`: Bootstrap3/4/5/Tailwind/Vanilla renderers (same markup/classes as today)
- ✅ `@touchspin/jquery-plugin`: thin wrapper that adapts core to the historical jQuery plugin surface
- [ ] Optional wrappers: `@touchspin/react`, `@touchspin/angular`, `@touchspin/webcomponent`

Build outputs and naming
- UMD jQuery plugin per renderer (new naming): `dist/touchspin.jquery.bs{3,4,5}.js`, `dist/touchspin.jquery.tailwind.js`.
- Core ESM: `@touchspin/core` → `dist/esm/touchspin-core.js` (alias currently emitted).
- Maintain legacy filenames as aliases during transition.

Roadmap (high‑level) - Status Update
- ✅ Phase 0: Baseline and naming (aliases, docs, no behavior change)
- ✅ Phase A: Extract core from current plugin (start from migrated copy; remove jQuery/UMD glue; export Core API)
- ✅ Phase B: Extract renderers into packages; keep markup/behavior identical
- ✅ Phase C: Implement jQuery plugin wrapper on top of core; update UMD builds to use wrapper + renderer
- [ ] Phase D: Optional framework wrappers (React/Angular/Web Component) - **NEXT PRIORITY**
- ✅ Phase E: Workspaces, CI, build, and publishing; migration guide

Risks and mitigations
- Drift between core and wrapper: keep a single source of truth for behavior; move code, not rewrite it.
- Naming confusion: emit new filenames alongside legacy aliases; document clearly.
- Package proliferation: establish small, consistent interfaces (renderer contract; wrapper contract).

Acceptance criteria
- All existing tests remain green across phases.
- Manual pages function identically.
- New artifacts published with clear names and docs; legacy artifacts remain available until a major release.
