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

#### 🔍 Core Value Handling Behavior

**IMPORTANT**: Core has different value handling than the original jQuery plugin:

**Empty Values**:
- **Internal**: `core.getValue()` returns `NaN` for empty inputs
- **Display**: Input element shows empty string `""`
- **Test Pattern**: Use `readInputValue()` to check display, not `getNumericValue()`

**Non-Numeric Values**:
- **Internal**: `core.getValue()` returns `NaN` for invalid input
- **Display**: HTML5 `type="number"` inputs automatically clear invalid values to empty string
- **Test Pattern**: Check display value, expect empty string for invalid input

**Callback Effects**:
- `callback_before_calculation` can return non-numeric strings
- Core preserves display value even when callback returns invalid data
- Internal `getValue()` may return `NaN` while display shows original

```typescript
// ✅ CORRECT - Test display behavior
const displayValue = await readInputValue(page, 'test-input');
expect(displayValue).toBe(''); // Empty string, not NaN

// ❌ WRONG - Don't test internal NaN state
const numericValue = await getNumericValue(page, 'test-input');
expect(Number.isNaN(numericValue)).toBe(true); // This masks display behavior
```

#### Core Testing Strategy: Renderer-Independent

**CRITICAL DISCOVERY**: TouchSpin Core without a renderer provides only keyboard/wheel functionality - **no buttons are created**. This is the intended behavior for pure Core testing.

**Core-Only Architecture**:
- Core package manages state, calculations, boundaries, validation
- Without renderer: Only supports keyboard (ArrowUp/ArrowDown) and mouse wheel events
- Console warning: "TouchSpin: No renderer specified (renderer: null). Only keyboard/wheel events will work..."

**Test Helpers Strategy**:
```typescript
// packages/core/test-helpers/core-adapter.ts
export async function initializeCore(page, testId, options)  // Creates TouchSpinCore instance directly
export async function incrementViaAPI(page, testId)    // Uses core.upOnce()
export async function decrementViaAPI(page, testId)    // Uses core.downOnce()
export async function incrementViaKeyboard(page, testId) // ArrowUp key
export async function decrementViaKeyboard(page, testId) // ArrowDown key
export async function incrementViaWheel(page, testId)  // Mouse wheel up
export async function decrementViaWheel(page, testId)  // Mouse wheel down
export async function setValueViaAPI(page, testId, value)  // Uses core.setValue()
export async function getNumericValue(page, testId)   // Gets numeric value from input
export async function destroyCore(page, testId)       // Destroys Core instance
export async function isCoreInitialized(page, testId) // Checks if Core is initialized
```

**DO NOT use button helpers in Core tests**:
- `clickUpButton()` and `clickDownButton()` will fail - no buttons exist
- These helpers are for renderer integration tests only
- Core tests should use API or keyboard/wheel methods

**Core Test File Status** (All syntax errors fixed):
- `boundary-enforcement.spec.ts` - Placeholder tests for min/max enforcement
- `step-calculations.spec.ts` - ✅ Updated to use API methods (incrementViaAPI/decrementViaAPI)
- `value-normalization.spec.ts` - Complete implementation, tests getValue/setValue methods
- `value-operations.spec.ts` - Placeholder tests for core operations
- All other test files - Clean placeholders awaiting implementation

#### Core Package Testing Guidelines

**⚠️ CRITICAL: Step Normalization Behavior**

TouchSpin automatically normalizes all values to the nearest multiple of the step size during initialization. This affects test expectations:

**The Problem:**
- HTML fixture has `value="50"` by default
- When `step: 3` is configured, TouchSpin normalizes 50 → 51 (nearest multiple of 3)
- Subsequent decrement produces 48, not the expected 47

**✅ SOLUTION: Use Step-Divisible Initial Values**

When writing tests involving `step` values, always choose an `initval` that is divisible by the step size:

```typescript
// ❌ BAD: Will cause normalization (50 → 51 when step=3)
await initializeCore(page, 'test-input', { step: 3 });
await decrementViaAPI(page, 'test-input');
expect(await getNumericValue(page, 'test-input')).toBe(47); // FAILS: Actually 48

// ✅ GOOD: Use divisible initial value
await initializeCore(page, 'test-input', { step: 3, initval: 48 });
await decrementViaAPI(page, 'test-input');
expect(await getNumericValue(page, 'test-input')).toBe(45); // PASSES

// ✅ GOOD: Use setValueViaAPI to ensure exact value before testing
await setValueViaAPI(page, 'test-input', 48);
await initializeCore(page, 'test-input', { step: 3 });
await decrementViaAPI(page, 'test-input');
expect(await getNumericValue(page, 'test-input')).toBe(45); // PASSES
```

**Test Separation Rule:**

1. **Basic Operations**: Use step-divisible values to avoid normalization confusion
   - Examples: `step: 5 → initval: 50`, `step: 3 → initval: 48`

2. **Normalization Tests**: Test rounding behavior separately in dedicated tests
   - Examples: "should normalize 50 to 51 when step=3", "should round to nearest step multiple"

**Common Step-Divisible Values:**
- `step: 1` → Any integer (1, 2, 3, 4, 5...)
- `step: 2` → Even numbers (2, 4, 6, 8, 10...)
- `step: 3` → Multiples of 3 (3, 6, 9, 12, 15, 18, 21...)
- `step: 5` → Multiples of 5 (5, 10, 15, 20, 25, 30...)
- `step: 0.1` → One decimal place (0.1, 0.2, 0.3...)
- `step: 0.25` → Quarter values (0.25, 0.5, 0.75, 1.0...)

#### Core vs jQuery Helper Functions

**CRITICAL: Use the Right Helper for the Right Test Type**

There are two distinct initialization functions for different test scenarios:

**1. Core Tests (Renderer-Independent)**
```typescript
// packages/core/test-helpers/core-adapter.ts
import { initializeCore } from '../test-helpers/core-adapter';

await initializeCore(page, 'test-input', {
  step: 3,
  min: 0,
  max: 100,
  initval: 48  // Set initial value during initialization
});
```

**2. jQuery Plugin Tests (With Renderer)**
```typescript
// Uses existing jQuery-based helpers
import touchspinHelpers from '../test-helpers';

await touchspinHelpers.initializeTouchSpinJQuery(page, 'test-input', {
  step: 3,
  min: 0,
  max: 100
});
```

**✅ CORRECT Core Test Pattern:**
```typescript
// Use initval option instead of separate setValue call
await initializeCore(page, 'test-input', {
  step: 0.25,
  decimals: 2,
  initval: 10  // Sets value before Core initialization
});
await incrementViaAPI(page, 'test-input');
expect(await getNumericValue(page, 'test-input')).toBe(10.25);
```

**❌ WRONG Core Test Pattern:**
```typescript
// This will fail because _touchSpinCore doesn't exist yet
await setValueViaAPI(page, 'test-input', 10);  // FAILS!
await initializeCore(page, 'test-input', { step: 0.25, decimals: 2 });
```

**Key Differences:**
- **`initializeCore`**: Creates `new TouchSpinCore()` directly, stores on `input._touchSpinCore`
- **`initializeTouchSpinJQuery`**: Uses jQuery wrapper, creates renderer UI elements
- **`initval` option**: Sets input value BEFORE Core initialization to avoid normalization issues
- **Core helpers work without renderer**: No buttons created, API/keyboard/wheel only

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

### CRITICAL: TouchSpin Initialization Detection

**For Core Package Tests Only** (jQuery plugin uses different pattern):

- **Initialization Signal**: Core sets `data-touchspin-injected` attribute **on the input element** when fully initialized
- **What "fully initialized" means**:
  1. DOM structure built (wrapper, buttons created)
  2. Event handlers attached
  3. Mutation observer active
  4. Component ready for interaction

**IMPORTANT**: The `initializeCore` helper automatically waits for this attribute before returning. Tests should never manually check for initialization - the helper guarantees the Core is ready.

```typescript
// ✅ CORRECT - initializeCore waits for full initialization
await initializeCore(page, 'test-input', { step: 5 });
// Core is guaranteed to be fully ready here

// ❌ WRONG - Don't manually check, helper does this
await initializeCore(page, 'test-input', { step: 5 });
await page.waitForSelector('[data-testid="test-input"][data-touchspin-injected]'); // Redundant!
```

**Key Difference from jQuery Plugin**:
- **jQuery Plugin**: Sets `data-touchspin-injected` on the **wrapper element**
- **Core Package**: Sets `data-touchspin-injected` on the **input element** (updated in Core source)

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

## 🔧 Important Development Workflow

### CRITICAL: Always Rebuild After Source Changes

**⚠️ NEVER FORGET**: After making ANY changes to source files (`/src/`), you MUST rebuild before running tests:

```bash
yarn build
```

**Why this is critical:**
- Tests run against built artifacts in `/dist/` folders
- Source changes don't take effect until rebuilt
- Forgetting to rebuild leads to confusing test failures
- This is the #1 cause of "my fix doesn't work" issues

**Workflow:**
1. Edit source files (`packages/*/src/`)
2. **ALWAYS run `yarn build`**
3. Run tests
4. Repeat

**Add this to your muscle memory** - every source change requires a rebuild!

---

*End of Testing Strategy Document - Let's achieve 100% coverage with clean, maintainable tests!*
