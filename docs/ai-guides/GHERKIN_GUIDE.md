
# A Guide to Gherkin Scenarios in TouchSpin Tests

This guide explains the Gherkin-style comment format used in TouchSpin tests. This format is essential for keeping tests organized, readable, and aligned with the project's behavior-driven testing philosophy.

## 1. The Gherkin Comment Structure

Every test (`.spec.ts`) file uses a specific comment structure to define the feature and its scenarios. This structure provides a human-readable specification of what the tests in the file are intended to cover.

### File Structure Overview

```typescript
/**
 * Feature: [A brief description of the feature being tested]
 * Background: fixture = [path to the HTML fixture file]
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] A test scenario that has been implemented
 * [ ] A test scenario that is planned but not yet implemented
 */

import { test } from '@playwright/test';
// ... other imports

/**
 * Scenario: A test scenario that has been implemented
 * Given [a precondition or initial state]
 * When [an action is performed]
 * Then [an expected outcome occurs]
 */
test('A test scenario that has been implemented', async ({ page }) => {
  // Test implementation goes here
});

/**
 * Scenario: A test scenario that is planned but not yet implemented
 * Given [a precondition or initial state]
 * When [an action is performed]
 * Then [an expected outcome occurs]
 * Params:
 * { "some_param": "value", "another_param": 123 }
 */
test.skip('A test scenario that is planned but not yet implemented', async ({ page }) => {
  // Implementation is pending
});
```

### Key Components

-   **`/** Feature: ... */`**: A block comment at the top of the file that describes the overall feature.
-   **`/* CHECKLIST — ... */`**: A checklist of all scenarios in the file. This is used to track progress and ensure all planned tests are implemented.
    -   `[x]` marks a completed test.
    -   `[ ]` marks a planned (`test.skip`) test.
-   **`/** Scenario: ... */`**: A block comment immediately preceding each `test` or `test.skip` block. It describes the specific behavior being tested using the `Given/When/Then` format.
-   **`Params`**: An optional JSON block within the `Scenario` comment that provides specific parameters for the test.

---

## 2. Implementing a Planned Scenario

Your primary task will often be to implement the `test.skip` scenarios that have already been defined.

### Step-by-Step Guide

1.  **Find a `test.skip` scenario:** Locate a test marked with `[ ]` in the checklist and a corresponding `test.skip` block.

2.  **Update the checklist:** Change the `[ ]` to `[x]` for that scenario.

3.  **Change `test.skip` to `test`:** Modify the test block to be an active test.

4.  **Implement the test:** Write the test logic using the provided helper functions. The `Given/When/Then` description in the `Scenario` comment should be your guide.

### Example

**Before (Planned Scenario):**

```typescript
/*
 * CHECKLIST — Scenarios in this spec
 * [ ] Triggers change event on blur when value changed
 */

/**
 * Scenario: Triggers change event on blur when value changed
 * Given the fixture page is loaded
 * When I change the value and blur the input
 * Then a change event is fired
 */
test.skip('Triggers change event on blur when value changed', async ({ page }) => {
  // Implementation pending
});
```

**After (Implemented Scenario):**

```typescript
/*
 * CHECKLIST — Scenarios in this spec
 * [x] Triggers change event on blur when value changed
 */

/**
 * Scenario: Triggers change event on blur when value changed
 * Given the fixture page is loaded
 * When I change the value and blur the input
 * Then a change event is fired
 */
test('Triggers change event on blur when value changed', async ({ page }) => {
  await initializeTouchspinWithVanilla(page, 'test-input', { initval: '0' });
  await fillWithValueAndBlur(page, 'test-input', '5');
  await expectValueToBe(page, 'test-input', '5');
  const changeEventCount = await countEventInLog(page, 'change');
  test.expect(changeEventCount).toBe(1);
});
```

---

## 3. Writing New Scenarios

While you will primarily be implementing existing scenarios, you may occasionally need to write new ones.

### Guidelines for New Scenarios

1.  **Follow the `Given/When/Then` format:** Clearly describe the initial state, the action being performed, and the expected result.
2.  **Keep it focused:** Each scenario should test one specific behavior.
3.  **Add it to the checklist:** Add a new item to the `CHECKLIST` at the top of the file, marked with `[ ]`.
4.  **Create a `test.skip` block:** Create a new `test.skip` block with a title that exactly matches the `Scenario` description.
5.  **Add `Params` if necessary:** If the test requires specific configuration, add a `Params` block with a clear JSON object.

### Example of a New Planned Scenario

```typescript
/*
 * CHECKLIST — Scenarios in this spec
 * ... (other scenarios)
 * [ ] Does not trigger change event on blur when value unchanged
 */

// ... (other tests)

/**
 * Scenario: Does not trigger change event on blur when value unchanged
 * Given the fixture page is loaded
 * When I blur the input without changing the value
 * Then no change event is fired
 */
test.skip('Does not trigger change event on blur when value unchanged', async ({ page }) => {
  // Implementation pending
});
```
