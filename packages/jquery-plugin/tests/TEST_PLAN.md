# jQuery Plugin — Minimal Test Plan

Goal: Verify the jQuery wrapper preserves legacy API/behavior and bridges to core correctly with minimal tests. Use plugin test helpers.

Helpers used:
- `installJqueryPlugin(page)` and `initializeTouchspinJQuery(page, id, options)` from `@touchspin/jquery-plugin/test-helpers`
- Core helpers for assertions and interactions where needed
- Coverage hooks: `startCoverage`, `collectCoverage`

---

- [ ] initialization and chainability
  - Purpose: `$(selector).TouchSpin(opts)` initializes and returns chainable jQuery object.
  - Pseudocode:
    1) installJqueryPlugin(); initializeTouchspinJQuery('qty', { step: 1 })
    2) page.evaluate: return `typeof $(`[data-testid="qty"]`).TouchSpin === 'function'` and chaining length

- [ ] option passthrough to core
  - Purpose: options reach core; UI reflects renderer output.
  - Pseudocode:
    1) initializeTouchspinJQuery('price', { prefix: '$', postfix: 'kg', step: 2 })
    2) Assert prefix/postfix present and interactions change by step=2

- [ ] command API parity (if present)
  - Purpose: `TouchSpin('up')`, `TouchSpin('down')` calls map to core.
  - Pseudocode:
    1) page.evaluate: call `$(input).TouchSpin('up')` → expect value incremented; same for 'down'

- [ ] DOM event bridging
  - Purpose: jQuery `.on('change', ...)` fires once when core triggers native change (no duplicates).
  - Pseudocode:
    1) page.evaluate: attach `$(input).on('change', handler)`; perform interaction; assert handler invoked exactly once

- [ ] blur compatibility
  - Purpose: `.trigger('blur')` invokes core blur handling.
  - Pseudocode:
    1) page.evaluate: `$(input).trigger('blur')` after value edit → expect sanitization/checkValue applied

- [ ] change event emission — edge cases via plugin
  - Purpose: ensure plugin does not introduce duplicate 'change' events on boundary/rounding cases.
  - Pseudocode:
    1) initializeTouchspinJQuery('qty', { step: 5, min: 0, max: 100, initval: 95 }); clickUpButton twice → expectEventCount('change', 1)
    2) initializeTouchspinJQuery('qty', { step: 5, min: 0, max: 100, forcestepdivisibility: 'none', initval: 97 }); clickUpButton twice → expectEventCount('change', 1)
    3) initializeTouchspinJQuery('qty', { step: 5, min: 0, max: 100, initval: 100 }); clickUpButton → expectEventCount('change', 0)

- [ ] destroy/uninitialize
  - Purpose: plugin cleanup, idempotent destroy.
  - Pseudocode:
    1) page.evaluate: `$(input).TouchSpin('destroy')`; actions no longer affect value; calling again is safe
