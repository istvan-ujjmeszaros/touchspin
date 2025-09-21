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

* **Do not modify** `__tests__/helpers/touchspinApiHelpers.ts` or configs unless absolutely necessary
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
export async function initializeTouchspin(page, testId, options)  // Creates TouchSpinCore instance directly
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

**⚠️ CRITICAL: Step Normalization Gotcha**

> TouchSpin normalizes the initial value to the nearest multiple of `step` during initialization.

```typescript
// ❌ Pitfall: fixture value 50 with step 3 may become 51 during init
await apiHelpers.initializeTouchspin(page, 'test-input', { step: 3 });

// ✅ Prefer supplying a divisible init value
await apiHelpers.initializeTouchspin(page, 'test-input', { step: 3, initval: 48 });
```

**Rule of thumb (from Handbook):**
- `step: 1` → any integer
- `step: 2` → even numbers
- `step: 3` → multiples of 3
- `step: 5` → multiples of 5
- `step: 0.1` → one decimal steps, ensure string inputs use `.`

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
import { initializeTouchspin } from '../test-helpers/core-adapter';

await initializeTouchspin(page, 'test-input', {
  step: 3,
  min: 0,
  max: 100,
  initval: 48  // Set initial value during initialization
});
```

**2. jQuery Plugin Tests (With Renderer)**
```typescript
// Uses existing jQuery-based helpers
import * as apiHelpers from '@touchspin/core/test-helpers';

await apiHelpers.initializeTouchspinJQuery(page, 'test-input', {
  step: 3,
  min: 0,
  max: 100
});
```

**✅ CORRECT Core Test Pattern:**
```typescript
// Use initval option instead of separate setValue call
await initializeTouchspin(page, 'test-input', {
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
await initializeTouchspin(page, 'test-input', { step: 0.25, decimals: 2 });
```

**Key Differences:**
- **`initializeTouchspin`**: Creates `new TouchSpinCore()` directly, stores on `input._touchSpinCore`
- **`initializeTouchspinJQuery`**: Uses jQuery wrapper, creates renderer UI elements
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

1. **Canonical Helpers**: The single source of truth is `__tests__/helpers/touchspinApiHelpers.ts`.
2. **Core Adapter Layer**: In `packages/core/test-helpers/core-adapter.ts`, only lightweight adapter functions may be added to bridge Core logic and the canonical helpers.
3. **No Duplicate Helpers**: Never rewrite helpers under `packages/core/test-helpers/helpers/`. Always import from the canonical location.
4. **Allowed Additions**: Only extend via adapter if Core requires access to API-level methods (`upOnce`, `downOnce`, etc.).
5. **Import Pattern**:

   ```typescript
   import * as apiHelpers from '@touchspin/core/test-helpers';
   import { initializeTouchspin } from '../test-helpers/core-adapter';
   ```

### ✅ Do

```typescript
import * as apiHelpers from '@touchspin/core/test-helpers';
import { initializeTouchspin } from '../test-helpers/core-adapter';
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

## 📖 Testing Methodology & Guidelines

> **📋 Quick Reference**: See [TEST_HELPERS_CHEATSHEET.md](packages/core/TEST_HELPERS_CHEATSHEET.md)
> **📚 Comprehensive Guide**: See [TEST_CONTRIBUTOR_HANDBOOK.md](packages/core/TEST_CONTRIBUTOR_HANDBOOK.md)

### 🎯 Golden Rules (from Handbook)

* **Helpers-first**: All interactions and checks go through `apiHelpers` / `jqueryHelpers`
* **Renderer-agnostic**: Use `data-touchspin-injected="up|down|prefix|postfix"` — never Bootstrap classes
* **Centralized logging**: Logging is wired by initializers — do **not** add listeners in tests
* **Deterministic waits**: Use `waitForTouchspinInitialized`, `waitForSanitization`, or `expect*` helpers (no arbitrary sleeps)
* **AAA + one behavior per test**: Arrange–Act–Assert; descriptive titles; keep tests focused

### 📋 Standard Test Template

```typescript
import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';

test.describe('TouchSpin: [feature]', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await apiHelpers.waitForPageReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  test('should [specific behavior]', async ({ page }) => {
    // Arrange
    await apiHelpers.initializeTouchspin(page, 'qty', { step: 3, initval: 9 });
    await apiHelpers.expectTouchSpinInitialized(page, 'qty');

    // Act
    await apiHelpers.clickUpButton(page, 'qty');

    // Assert
    await apiHelpers.expectValueToBe(page, 'qty', '12');
    await apiHelpers.expectEventFired(page, 'change');
  });
});
```

### 🚫 Anti-patterns (from Handbook)

* Direct DOM ops on TouchSpin controls (`page.locator(...).click()`) → **use helpers**
* Adding listeners in tests (`addEventListener`, `$(document).on(...)`) → **logging is centralized**
* Bootstrap class selectors → **use injected roles**
* Arbitrary `waitForTimeout` → **use deterministic waits/expectations**
* Mixing Core and jQuery init in the same test file → keep them in separate suites

### ✅ Review Checklist (from Handbook)

* [ ] Only `apiHelpers` / `jqueryHelpers` used for TouchSpin interactions
* [ ] Renderer-agnostic locators (no Bootstrap classes)
* [ ] No raw sleeps; expectations/waits are deterministic
* [ ] No test-level event listeners; logging relies on central setup
* [ ] Test names describe behavior ("should …"), one behavior per test
* [ ] If helpers were edited, examples/cheatsheet updated accordingly

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
expect(await apiHelpers.isTouchSpinInitialized(page, 'test-input')).toBe(true);
```

### CRITICAL: TouchSpin Initialization Detection

**For Core Package Tests Only** (jQuery plugin uses different pattern):

- **Initialization Signal**: Core sets `data-touchspin-injected` attribute **on the input element** when fully initialized
- **What "fully initialized" means**:
  1. DOM structure built (wrapper, buttons created)
  2. Event handlers attached
  3. Mutation observer active
  4. Component ready for interaction

**IMPORTANT**: The `initializeTouchspin` helper automatically waits for this attribute before returning. Tests should never manually check for initialization - the helper guarantees the Core is ready.

```typescript
// ✅ CORRECT - initializeTouchspin waits for full initialization
await initializeTouchspin(page, 'test-input', { step: 5 });
// Core is guaranteed to be fully ready here

// ❌ WRONG - Don't manually check, helper does this
await initializeTouchspin(page, 'test-input', { step: 5 });
await page.waitForSelector('[data-testid="test-input"][data-touchspin-injected]'); // Redundant!
```

**Key Difference from jQuery Plugin**:
- **jQuery Plugin**: Sets `data-touchspin-injected` on the **wrapper element**
- **Core Package**: Sets `data-touchspin-injected` on the **input element** (updated in Core source)

### Checking for Destroy

```typescript
expect(await apiHelpers.isTouchSpinDestroyed(page, 'test-input')).toBe(true);
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

The test helpers are organized into focused modules in the core package for better maintainability:

#### Import Options

```typescript
// Option 1: Import everything (recommended)
import * as apiHelpers from '@touchspin/core/test-helpers';

// Option 2: Import specific modules (for focused usage)
import { clickUpButton, holdDownButton } from '@touchspin/core/test-helpers/interactions/buttons';
import { expectValueToBe } from '@touchspin/core/test-helpers/assertions/values';
import { setupLogging, clearEventLog } from '@touchspin/core/test-helpers/events';
```

#### Core Functionality

**Element Access & Selectors:**
- `getTouchSpinElements(page, testId)` - Returns wrapper, input, buttons, prefix/postfix
- `getTouchSpinWrapper(page, testId)` - Returns wrapper element
- `getElement(page, testId)` - Returns input element
- `inputById(page, testId)`, `wrapperById(page, testId)` - Basic selectors

**Initialization & State:**
- `initializeTouchspinJQuery(page, testId, options)` - jQuery plugin initialization
- `initializeTouchspin(page, testId, options)` - Core initialization
- `isTouchSpinInitialized(page, testId)` - Check if initialized
- `isTouchSpinDestroyed(page, testId)` - Check if destroyed
- `isCoreInitialized(page, testId)` - Check Core instance exists

#### Interactions

**Button Operations:**
- `clickUpButton(page, testId)`, `clickDownButton(page, testId)` - Single clicks
- `holdUpButton(page, testId, ms)`, `holdDownButton(page, testId, ms)` - Hold for duration
- `focusUpButton(page, testId)`, `focusDownButton(page, testId)` - Focus buttons

**Keyboard Operations:**
- `pressUpArrowKeyOnInput(page, testId)`, `pressDownArrowKeyOnInput(page, testId)` - Single key press
- `holdUpArrowKeyOnInput(page, testId, ms)`, `holdDownArrowKeyOnInput(page, testId, ms)` - Hold keys

**Mouse Operations:**
- `wheelUpOnInput(page, testId)`, `wheelDownOnInput(page, testId)` - Mouse wheel events

**Input Operations:**
- `readInputValue(page, testId)` - Get current input value
- `fillWithValue(page, testId, value)` - Fill input with value
- `fillWithValueAndBlur(page, testId, value)` - Fill and trigger blur
- `typeInInput(page, testId, text)` - Type text into input
- `selectAllInInput(page, testId)` - Select all text

#### Core API Operations

- `getNumericValue(page, testId)` - Get parsed numeric value
- `setValueViaAPI(page, testId, value)` - Set value via Core API
- `incrementViaAPI(page, testId)`, `decrementViaAPI(page, testId)` - Direct API calls
- `startUpSpinViaAPI(page, testId)`, `startDownSpinViaAPI(page, testId)` - Start spinning
- `stopSpinViaAPI(page, testId)` - Stop spinning
- `updateSettingsViaAPI(page, testId, settings)` - Update configuration
- `destroyCore(page, testId)` - Destroy Core instance

#### Event System

**Event Logging:**
- `setupLogging(page)` - Initialize event capture (idempotent)
- `clearEventLog(page)` - Clear event history
- `getEventLog(page)` - Get full event log array
- `hasEventInLog(page, event, type?)` - Check if event occurred
- `countEventInLog(page, event, type?)` - Count event occurrences
- `waitForEventInLog(page, event, options?)` - Wait for specific event
- `getEventsOfType(page, type)` - Get events by type ('native' | 'touchspin')

#### Assertions (Polled Expectations)

**Value Assertions:**
- `expectValueToBe(page, testId, expected, timeout?)` - Wait for specific value
- `expectValueToBeGreaterThan(page, testId, value, timeout?)` - Wait for value > threshold
- `expectValueToBeLessThan(page, testId, value, timeout?)` - Wait for value < threshold
- `expectValueToBeBetween(page, testId, min, max, timeout?)` - Wait for value in range

**Button State Assertions:**
- `expectButtonToBeDisabled(page, testId, 'up'|'down', timeout?)` - Wait for disabled state
- `expectButtonToBeEnabled(page, testId, 'up'|'down', timeout?)` - Wait for enabled state

**Event Assertions:**
- `expectEventFired(page, eventName, timeout?)` - Wait for event to fire
- `expectNoEvent(page, eventName, timeout?)` - Ensure event doesn't fire
- `expectEventCount(page, eventName, count, timeout?)` - Wait for specific event count

#### Test Utilities

**Coverage:**
- `startCoverage(page)` - Start CDP coverage collection
- `collectCoverage(page, testName)` - Collect and save coverage data

**Test Setup:**
- `installJqueryPlugin(page)` - Install jQuery plugin with Bootstrap5 renderer
- `createAdditionalInput(page, testId, options)` - Create dynamic test inputs
- `waitForPageReady(page, flag?, timeout?)` - Wait for page ready state

#### Types

```typescript
type EventLogType = 'native' | 'touchspin';
interface EventLogEntry {
  type: EventLogType;
  event: string;
  target?: string;
  value?: string;
}
interface TouchSpinElements {
  wrapper: Locator;
  input: Locator;
  upButton: Locator;
  downButton: Locator;
  prefix: Locator;
  postfix: Locator;
}
```

### Test File Locations

**New Test Structure:**
* Test Helpers: `packages/core/test-helpers/` (shared across all packages)
* Test Cheatsheet: `packages/core/TEST_HELPERS_CHEATSHEET.md`
* New Tests: `packages/*/tests/*.spec.ts` (when written)

**Archived Tests (for reference only):**
* Deprecated Tests: `__tests__/*.spec.deprecated.ts` (legacy tests for edge case reference)

### Running New Tests

```bash
# Core package tests (when written)
yarn exec playwright test packages/core/tests/

# jQuery plugin tests (when written)
yarn exec playwright test packages/jquery-plugin/tests/

# All new tests
yarn exec playwright test packages/

# With coverage
COVERAGE=1 yarn exec playwright test --config=playwright-coverage.config.ts packages/

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
# Coverage for new tests
yarn coverage:all packages/core/tests/
yarn coverage:all packages/jquery-plugin/tests/
yarn coverage:all:ci
yarn coverage:check
```

### Troubleshooting

* Comments flagged → use build-mode
* Missing sources → ensure build success
* Empty coverage → check `COVERAGE_DIST`

---

## 📖 Reference: Archived Test Suite

All legacy tests have been archived to `__tests__/*.spec.deprecated.ts` for reference when identifying edge cases during new test development.

**Key archived tests for reference:**
- `value-normalization.spec.deprecated.ts` - Value handling edge cases
- `boundary-enforcement.spec.deprecated.ts` - Min/max behavior
- `callbacks.spec.deprecated.ts` - Callback function patterns
- `mousewheel.spec.deprecated.ts` - Mouse wheel interaction edge cases
- `step-calculations.spec.deprecated.ts` - Step calculation behaviors
- And 25+ more archived test files

**Usage**: Consult archived tests when implementing new tests to ensure edge cases are covered, but do not run or maintain the deprecated tests.

---

## 📁 Project Structure Notes

### Test Infrastructure

**Test helpers location**: All test helpers are in `packages/core/test-helpers/` and can be imported as `@touchspin/core/test-helpers`.

**Archived tests**: Legacy tests are in `__tests__/*.spec.deprecated.ts` for reference only - do not run or maintain these.

**New tests**: Write new tests in `packages/*/tests/` directories using the helper infrastructure.

### Temporary Files and Documentation

**Project tmp folder**: Use `/apps/bootstrap-touchspin-openai/tmp/` (not system `/tmp/`) for:
- Temporary documentation files
- Progress tracking files
- Work-in-progress notes
- Any temporary files that should be accessible within the project context

This folder is part of the project structure and should be used instead of system tmp directories.

---

## 🎭 Gherkin-Style Test Format & Step Lexicon

### Test Format: Comments-First Approach

We use a **Gherkin-style comment approach** for test specification and organization. This provides clear documentation of test intent without requiring a full Gherkin parser.

#### Spec File Structure

```typescript
/**
 * Feature: [Brief feature description]
 * Background: fixture = [path to test fixture]
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] implemented scenario one
 * [x] implemented scenario two
 * [ ] planned scenario three
 * [ ] planned scenario four
 */

import { test } from '@playwright/test';
// ... imports

/**
 * Scenario: implemented scenario one
 * Given the fixture page is loaded
 * When I perform some action
 * Then some expected result occurs
 */
test('implemented scenario one', async ({ page }) => {
  // Test implementation
});

/**
 * Scenario: planned scenario three
 * Given some initial state
 * When some action is performed
 * Then some result is expected
 * Params:
 * { "setting": "value", "other": 123 }
 */
test.skip('planned scenario three', async ({ page }) => {
  // Implementation pending
});
```

#### Format Rules

1. **Feature Header**: Minimal `/** Feature: ... */` at top of file
2. **Checklist**: `/* CHECKLIST — Scenarios in this spec */` block with `[x]`/`[ ]` items
3. **Scenario Comments**: Immediately above each `test()` with Given/When/Then structure
4. **Params**: Optional JSON block for complex test configurations
5. **Implemented Tests**: Use `test()` with `[x]` in checklist
6. **Planned Tests**: Use `test.skip()` with `[ ]` in checklist

### Guard Script Validation

The **gherkin-guard-dog** script enforces checklist consistency:

```bash
# Run the guard (validates all .spec.ts files)
yarn test:guard

# With environment variables
REQUIRE_CHECKLIST=1 yarn test:guard  # Fail if no checklist found
VERBOSE=1 yarn test:guard            # Show OK messages
```

#### Validation Rules

- `[x]` items must have corresponding `test()` (not `test.skip()`)
- `[ ]` items must have corresponding `test.skip()`
- Every `test()` must be listed as `[x]` in checklist
- Every `test.skip()` must be listed as `[ ]` in checklist
- No duplicate test titles or checklist items
- Test titles must exactly match checklist items

### Step Lexicon Generation

The **step lexicon** is auto-generated from doc-comments in helper functions and serves as the **single source of truth** for available test steps.

#### Helper Function Annotation

```typescript
/**
 * When I click the up button on "{testId}"
 * @note Keeps focus; does not blur
 */
export async function clickUpButton(page: Page, testId: string) { ... }

/**
 * Then the value of "{testId}" is "{expected}"
 */
export async function expectValueToBe(page: Page, testId: string, expected: string) { ... }

/**
 * Given I mount TouchSpin on "{testId}" with settings
 * Given TouchSpin is initialized on "{testId}" with {settings}
 * @note Multiple step phrases supported for flexibility
 */
export async function initializeTouchspinWithVanilla(page, testId, settings) { ... }
```

#### Doc-Comment Format

- **First line**: Human-readable step description (becomes lexicon entry)
- **Additional lines**: Alternative phrasings (each becomes separate entry)
- **@note lines**: Optional implementation notes
- **Placeholders**: Use `{testId}`, `{expected}`, `{settings}`, `{value}`, etc.

#### Generate the Lexicon

```bash
# Generate tests/STEP-LEXICON.md from helper doc-comments
yarn lexicon:gen

# Override default scan paths
yarn lexicon:gen packages/foo/helpers packages/bar/helpers
```

#### Generated Output Format

```markdown
# Step Lexicon (generated)

## interactions

- **When I click the up button on "{testId}"**
  - `clickUpButton(page, testId)`
  - File: `packages/core/tests/__shared__/helpers/interactions/buttons.ts`

- **When I type "{text}" into "{testId}"**
  - `typeInInput(page, testId, text)`
  - File: `packages/core/tests/__shared__/helpers/interactions/input.ts`

## assertions

- **Then the value of "{testId}" is "{expected}"**
  - `expectValueToBe(page, testId, expected, timeout?)`
  - File: `packages/core/tests/__shared__/helpers/assertions/values.ts`
```

### Claude Scope Discipline

When Claude generates tests from Gherkin comments, these rules **must** be followed:

#### ✅ Claude May

1. **Implement only `[ ]` scenarios**: Convert `test.skip()` to `test()` and flip checklist to `[x]`
2. **Use only lexicon steps**: Every step phrase must exist in `tests/STEP-LEXICON.md`
3. **Match titles exactly**: Test titles must equal scenario titles character-for-character
4. **Handle malformed Params**: Use `test.skip()` with error comment for invalid JSON

#### ❌ Claude Must NOT

1. **Invent new steps**: Never create step phrases not in the lexicon
2. **Modify existing helpers**: Don't change helper function signatures or behavior
3. **Implement `[x]` scenarios**: These are already done
4. **Change test names**: Keep exact scenario titles as test names

#### Example Valid Implementation

```typescript
// Scenario comment (already exists)
/**
 * Scenario: increases value on click on up button and triggers change event
 * Given the fixture page is loaded
 * When I click the up button
 * Then the value increases and change event is fired
 */

// Claude converts from test.skip to test, updates checklist [x]
test('increases value on click on up button and triggers change event', async ({ page }) => {
  // Implementation using only lexicon steps
  await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
  await initializeTouchspinWithVanilla(page, 'test-input', { step: 1, initval: '0' });
  await clickUpButton(page, 'test-input');
  await expectValueToBe(page, 'test-input', '1');
  // ... rest using lexicon steps
});
```

### How to Implement a Planned Scenario

When converting a planned scenario from `test.skip()` to `test()`:

1. **Flip checklist status**: Change `[ ]` to `[x]` in the checklist
2. **Change test method**: Convert `test.skip('Title', ...)` to `test('Title', ...)`
3. **Use only lexicon steps**: Every action must exist in `tests/STEP-LEXICON.md`
4. **Keep scenario title exactly**: Test title must match the scenario comment exactly
5. **Implement using helpers**: Replace `// Implementation pending` with actual test code using documented helpers

#### Quick Example

```diff
/*
 * CHECKLIST — Scenarios in this spec
- * [ ] increases value on click on up button and triggers change event
+ * [x] increases value on click on up button and triggers change event
 */

- test.skip('increases value on click on up button and triggers change event', async ({ page }) => {
+ test('increases value on click on up button and triggers change event', async ({ page }) => {
-   // Implementation pending
+   await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
+   await initializeTouchspinWithVanilla(page, 'test-input', { step: 1, initval: '0' });
+   await clickUpButton(page, 'test-input');
+   await expectValueToBe(page, 'test-input', '1');
  });
```

### PR Checklist

When contributing tests, ensure:

- [ ] **Checklist updated**: `[ ]` → `[x]` for implemented scenarios
- [ ] **Guard passes**: `yarn test:guard` runs clean
- [ ] **Lexicon regenerated**: `yarn lexicon:gen` if helper docs changed
- [ ] **Step compliance**: All steps exist in generated lexicon
- [ ] **Test titles exact**: Match scenario comments precisely

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

## 🎛️ Core Event Model

### API vs User Input Events

**IMPORTANT**: API spin methods do not emit `touchspin.on.startspin/stopspin` events. For these events, **use keyboard or wheel** in tests. API-based tests should assert **no start/stop** events.

**Event Sources**:
- **User Input** (keyboard, mousewheel): Emits `startspin`/`stopspin` events
- **API Methods** (`startUpSpin()`, `stopSpin()`, etc.): Do NOT emit `startspin`/`stopspin` events

**Testing Implications**:
```typescript
// ✅ CORRECT - Test keyboard events
await page.keyboard.down('ArrowUp');
expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);

// ✅ CORRECT - Test API methods don't emit start/stop
await apiHelpers.incrementViaAPI(page, 'test-input');
expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(false);
```

---

## 🔄 Callback Functions

### Callback Behavior Specifications

**`callback_before_calculation`**:
- May return **numeric** (number or numeric string) → Core normalizes & clamps as usual
- If it returns **non-numeric**, Core **rejects the callback return** and preserves the original value
- Use `readInputValue()` for display assertions and `getNumericValue()` for internal state

**`callback_after_calculation`**:
- Takes the final computed value and may return a **string for display** (e.g., `"10 USD"`)
- Core applies formatter to display but **maintains internal numeric value**
- Display shows formatted string, but `getNumericValue()` returns the underlying number

**Testing Implications**:
```typescript
// ✅ Test before_calculation with numeric string
expect(await getNumericValue(page, 'test-input')).toBe(51);  // Normalized
expect(await readInputValue(page, 'test-input')).toBe('51'); // Display

// ✅ Test before_calculation with non-numeric (rejected)
expect(await readInputValue(page, 'test-input')).toBe('50'); // Original preserved
expect(await getNumericValue(page, 'test-input')).toBe(50);  // Original preserved

// ✅ Test after_calculation formatting
expect(await readInputValue(page, 'test-input')).toBe('10 USD'); // Formatted display
expect(await getNumericValue(page, 'test-input')).toBe(10);      // Internal numeric preserved
```

---

*End of Testing Strategy Document - Let's achieve 100% coverage with clean, maintainable tests!*
