# The Safety Net: How E2E Tests Enabled a Complete Architectural Rewrite

I wanted to modernize Bootstrap TouchSpin without breaking anyone’s app. That meant changing everything on the inside while changing nothing on the outside—a paradox unless you treat behavior as a contract and make your tests the enforcer.

The paradox of legacy modernization
TouchSpin started life as a focused jQuery plugin (~873 lines) with hardcoded Bootstrap markup. It grew into a more flexible monolith (~1,5k lines) that supported multiple Bootstrap versions, but rendering, behavior, and event wiring still lived together. Supporting Tailwind or adding new variants meant threading changes through tightly coupled code. Users were happy; maintainers were careful; velocity suffered.

Why I bet on end‑to‑end tests
If you’re going to move code around aggressively, unit tests can slow you down by locking in internal structure. I chose Playwright end‑to‑end tests—on purpose—because they only care about what users see and do.

My testing philosophy was simple:
1) Write Playwright tests for every user interaction and edge case.
2) Treat the tests as the behavioral contract.
3) Consider any implementation that passes the tests equivalent.
4) Let the test suite be both the spec and the safety net.

Three stages, one experience

Stage 1 — The original (focused and simple)
```javascript
$.fn.TouchSpin = function(options) {
  return this.each(function() {
    // 873 lines of tightly coupled jQuery + Bootstrap DOM
    // hardcoded HTML construction
  });
};
```

Stage 2 — The enhanced monolith (more flexible, still coupled)
```javascript
$.fn.TouchSpin = function(options, command) {
  if (typeof options === 'string') return handleCommand(this, options, command);
  const renderer = RendererFactory.getRenderer(settings);
  const elements = renderer.buildInputGroup(input, settings);
};
```

Stage 3 — The modular rewrite (behavior‑first)
```javascript
// packages/core/src/index.js
class TouchSpinCore {
  upOnce() {
    if (this.getValue() === this.settings.max) { this.emit('max'); return; }
    // proactive boundaries + events + display update
  }
}

// packages/jquery-plugin/src/index.js
$.fn.TouchSpin = function(options) {
  return this.each(function() { const api = TouchSpin(this, options); /* bridge events */ });
};

// packages/renderers/bootstrap5/src/Bootstrap5Renderer.js
class Bootstrap5Renderer { init() { this.buildWrapper(); this.core.attachUpEvents(this.up); this.core.attachDownEvents(this.down); } }
```

The architectural choices that made it work
Separation of concerns was the foundation. The core became the single source of truth for value math, constraints, timers, ARIA, and native attribute sync (only for `type="number"`). The jQuery wrapper became an adapter that forwards commands to the core and re‑emits core events using the legacy names developers rely on. Renderers build DOM for Bootstrap 3/4/5 and Tailwind, then call `core.attachUpEvents/attachDownEvents`—they don’t own behavior.

I also wrote down the rules users implicitly depend on:
- Event ordering: `startspin` → directional start; on exact bounds `min|max` fire before the display change; spin stops with a directional stop then `stopspin`.
- Change discipline: intercept native `change` in capture when sanitation would alter the value and emit the final `change` after blur/Enter only if the display truly changed.
- Boundary prevention: don’t start a hold at min/max; stop immediately on hitting the bound.

The test suite as living documentation
The same Playwright tests ran against the monolith and the modular architecture. If a test failed under the new architecture but passed before, I had a regression. If they all passed, I had behavioral equivalence. The tests became the spec I could trust.

Two stories from the trenches
I chased a spin that wouldn’t stop at max. A quick sequence diagram clarified the timeline: emit `max`, then `stopupspin`, then `stopspin`. One missing stop event—fixed.

I tracked down noisy `change` events while typing. Capturing `change` and gating emission until sanitation on blur/Enter removed the noise without losing the final update. Apps got quieter and more predictable.

Results and impact
Users kept their exact behavior. Developers gained a framework‑agnostic core, optional jQuery compatibility, and renderers that are easy to review. I can add a new renderer without touching core logic. Teardown is clean. Onboarding is clearer.

If you’re planning a similar rewrite
Start by writing the contracts (roles, selectors, event order). Back them with end‑to‑end tests that prove real behavior. Then reshape the internals with confidence. Keep history separate so your main README can focus on how to extend the system today. The result is simple: code that’s easier to change because behavior is easier to trust.
