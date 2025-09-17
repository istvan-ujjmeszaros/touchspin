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
      core-adapter.ts # Adapter functions for Core API
```

### Principles for Shared Resources

1. **HTML fixtures must be minimal** - just enough DOM to test
2. **Fixtures should be parameter-driven** - not hardcoded
3. **Helpers should be composable** - small functions that combine
4. **No package-specific logic** - keep it generic

## 🔒 Helper Usage Policy

1. **Canonical Helpers**: The single source of truth is `__tests__/helpers/touchspinHelpers.ts`.
2. **Core Adapter Layer**: In `packages/core/test-helpers/core-adapter.ts`, only lightweight adapter functions may be added to bridge Core logic and the canonical helpers.
3. **No Duplicate Helpers**: Never rewrite helpers under `packages/core/test-helpers/helpers/`. Always import from the canonical location.
4. **Allowed Additions**: Only extend via adapter if Core requires access to API-level methods (`upOnce`, `downOnce`, etc.).
5. **Import Pattern**:

   ```typescript
   import touchspinHelpers from '../../__tests__/helpers/touchspinHelpers';
   import { initializeCore } from '../test-helpers/core-adapter';
   ```

### ✅ Do

```typescript
import touchspinHelpers from '../../__tests__/helpers/touchspinHelpers';
import { initializeCore } from '../test-helpers/core-adapter';
```

### ❌ Don’t

```typescript
// WRONG: reimplemented helpers
import { clickUpButton } from '../test-helpers/helpers/core-helpers';
```

## 🖼️ Renderer Usage in Core Tests

### Problem

* Core without a renderer creates **no buttons** (only supports keyboard/wheel events and API methods).
* Button-based helpers (`clickUpButton`, `clickDownButton`) only work if a renderer is attached.

### Policy

1. **Pure Core Tests**: Use API methods (`upOnce`, `downOnce`) or keyboard events (ArrowUp/ArrowDown).
2. **UI-Oriented Tests**: If buttons are needed, explicitly initialize Core with a renderer (default: Bootstrap5Renderer).
3. **Hybrid Approach**: Prefer API methods for Core logic, renderer-based tests only when verifying integration with renderers.

### Adapter Extension

In `core-adapter.ts`, provide unified methods:

```typescript
// API-based increment/decrement
export async function incrementViaAPI(page, testId) { /* ... */ }
export async function decrementViaAPI(page, testId) { /* ... */ }

// Keyboard-based
export async function incrementViaKeyboard(page, testId) { /* ... */ }
export async function decrementViaKeyboard(page, testId) { /* ... */ }

// Renderer-based (optional)
export async function incrementViaButton(page, testId) { /* ... */ }
export async function decrementViaButton(page, testId) { /* ... */ }
```

### Expected Usage

* **Core Logic Tests** → API/keyboard
* **Renderer Integration Tests** → Renderer + button clicks

---

## 📈 Why Clean Tests Matter

### Readability

* **Bad**: "should handle increment and decrement with callbacks and update display"
* **Good**: "should increment value by step amount"

### Maintainability

* Simple tests = easy updates
* Update one test per behavior change

### Debuggability

* Playwright UI shows failures clearly
* Event log provides complete interaction history

### Coverage Achievement

* Focused tests highlight gaps
* Easy to add specific missing cases

## ✅ Test Quality Checklist

* [ ] **Tests exactly ONE behavior**
* [ ] **Uses event log for verification**
* [ ] **No conditional element checks**
* [ ] **Clear descriptive test name**
* [ ] **Follows AAA pattern**
* [ ] **Reuses shared fixtures**
* [ ] **Cleans up after itself**

### Example of a Perfect Test

```typescript
test('should round value to nearest step multiple on initialization', async ({ page }) => {
  await touchspinHelpers.clearEventLog(page);
  await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
    step: 3,
    initval: 20
  });
  const value = await touchspinHelpers.readInputValue(page, 'test-input');
  expect(value).toBe('21');
});
```

## 🎯 Writing Human-Readable Tests

* **Immediate Clarity**
* **No Detective Work**
* **Expected Values Clear**
* **Event Log Over Custom**
* **Direct Assertions**
* **Meaningful Test Names**

### When Variables Are OK

* Reduce repetition of selectors
* Store configuration for readability
* Hold complex setup data reused across tests

NOT OK when they:

* Hide what's being tested
* Store boolean results just to assert
* Make the assertion less clear than a direct check

## 🔄 Migration Strategy: From Complex to Clean

### Old Complex Test:

```typescript
test('should handle min/max with events and callbacks', async ({ page }) => {
  // multiple behaviors in one
});
```

### New Clean Tests:

```typescript
test('should not decrement below minimum value', async ({ page }) => { /* ... */ });
test('should emit touchspin.on.min event at minimum boundary', async ({ page }) => { /* ... */ });
test('should execute callback before calculation', async ({ page }) => { /* ... */ });
```

## 📋 Standard Test Structure Template

```typescript
import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../__tests__/helpers/touchspinHelpers';

test.describe('[Package] [Feature Area]', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/path/to/fixture.html');
    await touchspinHelpers.installJqueryPlugin(page);
    await touchspinHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'test-name');
  });

  test('should [specific behavior]', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });
});
```

## 🎯 Coverage Strategy: Achieving 100%

### Workflow

1. **Baseline**: run all tests with coverage
2. **Identify Gaps**: check red/yellow lines
3. **Targeted Tests**: add missing cases
4. **Monitor**: enforce coverage in PRs

### Coverage Tips

* Test error paths
* Cover edge cases
* Cover all config options
* Both if/else branches
* Defaults explicitly

### What 100% Coverage Means

* Every line executed
* Every branch covered
* Every function called
* Every edge case handled

---

## 📚 jQuery Plugin Testing Reference

### Data Attributes Reference

* `wrapper`, `wrapper-advanced`, `up`, `down`, `prefix`, `postfix`, `vertical-wrapper`

### Test ID Pattern

When initialized with `data-testid="my-input"`, creates:

* `my-input-wrapper`
* `my-input-up`
* `my-input-down`
* `my-input-prefix`
* `my-input-postfix`

### Checking for Initialization

```typescript
expect(await touchspinHelpers.isTouchSpinInitialized(page, 'test-input')).toBe(true);
```

### Checking for Destroy

```typescript
expect(await touchspinHelpers.isTouchSpinDestroyed(page, 'test-input')).toBe(true);
```

### DOM Structure Examples

* Basic Horizontal Layout
* With Prefix/Postfix
* Vertical Buttons

### Event Log System

* Format: `[native] target:value eventName`, `[touchspin] target:value eventName`
* Helpers: clearEventLog, hasEventInLog, countEventInLog

### Strict Element Finding

* BAD: optional chaining
* GOOD: strict helpers that throw if missing

### Common Pitfalls

* Step value correction
* Focus required for keyboard/mousewheel

### Helper Functions Reference

```typescript
startCoverage(page)
installJqueryPlugin(page)
initializeTouchSpin(page, testId, options)
getTouchSpinElementsStrict(page, testId)
clickUpButton(page, testId)
clickDownButton(page, testId)
clearEventLog(page)
getEventLog(page)
hasEventInLog(page, event, type?)
countEventInLog(page, event, type?)
getEventsOfType(page, type)
waitForEventInLog(page, event, options?)
readInputValue(page, testId)
```

### Test File Locations

* jQuery Plugin Tests: `/packages/jquery-plugin/tests/*.spec.ts`
* Fixture: `/packages/jquery-plugin/tests/html/test-fixture.html`
* Shared Helpers: `/__tests__/helpers/touchspinHelpers.ts`

### Running Tests

```bash
# Single test
yarn exec playwright test packages/jquery-plugin/tests/commands.spec.ts:22

# All tests
yarn exec playwright test packages/jquery-plugin/tests/

# With coverage
COVERAGE=1 yarn exec playwright test --config=playwright-coverage.config.ts packages/jquery-plugin/tests/

# Debug UI
yarn exec playwright test --ui

# Headed mode
yarn exec playwright test --headed
```

---

## 📊 Coverage (Build-Mode First)

* Build-mode eliminates sourcemap drift
* Coverage flow: V8 → Istanbul JSON → merge → report

### Running Coverage

```bash
yarn coverage:all packages/jquery-plugin/tests/
yarn coverage:all packages/jquery-plugin/tests/callable-events.spec.ts
yarn coverage:all:ci
yarn coverage:check
```

### Troubleshooting

* Comments flagged → use build-mode
* Missing sources → ensure build success
* Empty coverage → check `COVERAGE_DIST`

---

## 📖 Reference: Old Test Suite Analysis

* Old suite: 44 files, \~346 tests = definitive spec

### Coverage Gaps

1. forcestepdivisibility options
2. Vertical buttons
3. Callback functions
4. Advanced features: RTL, replacement text, button text customization, native attribute sync

### Key Reference Files

| Feature   | Old Test File                  | What It Covers            |
| --------- | ------------------------------ | ------------------------- |
| Core      | basicOperations.test.ts        | Basic increment/decrement |
| Events    | events.test.ts                 | Event scenarios           |
| Edge      | edgeCasesAndErrors.test.ts     | Boundaries                |
| Lifecycle | destroyAndReinitialize.test.ts | Init/destroy cycles       |
| Keyboard  | keyboardAccessibility.test.ts  | Keyboard interactions     |
| Config    | settingsPrecedence.test.ts     | Config priority           |

---

*End of Testing Strategy Document - Let's achieve 100% coverage with clean, maintainable tests!*
