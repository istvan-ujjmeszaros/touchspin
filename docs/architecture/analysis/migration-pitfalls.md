# Migration Pitfalls (v4 → v5)

Key differences to watch when moving from the v4 monolithic plugin to the v5 core + wrapper + renderer architecture.

Instance storage
- v4: `$(input).data('touchspinInternal')` stored API.
- v5: `input._touchSpinCore` stores the core; wrapper fetches/bridges.

Event plumbing
- v4: Plugin triggers `touchspin.on.*` directly.
- v5: Core emits internal events; wrapper bridges to `touchspin.on.*`. Behavior is equivalent for consumers.

Change events
- v4: blur/focusout/enter sanitize then trigger jQuery `change`.
- v5: intercepts native `change` in capture to suppress intermediate values; blur/Enter triggers final native `change` after sanitization.

Native attribute sync
- v4: always sync min/max/step to input.
- v5: sync only for `type="number"`; avoids browser precision quirks for text inputs.

Spin lifecycle and boundaries
- Start: `startspin` then `startupspin|startdownspin`.
- Boundary: `min|max` fire before the display change on exact bounds; holds stop immediately at boundary.
- Stop: `stopupspin|stopdownspin` then `stopspin`.

Renderer responsibilities
- v4: Plugin bound events; renderer returned jQuery structures.
- v5: Renderer uses DOM, sets roles + testids, and calls core attach methods.

Prefix/Postfix
- v4: Renderer structures differ; plugin hides empty ones.
- v5: Same behavior; renderers include elements; core may hide empties.

Sanitization
- v4: scattered normalization (numbers, timings).
- v5: strict sanitize before/after merge; observers fire only on effective changes.

Wheel interactions
- Both: wheel only when input focused; prevent default to avoid page scroll; up/down are single steps.

Testing impact
- v5 injects deterministic testids; use data-testid selectors (e.g., `{id}-up`) not framework classes.

