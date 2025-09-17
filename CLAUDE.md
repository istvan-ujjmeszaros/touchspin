# Bootstrap TouchSpin - Testing Strategy & Agent Reference

## 🎯 PRIMARY MISSION: Achieve 100% Test Coverage with Clean Behavioral Tests

### The Testing Revolution

We are **rewriting ALL tests from scratch** to create a maintainable, clean test suite that achieves 100% coverage.

#### Why We're Starting Over

* **Problem with old tests** (`/__tests__/`):

  * Overcomplicated with multiple behaviors per test
  * Hard to understand what's actually being tested
  * Difficult to debug when they fail
  * Mix unit testing with behavioral testing

* **Our new approach**:

  * **DIST-ONLY TESTS** - tests must import built artifacts (`/dist/index.js`), never `/src/`
  * **TESTID SELECTORS** - use `data-testid` selectors in all tests for reliability
  * **ONE behavior per test** - if the test name has "and" in it, split it
  * **NO UNIT TESTS** - only Playwright behavioral tests
  * **Event log for everything** - single source of truth
  * **Fail fast** - no silent failures with conditional checks
  * **Minimal test fixtures** - reuse simple HTML across tests

### Testing Philosophy

```
Clean Tests = Maintainable Code = Happy Developers
```

Every test should be so simple that a junior developer can:

1. Read the test name and know what it tests
2. Read the test code and understand how it works
3. Fix it when the behavior changes

## 🔧 Testing Requirements

### Dist-Only Rule

* **Tests must load built artifacts** (`/dist/index.js`) only - never `/src/`
* **Guard script**: `yarn guard:no-src-in-tests` enforces this rule
* **Runtime guard**: Tests throw if any `/src/` script sneaks into fixtures

### Selectors Standard

* **Use `data-testid` selectors** in all tests - TouchSpin auto-generates these
* **Never use CSS classes** or DOM structure for test selectors

### Coverage (CDP-Based)

* **Build first**: `yarn coverage:build`
* **Run coverage**: `yarn coverage:all <path> --no-open`
* **View report**: `reports/coverage/index.html`
* **Coverage hooks**: Auto-imported in each spec - don't duplicate in tests

### Helper/Config Policy

* **Do not modify** `__tests__/helpers/touchspinHelpers.ts` or configs unless absolutely necessary
* **Keep it stable** - these are shared across all test packages

## 🛠️ Helper Usage Policy

### Single Source of Truth

* The **canonical helpers** already exist under `__tests__/helpers/`.
* These are **battle-tested** and must be treated as the single source of truth.

### Core Package Helpers

* For `@touchspin/core`, we **do not reimplement helpers**.
* Instead, we:

  1. **Copy** the canonical helpers into `packages/core/test-helpers/`.
  2. Add a thin **adapter layer** (`core-adapter.ts`) for Core-specific logic (e.g. initialization without jQuery).
  3. Re-export everything via `packages/core/test-helpers/index.ts`.

### Strict Rules

1. ❌ Do **not** create parallel helpers like `core-helpers.ts`, `events.ts`, or `coverage.ts` — this causes duplication and inconsistency.
2. ✅ Always import from:

  * `../test-helpers` → shared `touchspinHelpers` (copied from `__tests__/helpers/`).
  * `../test-helpers/core-adapter` → only for Core-specific APIs.
3. ✅ All new tests must rely on these helpers, never bypass them.

### Why This Matters

* Keeps the test suite **consistent and maintainable**.
* Prevents duplication of logic.
* Ensures that bugfixes to helpers automatically benefit all packages.

## 📊 Coverage Roadmap: Journey to 100%

### Phase 1: jQuery Plugin Package ✅ (\~95% Complete)

* **Status**: Almost done, refining patterns
* **Focus**: Establishing clean patterns for other packages
* **Location**: `packages/jquery-plugin/tests/`
* **Coverage Target**: 100%
* **Remaining Work**:

  * Cover `forcestepdivisibility` options (floor, ceil, none)
  * Test vertical button configurations
  * Add callback function tests
  * Complete edge cases

### Phase 2: Core Package 🚀 (NEXT - 0%)

* **Status**: Starting after jQuery plugin completion
* **Focus**: Core logic, state management, value calculations
* **Location**: `packages/core/tests/`
* **Coverage Target**: 100%
* **Special Role**: Will house shared test infrastructure
* **What to test**:

  * Value normalization and validation
  * Step calculations and rounding
  * Min/max boundary enforcement
  * Decimal precision handling
  * State management
  * Configuration merging

### Phase 3: Renderer Packages 📅 (Future - 0%)

* **Status**: After core package
* **Coverage Target**: 100% each
* **Packages**:

  * `packages/renderers/bootstrap5/tests/` - Bootstrap 5 markup
  * `packages/renderers/material/tests/` - Material Design
  * `packages/renderers/tailwind/tests/` - Tailwind CSS
* **What to test**:

  * Framework-specific DOM structure
  * CSS class application
  * ARIA attributes
  * Theme integration

### Phase 4: Integration & E2E 🔄 (Final - 0%)

* **Status**: After individual packages
* **Focus**: Cross-package integration
* **Coverage Target**: Key user workflows

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

* **Bad**: "should handle increment and decrement with callbacks and update display"
* **Good**: "should increment value by step amount"
* A developer should understand the test from its name alone

### Maintainability

* Simple tests = easy updates
* When TouchSpin behavior changes, update one test, not untangle complex logic
* New developers can contribute immediately

### Debuggability

* Playwright UI shows exactly what failed
* Event log provides complete interaction history
* No mysterious failures from complex test setup

### Coverage Achievement

* Focused tests make it obvious what's not covered
* Easy to add test for specific branch or condition
* No accidentally testing the same thing multiple times

## ✅ Test Quality Checklist

Every test MUST meet these criteria:

* [ ] **Tests exactly ONE behavior** - split complex tests
* [ ] **Uses event log for verification** - not custom listeners
* [ ] **No conditional element checks** - use strict helpers
* [ ] **Clear descriptive test name** - behavior, not implementation
* [ ] **Follows AAA pattern** - Arrange, Act, Assert
* [ ] **Reuses shared fixtures** - don't create custom HTML
* [ ] **Cleans up after itself** - no side effects for next test

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

## 🎯 Writing Human-Readable Tests

### The Golden Rule: No Hidden Assertions

Every test should be readable by a developer who has never seen the code before. They should understand what's being tested just by reading the assertions.

### ❌ Bad Examples (Don't Do This)

#### Hidden Results in Variables

```typescript
// BAD: What is eventValid? How was it calculated?
test('should emit correct events', async ({ page }) => {
  const eventValid = await page.evaluate(() => {
    let hasEventObject = false;
    let hasType = false;
    // ... complex setup
    return hasEventObject && hasType;
  });
  expect(eventValid).toBe(true); // What does this even mean?
});

// BAD: Multiple behaviors hidden behind variables
test('should handle boundaries', async ({ page }) => {
  const result = await testBoundaries(); // What boundaries? What result?
  expect(result.min).toBe('correct');
  expect(result.max).toBe('correct'); // What is "correct"?
});
```

#### Complex Variable Assignments

```typescript
// BAD: Makes developer trace through assignments
test('should increment properly', async ({ page }) => {
  const initialValue = await touchspinHelpers.readInputValue(page, 'test-input');
  await touchspinHelpers.clickUpButton(page, 'test-input');
  const newValue = await touchspinHelpers.readInputValue(page, 'test-input');
  expect(parseInt(newValue)).toBe(parseInt(initialValue) + 5); // Why +5? Where did 5 come from?
});
```

#### Custom Event Listeners Instead of Event Log

```typescript
// BAD: Custom promise-based setup when event log exists
test('should fire min event', async ({ page }) => {
  const eventFired = await page.evaluate(() => {
    return new Promise((resolve) => {
      let fired = false;
      $input.on('touchspin.on.min', () => { fired = true; });
      // ... trigger action
      setTimeout(() => resolve(fired), 100);
    });
  });
  expect(eventFired).toBe(true); // Event log would be clearer
});
```

### ✅ Good Examples (Do This)

#### Direct, Clear Assertions

```typescript
// GOOD: Expected value is immediately clear
test('should increment by step amount when clicking up button', async ({ page }) => {
  await touchspinHelpers.initializeTouchSpin(page, 'test-input', { step: 5 });

  await touchspinHelpers.clickUpButton(page, 'test-input');

  expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('55'); // 50 + 5
});

// GOOD: No variable hiding what we're testing
test('should create wrapper with buttons after initialization', async ({ page }) => {
  await touchspinHelpers.initializeTouchSpin(page, 'test-input', {});

  // TouchSpin should be properly initialized - direct check
  expect(await touchspinHelpers.isTouchSpinInitialized(page, 'test-input')).toBe(true);
  expect(await page.locator('[data-testid="test-input-up"]').count()).toBe(1);
  expect(await page.locator('[data-testid="test-input-down"]').count()).toBe(1);
});
```

#### Use Event Log for All Events

```typescript
// GOOD: Event log provides clear verification
test('should emit min event when at minimum boundary', async ({ page }) => {
  await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, initval: 0 });
  await touchspinHelpers.clearEventLog(page);

  await touchspinHelpers.clickDownButton(page, 'test-input');

  // Clear what we're checking - event log entry
  expect(await touchspinHelpers.hasEventInLog(page, 'touchspin.on.min', 'touchspin')).toBe(true);
});
```

#### Clear Expected Values with Comments

```typescript
// GOOD: Comments explain the calculation
test('should clamp value to maximum boundary', async ({ page }) => {
  await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

  await page.evaluate(() => {
    (window as any).$('[data-testid="test-input"]').TouchSpin('set', 150);
  });

  expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('100'); // Clamped to max
});
```

#### One Clear Behavior Per Test

```typescript
// GOOD: Test name tells exactly what it tests
test('should support jQuery method chaining', async ({ page }) => {
  await touchspinHelpers.initializeTouchSpin(page, 'test-input', {});

  const isJQuery = await page.evaluate(() => {
    const result = (window as any).$('[data-testid="test-input"]')
      .TouchSpin('set', 60)
      .TouchSpin('uponce');
    return result instanceof (window as any).$;
  });

  expect(isJQuery).toBe(true);
  expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('61'); // 60 + 1
});
```

### Human-Readable Test Principles

1. **Immediate Clarity** - Anyone reading the test understands what it's testing
2. **No Detective Work** - Don't make developers trace through variable assignments
3. **Expected Values Clear** - Use comments like `'55' // 50 + 5` when helpful
4. **Event Log Over Custom** - Use the centralized event log, not custom listeners
5. **Direct Assertions** - Check exactly what the test name promises
6. **Meaningful Test Names** - Name describes the exact behavior being tested

### When Variables Are OK

Variables are acceptable when they:

* **Reduce repetition** of complex selectors: `const upButton = page.locator('.bootstrap-touchspin-up')`
* **Store configuration** for readability: `const config = { min: 0, max: 100, step: 5 }`
* **Hold complex setup data** that's reused: `const elements = await getTouchSpinElementsStrict(page, 'test-input')`

Variables are NOT OK when they:

* Hide what's being tested
* Store boolean results just to assert them
* Make the assertion less clear than a direct check

## 🔄 Migration Strategy: From Complex to Clean

### Identifying Complex Tests in Old Suite

Look for tests that:

* Have multiple `expect()` statements testing different things
* Use words like "and", "with", "also" in the name
* Set up complex state before testing
* Test implementation details not behavior

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

## 🎯 Coverage Strategy:
