# Tailwind Renderer — Minimal Test Plan

Goal: Cover Tailwind renderer DOM and class binding using helpers; ensure vertical/horizontal and prefix/postfix behavior.

Helpers used:
- Initialize core with Tailwind renderer via dynamic import and pass as `renderer` option
- `updateSettingsViaAPI`, interactions/assertions
- Coverage hooks

---

- [ ] horizontal layout: class utilities applied
  - Purpose: verify Tailwind classes on buttons and addons
  - Pseudocode:
    1) Initialize with button class utilities and prefix/postfix
    2) Assert injected elements and class lists

- [ ] vertical layout
  - Purpose: vertical wrapper and class utilities
  - Pseudocode:
    1) `verticalbuttons:true` with vertical-specific classes/texts
    2) Assert layout

- [ ] updates
  - Purpose: changing classes/texts/prefix/postfix updates DOM
  - Pseudocode:
    1) updateSettingsViaAPI class/text options; assert changes

