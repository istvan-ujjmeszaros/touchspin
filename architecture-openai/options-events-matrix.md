# Options ↔ Events Matrix (Influence Overview)

This matrix highlights which options can directly or indirectly affect event emission. It is not exhaustive of all behaviors, but is useful to orient where changes may occur during integration.

- min / max
  - Affects: `touchspin.on.min`, `touchspin.on.max`
  - How: when a step reaches exact bounds via upOnce/downOnce, boundary event fires before the change. Also prevents starting a spin when already at boundary.

- step
  - Affects: change frequency (smaller step → more change events), and boundary hits.
  - Note: Formatting uses `forcestepdivisibility`; physics use `step` directly.

- decimals
  - Affects: change emission (display differences). When the formatted value differs (e.g., rounding), native `change` is dispatched by core.

- forcestepdivisibility
  - Affects: when the displayed value changes (round|floor|ceil|none) → may cause additional native `change` events when stepping/typing.

- stepinterval / stepintervaldelay
  - Affects: `touchspin.on.startspin`, `touchspin.on.stopspin`, and the cadence of repeated steps. Shorter intervals → more change events during holds.

- booster / boostat / maxboostedstep
  - Affects: stepping pace during holds and `touchspin.on.boostchange` (level increments). Larger step sizes may reach min/max sooner, emitting boundary events.

- mousewheel
  - Affects: change events (wheel up/down triggers single steps). Only active when input is focused; core prevents default to avoid page scroll.

- verticalbuttons / prefix / postfix (+ _extraclass)
  - Affects: no core events; renderer visuals only. Changes may trigger DOM updates but do not emit core events.

- initval / replacementval / firstclickvalueifempty
  - Affects: native `change` on initial formatting (if display differs) and blur sanitization; does not produce TouchSpin-specific events by itself.

Event timing recap
- Start: `touchspin.on.startspin` then `touchspin.on.startupspin|startdownspin`.
- Boundary step: `touchspin.on.min|max` before updating the display when the next step hits the bound.
- Stop: `touchspin.on.stopupspin|stopdownspin` then `touchspin.on.stopspin`.
- Native change: dispatched when the displayed value actually changes.
- Boost: `touchspin.on.boostchange` when boost level increments during a hold.

