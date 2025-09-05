# Behavior‑First: How I Rewrote Bootstrap TouchSpin Without Losing Sleep

I didn’t set out to change the spinner’s features. I wanted to change how it felt to work on it.

When I opened the v4.x code, I saw one file doing many jobs: math, timing, event wiring, rendering for multiple frameworks. It had grown carefully, but every change cut across concerns. Adding a variation for Bootstrap or Tailwind was doable, but it wasn’t calm.

I gave myself three constraints.

First, behavior had to stay intact. If someone was listening to `touchspin.on.*` or `change`, I wanted their app to keep working. Second, tests would be end‑to‑end only. I didn’t want to freeze the internals with unit tests when the whole point was to move them around. Third, the core couldn’t know about frameworks. Presentation would live elsewhere.

With those guardrails, I rewrote the architecture.

The core became the single source of truth for state and behavior: value math, ARIA, native attribute sync for `type="number"`, and the spin timers. It exposes a small public API and an event emitter. The jQuery wrapper turned into a translation layer: it forwards commands to the core and re‑emits core events in the same names developers already use. And renderers focus solely on DOM—they build the markup for Bootstrap 3/4/5 or Tailwind and then call into the core to attach behavior.

Two decisions made the rest of the work fall into place.

I wrote down the contracts. Renderers add simple data roles (`wrapper`, `up`, `down`, `prefix`, `postfix`) and derive predictable test ids from the input’s `data-testid`. That gave me selectors that don’t break when markup shifts across frameworks. And I documented event ordering: spin starts with `startspin`, then a directional start; hitting exact min/max fires `min|max` before the display changes; spin ends with a directional stop and then `stopspin`. Those rules were easy to test and easy to reason about in code.

The other decision was to treat change events with some care. Inputs often dispatch `change` at moments that aren’t useful to applications. I intercepted native `change` in the capture phase when sanitation would alter the value and delayed the real `change` until blur/Enter with the final, sanitized display. Apps stopped reacting to intermediate values, which made them quieter and more predictable.

Along the way, a few debugging moments stood out. I chased a hold that wouldn’t stop at the boundary; turning the scenario into a small sequence diagram revealed the missing stop event. I tracked down extra `change` events while typing; capturing and gating them moved the responsibility to a place that matched user intent.

What changed for me wasn’t just the file layout. I can now add a renderer without touching core logic. Teardown is clear—renderers remove what they injected, the wrapper unhooks its bridges, and the core cleans up timers and observers. New contributors can read a short set of contracts and understand how the system fits together.

If you’re considering a similar rewrite, I’d suggest this order: define the contracts (roles, selectors, event order), write end‑to‑end tests that prove them, and then reshape the code underneath. Keep history in a separate document so your main README can focus on how to extend the system today. The result is code that’s easier to change because the behavior is easy to trust.
