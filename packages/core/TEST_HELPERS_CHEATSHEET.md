# TouchSpin Tests — Contributor Cheatsheet

## Golden rules

* **Helpers-first**: all interactions and checks go through `apiHelpers` / `jqueryHelpers`.
* **Renderer-agnostic**: use `data-touchspin-injected="up|down|prefix|postfix"` — never Bootstrap classes.
* **Centralized logging**: logging is wired by initializers — do **not** add listeners in tests.
* **Deterministic waits**: use `waitForTouchspinInitialized`, `waitForSanitization`, or `expect*` helpers (no arbitrary sleeps).
* **AAA + one behavior per test**: Arrange–Act–Assert; descriptive titles; keep tests focused.

## Imports

```ts
import * as apiHelpers from '@__tests__/helpers/apiHelpers';
import * as jqueryHelpers from '@__tests__/helpers/jqueryHelpers'; // only for jQuery-based pages
// Optional targeted imports if truly needed:
// import { clickUpButton } from '@__tests__/helpers/apiHelpers/interactions/buttons';
```

## Canonical test skeleton

```ts
import { test, expect } from '@playwright/test';
import * as apiHelpers from '@__tests__/helpers/apiHelpers';

test.describe('TouchSpin: basic interactions', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);      // no-op unless COVERAGE=1
    await apiHelpers.waitForPageReady(page);   // fixture ready flag
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  test('should increment by step amount', async ({ page }) => {
    // Arrange
    await apiHelpers.initializeTouchspin(page, 'qty', { step: 3, initval: 9 });
    await apiHelpers.expectTouchSpinInitialized(page, 'qty');

    // Act
    await apiHelpers.clickUpButton(page, 'qty');

    // Assert
    await apiHelpers.expectValueToBe(page, 'qty', '12');
    await apiHelpers.expectEventFired(page, 'change');
  });
});
```

## Core vs jQuery initialization

```ts
// Core (no renderer)
await apiHelpers.initializeTouchspin(page, 'qty', { min: 0, max: 10, step: 1 });

// jQuery (with renderer) — from plugin helpers
import { installJqueryPlugin, initializeTouchspinJQuery } from '@touchspin/jquery-plugin/test-helpers';
await installJqueryPlugin(page);
await initializeTouchspinJQuery(page, 'qty', { min: 0, max: 10, step: 1 });
```

## Interactions (selection)

```ts
await apiHelpers.clickUpButton(page, 'qty');               // injected="up"
await apiHelpers.holdDownButton(page, 'qty', 300);
await apiHelpers.pressUpArrowKeyOnInput(page, 'qty');
await apiHelpers.wheelDownOnInput(page, 'qty');
await apiHelpers.fillWithValueAndBlur(page, 'qty', '12');
```

## Assertions & expectations

```ts
// value
await apiHelpers.expectValueToBe(page, 'qty', '11');
await apiHelpers.expectValueToBeBetween(page, 'qty', 10, 12);

// buttons (renderer-agnostic via injected role)
await apiHelpers.expectButtonToBeDisabled(page, 'qty', 'down');
await apiHelpers.expectButtonToBeEnabled(page, 'qty', 'up');

// events (centralized logger)
await apiHelpers.expectEventFired(page, 'touchspin.on.max');
await apiHelpers.expectNoEvent(page, 'touchspin.on.min', 800);
const changeCount = await apiHelpers.countEventInLog(page, 'change');
```

## Prefix/Postfix (renderer-agnostic)

```ts
await apiHelpers.hasPrefix(page, 'price', '$');
await apiHelpers.hasPostfix(page, 'weight', 'kg');
```

## Programmatic Core control (only if necessary)

```ts
await apiHelpers.setValueViaAPI(page, 'qty', 4);
await apiHelpers.incrementViaAPI(page, 'qty');
await apiHelpers.updateSettingsViaAPI(page, 'qty', { step: 2 });
```

## Step normalization — gotcha

> TouchSpin normalizes the value to a multiple of `step` during initialization.

```ts
// ❌ Unexpected: fixture value may not be divisible by step (e.g., 50 → 51 when step=3)
await apiHelpers.initializeTouchspin(page, 'qty', { step: 3 });

// ✅ Prefer step-divisible initial values
await apiHelpers.initializeTouchspin(page, 'qty', { step: 3, initval: 48 });
```

## Common patterns

### Event verification

```ts
await apiHelpers.initializeTouchspin(page, 'qty', { step: 1 });
await apiHelpers.clearEventLog(page);
await apiHelpers.clickUpButton(page, 'qty');
expect(await apiHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
```

### Boundary enforcement

```ts
await apiHelpers.initializeTouchspin(page, 'qty', { max: 10, initval: 10 });
await apiHelpers.clickUpButton(page, 'qty');
await apiHelpers.expectValueToBe(page, 'qty', '10');
await apiHelpers.expectEventFired(page, 'touchspin.on.max');
```

### Polled expectation during spin

```ts
await apiHelpers.initializeTouchspin(page, 'qty', { step: 2, initval: 10 });
await apiHelpers.startUpSpinViaAPI(page, 'qty');
await apiHelpers.expectValueToBeGreaterThan(page, 'qty', 15);
await apiHelpers.stopSpinViaAPI(page, 'qty');
```

## Anti-patterns

* Direct DOM ops on TouchSpin controls (`page.locator(...).click()`) → **use helpers**.
* Adding listeners in tests (`addEventListener`, `$(document).on(...)`) → **logging is centralized**.
* Bootstrap class selectors → **use injected roles**.
* Arbitrary `waitForTimeout` → **use deterministic waits/expectations**.

## Coverage & debug

```ts
await apiHelpers.startCoverage(page);
// ...
await apiHelpers.collectCoverage(page, test.info().title);

const log = await apiHelpers.getEventLog(page);
const native = await apiHelpers.getEventsOfType(page, 'native');
const ts = await apiHelpers.getEventsOfType(page, 'touchspin');
```
