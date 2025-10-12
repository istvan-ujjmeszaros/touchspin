# Options ↔ Feature Cross-Reference (High-level)

- min/max
  - Boundaries for clamping; min/max events when hit; ARIA valuemin/valuemax; synced to native attrs for type=number.

- step
  - Base increment size; applied by upOnce/downOnce; forcestepdivisibility uses this for formatting pipeline.

- decimals
  - Display precision; value pipeline .toFixed(decimals); input '.' allowed momentarily when decimals>0.

- forcestepdivisibility
  - Formatting-only rule: round|floor|ceil|none; does not alter underlying arithmetic beyond display normalization.

- stepinterval / stepintervaldelay
  - Hold behavior timings: delay before repeating, then repeat cadence.

- maxboostedstep
  - Booster increases effective step after boostat repeats; capped by maxboostedstep if finite; level changes drive boostchange events.

- callback_before_calculation
  - Function to modify value before calculation.

- callback_after_calculation
  - Function to format display value after calculation.

- mousewheel
  - Enabled only when input focused; wheel up/down maps to upOnce/downOnce; preventDefault to avoid page scroll.

- focusablebuttons
  - Makes buttons focusable (adds tabindex).

- prefix/postfix (+ _extraclass)
  - Renderer visuals; prefix/postfix text and extra classes; core hides empty prefix/postfix.

- verticalbuttons (+ text/classes)
  - Renderer layout variant; core still only attaches events.

- initval / replacementval / firstclickvalueifempty
  - Initialization and empty-value helpers (initval only applied if input starts empty).

Effects & Events
- upOnce/downOnce → may emit min/max when reaching bounds; always dispatch native change on display change.
- startspin/startupspin|startdownspin on beginning a hold; stopupspin|stopdownspin/stopspin on release.
- boostchange on level increments (payload includes step and capped flag).

Native attributes
- For type=number, core mirrors min/max/step to native attrs (and observes changes via MutationObserver).
- For text inputs, core avoids setting native min/max/step to prevent browser-imposed formatting.

