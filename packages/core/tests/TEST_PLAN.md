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

