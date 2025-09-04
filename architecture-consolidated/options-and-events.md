# Options, Data Attributes, and Events

This reference consolidates options/data attributes and the event model (core → jQuery wrapper) for v5. Semantics generally match v4; v5 adds stronger sanitization and clearer ordering.

Options and data attributes
- min (`data-bts-min`): number|null. Default 0. Null removes the lower bound.
- max (`data-bts-max`): number|null. Default 100. Null removes the upper bound.
- step (`data-bts-step`): number > 0. Default 1. Affects step arithmetic and divisibility.
- decimals (`data-bts-decimals`): integer ≥ 0. Default 0. Display precision.
- stepinterval (`data-bts-step-interval`): ms between repeats when holding. Default 100.
- stepintervaldelay (`data-bts-step-interval-delay`): initial delay before repeats. Default 500.
- forcestepdivisibility (`data-bts-force-step-divisibility`): 'round' | 'floor' | 'ceil' | 'none'. Default 'round'. Formatting policy, not physics.
- booster (`data-bts-booster`): boolean. Default true. Enables accelerated stepping during hold.
- boostat (`data-bts-boostat`): integer ≥ 1. Default 10. Steps per boost level.
- maxboostedstep (`data-bts-max-boosted-step`): number | false. Default false. Caps boosted step.
- mousewheel (`data-bts-mouse-wheel`): boolean. Default true. Active only when input is focused.
- prefix/postfix (+ `_extraclass`) (`data-bts-prefix|postfix|prefix-extra-class|postfix-extra-class`): strings. Presentation only; renderers react via observers.
- verticalbuttons (+ classes/text) (`data-bts-vertical-buttons` etc.): renderer visuals; core only attaches events.
- initval / replacementval / firstclickvalueifempty: helpers for empty input behavior.

Notes
- Native attributes min/max/step also influence settings and are kept in sync for `type="number"` inputs only.
- v5 sanitizes partial settings before merge and notifies observers only on effective changes.

Event model (core → jQuery)
- Core events and wrapper translations:
  - `min` → `touchspin.on.min`
  - `max` → `touchspin.on.max`
  - `startspin` → `touchspin.on.startspin`
  - `startupspin` → `touchspin.on.startupspin`
  - `startdownspin` → `touchspin.on.startdownspin`
  - `stopupspin` → `touchspin.on.stopupspin`
  - `stopdownspin` → `touchspin.on.stopdownspin`
  - `stopspin` → `touchspin.on.stopspin`
  - `boostchange` → `touchspin.on.boostchange` (payload: `{ level, step, capped }`)

Ordering guarantees
- Spin start: `startspin` then `startupspin|startdownspin`.
- Boundary: on exact boundary via single step, emit `min|max` BEFORE display update; holds stop immediately at boundary.
- Spin stop: directional stop (`stopupspin|stopdownspin`) then `stopspin`.
- Native `change`: dispatched only when display actually changes; intermediate unsanitized values are suppressed in change capture.

Testing selectors
- Given `data-testid="qty"` on the input, TouchSpin derives:
  - `qty-wrapper`, `qty-up`, `qty-down`, `qty-prefix`, `qty-postfix`.
- Renderers must apply roles: `data-touchspin-injected="wrapper|up|down|prefix|postfix"` (and `vertical-wrapper` when relevant).

