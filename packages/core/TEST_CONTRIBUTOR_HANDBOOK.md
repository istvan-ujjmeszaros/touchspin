# TouchSpin Tests — Contributor Cheatsheet (Extended)

> Opinionated guide for writing clean, stable, renderer-agnostic Playwright tests with our helpers.

---

## Table of contents

1. [Golden rules](#golden-rules)
2. [Imports & module boundaries](#imports--module-boundaries)
3. [Canonical skeletons](#canonical-skeletons)

  * [Core](#core-skeleton)
  * [jQuery + renderer](#jquery--renderer-skeleton)
4. [Initialization](#initialization)
5. [Interactions](#interactions)
6. [Assertions & expectations](#assertions--expectations)
7. [Events & logging](#events--logging)
8. [Prefix/Postfix](#prefixpostfix)
9. [Programmatic Core control](#programmatic-core-control)
10. [Common patterns (recipes)](#common-patterns-recipes)
11. [Step normalization (gotcha)](#step-normalization-gotcha)
12. [Parametric tests](#parametric-tests)
13. [Flakiness playbook](#flakiness-playbook)
14. [Coverage & reports](#coverage--reports)
15. [Debugging helpers](#debugging-helpers)
16. [Anti-patterns](#anti-patterns)
17. [Review checklist](#review-checklist)

---

## Golden rules

* **Helpers-first**: all interactions and checks go through `apiHelpers` / `jqueryHelpers`.
* **Renderer-agnostic**: rely on `data-touchspin-injected="up|down|prefix|postfix"`, never on Bootstrap classes.
* **Centralized logging**: logging is wired by initializers; do **not** attach listeners in tests.
* **Deterministic waits**: use `waitForTouchspinInitialized`, `waitForSanitization`, or `expect*` helpers (no raw sleeps).
* **AAA + one behavior per test**: Arrange–Act–Assert; focused assertions; descriptive titles.

---

## Imports & module boundaries

```ts
import * as apiHelpers from '@__tests__/helpers/apiHelpers';
import * as jqueryHelpers from '@__tests__/helpers/jqueryHelpers'; // only for jQuery-based suites
```

* Prefer barrel imports above.
* Avoid importing deep files directly unless you know exactly why.
* Never bypass helpers with raw `page.locator(...)` on TouchSpin parts.

---

## Canonical skeletons

### Core skeleton

```ts
import { test } from '@playwright/test';
import * as apiHelpers from '@__tests__/helpers/apiHelpers';

test.describe('TouchSpin: <feature>', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);      // no-op unless COVERAGE=1
    await apiHelpers.waitForPageReady(page);   // fixture flag
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  test('should <expected behavior>', async ({ page }) => {
    // Arrange
    await apiHelpers.initializeTouchspin(page, 'qty', { min: 0, max: 10, step: 1 });
    await apiHelpers.expectTouchSpinInitialized(page, 'qty');

    // Act
    await apiHelpers.clickUpButton(page, 'qty');

    // Assert
    await apiHelpers.expectValueToBe(page, 'qty', '1');
    await apiHelpers.expectEventFired(page, 'change');
  });
});
```

### jQuery + renderer skeleton

```ts
import { test } from '@playwright/test';
import * as apiHelpers from '@__tests__/helpers/apiHelpers';
import { installJqueryPlugin, initializeTouchspinJQuery } from '@touchspin/jquery-plugin/test-helpers';

test.describe('TouchSpin (jQuery+renderer): <feature>', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.waitForPageReady(page);
    await installJqueryPlugin(page);  // sets renderer + centralized logging
    await apiHelpers.clearEventLog(page);
  });

  test('should render prefix and increment with button', async ({ page }) => {
    await initializeTouchspinJQuery(page, 'price', { min: 0, max: 10, step: 1 });
    await apiHelpers.expectTouchSpinInitialized(page, 'price');

    await apiHelpers.hasPrefix(page, 'price', '$');     // renderer-agnostic
    await apiHelpers.clickUpButton(page, 'price');

    await apiHelpers.expectValueToBe(page, 'price', '1');
    await apiHelpers.expectEventFired(page, 'change');
  });
});
```

---

## Initialization

```ts
// Core (no renderer)
await apiHelpers.initializeTouchspin(page, 'qty', { min: 0, max: 10, step: 1 });

// jQuery + renderer
await installJqueryPlugin(page);
await initializeTouchspinJQuery(page, 'qty', { min: 0, max: 10, step: 1 });

// Readiness checks
await apiHelpers.expectTouchSpinInitialized(page, 'qty');
// or (boolean)
const ready = await apiHelpers.isTouchSpinInitialized(page, 'qty');
```

**Note:** Logging is automatically wired by the initializers; don’t call setup in tests.

---

## Interactions

```ts
await apiHelpers.clickUpButton(page, 'qty');
await apiHelpers.clickDownButton(page, 'qty');

await apiHelpers.holdUpButton(page, 'qty', 300);
await apiHelpers.holdDownButton(page, 'qty', 300);

await apiHelpers.pressUpArrowKeyOnInput(page, 'qty');
await apiHelpers.pressDownArrowKeyOnInput(page, 'qty');
await apiHelpers.holdUpArrowKeyOnInput(page, 'qty', 250);
await apiHelpers.holdDownArrowKeyOnInput(page, 'qty', 250);

await apiHelpers.wheelUpOnInput(page, 'qty');
await apiHelpers.wheelDownOnInput(page, 'qty');

await apiHelpers.fillWithValue(page, 'qty', '12');
await apiHelpers.fillWithValueAndBlur(page, 'qty', '12');  // triggers blur sanitization
```

---

## Assertions & expectations

```ts
// Values
await apiHelpers.expectValueToBe(page, 'qty', '11');
await apiHelpers.expectValueToBeBetween(page, 'qty', 10, 12);
await apiHelpers.expectValueToBeGreaterThan(page, 'qty', 10);
await apiHelpers.expectValueToBeLessThan(page, 'qty', 20);

// Buttons (injected roles)
await apiHelpers.expectButtonToBeDisabled(page, 'qty', 'down');
await apiHelpers.expectButtonToBeEnabled(page, 'qty', 'up');

// Events (central log)
await apiHelpers.expectEventFired(page, 'touchspin.on.max');
await apiHelpers.expectNoEvent(page, 'touchspin.on.min', 800);
await apiHelpers.expectEventCount(page, 'change', 2);
```

---

## Events & logging

* Centralized, idempotent logging is wired by initializers.
* Inspect/clear via helpers:

```ts
await apiHelpers.clearEventLog(page);

const seen = await apiHelpers.hasEventInLog(page, 'change', 'native');
const count = await apiHelpers.countEventInLog(page, 'change');
await apiHelpers.waitForEventInLog(page, 'touchspin.on.stopspin', { timeout: 2000 });

const all = await apiHelpers.getEventLog(page);
const nativeOnly = await apiHelpers.getEventsOfType(page, 'native');
const tsOnly = await apiHelpers.getEventsOfType(page, 'touchspin');
```

**Event names (TouchSpin DOM events):**
`touchspin.on.min`, `touchspin.on.max`, `touchspin.on.startspin`, `touchspin.on.startupspin`, `touchspin.on.startdownspin`, `touchspin.on.stopspin`, `touchspin.on.stopupspin`, `touchspin.on.stopdownspin`
**Native we care about:** `change`

---

## Prefix/Postfix

```ts
await apiHelpers.hasPrefix(page, 'price', '$');
await apiHelpers.hasPostfix(page, 'weight', 'kg');
```

Renderer-agnostic via injected roles.

---

## Programmatic Core control

> Use only when user-like interactions can’t cover the case.

```ts
await apiHelpers.setValueViaAPI(page, 'qty', 4);
await apiHelpers.incrementViaAPI(page, 'qty');
await apiHelpers.decrementViaAPI(page, 'qty');
await apiHelpers.startUpSpinViaAPI(page, 'qty');
await apiHelpers.stopSpinViaAPI(page, 'qty');
await apiHelpers.updateSettingsViaAPI(page, 'qty', { step: 2 });

const num = await apiHelpers.getNumericValue(page, 'qty');
const publicApi = await apiHelpers.getPublicAPI(page, 'qty'); // opaque in tests
```

---

## Common patterns (recipes)

### 1) Value change (step)

```ts
await apiHelpers.initializeTouchspin(page, 'qty', { step: 3, initval: 9 });
await apiHelpers.clickUpButton(page, 'qty');
await apiHelpers.expectValueToBe(page, 'qty', '12');
```

### 2) Boundary (max)

```ts
await apiHelpers.initializeTouchspin(page, 'qty', { max: 10, initval: 10 });
await apiHelpers.clickUpButton(page, 'qty');
await apiHelpers.expectValueToBe(page, 'qty', '10');
await apiHelpers.expectEventFired(page, 'touchspin.on.max');
```

### 3) Spin with polling

```ts
await apiHelpers.initializeTouchspin(page, 'qty', { step: 2, initval: 10 });
await apiHelpers.startUpSpinViaAPI(page, 'qty');
await apiHelpers.expectValueToBeGreaterThan(page, 'qty', 15);
await apiHelpers.stopSpinViaAPI(page, 'qty');
```

### 4) Event verification

```ts
await apiHelpers.initializeTouchspin(page, 'qty', { step: 1 });
await apiHelpers.clearEventLog(page);
await apiHelpers.clickDownButton(page, 'qty');
await apiHelpers.expectEventFired(page, 'change');
```

### 5) Prefix/Postfix presence

```ts
await apiHelpers.initializeTouchspinJQuery(page, 'price', { step: 1 });
await apiHelpers.hasPrefix(page, 'price', '$');
```

---

## Step normalization (gotcha)

> TouchSpin normalizes the initial value to the nearest multiple of `step` during initialization.

```ts
// ❌ Pitfall: fixture value 50 with step 3 may become 51 during init
await apiHelpers.initializeTouchspin(page, 'qty', { step: 3 });

// ✅ Prefer supplying a divisible init value
await apiHelpers.initializeTouchspin(page, 'qty', { step: 3, initval: 48 });
```

**Rule of thumb:**

* `step: 1` → any integer
* `step: 2` → even numbers
* `step: 3` → multiples of 3
* `step: 5` → multiples of 5
* `step: 0.1` → one decimal steps, ensure string inputs use `.`

---

## Parametric tests

```ts
const cases = [
  { name: 'clamp to min', initval: '-5', expected: '0', opts: { min: 0, max: 10 } },
  { name: 'clamp to max', initval: '99', expected: '10', opts: { min: 0, max: 10 } },
];

for (const c of cases) {
  test(`sanitize: ${c.name}`, async ({ page }) => {
    await apiHelpers.initializeTouchspin(page, 'qty', c.opts);
    await apiHelpers.fillWithValueAndBlur(page, 'qty', c.initval);
    await apiHelpers.expectValueToBe(page, 'qty', c.expected);
  });
}
```

---

## Flakiness playbook

* Prefer **state waits** and **polled expectations** over timeouts.
* Never use raw `waitForTimeout` in tests; add/extend a helper if needed.
* Avoid racing logs → `await apiHelpers.waitForEventInLog(page, 'touchspin.on.stopspin')`.
* Keep tests small and focused; split long flows.
* Make initial values **step-divisible**.
* In CI, keep viewport and device scale defaults; don’t rely on hover timing.

---

## Coverage & reports

```ts
// Start/collect (no-op unless COVERAGE=1)
await apiHelpers.startCoverage(page);
// ... run actions
await apiHelpers.collectCoverage(page, test.info().title);
```

Reports are saved under `reports/playwright-coverage/` (raw V8 JSON). Post-processing runs in teardown.

---

## Debugging helpers

```ts
const events = await apiHelpers.getEventLog(page);
console.log(events);

const native = await apiHelpers.getEventsOfType(page, 'native');
const tsOnly = await apiHelpers.getEventsOfType(page, 'touchspin');
```

Tips:

* Add a temporary `await apiHelpers.expectEventCount(page, 'change', N)` to ensure your flow emits the expected number of changes.
* If something “sometimes” fails, assert intermediate states with `expectValueToBeBetween`.

---

## Anti-patterns

* Direct DOM ops on TouchSpin parts: `page.locator(...).click()` → **use helpers**.
* Attaching listeners in tests (`addEventListener`, `$(document).on(...)`) → **logging is centralized**.
* Bootstrap class selectors → **use injected roles**.
* Arbitrary sleeps (`waitForTimeout`) → **use deterministic waits/expectations**.
* Mixing Core and jQuery init in the same test file → keep them in separate suites.

---

## Review checklist

* [ ] Only `apiHelpers` / `jqueryHelpers` used for TouchSpin interactions.
* [ ] Renderer-agnostic locators (no Bootstrap classes).
* [ ] No raw sleeps; expectations/waits are deterministic.
* [ ] No test-level event listeners; logging relies on central setup.
* [ ] Test names describe behavior (“should …”), one behavior per test.
* [ ] If helpers were edited, examples/cheatsheet updated accordingly.
