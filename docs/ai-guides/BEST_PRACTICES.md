
# Best Practices for Writing TouchSpin Tests

This guide outlines the core principles for writing clean, robust, and maintainable tests for the TouchSpin project. Adhering to these best practices is essential for all contributors, including AI agents.

## 1. No Manual Waits: Use Polling Assertions

One of the most critical rules in this project is to **never use manual or fixed-time waits** in your tests. Arbitrary waits like `page.waitForTimeout()` lead to flaky, slow, and unreliable tests.

Instead, you must use the provided **polling assertion helpers**. These helpers repeatedly check for a condition until it becomes true or a timeout is reached, making the tests both robust and efficient.

### ✅ Good Example: Using a Polling Assertion

This test correctly uses `expectValueToBe` to wait for the input's value to be updated after a button click. The helper handles the waiting automatically.

```typescript
import { test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';

test('should increment value and wait correctly', async ({ page }) => {
  // Arrange
  await apiHelpers.initializeTouchspin(page, 'test-input', { initval: 10 });

  // Act
  await apiHelpers.clickUpButton(page, 'test-input');

  // Assert
  // The helper polls the DOM until the value is '11' or it times out.
  await apiHelpers.expectValueToBe(page, 'test-input', '11');
});
```

### ❌ Bad Example: Using a Manual Wait

This test is flaky. It uses `page.waitForTimeout()` to guess how long the update will take. If the operation is faster or slower, the test can fail or be unnecessarily slow.

```typescript
import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';

test('should not use manual waits', async ({ page }) => {
  // Arrange
  await apiHelpers.initializeTouchspin(page, 'test-input', { initval: 10 });

  // Act
  await apiHelpers.clickUpButton(page, 'test-input');

  // Assert
  // 🚨 WRONG: This is a fixed wait and makes the test unreliable.
  await page.waitForTimeout(500);

  const value = await apiHelpers.readInputValue(page, 'test-input');
  expect(value).toBe('11');
});
```

---

## 2. Simplicity and Readability: Use Human-Readable Helpers

Tests should be as simple and easy to read as possible. This is achieved by using the extensive library of **human-readable helper functions** provided in `@touchspin/core/test-helpers`.

These helpers abstract away the low-level Playwright implementation details, making the tests declarative and focused on the behavior being tested.

### ✅ Good Example: Using High-Level Helpers

The test's intent is immediately clear because the helpers describe the actions in plain English.

```typescript
import { test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';

test('should be simple and readable', async ({ page }) => {
  // Arrange
  await apiHelpers.initializeTouchspin(page, 'test-input', { initval: 5 });

  // Act
  await apiHelpers.clickUpButton(page, 'test-input');

  // Assert
  await apiHelpers.expectValueToBe(page, 'test-input', '6');
  await apiHelpers.expectEventFired(page, 'change');
});
```

### ❌ Bad Example: Using Low-Level Playwright APIs

This test is harder to read and more brittle. It mixes high-level concepts with low-level implementation details, such as CSS selectors and DOM structure.

```typescript
import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';

test('should not use low-level APIs directly', async ({ page }) => {
  // Arrange
  await apiHelpers.initializeTouchspin(page, 'test-input', { initval: 5 });

  // Act
  // 🚨 WRONG: This is too low-level. Use the clickUpButton() helper instead.
  await page.locator('[data-testid="test-input-up"]').click();

  // Assert
  // 🚨 WRONG: This is also too low-level. Use expectValueToBe().
  const inputValue = await page.locator('[data-testid="test-input"]').inputValue();
  expect(inputValue).toBe('6');
});
```

---

## 3. Test Behavior Once

To avoid redundancy and keep the test suite maintainable, each distinct behavior should be tested by **one and only one test**. Once the core behavior is confirmed, separate tests should be created to cover specific edge cases.

This principle ensures that a single change in behavior only breaks a single, focused test, making debugging much easier.

### ✅ Good Example: Separate Tests for Behavior and Edge Cases

**Test 1: Core Behavior**
This test verifies the fundamental increment behavior.

```typescript
test('should increment the value by the step amount', async ({ page }) => {
  // Arrange
  await apiHelpers.initializeTouchspin(page, 'test-input', { initval: 10, step: 5 });

  // Act
  await apiHelpers.clickUpButton(page, 'test-input');

  // Assert
  await apiHelpers.expectValueToBe(page, 'test-input', '15');
});
```

**Test 2: Edge Case**
This test verifies the specific edge case of incrementing at the maximum boundary.

```typescript
test('should not increment past the maximum value', async ({ page }) => {
  // Arrange
  await apiHelpers.initializeTouchspin(page, 'test-input', { initval: 100, max: 100 });

  // Act
  await apiHelpers.clickUpButton(page, 'test-input');

  // Assert
  await apiHelpers.expectValueToBe(page, 'test-input', '100');
});
```

### ❌ Bad Example: Mixing Multiple Behaviors in One Test

This test is doing too much. It tests basic incrementing, the `max` boundary, and the `min` boundary all at once. If it fails, it's not immediately clear which behavior is broken.

```typescript
// 🚨 WRONG: This test covers too many behaviors.
test('should handle incrementing and boundaries', async ({ page }) => {
  // Arrange
  await apiHelpers.initializeTouchspin(page, 'test-input', { initval: 99, max: 100, min: 0 });

  // Act & Assert 1: Basic increment
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '100');

  // Act & Assert 2: Max boundary
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '100');

  // Act & Assert 3: Min boundary (unrelated to incrementing at max)
  await apiHelpers.setValueViaAPI(page, 'test-input', '0');
  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '0');
});
```
