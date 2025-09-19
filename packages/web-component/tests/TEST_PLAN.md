# Web Component — Minimal Test Plan

Goal: Cover custom element lifecycle, attribute/property mapping, and integration with core using helpers.

Helpers used:
- Page-side dynamic define of `<touch-spin>` if not already registered (import package)
- Initialize via markup attributes and property assignments
- Use core helpers via `window.__ts` to locate the underlying core by test id if needed
- Coverage hooks

---

- [ ] definition and lifecycle
  - Purpose: customElements.define, connected/disconnectedCallback
  - Pseudocode:
    1) page.evaluate: import web-component bundle; define if needed
    2) Insert element into DOM; then remove; ensure no errors

- [ ] attribute mapping
  - Purpose: attributes (min/max/step/value, verticalbuttons, prefix/postfix, classes) map to core settings
  - Pseudocode:
    1) Create `<touch-spin data-testid=... min="0" max="10" step="2" prefix="$" postfix="kg">`
    2) Assert rendered DOM has prefix/postfix and buttons; interactions reflect step

- [ ] reactive attribute updates
  - Purpose: changing attributes updates renderer
  - Pseudocode:
    1) page.evaluate: el.setAttribute('prefix','€'); assert prefix text updates
    2) Toggle verticalbuttons; assert layout switches

- [ ] property reflection (if exposed)
  - Purpose: setting properties updates core
  - Pseudocode:
    1) el.step = 5 (or via method); assert value increments by 5

