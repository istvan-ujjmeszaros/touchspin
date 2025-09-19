# Bootstrap 3 Renderer — Minimal Test Plan

Goal: Cover B3 renderer DOM structure and updates with minimal tests using helpers.

Helpers used:
- `initializeTouchspinWithBootstrap5` analogue for B3 (or a B3-specific initializer if present). If not, load the B3 renderer via page.evaluate dynamic import and pass as renderer option.
- `updateSettingsViaAPI`, interactions/assertions
- Coverage hooks

---

- [ ] horizontal layout: texts/classes/prefix/postfix
  - Purpose: basic build path, button texts/classes, prefix/postfix elements.
  - Pseudocode:
    1) Initialize with B3 renderer, options: prefix/postfix, buttonup/down_txt, buttonup/down_class
    2) Assert injected elements; class names follow B3 patterns

- [ ] vertical layout
  - Purpose: vertical buttons wrapper and classes.
  - Pseudocode:
    1) Initialize with `verticalbuttons:true`, verticalup/down texts and classes
    2) Assert layout and classes

- [ ] updates
  - Purpose: dynamic update of texts/classes/prefix/postfix and focusability.
  - Pseudocode:
    1) updateSettingsViaAPI for class/text changes; assert DOM reflects updates
    2) toggle focusablebuttons; assert tabindex changes

