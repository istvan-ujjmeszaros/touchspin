# Bootstrap TouchSpin - Testing Strategy & Agent Reference

## 🎯 Overall Testing Mission

### Why We're Rewriting Tests
- **Problem**: Old tests in `/__tests__/` are overcomplicated and test multiple behaviors per test
- **Solution**: Writing clean, focused tests FROM SCRATCH for each package
- **Goal**: Achieve 100% test coverage with maintainable, readable tests
- **Philosophy**: One behavior per test, fail fast, use event log for verification

### Coverage Goals & Priority Order
1. **`packages/jquery-plugin`** (~90% complete)
   - Status: Almost done, finishing touches and refining patterns
   - Focus: Clean test patterns that will be used as template for other packages

2. **`packages/core`** (0% - NEXT PRIORITY)
   - Status: Will start after jQuery plugin is complete
   - Focus: Core logic, value handling, state management

3. **`packages/renderers`** (0%)
   - `renderers/bootstrap5/` - Bootstrap 5 renderer
   - `renderers/material/` - Material Design renderer
   - `renderers/tailwind/` - Tailwind CSS renderer
   - Status: After core package

4. **Remaining packages** (0%)
   - Integration tests
   - End-to-end tests

### Test Organization Structure
```
packages/
  jquery-plugin/
    tests/          ✓ Clean, focused tests (in progress)
    src/            - Source code

  core/
    tests/          ⚠ To be created next
    src/            - Core logic

  renderers/
    bootstrap5/
      tests/        ⚠ To be created
    material/
      tests/        ⚠ To be created
    tailwind/
      tests/        ⚠ To be created
```

## 📋 Key Testing Principles

### Single Responsibility
- Each test verifies ONE specific behavior
- No mixing of concerns
- If test name has "and" in it, split into two tests

### Self-Contained Tests
- Tests should not depend on other tests
- Each test sets up its own state
- Use `beforeEach` for common setup, not shared state

### Clear Test Structure (AAA Pattern)
```typescript
test('should increment value by step', async ({ page }) => {
  // Arrange - Set up initial state
  await touchspinHelpers.initializeTouchSpin(page, 'test-input', { step: 5 });

  // Act - Perform the action
  await touchspinHelpers.clickUpButton(page, 'test-input');

  // Assert - Verify the result
  expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('55');
});
```

### Event Log First
- Use event log for verification whenever possible
- Avoid custom event listeners
- Event log provides complete interaction history

### Strict Helpers & Fail Fast
- No `if (element)` checks
- Use strict helpers that throw on missing elements
- Better to fail immediately than have silent failures

## 📚 Lessons Learned from jQuery Plugin Testing

1. **Event Log System is Powerful**
   - `[native]` vs `[touchspin]` prefixes enable easy filtering
   - Complete interaction history in one place

2. **Single Input Pattern Works Best**
   - One input per test fixture
   - Reload page for each test

3. **Step Value Correction is Critical**
   - TouchSpin rounds values to nearest step multiple
   - Must account for this in ALL value tests

4. **Focus Requirements**
   - Mousewheel and keyboard events require focus

5. **Strict Element Finding Prevents Bugs**
   - Throws immediately if element missing
   - No silent failures

## 🔮 Core Package Testing Strategy (Next Phase)

### What We'll Test:
- Value normalization and validation
- Step calculations and rounding
- Min/max boundary enforcement
- Decimal precision handling
- State management
- Event emission logic
- Configuration options
- Public API methods

## 🎨 Renderer Testing Strategy (Future)

### What We'll Test:
- DOM structure per framework
- CSS class application
- ARIA attributes
- Theme-specific styling
- Framework integration

## 📝 Standard Test Template
```typescript
test.describe('[Package] [Feature]', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('test-fixture.html');
    await touchspinHelpers.installJqueryPlugin(page);
    await touchspinHelpers.clearEventLog(page);
  });

  test('should [specific behavior]', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });
});
```

## 📊 Coverage Workflow to Reach 100%

### Step 1: Run Coverage
```bash
# For specific package
COVERAGE=1 yarn exec playwright test --config=playwright-coverage.config.ts packages/jquery-plugin/tests/

# For specific test file
COVERAGE=1 yarn exec playwright test --config=playwright-coverage.config.ts packages/jquery-plugin/tests/commands.spec.ts
```

### Step 2: Analyze Report
```bash
# Open in browser
open reports/coverage/index.html

# Or serve locally
npx serve reports/coverage
```

### Step 3: Identify Gaps
- **Red lines**: Not covered at all - write tests for these
- **Yellow lines**: Partially covered - missing branch coverage
- **Look for patterns**:
  - Error handling paths
  - Edge cases
  - Configuration options
  - Conditional logic

### Step 4: Write Targeted Tests
```typescript
// Example: Found uncovered error handling
test('should handle invalid step value', async ({ page }) => {
  await touchspinHelpers.initializeTouchSpin(page, 'test-input', { step: -1 });
  // Verify it defaults to 1 or throws error
});

// Example: Found uncovered branch
test('should handle max value when incrementing', async ({ page }) => {
  await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
    max: 10,
    initval: 10
  });
  await touchspinHelpers.clickUpButton(page, 'test-input');
  // Verify it stays at 10
});
```

### Step 5: Iterate
- Re-run coverage after adding tests
- Check if new tests revealed more uncovered paths
- Continue until 100%

### Coverage Tips
- **Don't chase 100% blindly** - Focus on meaningful coverage
- **Test behavior, not implementation** - Coverage is a tool, not a goal
- **Edge cases matter** - Boundary conditions often reveal bugs
- **Error paths are critical** - Users will hit these

---

## Critical Testing Principles (jQuery Plugin Specific)

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

### 3. Test Coverage Reference (CRITICAL - Read This First!)

#### The Old Test Suite is the Specification
The `__tests__/` directory contains **44 test files with ~346 individual tests** that were all passing previously. These tests represent:
- Years of bug fixes and edge case discoveries
- Nearly 100% coverage of expected TouchSpin behaviors
- The **definitive specification** of how TouchSpin should work

**IMPORTANT**: When writing tests to cover a behavior, **ALWAYS** check the old tests first! They are the source of truth.

#### Key Test Files for Reference

| Feature Area | Reference Test Files | What They Cover |
|-------------|---------------------|-----------------|
| **Core Functionality** | `basicOperations.test.ts`, `events.test.ts` | Basic increment/decrement, events, change handling |
| **Advanced Features** | `advancedFeatures.test.ts` | Callbacks, step validation, complex configurations |
| **Edge Cases** | `edgeCasesAndErrors.test.ts`, `uncoveredConfigurations.test.ts` | Error handling, boundary conditions |
| **Renderers** | `bs3Renderer.test.ts`, `bs4Renderer.test.ts`, `bs5Renderer.test.ts`, `tailwindRenderer.test.ts` | Bootstrap/Tailwind specific markup |
| **Lifecycle** | `destroyAndReinitialize.test.ts`, `coreLifecycle.test.ts` | Initialization, destruction, reinit |
| **User Input** | `keyboardAccessibility.test.ts`, `browserNativeSpinners.test.ts` | Keyboard, mouse wheel, native behaviors |
| **Configuration** | `settingsPrecedence.test.ts`, `verticalButtons.test.ts` | Settings priority, special configs |
| **jQuery Specific** | `callbackTests.test.ts`, `apiMethods.test.ts` | jQuery plugin API, methods |

#### Coverage Gaps in New Tests
The following behaviors are tested in old tests but **NOT YET** in the new jQuery plugin tests:

1. **`forcestepdivisibility` options**
   - Old tests cover: 'none', 'floor', 'ceil', 'round'
   - New tests only cover: 'round' (default)
   - See: `uncoveredConfigurations.test.ts`, `edgeCasesAndErrors.test.ts`

2. **Vertical buttons configuration**
   - `verticalbuttons`, `verticalupclass`, `verticaldownclass`
   - See: `verticalButtons.test.ts`

3. **Callback functions**
   - `callback_before_calculation`, `callback_after_calculation`
   - See: `advancedFeatures.test.ts`, `callbackTests.test.ts`

4. **Advanced features not yet tested**
   - RTL support (`rtlSupport.test.ts`)
   - Replacement text feature
   - Button text customization
   - Mousewheel configuration details
   - Native attribute synchronization

5. **Complex scenarios**
   - Multiple destroy calls
   - Settings precedence rules
   - Cross-API lifecycle interactions
   - Event cleanup verification

#### How to Use Old Tests as Reference

1. **Before writing a new test**, search `__tests__/` for related tests:
   ```bash
   grep -r "feature_name" __tests__/
   ```

2. **Copy the test logic** but adapt to new patterns:
   - Use event log instead of custom counters
   - Use strict helpers instead of querySelector
   - Keep the same assertions and expected values

3. **Example migration**:
   ```typescript
   // OLD TEST (from __tests__/events.test.ts)
   test('should fire change event once', async ({ page }) => {
     await touchspinHelpers.touchspinClickUp(page, testid);
     expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
   });

   // NEW TEST (migrated pattern)
   test('should fire change event once', async ({ page }) => {
     await touchspinHelpers.clearEventLog(page);
     await touchspinHelpers.clickUpButton(page, 'test-input');
     expect(await touchspinHelpers.countEventInLog(page, 'change', 'native')).toBe(1);
   });
   ```

#### Migration Priority
Focus on migrating tests for:
1. Missing configuration options (forcestepdivisibility, vertical buttons)
2. Callback functions
3. Complex lifecycle scenarios
4. Any bug that gets reported - check if there's an existing old test

Remember: **The old tests passed, so TouchSpin should behave exactly as they specify!**

### 4. Event Log System

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

### 5. Strict Element Finding (No More If Checks!)

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

### 6. Common Test Mistakes to Avoid

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

### 7. Event Log Format (DEPRECATED - See Section 4)
- **OLD format**: `target:value event`
- **NEW format**: `[type] target:value event` where type is 'native' or 'touchspin'
- **See Section 4** for the new event log system with type prefixes

### 8. Helper Functions Reference

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

### 9. Test File Locations
- **Test files**: `/packages/jquery-plugin/tests/*.spec.ts`
- **Test fixture**: `/packages/jquery-plugin/tests/html/test-fixture.html`
- **Helpers**: `/__tests__/helpers/touchspinHelpers.ts`

### 10. Coverage Collection & Analysis

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

### 11. Standard Test Setup
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

### 12. Key Lessons from Conversation
1. **User found tests failing with wrong expectations** - Always verify test logic matches actual behavior
2. **Event log was not working** - Fixed by using global `logEvent` function and document-level listeners
3. **Clear Log button wasn't working** - Fixed with proper event handling
4. **Test IDs were outdated** - Migrated from hardcoded IDs to single `test-input`
5. **TypeScript null safety** - Always check `querySelector` results before using
6. **ESLint configuration** - Test files must be included in tsconfig.json

### 13. Running Tests

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

### 14. Important Files Modified
- All test files converted to single-input pattern
- Test fixture simplified to single input with event log
- Helpers extended with TouchSpin-specific functions
- Coverage setup automated with directory cleaning and HTML generation

### 15. Test Philosophy
- **Simplicity**: One input, one test, clear expectations
- **Reliability**: Use helpers, not brittle selectors
- **Debuggability**: Event log, clear test names, Playwright UI friendly
- **Isolation**: Page reload between tests, no shared state