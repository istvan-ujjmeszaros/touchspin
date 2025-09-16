# Bootstrap TouchSpin - Testing Strategy & Agent Reference

## 🎯 PRIMARY MISSION: Achieve 100% Test Coverage with Clean Behavioral Tests

### The Testing Revolution
We are **rewriting ALL tests from scratch** to create a maintainable, clean test suite that achieves 100% coverage.

#### Why We're Starting Over
- **Problem with old tests** (`/__tests__/`):
  - Overcomplicated with multiple behaviors per test
  - Hard to understand what's actually being tested
  - Difficult to debug when they fail
  - Mix unit testing with behavioral testing

- **Our new approach**:
  - **ONE behavior per test** - if the test name has "and" in it, split it
  - **NO UNIT TESTS** - only Playwright behavioral tests
  - **Event log for everything** - single source of truth
  - **Fail fast** - no silent failures with conditional checks
  - **Minimal test fixtures** - reuse simple HTML across tests

### Testing Philosophy
```
Clean Tests = Maintainable Code = Happy Developers
```

Every test should be so simple that a junior developer can:
1. Read the test name and know what it tests
2. Read the test code and understand how it works
3. Fix it when the behavior changes

## 📊 Coverage Roadmap: Journey to 100%

### Phase 1: jQuery Plugin Package ✅ (~95% Complete)
- **Status**: Almost done, refining patterns
- **Focus**: Establishing clean patterns for other packages
- **Location**: `packages/jquery-plugin/tests/`
- **Coverage Target**: 100%
- **Remaining Work**:
  - Cover `forcestepdivisibility` options (floor, ceil, none)
  - Test vertical button configurations
  - Add callback function tests
  - Complete edge cases

### Phase 2: Core Package 🚀 (NEXT - 0%)
- **Status**: Starting after jQuery plugin completion
- **Focus**: Core logic, state management, value calculations
- **Location**: `packages/core/tests/`
- **Coverage Target**: 100%
- **Special Role**: Will house shared test infrastructure
- **What to test**:
  - Value normalization and validation
  - Step calculations and rounding
  - Min/max boundary enforcement
  - Decimal precision handling
  - State management
  - Configuration merging

### Phase 3: Renderer Packages 📅 (Future - 0%)
- **Status**: After core package
- **Coverage Target**: 100% each
- **Packages**:
  - `packages/renderers/bootstrap5/tests/` - Bootstrap 5 markup
  - `packages/renderers/material/tests/` - Material Design
  - `packages/renderers/tailwind/tests/` - Tailwind CSS
- **What to test**:
  - Framework-specific DOM structure
  - CSS class application
  - ARIA attributes
  - Theme integration

### Phase 4: Integration & E2E 🔄 (Final - 0%)
- **Status**: After individual packages
- **Focus**: Cross-package integration
- **Coverage Target**: Key user workflows

## 🏗️ Shared Test Infrastructure Strategy

### Why Core Package Houses Shared Resources
Since `@touchspin/core` is a dependency for ALL other packages, it's the perfect location for shared test infrastructure.

### Planned Shared Resources in Core
```
packages/core/
  src/               # Core logic
  tests/             # Core package tests
  test-helpers/      # Shared helpers for ALL packages
    fixtures/        # Reusable HTML fixtures
      minimal.html   # Simplest possible fixture
      multi.html     # Multiple inputs fixture
    helpers/         # Shared helper functions
      common.ts      # Cross-package helpers
      events.ts      # Event log helpers
      coverage.ts    # Coverage utilities
```

### Principles for Shared Resources
1. **HTML fixtures must be minimal** - just enough DOM to test
2. **Fixtures should be parameter-driven** - not hardcoded
3. **Helpers should be composable** - small functions that combine
4. **No package-specific logic** - keep it generic

## 📈 Why Clean Tests Matter

### Readability
- **Bad**: "should handle increment and decrement with callbacks and update display"
- **Good**: "should increment value by step amount"
- A developer should understand the test from its name alone

### Maintainability
- Simple tests = easy updates
- When TouchSpin behavior changes, update one test, not untangle complex logic
- New developers can contribute immediately

### Debuggability
- Playwright UI shows exactly what failed
- Event log provides complete interaction history
- No mysterious failures from complex test setup

### Coverage Achievement
- Focused tests make it obvious what's not covered
- Easy to add test for specific branch or condition
- No accidentally testing the same thing multiple times

## ✅ Test Quality Checklist

Every test MUST meet these criteria:

- [ ] **Tests exactly ONE behavior** - split complex tests
- [ ] **Uses event log for verification** - not custom listeners
- [ ] **No conditional element checks** - use strict helpers
- [ ] **Clear descriptive test name** - behavior, not implementation
- [ ] **Follows AAA pattern** - Arrange, Act, Assert
- [ ] **Reuses shared fixtures** - don't create custom HTML
- [ ] **Cleans up after itself** - no side effects for next test

### Example of a Perfect Test
```typescript
test('should round value to nearest step multiple on initialization', async ({ page }) => {
  // Arrange - clear state and initialize
  await touchspinHelpers.clearEventLog(page);
  await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
    step: 3,
    initval: 20  // Will round to 21 (nearest multiple of 3)
  });

  // Act - read the value
  const value = await touchspinHelpers.readInputValue(page, 'test-input');

  // Assert - verify rounding occurred
  expect(value).toBe('21');
});
```

## 🔄 Migration Strategy: From Complex to Clean

### Identifying Complex Tests in Old Suite
Look for tests that:
- Have multiple `expect()` statements testing different things
- Use words like "and", "with", "also" in the name
- Set up complex state before testing
- Test implementation details not behavior

### Splitting Complex Tests Example

#### Old Complex Test:
```typescript
test('should handle min/max with events and callbacks', async ({ page }) => {
  // Sets up callbacks
  // Tests min boundary
  // Tests max boundary
  // Verifies events
  // Checks callback execution
  // 50+ lines of code
});
```

#### New Clean Tests:
```typescript
test('should not decrement below minimum value', async ({ page }) => {
  await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, initval: 0 });
  await touchspinHelpers.clickDownButton(page, 'test-input');
  expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('0');
});

test('should emit touchspin.on.min event at minimum boundary', async ({ page }) => {
  await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, initval: 0 });
  await touchspinHelpers.clearEventLog(page);
  await touchspinHelpers.clickDownButton(page, 'test-input');
  expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.min', 'touchspin')).toBe(true);
});

test('should execute callback before calculation', async ({ page }) => {
  // Separate test for callback behavior
});
```

## 📋 Standard Test Structure Template

```typescript
import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../__tests__/helpers/touchspinHelpers';

test.describe('[Package] [Feature Area]', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Start coverage collection
    await touchspinHelpers.startCoverage(page);

    // 2. Load test fixture
    await page.goto('http://localhost:8866/path/to/fixture.html');

    // 3. Initialize package/plugin
    await touchspinHelpers.installJqueryPlugin(page);

    // 4. Clear event log for clean state
    await touchspinHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    // Collect coverage data
    await touchspinHelpers.collectCoverage(page, 'test-name');
  });

  test('should [specific behavior]', async ({ page }) => {
    // Arrange - Set up initial state

    // Act - Perform the action

    // Assert - Verify the result
  });
});
```

## 🎯 Coverage Strategy: Achieving 100%

### The 100% Coverage Workflow

#### Step 1: Establish Baseline
```bash
# Run all tests with coverage
COVERAGE=1 yarn exec playwright test --config=playwright-coverage.config.ts packages/[package]/tests/

# View report
open reports/coverage/index.html
```

#### Step 2: Identify Gaps
- **Red lines** = Not covered at all → Write new test
- **Yellow lines** = Branch not taken → Add test for other branch
- **0% functions** = Untested feature → Create feature tests

#### Step 3: Write Targeted Tests
Focus on one uncovered section at a time:
1. Identify the behavior that code implements
2. Write a test that exercises that behavior
3. Verify coverage improved
4. Repeat until 100%

#### Step 4: Monitor Continuously
- Run coverage with every PR
- Never let coverage decrease
- Add tests with every bug fix

### Coverage Tips for 100%
- **Error paths matter** - Test invalid inputs
- **Edge cases are critical** - Boundaries reveal bugs
- **Configuration options** - Test every option value
- **Conditional branches** - Both if and else paths
- **Default values** - Test with and without options

### What 100% Coverage Means
- Every line of code has been executed
- Every branch has been taken
- Every function has been called
- Every edge case has been considered
- **BUT**: It's still just a tool - focus on behavior!

---

## 📚 jQuery Plugin Testing Reference

*[Sections below contain specific jQuery plugin testing details that have been established during Phase 1]*

### Event Log System

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
```

### Strict Element Finding (No More If Checks!)

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

### Common jQuery Plugin Pitfalls

#### Step Value Correction (CRITICAL)
- TouchSpin automatically corrects ALL values to be divisible by step
- Default: `forcestepdivisibility: 'round'` - rounds to NEAREST
- Examples:
  - Value 20 with step 3 → corrected to 21 (nearest)
  - Value 5.55 with step 0.1 → corrected to 5.6 (nearest)

#### Focus Requirements
- Mousewheel and keyboard events require focus
- Always focus before testing these events:
```typescript
await page.focus('[data-testid="test-input"]');
// Now mousewheel/keyboard events will work
```

### Helper Functions Reference

```typescript
// Initialization
startCoverage(page)                          // Start coverage (call first)
installJqueryPlugin(page)                     // Install plugin with Bootstrap5
initializeTouchSpin(page, testId, options)   // Initialize on input

// Element Access (Strict - PREFERRED!)
getTouchSpinElementsStrict(page, testId)     // Get all elements or throw
clickUpButton(page, testId)                  // Click up button (strict)
clickDownButton(page, testId)                // Click down button (strict)

// Event Log Operations (NEW!)
clearEventLog(page)                          // Clear the event log
getEventLog(page)                           // Get full event log array
hasEventInLog(page, event, type?)           // Check if event occurred
countEventInLog(page, event, type?)         // Count event occurrences
getEventsOfType(page, type)                 // Get all 'native' or 'touchspin' events
waitForEventInLog(page, event, options?)    // Wait for event to appear

// Value Operations
readInputValue(page, testId)                 // Read value
```

### Test File Locations
- **jQuery Plugin Tests**: `/packages/jquery-plugin/tests/*.spec.ts`
- **Test Fixture**: `/packages/jquery-plugin/tests/html/test-fixture.html`
- **Shared Helpers**: `/__tests__/helpers/touchspinHelpers.ts` (will move to core)

### Running Tests

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

---

## 📖 Reference: Old Test Suite Analysis

### The Old Tests Are Our Specification
The `__tests__/` directory contains **44 test files with ~346 tests** representing years of bug fixes. They are the **definitive specification** of TouchSpin behavior.

### Coverage Gaps to Address

#### Not Yet Covered in New Tests:
1. **`forcestepdivisibility` options** - floor, ceil, none (only round tested)
2. **Vertical buttons configuration** - `verticalbuttons`, custom classes
3. **Callback functions** - before/after calculation callbacks
4. **Advanced features**:
   - RTL support
   - Replacement text
   - Button text customization
   - Native attribute synchronization

### Key Reference Files

| Feature | Old Test File | What It Covers |
|---------|--------------|----------------|
| Core | `basicOperations.test.ts` | Basic increment/decrement |
| Events | `events.test.ts` | All event scenarios |
| Edge Cases | `edgeCasesAndErrors.test.ts` | Boundary conditions |
| Lifecycle | `destroyAndReinitialize.test.ts` | Init/destroy cycles |
| Keyboard | `keyboardAccessibility.test.ts` | Keyboard interactions |
| Config | `settingsPrecedence.test.ts` | Configuration priority |

---

*End of Testing Strategy Document - Let's achieve 100% coverage with clean, maintainable tests!*