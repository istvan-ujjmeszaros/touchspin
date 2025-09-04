# Architecture (OpenAI Analyses)

This folder contains machine‑generated architecture notes to help compare the in-between jQuery plugin in `src/` with the modern modular implementation in `packages/`.

## Important: Three-Stage Evolution

⚠️ **Please read `LEGACY-CLARIFICATION.md` first** ⚠️

TouchSpin has three architectural stages, but this analysis only covers two:
1. **TRUE Legacy** (873 lines): `tmp/jquery.bootstrap-touchspin.legacy.js` *(NOT covered here)*
2. **In-Between** (1,502 lines): `src/jquery.bootstrap-touchspin.js` *(OpenAI calls this "Legacy")*
3. **New Modular** (packages/): `packages/` *(OpenAI calls this "Modern")*

This analysis accurately compares stages 2 → 3, but for the complete evolution see `../architecture-claude/`.

## Contents
- `LEGACY-CLARIFICATION.md` — **READ FIRST** - Explains which "Legacy" version is analyzed
- `methods-diff.md` — Side‑by‑side method inventory, pseudo‑code, and behavioral diffs
- `architecture.json` — Machine‑readable model of modules, APIs, events, and relationships
- `diagrams/` — Mermaid diagrams (multiple views kept as separate files)

## Notes
- Source of truth remains the code. These notes are for review and should be kept in sync with code changes when APIs/behavior change.
- This analysis is accurate for comparing `src/` (in-between version) with `packages/` (new version).
