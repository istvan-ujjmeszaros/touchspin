# Core Package — Minimal Test Plan

Goal: Cover core logic and event handling (renderer-agnostic) with minimal tests using helpers. Prefer `data-touchspin-injected` selectors and avoid renderer assumptions.

Helpers used:
- `initializeTouchspin(page, id, options)` (direct core init, no renderer)
- `initializeTouchspinWithBootstrap5(page, id, options)` (when UI structure is required)
- `updateSettingsViaAPI(page, id, newSettings)`
- `incrementViaAPI`, `decrementViaAPI`, `startUpSpinViaAPI`, `startDownSpinViaAPI`, `stopSpinViaAPI`, `setValueViaAPI`, `destroyCore`
- Interactions/assertions helpers under `interactions/*` and `assertions/*`
- Coverage hooks: `startCoverage`, `collectCoverage`

---

- [ ] value operations and normalization
  - Purpose: initval normalization to step, up/down once, setValue, get value.
  - Pseudocode:
    1) initializeTouchspin('qty', { step: 3, initval: 50 }) → expect sanitized to multiple of 3
    2) incrementViaAPI → expect +3; decrementViaAPI → expect -3
    3) setValueViaAPI(17) → expect normalized per step on blur (if applicable)

- [ ] boundaries and clamping
  - Purpose: min/max enforcement; event emissions for min/max.
  - Pseudocode:
    1) initializeTouchspin('qty', { min: 0, max: 5, step: 1, initval: 4 })
    2) click up to exceed max → expect clamped value 5; log includes touchspin.on.max
    3) click down to below min → expect 0; log includes touchspin.on.min

- [ ] spin timers and acceleration
  - Purpose: start/stop spin events; boosted step behavior.
  - Pseudocode:
    1) initializeTouchspin('qty', { step: 1, boostat: 5, maxboostedstep: 10 })
    2) startUpSpinViaAPI; wait; stopSpinViaAPI → expect change events and start/stop events order

- [ ] keyboard and wheel interactions
  - Purpose: up/down arrows, wheel up/down update value; prevent on disabled/readonly.
  - Pseudocode:
    1) initializeTouchspinWithBootstrap5('qty', { step: 2 })
    2) pressUpArrowKeyOnInput → expect +2; wheelDownOnInput → expect -2
    3) updateSettingsViaAPI({ disabled: true }) → assert interactions no-op

- [ ] updateSettings reactivity
  - Purpose: settings observers are applied; value aligned with new step/min/max.
  - Pseudocode:
    1) initializeTouchspin('qty', { step: 1, min: 0, max: 100, initval: 10 })
    2) updateSettingsViaAPI({ step: 4 }) → expect future increments by 4
    3) updateSettingsViaAPI({ min: 12 }) with value below → expect clamped and event

- [ ] lifecycle
  - Purpose: destroy removes events and instance; idempotency.
  - Pseudocode:
    1) initializeTouchspin('qty', {})
    2) destroyCore → interactions no longer change value; calling destroy again is safe

---

- [ ] change event emission — boundary/rounding edge cases
  - Purpose: ensure exactly one native 'change' fires per effective value change, and none when value doesn't change.
  - Pseudocode:
    1) page.goto(fixture) and clearEventLog
    2) initializeTouchspinWithBootstrap5('qty', { step: 5, min: 0, max: 100 });
       page.evaluate: set input value to '95' before init or via initval: 95
    3) clickUpButton twice → expectValueToBe '100' and expectEventCount('change', 1)
    4) initializeTouchspinWithBootstrap5('qty', { step: 5, min: 0, max: 100, forcestepdivisibility: 'none', initval: 97 })
       clickUpButton twice → expect value '100'; expectEventCount('change', 1)
    5) initializeTouchspinWithBootstrap5('qty', { step: 5, min: 0, max: 100, initval: 100 })
       clickUpButton once → expectEventCount('change', 0)
    6) initializeTouchspinWithBootstrap5('qty', { step: 5, min: 0, max: 100, initval: 0 })
       clickDownButton once → expectEventCount('change', 0) (already at min)

- [ ] change event emission — programmatic and sanitize paths
  - Purpose: programmatic setValue and sanitize-on-blur produce at most one change when resulting display differs.
  - Pseudocode:
    1) initializeTouchspin('qty', { step: 5, min: 0, max: 100 })
       setValueViaAPI('qty', '96'); clearEventLog; blur input (fillWithValueAndBlur('qty','96')) → expectEventCount('change', 1) and value '95' (round)
    2) updateSettingsViaAPI({ min: 60 }) from current value 70 → clearEventLog; expectEventCount('change', 0) (value unchanged)
    3) updateSettingsViaAPI({ max: 50 }) from current value 70 → expectEventCount('change', 1) and value '50'
    4) setValueViaAPI('qty', currentValue) → expectEventCount('change', 0) (no-op write)
