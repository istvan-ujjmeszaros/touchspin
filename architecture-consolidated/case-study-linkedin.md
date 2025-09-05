# The Safety Net: How E2E Tests Let Me Rewrite TouchSpin Without Breaks

I inherited Bootstrap TouchSpin, a popular jQuery spinner used across thousands of projects. It worked for users—but it wasn’t fun to change. Rendering, behavior, and event wiring lived in one place. Adding Bootstrap/Tailwind variants felt like surgery.

I decided to flip the usual refactor playbook: protect behavior first, then change everything underneath.

My approach was simple and strict:
1) Anchor the project in Playwright end‑to‑end tests. No unit tests. The tests define the behavioral contract users rely on.
2) Split the component into three parts: a framework‑agnostic core (math, timers, ARIA, events), a tiny jQuery wrapper (compatibility), and pluggable renderers (Bootstrap 3/4/5, Tailwind) that only build DOM.
3) Document the invariants that actually matter to users: event order, boundary behavior, and when native `change` should fire.

Two decisions changed everything.

First, I set a renderer contract. Renderers mark injected elements with simple roles (`wrapper`, `up`, `down`, `prefix`, `postfix`) and derive test ids from the input (`{id}-up`, `{id}-down`, …). Tests stopped caring about DOM shape differences; I stopped chasing selector flakiness.

Second, I locked in the event timeline and boundary rules. A spin starts with `startspin`, then a directional start. Hitting an exact `min|max` fires the boundary event before the display changes; holds stop immediately at the edge. A spin ends with a directional stop and then `stopspin`. With this sequence in place, debugging became boring—in the best way.

Here’s the feel of the before and after:

Original (monolithic, jQuery‑dependent)
```javascript
$.fn.TouchSpin = function(options) {
  return this.each(function() {
    // DOM + math + events in one file
    // hardcoded Bootstrap markup
  });
};
```

Modern (behavior‑first, modular)
```javascript
// Core owns behavior
class TouchSpinCore { upOnce() { /* proactive boundaries + events */ } }
// Wrapper is compatibility
$.fn.TouchSpin = function(opts) { return this.each(function(){ TouchSpin(this, opts); }); };
// Renderers build DOM then call core.attachUpEvents/attachDownEvents
```

The result is calm change. I can add a renderer without touching core logic. Apps listening to `change` no longer get noisy intermediate values because I gate native `change` until sanitation completes. Teardown is straightforward. New contributors can read the contracts and immediately understand where things belong.

If you’re facing a similar rewrite, start by writing the contracts (roles, selectors, event order) and make your E2E tests the spec. When behavior is protected, refactoring stops being scary—and starts being fast.
