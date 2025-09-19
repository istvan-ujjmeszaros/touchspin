# TouchSpin Test Helpers Cheatsheet

Quick reference for writing clean, focused TouchSpin tests.

## 🚀 Quick Start

```typescript
import { test, expect } from '@playwright/test';
import * as apiHelpers from '../../../__tests__/helpers/touchspinApiHelpers';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'my-feature');
  });

  test('should increment value when up button clicked', async ({ page }) => {
    await apiHelpers.initializeTouchspin(page, 'test-input', { step: 5 });
    await apiHelpers.clickUpButton(page, 'test-input');
    expect(await apiHelpers.readInputValue(page, 'test-input')).toBe('55');
  });
});
```

## 📁 Modular Imports (Recommended)

```typescript
// Specific imports for cleaner code
import { clickUpButton, holdDownButton } from '../../../__tests__/helpers/interactions/buttons';
import { expectValueToBe } from '../../../__tests__/helpers/assertions/values';
import { setupLogging, clearEventLog } from '../../../__tests__/helpers/events';
import { initializeTouchspin } from '../../../__tests__/helpers/core/initialization';
```

## 🎯 Common Test Patterns

### Pattern 1: Basic Value Change Test
```typescript
test('should increment by step amount', async ({ page }) => {
  await apiHelpers.initializeTouchspin(page, 'test-input', { step: 3, initval: 9 });
  await apiHelpers.clickUpButton(page, 'test-input');
  expect(await apiHelpers.readInputValue(page, 'test-input')).toBe('12');
});
```

### Pattern 2: Event Verification Test
```typescript
test('should emit change event on increment', async ({ page }) => {
  await apiHelpers.initializeTouchspin(page, 'test-input', { step: 1 });
  await apiHelpers.clearEventLog(page);
  await apiHelpers.clickUpButton(page, 'test-input');
  expect(await apiHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
});
```

### Pattern 3: Boundary Enforcement Test
```typescript
test('should not increment beyond maximum', async ({ page }) => {
  await apiHelpers.initializeTouchspin(page, 'test-input', { max: 10, initval: 10 });
  await apiHelpers.clearEventLog(page);
  await apiHelpers.clickUpButton(page, 'test-input');
  expect(await apiHelpers.readInputValue(page, 'test-input')).toBe('10');
  expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.max', 'touchspin')).toBe(true);
});
```

### Pattern 4: Polled Expectations Test
```typescript
test('should reach target value during spinning', async ({ page }) => {
  await apiHelpers.initializeTouchspin(page, 'test-input', { step: 2, initval: 10 });
  await apiHelpers.startUpSpinViaAPI(page, 'test-input');
  await apiHelpers.expectValueToBeGreaterThan(page, 'test-input', 15);
  await apiHelpers.stopSpinViaAPI(page, 'test-input');
});
```

## 🏗️ Initialization Helpers

### Core vs jQuery

```typescript
// Core initialization (no renderer, API/keyboard/wheel only)
await apiHelpers.initializeTouchspin(page, 'test-input', {
  step: 5,
  min: 0,
  max: 100,
  initval: 50  // Set initial value before Core init
});

// jQuery initialization (with Bootstrap5 renderer, full UI)
await apiHelpers.installJqueryPlugin(page);
await apiHelpers.initializeTouchspinJQuery(page, 'test-input', {
  step: 5,
  min: 0,
  max: 100
});
```

## 🎮 Interaction Methods

### Direct API vs User Actions

```typescript
// API methods (direct calls, no DOM events)
await apiHelpers.incrementViaAPI(page, 'test-input');
await apiHelpers.decrementViaAPI(page, 'test-input');

// User interactions (full DOM event simulation)
await apiHelpers.clickUpButton(page, 'test-input');
await apiHelpers.pressUpArrowKeyOnInput(page, 'test-input');
await apiHelpers.wheelUpOnInput(page, 'test-input');
```

## 📊 Event Log System

### Setup and Usage

```typescript
// Setup logging (call once per page, idempotent)
await apiHelpers.setupLogging(page);

// Clear before each test
await apiHelpers.clearEventLog(page);

// Check for events
expect(await apiHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.min', 'touchspin')).toBe(true);

// Count events
expect(await apiHelpers.countEventInLog(page, 'change')).toBe(2);

// Wait for events
await apiHelpers.waitForEventInLog(page, 'touchspin.on.startspin', { timeout: 2000 });
```

### Event Types
- **Native events**: `change`, `blur`, `focus`
- **TouchSpin events**: `touchspin.on.min`, `touchspin.on.max`, `touchspin.on.startspin`, `touchspin.on.stopspin`

## ⏱️ Assertions & Expectations

### Value Assertions
```typescript
// Direct assertions (for final state)
expect(await apiHelpers.readInputValue(page, 'test-input')).toBe('42');
expect(await apiHelpers.getNumericValue(page, 'test-input')).toBe(42);

// Polled expectations (wait for changes)
await apiHelpers.expectValueToBe(page, 'test-input', '42');
await apiHelpers.expectValueToBeGreaterThan(page, 'test-input', 40);
await apiHelpers.expectValueToBeLessThan(page, 'test-input', 50);
await apiHelpers.expectValueToBeBetween(page, 'test-input', 40, 50);
```

### Button State Assertions
```typescript
await apiHelpers.expectButtonToBeDisabled(page, 'test-input', 'up');
await apiHelpers.expectButtonToBeEnabled(page, 'test-input', 'down');
```

### Event Assertions
```typescript
await apiHelpers.expectEventFired(page, 'touchspin.on.startspin');
await apiHelpers.expectNoEvent(page, 'touchspin.on.stopspin', 1000);
await apiHelpers.expectEventCount(page, 'change', 3);
```

## 🔄 Step Normalization Gotcha

⚠️ **CRITICAL**: TouchSpin normalizes values to step multiples during initialization!

```typescript
// ❌ BAD: Will cause unexpected results
await apiHelpers.initializeTouchspin(page, 'test-input', { step: 3 });
// HTML fixture has value="50", gets normalized to 51 (nearest multiple of 3)
await apiHelpers.decrementViaAPI(page, 'test-input');
expect(await apiHelpers.readInputValue(page, 'test-input')).toBe('47'); // FAILS: Actually 48

// ✅ GOOD: Use step-divisible initial values
await apiHelpers.initializeTouchspin(page, 'test-input', { step: 3, initval: 48 });
await apiHelpers.decrementViaAPI(page, 'test-input');
expect(await apiHelpers.readInputValue(page, 'test-input')).toBe('45'); // PASSES
```

**Step-Divisible Values Reference:**
- `step: 1` → Any integer (1, 2, 3, 4, 5...)
- `step: 2` → Even numbers (2, 4, 6, 8, 10...)
- `step: 3` → Multiples of 3 (3, 6, 9, 12, 15...)
- `step: 5` → Multiples of 5 (5, 10, 15, 20, 25...)
- `step: 0.1` → One decimal (0.1, 0.2, 0.3...)

## 🧪 Test Organization

### One Behavior Per Test
```typescript
// ❌ BAD: Multiple behaviors
test('should increment and handle boundaries and emit events', async ({ page }) => {
  // Testing too many things
});

// ✅ GOOD: Single behaviors
test('should increment by step amount', async ({ page }) => { /* ... */ });
test('should not exceed maximum boundary', async ({ page }) => { /* ... */ });
test('should emit max event at boundary', async ({ page }) => { /* ... */ });
```

### Test Naming Convention
- Start with "should"
- Describe the expected behavior
- Be specific and testable
- Avoid "and" in test names

## 🔧 Coverage & Debugging

### Coverage Collection
```typescript
test.beforeEach(async ({ page }) => {
  await apiHelpers.startCoverage(page); // Start CDP coverage
  // ... test setup
});

test.afterEach(async ({ page }) => {
  await apiHelpers.collectCoverage(page, 'test-category-name');
});
```

### Debug Event Log
```typescript
// Print full event log for debugging
const eventLog = await apiHelpers.getEventLog(page);
console.log('Event log:', eventLog);

// Or get events by type
const touchspinEvents = await apiHelpers.getEventsOfType(page, 'touchspin');
const nativeEvents = await apiHelpers.getEventsOfType(page, 'native');
```

## 📋 Test Template

```typescript
import { test, expect } from '@playwright/test';
import * as apiHelpers from '../../../__tests__/helpers/touchspinApiHelpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'feature-name');
  });

  test('should [specific behavior]', async ({ page }) => {
    // Arrange
    await apiHelpers.initializeTouchspin(page, 'test-input', {
      step: 1,
      initval: 10
    });

    // Act
    await apiHelpers.clickUpButton(page, 'test-input');

    // Assert
    expect(await apiHelpers.readInputValue(page, 'test-input')).toBe('11');
  });
});
```

---

*For more details, see the full helper documentation in `CLAUDE.md`*