# Bootstrap 4 Renderer — Minimal Test Plan

Goal: Cover B4 renderer structure and updates with minimal tests using helpers.

Helpers used:
- Initialize core with B4 renderer via dynamic import and pass as `renderer` option
- `updateSettingsViaAPI`, interactions/assertions
- Coverage hooks

---

- [ ] horizontal layout: texts/classes/prefix/postfix
  - Purpose: DOM build and classes per B4
  - Pseudocode:
    1) Initialize with prefix/postfix, button texts/classes
    2) Assert injected elements and expected classes

- [ ] vertical layout
  - Purpose: vertical buttons and wrapper
  - Pseudocode:
    1) `verticalbuttons:true`, vertical texts/classes
    2) Assert layout

- [ ] updates + focusability
  - Purpose: updateSettings affects DOM; tabindex toggles
  - Pseudocode:
    1) Update classes/texts/extraclasses; toggle `focusablebuttons`
    2) Assert DOM reflects changes

