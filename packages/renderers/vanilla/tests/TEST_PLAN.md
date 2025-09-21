# Vanilla Renderer (standalone package) — Minimal Test Plan

Goal: Cover standalone vanilla renderer (if differs from renderers/vanilla) UI assembly and updates.

Helpers used:
- Initialize core with this renderer via dynamic import and pass as `renderer` option
- `updateSettingsViaAPI`, interactions/assertions
- Coverage hooks

---

- [ ] horizontal and vertical layouts
  - Purpose: ensure both paths are covered with texts and class toggles
  - Pseudocode:
    1) Initialize horizontal with texts/prefix/postfix; assert DOM
    2) Toggle verticalbuttons; assert vertical wrapper/buttons

- [ ] updates and rebuilds
  - Purpose: update texts/classes; empty prefix/postfix triggers rebuild
  - Pseudocode:
    1) updateSettingsViaAPI across options; assert DOM updated

