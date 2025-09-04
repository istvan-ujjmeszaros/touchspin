# Architecture Consolidated — Index

This folder is a curated, consolidated view of the two prior analyses (`architecture-claude/` and `architecture-openai/`). It keeps only what’s most helpful for developers working on or extending v5, while preserving essential history and diagrams.

Start here
- README.md — Current architecture and extension guidance (core, wrapper, renderers)
- HISTORY.md — Three-stage evolution (TRUE Legacy → In-Between → Modular)

Deep dives
- methods-and-evolution.md — Key method/behavior differences across stages 2 → 3 with highlights from stage 1
- options-and-events.md — Options, data attributes, and event mapping in one place
- renderer-guide.md — Renderer responsibilities, contracts, and gotchas

Reference
- pseudocode/core.md — Core methods (pseudo-code)
- pseudocode/legacy-inbetween.md — In-between (v4) plugin methods (pseudo-code)
- diagrams/ — Mermaid diagrams (.md): flows, sequences, state, and contracts
- case-study-linkedin.md — Short case study
- case-study-blog.md — Long-form case study

Notes
- Mermaid diagrams use `.md` for GitHub rendering (no `.mmd`).
- The repo intentionally uses Playwright E2E tests only.
- Line counts are not a quality metric; v5 is longer due to JSDoc and modular separation.

