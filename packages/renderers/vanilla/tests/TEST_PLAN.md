# Vanilla Renderer (under renderers/) — Minimal Test Plan

Goal: Cover vanilla renderer UI assembly and updates without external CSS dependencies.

Helpers used:
- Initialize core with Vanilla renderer via dynamic import and pass as `renderer` option
- `updateSettingsViaAPI`, interactions/assertions
- Coverage hooks

---

- [ ] horizontal layout: up/down/prefix/postfix
  - Purpose: base DOM structure and text/class placeholders
  - Pseudocode:
    1) Initialize with prefix/postfix and button texts
    2) Assert injected roles present; texts match

- [ ] vertical layout
  - Purpose: vertical wrapper and texts/classes
  - Pseudocode:
    1) `verticalbuttons:true` with vertical texts/classes
    2) Assert layout

- [ ] updates and rebuilds
  - Purpose: update prefix/postfix to/from empty triggers rebuild; texts/classes update
  - Pseudocode:
    1) updateSettingsViaAPI for class/text changes; then set prefix/postfix to '' and back; assert DOM updates

