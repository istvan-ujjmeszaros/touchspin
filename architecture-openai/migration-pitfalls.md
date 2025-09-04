# Migration Pitfalls (Legacy → Core)

Key differences to watch when migrating from the monolithic v4 plugin to the v5 core + wrapper + renderer architecture.

Instance storage
- Legacy: `$(input).data('touchspinInternal')` stored API.
- Core: `input._touchSpinCore` stores the core; wrapper fetches via getTouchSpin.

Event plumbing
- Legacy: Plugin triggers `touchspin.on.*` directly.
- Core: Emits internal events; wrapper bridges to `touchspin.on.*`. Behavior is equivalent for consumers.

Change events
- Legacy: blur/focusout/enter paths sanitize and then trigger jQuery `change`.
- Core: intercepts native `change` in capture to suppress intermediate wrong values; blur/Enter triggers final native `change` after sanitization.
- Impact: Fewer mid-typing change events; final value is cleaner.

Native attribute sync
- Legacy: always sync min/max/step to input.
- Core: sync only for `type="number"`; avoids browser precision quirks for text inputs.

Spin lifecycle
- Start: same ordering (startspin then direction-specific).
- Boundary: min/max events fire before the display change when reaching exact bounds.
- Stop: stopupspin|stopdownspin then stopspin.

Renderer responsibilities
- Legacy: Plugin bound events on jQuery elements; renderer returned jQuery structures.
- Core: Renderer uses vanilla DOM; must set data-touchspin-injected roles and testids; calls core.attachUpEvents/attachDownEvents.

Prefix/Postfix handling
- Legacy: Renderer structures differ; plugin hides empty ones.
- Core: Same behavior; core hides empty prefix/postfix; renderer should render elements even if empty.

Sanitization
- Legacy: normalization scattered; decimals coerced, min/max string numbers coerced to numbers, stepinterval timings adjusted.
- Core: strict sanitization for step>0, decimals>=0, min/max null or finite, interval/delay non-negative; observers notified only on effective changes.

Wheel interactions
- Both: wheel only when input focused; prevent default to avoid page scroll; up/down as single steps.

Testing impact
- Core injects testids; tests should use data-testid selectors (e.g., {id}-up) rather than legacy classes.
- Wrapper pages are best for end-to-end parity checks.

