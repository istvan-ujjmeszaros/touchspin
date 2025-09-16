# TouchSpin Testing Agent File

## Critical Testing Principles

### 1. Test Structure
- **Single input per test**: Each test uses `data-testid="test-input"` as the primary input
- **Page reload between tests**: Ensures clean state, makes debugging easier in Playwright UI
- **Dynamic input creation**: Use `createAdditionalInput()` when multiple inputs are needed

### 2. Finding TouchSpin Elements
**ALWAYS use helper functions to find TouchSpin elements:**
```typescript
// CORRECT - Using helpers
const elements = await touchspinHelpers.getTouchSpinElements(page, 'test-input');
const hasPrefix = await touchspinHelpers.hasPrefix(page, 'test-input', '€');

// WRONG - Direct DOM queries
const wrapper = document.querySelector('[data-touchspin-injected]');
```

### 3. Event Log System

#### Event Log Format
- **Native events**: `[native] target:value eventName` or `[native] target eventName`
- **TouchSpin events**: `[touchspin] target:value eventName` or `[touchspin] target eventName`
- Examples:
  - `[native] test-input:50 change`
  - `[touchspin] test-input:51 touchspin.on.startspin`
  - `[native] test-input focus`
  - `[native] test-input-up-button click`

#### Using Event Log in Tests
```typescript
// Clear event log before test
await touchspinHelpers.clearEventLog(page);

// Perform actions...
await touchspinHelpers.clickUpButton(page, 'test-input');

// Check for specific events
expect(await touchspinHelpers.hasEventInLog(page, 'click', 'native')).toBe(true);
expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);

// Count events
const changeCount = await touchspinHelpers.countEventInLog(page, 'change', 'native');
expect(changeCount).toBe(1);

// Get all TouchSpin events
const touchspinEvents = await touchspinHelpers.getEventsOfType(page, 'touchspin');
```

### 4. Strict Element Finding (No More If Checks!)

#### Old Pattern (BAD):
```typescript
const upButton = wrapper?.querySelector('.bootstrap-touchspin-up');
if (upButton) {
  upButton.click();
}
```

#### New Pattern (GOOD):
```typescript
// Use strict helpers that throw if element doesn't exist
await touchspinHelpers.clickUpButton(page, 'test-input');

// Or get all elements with guarantee they exist
const elements = await touchspinHelpers.getTouchSpinElementsStrict(page, 'test-input');
await elements.upButton.click(); // No null check needed!
```

### 5. Common Test Mistakes to Avoid

#### Step Value Correction (CRITICAL)
- **Issue**: TouchSpin automatically corrects ALL values to be divisible by step
- **Default behavior**: `forcestepdivisibility: 'round'` - rounds to NEAREST value divisible by step
- **This applies to both integers AND decimals!**
- **Examples with default 'round' behavior**:
  - Value 20 with step 3 → corrected to 21 (7×3=21, nearest)
  - Value 5.55 with step 0.1 → corrected to 5.6 (56×0.1=5.6, nearest)
  - Value 5.55 with step 0.05 → stays 5.55 (111×0.05=5.55, already divisible)
- **Test Writing Rule**: Always calculate if value is divisible by step, or know what it will round to

#### Spin Test Logic
- **Issue**: Incorrect expectations about values during spinning
- **Solution**: Track values at each stage:
  1. Get initial value
  2. Start spin, wait, get value after spin
  3. Compare with appropriate reference points
- **Example**: When switching from up to down spin, final value should be less than after-up value, not necessarily less than initial

#### Selector Issues
- **Issue**: Using wrong selectors for TouchSpin elements
- **Solution**: The wrapper is the parent of the input, use helpers:
  - `getTouchSpinWrapper(page, testId)` - Gets wrapper
  - `getTouchSpinElements(page, testId)` - Gets all elements

#### Timing Issues
- **Issue**: DOM not updated when checking
- **Solution**: Add `await page.waitForTimeout(100)` after operations that update DOM

#### Focus Requirements (CRITICAL)
- **Issue**: Mousewheel and keyboard events don't work without focus
- **Applies to**: Mousewheel scroll, keyboard up/down arrow keys
- **Solution**: ALWAYS focus the input before testing these events
- **Example**:
  ```typescript
  // Focus the input first
  await page.focus('[data-testid="test-input"]');
  // Now mousewheel/keyboard events will work
  ```

### 4. Event Log Format (DEPRECATED - See Section 3)
- **OLD format**: `target:value event`
- **NEW format**: `[type] target:value event` where type is 'native' or 'touchspin'
- **See Section 3** for the new event log system with type prefixes

### 5. Helper Functions Reference

#### Core Helpers (Updated with New Functions)
```typescript
// Initialization
startCoverage(page)                          // Start coverage (call first)
installJqueryPlugin(page)                     // Install plugin with Bootstrap5
initializeTouchSpin(page, testId, options)   // Initialize on input

// Element Access (Non-Strict)
getTouchSpinWrapper(page, testId)            // Get wrapper container
getTouchSpinElements(page, testId)           // Get all elements
hasPrefix(page, testId, expectedText?)       // Check prefix
hasPostfix(page, testId, expectedText?)      // Check postfix

// Element Access (Strict - PREFERRED!)
getTouchSpinElementsStrict(page, testId)     // Get all elements or throw
clickUpButton(page, testId)                  // Click up button (strict)
clickDownButton(page, testId)                // Click down button (strict)

// Event Log Operations (NEW!)
clearEventLog(page)                          // Clear the event log
getEventLog(page)                           // Get full event log array
getEventLogText(page)                       // Get visual log text
hasEventInLog(page, event, type?)           // Check if event occurred
countEventInLog(page, event, type?)         // Count event occurrences
getEventsOfType(page, type)                 // Get all 'native' or 'touchspin' events
waitForEventInLog(page, event, options?)    // Wait for event to appear

// Dynamic Inputs
createAdditionalInput(page, testId, options) // Create new input
clearAdditionalInputs(page)                  // Clear all dynamic inputs

// Value Operations
readInputValue(page, testId)                 // Read value
touchspinClickUp(page, testId)              // Click up (old helper)
touchspinClickDown(page, testId)            // Click down (old helper)
```

### 6. Test File Locations
- **Test files**: `/packages/jquery-plugin/tests/*.spec.ts`
- **Test fixture**: `/packages/jquery-plugin/tests/html/test-fixture.html`
- **Helpers**: `/__tests__/helpers/touchspinHelpers.ts`

### 7. Coverage Collection & Analysis

#### Running Coverage
- Tests start coverage before page load
- Coverage collected in afterEach
- Run with: `COVERAGE=1 yarn exec playwright test --config=playwright-coverage.config.ts`

#### Analyzing Coverage Reports
- **HTML Report Location**: `reports/coverage/index.html`
- **View specific file coverage**: Navigate to individual files to see line-by-line coverage
- **Coverage highlights**:
  - Green lines: Covered by tests
  - Red lines: Not covered by tests
  - Yellow lines: Partially covered (e.g., branch not taken)

#### Finding Uncovered Code
```bash
# Generate coverage report
COVERAGE=1 yarn exec playwright test --config=playwright-coverage.config.ts packages/jquery-plugin/tests/

# Open HTML report in browser
open reports/coverage/index.html

# Or serve it locally
npx serve reports/coverage
```

#### Coverage Metrics
- **Statement coverage**: % of statements executed
- **Branch coverage**: % of if/else branches taken
- **Function coverage**: % of functions called
- **Line coverage**: % of lines executed

#### Improving Coverage
1. Look for red (uncovered) lines in HTML report
2. Identify which conditions/branches aren't tested
3. Add tests for edge cases and error conditions
4. Focus on critical business logic first

### 8. Standard Test Setup
```typescript
test.beforeEach(async ({ page }) => {
  await touchspinHelpers.startCoverage(page);
  await page.goto('http://localhost:8866/packages/jquery-plugin/tests/html/test-fixture.html');
  await page.waitForFunction(() => (window as any).testPageReady === true);
  await touchspinHelpers.installJqueryPlugin(page);
  await page.waitForFunction(() => (window as any).touchSpinReady === true);
});

test.afterEach(async ({ page }) => {
  await touchspinHelpers.collectCoverage(page, 'test-name');
});
```

### 9. Key Lessons from Conversation
1. **User found tests failing with wrong expectations** - Always verify test logic matches actual behavior
2. **Event log was not working** - Fixed by using global `logEvent` function and document-level listeners
3. **Clear Log button wasn't working** - Fixed with proper event handling
4. **Test IDs were outdated** - Migrated from hardcoded IDs to single `test-input`
5. **TypeScript null safety** - Always check `querySelector` results before using
6. **ESLint configuration** - Test files must be included in tsconfig.json

### 10. Running Tests

```bash
# Single test
yarn exec playwright test packages/jquery-plugin/tests/commands.spec.ts:22

# All jQuery tests
yarn exec playwright test packages/jquery-plugin/tests/

# With coverage
COVERAGE=1 yarn exec playwright test --config=playwright-coverage.config.ts packages/jquery-plugin/tests/

# With UI for debugging
yarn exec playwright test --ui

# See browser
yarn exec playwright test --headed
```

### 11. Important Files Modified
- All test files converted to single-input pattern
- Test fixture simplified to single input with event log
- Helpers extended with TouchSpin-specific functions
- Coverage setup automated with directory cleaning and HTML generation

### 12. Test Philosophy
- **Simplicity**: One input, one test, clear expectations
- **Reliability**: Use helpers, not brittle selectors
- **Debuggability**: Event log, clear test names, Playwright UI friendly
- **Isolation**: Page reload between tests, no shared state