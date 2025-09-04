# Architecture Analysis Index

Quick links to artifacts in this folder. These documents are for analysis only and are not linked from project READMEs.

Core overviews
- [README.md](README.md) — Overview of this folder and contents.
- [methods-diff.md](methods-diff.md) — Legacy vs Core/Wrapper/Renderer method inventory and behavioral diffs.
- [architecture.json](architecture.json) — Machine-readable model of modules, APIs, events, relationships.
- [methods-legacy-pseudocode.md](methods-legacy-pseudocode.md) — Pseudo-code for legacy plugin (src/jquery.bootstrap-touchspin.js).
- [methods-core-pseudocode.md](methods-core-pseudocode.md) — Pseudo-code for core (packages/core/src/index.js).

Options and events
- [options-mapping.md](options-mapping.md) — Options and data-bts-* attribute mapping.
- [options-feature-matrix.md](options-feature-matrix.md) — Options ↔ features/behaviors cross-reference.
- [options-events-matrix.md](options-events-matrix.md) — Options influencing event emission.
- [event-matrix.md](event-matrix.md) — Core → wrapper → jQuery event mapping; emission timing.

Renderers
- [renderer-checklist.md](renderer-checklist.md) — Framework differences (BS3/4/5, Tailwind) and contract notes.
- [renderer-audit-checklist.md](renderer-audit-checklist.md) — Checklist for renderer reviews (roles/testids, ARIA, teardown).

Testing and migration
- [test-traceability.md](test-traceability.md) — High-level mapping of tests to feature areas.
- [migration-pitfalls.md](migration-pitfalls.md) — Differences to watch migrating legacy → core.
- [future_plans.md](future_plans.md) — Planned behavior/events not implemented here.

Diagrams (Mermaid)
- [diagrams/class-overview.md](diagrams/class-overview.md) — Core/Wrapper/Renderer class diagram.
- [diagrams/init-sequence.md](diagrams/init-sequence.md) — Wrapper → Core → Renderer initialization.
- [diagrams/spin-hold-up-sequence.md](diagrams/spin-hold-up-sequence.md) — Hold up with boundary stop.
- [diagrams/destroy-sequence.md](diagrams/destroy-sequence.md) — Teardown order.
- [diagrams/change-sanitization-sequence.md](diagrams/change-sanitization-sequence.md) — Change capture vs blur sanitization.
- [diagrams/settings-update-flow.md](diagrams/settings-update-flow.md) — Sanitization/observers/align flow.
- [diagrams/events-bridge.md](diagrams/events-bridge.md) — Core → jQuery event mapping.
- [diagrams/renderer-contract.md](diagrams/renderer-contract.md) — Renderer hooks + testids.
- [diagrams/mutation-observer-flow.md](diagrams/mutation-observer-flow.md) — Attribute change handling.
- [diagrams/native-attr-sync-flow.md](diagrams/native-attr-sync-flow.md) — type=number native sync semantics.
- [diagrams/spinner-state-machine.md](diagrams/spinner-state-machine.md) — Idle/start/spin/stop states.
- [diagrams/event-timeline.md](diagrams/event-timeline.md) — Press/hold/release event timeline.
- [diagrams/value-formatting-flow.md](diagrams/value-formatting-flow.md) — before/parse/step/divisibility/after → display.
- [diagrams/renderer-data-attributes.md](diagrams/renderer-data-attributes.md) — Roles and testids mapping.
- [diagrams/command-map.md](diagrams/command-map.md) — Wrapper commands → Core API mapping.
- [diagrams/boundary-event-ordering.md](diagrams/boundary-event-ordering.md) — Min/max before change at bounds.
- [diagrams/renderer-bootstrap-overlay.md](diagrams/renderer-bootstrap-overlay.md) — Bootstrap layout overlay.
- [diagrams/renderer-tailwind-overlay.md](diagrams/renderer-tailwind-overlay.md) — Tailwind layout overlay.
- [diagrams/cheat-sheet.md](diagrams/cheat-sheet.md) — One-page overview of flows.
- [diagrams/core-callgraph.md](diagrams/core-callgraph.md) — Selected core function call graph.
