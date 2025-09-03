# Architecture (OpenAI Analyses)

This folder contains machine‑generated architecture notes to help compare the legacy jQuery plugin in `src/` with the modern modular implementation in `packages/`.

Contents
- `methods-diff.md` — Side‑by‑side method inventory, pseudo‑code, and behavioral diffs.
- `architecture.json` — Machine‑readable model of modules, APIs, events, and relationships.
- `diagrams/` — Mermaid diagrams as separate files:
  - `class-overview.md` — Core/Wrapper/Renderer class diagram
  - `init-sequence.md` — Wrapper → Core → Renderer init
  - `spin-hold-up-sequence.md` — Hold up with boundary stop
  - `destroy-sequence.md` — Teardown order
  - `change-sanitization-sequence.md` — Change capture vs blur sanitization
  - `settings-update-flow.md` — Sanitization/observers/align flow
  - `events-bridge.md` — Core → jQuery event mapping
  - `renderer-contract.md` — Required hooks + testids
  - `mutation-observer-flow.md` — Attribute change handling
  - `native-attr-sync-flow.md` — type=number sync semantics

Notes
- Source of truth remains the code. These notes are for review and should be kept in sync with code changes when APIs/behavior change.
