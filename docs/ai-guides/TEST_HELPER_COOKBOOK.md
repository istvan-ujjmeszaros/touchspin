
# The TouchSpin Test Helper Cookbook

This guide is a practical cookbook for using the test helpers in the TouchSpin project. It provides copy-and-paste examples for the most common testing scenarios.

## 1. Initialization

*For a more detailed guide on initialization, see `TEST_INITIALIZATION_GUIDE.md`.*

### Core Tests

Use `initializeTouchspinWithVanilla` for core tests that provide full TouchSpin functionality.

```typescript
import { initializeTouchspinWithVanilla } from '@touchspin/core/test-helpers';

await initializeTouchspinWithVanilla(page, 'test-input', {
  step: 5,
  initval: 10
});
```

### jQuery Plugin Tests

Use `initializeTouchspinJQuery` for jQuery plugin tests.

```typescript
import { initializeTouchspinJQuery } from '../helpers/jquery-initialization';

await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });
```

### Renderer Tests

Use `initializeTouchspinWithRenderer` for testing specific renderers.

```typescript
import { initializeTouchspinWithRenderer } from '@touchspin/core/test-helpers';

const RENDERER_URL = '/packages/renderers/bootstrap5/devdist/index.js';
await initializeTouchspinWithRenderer(page, 'test-input', RENDERER_URL);
```

### Web Component Tests

Use `initializeWebComponentTest` and then create the element.

```typescript
import { initializeWebComponentTest } from '@touchspin/core/test-helpers';

await initializeWebComponentTest(page);

await page.evaluate(() => {
  const element = document.createElement('touchspin-input');
  element.setAttribute('data-testid', 'my-component');
  document.body.appendChild(element);
});
```

---

## 2. Interactions

### Clicking Buttons

```typescript
// Click the up button
await apiHelpers.clickUpButton(page, 'test-input');

// Click the down button
await apiHelpers.clickDownButton(page, 'test-input');
```

### Keyboard Interactions

```typescript
// Press the up arrow key on the input
await apiHelpers.pressUpArrowKeyOnInput(page, 'test-input');

// Press the down arrow key on the input
await apiHelpers.pressDownArrowKeyOnInput(page, 'test-input');
```

### Typing in the Input

```typescript
// Type a value into the input
await apiHelpers.typeInInput(page, 'test-input', '50');

// Fill the input and then blur it to trigger change events
await apiHelpers.fillWithValueAndBlur(page, 'test-input', '75');
```

### Core API Interactions

These helpers interact directly with the `TouchSpinCore` instance. **Note:** These only work with tests initialized using `initializeTouchspinWithVanilla`, `initializeTouchspinWithRenderer`, or jQuery plugin initialization, not with the stub `core-adapter`.

```typescript
// First, initialize with a method that provides full API access
import { initializeTouchspinWithVanilla } from '@touchspin/core/test-helpers';
await initializeTouchspinWithVanilla(page, 'test-input', { step: 5, initval: 10 });

// Now API interactions work:
// Increment the value via the API
await apiHelpers.incrementViaAPI(page, 'test-input');

// Decrement the value via the API
await apiHelpers.decrementViaAPI(page, 'test-input');

// Set the value via the API
await apiHelpers.setValueViaAPI(page, 'test-input', '88');

// Update settings via the API
await apiHelpers.updateSettingsViaAPI(page, 'test-input', { step: 10 });
```

---

## 3. Reading Values

### Reading the Display Value

This returns the value as it appears in the input element (a string).

```typescript
const displayValue = await apiHelpers.readInputValue(page, 'test-input');
expect(displayValue).toBe('50.00');
```

### Reading the Numeric Value

This returns the parsed numeric value of the input (a number).

```typescript
const numericValue = await apiHelpers.getNumericValue(page, 'test-input');
expect(numericValue).toBe(50);
```

---

## 4. Assertions

### Asserting Values

These helpers poll the DOM, so you don't need manual waits.

```typescript
// Assert that the value is exactly '25'
await apiHelpers.expectValueToBe(page, 'test-input', '25');

// Assert that the value is greater than 10
await apiHelpers.expectValueToBeGreaterThan(page, 'test-input', 10);

// Assert that the value is less than 30
await apiHelpers.expectValueToBeLessThan(page, 'test-input', 30);
```

### Asserting Component State

```typescript
// Assert that TouchSpin is initialized
await apiHelpers.expectTouchSpinInitialized(page, 'test-input');

// Assert that a button is disabled
await apiHelpers.expectButtonToBeDisabled(page, 'test-input', 'up');

// Assert that a button is enabled
await apiHelpers.expectButtonToBeEnabled(page, 'test-input', 'down');
```

### Asserting Events

The event logging system is a powerful tool for verifying behavior.

```typescript
// First, clear the event log before acting
await apiHelpers.clearEventLog(page);

// ... perform an action ...

// Assert that a 'change' event was fired
await apiHelpers.expectEventFired(page, 'change');

// Assert that a specific TouchSpin event was fired
await apiHelpers.expectEventFired(page, 'touchspin.on.max');

// Assert that an event was NOT fired
await apiHelpers.expectNoEvent(page, 'touchspin.on.startspin');

// Assert that an event was fired a specific number of times
await apiHelpers.expectEventCount(page, 'change', 3);
```
