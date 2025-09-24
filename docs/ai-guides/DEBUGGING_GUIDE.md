
# A Debugging Guide for Failing TouchSpin Tests

This guide provides a structured approach for AI agents to diagnose and fix failing tests in the TouchSpin project. Following these steps will help you efficiently identify the root cause of a failure.

## Step 1: Analyze the Test and its Intent

Before diving into the code, make sure you understand what the test is supposed to do.

1.  **Read the Gherkin Scenario:** The `/** Scenario: ... */` comment above the test is the single source of truth for the test's intent. Read the `Given/When/Then` steps carefully.
2.  **Review the Test Implementation:** Look at the test code and compare it to the Gherkin scenario. Does the implementation match the described behavior? Are the correct helpers being used?

## Step 2: Examine the Error Message

The error message from Playwright is the most important clue. Look for key information:

-   **`Timeout` errors:** These are the most common type of failure. They almost always mean that a polling assertion (like `expectValueToBe`) did not become true within the timeout period.
-   **`Locator` errors:** If the error mentions a locator (e.g., `locator.click()`), it means Playwright couldn't find the element it was trying to interact with. This could be because the element doesn't exist, the selector is wrong, or it's not visible.
-   **`expect(received).toBe(expected)` errors:** These are direct assertion failures. The value received from the component did not match the expected value.

## Step 3: Use the Event Log

The event log is a powerful debugging tool that captures all native and TouchSpin-specific events. It is automatically set up in the test environment.

### How to Use the Event Log

1.  **Add a `console.log`:** Temporarily add a line to your test to print the event log at the point of failure.

    ```typescript
    // Add this line right before the failing assertion
    console.log(await apiHelpers.getEventLog(page));
    ```

2.  **Run the test again:** The console output will now show you the sequence of events that occurred.

3.  **Analyze the log:**
    -   Did the expected events fire? (e.g., `change`, `touchspin.on.max`)
    -   Did any unexpected events fire?
    -   What was the last event to fire before the test failed?

## Step 4: Common Causes of Failures and How to Fix Them

### Flaky Tests Due to Manual Waits

-   **Cause:** The test uses `page.waitForTimeout()` instead of a polling assertion.
-   **Fix:** Replace the manual wait with an appropriate `expect...` helper (e.g., `expectValueToBe`, `expectEventFired`). See `BEST_PRACTICES.md` for more details.

### Incorrect Assertions

-   **Cause:** The test is asserting the wrong value or state.
-   **Fix:** Double-check the Gherkin scenario and the component's behavior. Are you checking for a `string` when you should be checking for a `number`? Are you using `readInputValue` when you should be using `getNumericValue`?

### Timing Issues

-   **Cause:** An action is performed before the component is ready for it.
-   **Fix:** Ensure that you are `await`ing all helper functions. The initialization helpers (`initializeTouchspin`, etc.) are designed to wait for the component to be ready, so this is rarely an issue if you are using the helpers correctly.

### Incorrect Helper Usage

-   **Cause:** The test is using a helper that is not appropriate for the test type (e.g., using `clickUpButton` in a core test that has no UI).
-   **Fix:** Refer to the `TEST_HELPER_COOKBOOK.md` to find the correct helper for your scenario.

## Step 5: Interactive Debugging with Playwright

If you are still stuck, you can use Playwright's interactive debugging tools.

1.  **Add a `page.pause()`:** Place this line in your test where you want to pause execution.

    ```typescript
    await page.pause();
    ```

2.  **Run the test in headed mode:**

    ```bash
    yarn exec playwright test --headed [path/to/your/test.spec.ts]
    ```

3.  **Use the Playwright Inspector:** This will open a browser window with the Playwright Inspector, which allows you to step through the test, inspect the DOM, and see the state of the component at each step.
