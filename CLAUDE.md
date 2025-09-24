# TouchSpin - Testing Strategy & Agent Reference

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

### 🎯 Test Implementation Requirements

**CRITICAL**: We are implementing **EXISTING** test specifications, not creating new ones.

#### Follow Existing Test Scenarios
* **All test files contain pre-defined Gherkin-like scenarios** with complete specifications
* **Each `test.skip()` has documentation** describing the exact test to implement
* **Checklists at file tops** show all scenarios that need implementation
* **Parameters are provided** - use them exactly as specified

#### No New Tests Until Completion
* **Do NOT create any new tests** until ALL `test.skip()` placeholders are implemented
* **Follow the Gherkin scenarios exactly** - Given/When/Then structure with provided params
* **Use existing test names** - do not modify or add new test descriptions
* **Implement systematically** - complete one file before moving to the next

#### Gherkin Scenario Pattern
```javascript
/**
 * Scenario: [descriptive test name]
 * Given [initial state setup]
 * When [action performed]
 * Then [expected outcome]
 * Params:
 * { [exact configuration values] }
 */
test('scenario name', async ({ page }) => {
  // Implementation using provided params
});
```

#### Source Bug Handling
* **If test fails due to source bug**: Add TODO comment describing the issue
* **Do NOT fix source code** during test implementation phase
* **Document issues** for later resolution
* **Continue with remaining tests** - don't stop for bugs

#### CRUCIAL: Use Exact Scenario Parameters
* **NEVER modify the parameters specified in Gherkin scenarios**
* **Use EXACTLY the values provided in Params:** - no adjustments
* **Let tests fail if parameters don't match Core behavior**
* **DO NOT change test parameters to make tests pass**
* **Failed tests will be reviewed and addressed separately**

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

### Phase 1: jQuery Plugin Package ✅ (Patterns Established)

* **Status**: Clean patterns established, serves as reference implementation
* **Focus**: Reference for testing methodology and helper usage
* **Location**: `packages/jquery-plugin/tests/`
* **Coverage Target**: 100%

### Phase 2: Core Package 🚀 (Active Development)

* **Status**: Implementation ongoing with comprehensive test infrastructure
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

#### Core Testing Strategy: Use Full Initialization

**IMPORTANT**: For Core package tests that need full TouchSpin functionality, use `initializeTouchspinWithVanilla` which provides:
- Complete TouchSpin Core instance with VanillaRenderer
- All API methods (`upOnce()`, `downOnce()`, `setValue()`, etc.)
- Button interactions (`clickUpButton()`, `clickDownButton()`)
- Keyboard/wheel events
- Full UI including buttons

**Core Testing Approaches**:
1. **Full Functionality**: Use `initializeTouchspinWithVanilla` for comprehensive testing
2. **Callback Testing Only**: Use `core-adapter.ts` stub for callback pairing validation tests

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
await initializeTouchspinWithVanilla(page, 'test-input', { step: 3 });

// ✅ Prefer supplying a divisible init value
await initializeTouchspinWithVanilla(page, 'test-input', { step: 3, initval: 48 });
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

**⚠️ IMPORTANT: Avoid Normalization Side Effects in Tests**

When using `updateSettings` to change the `step` value during a test:
- **Be aware** that the current value will be normalized to the nearest multiple of the new step
- **Use step-divisible values** throughout the test to avoid unexpected normalization
- **Example**: If value is 11 and you change step to 2, the value becomes 12 (normalized)
- **Better approach**: Use values that are already divisible by all steps used in the test
- **Reserve normalization testing** for dedicated tests that specifically verify this behavior

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
// Use initval option with full initialization
await initializeTouchspinWithVanilla(page, 'test-input', {
  step: 0.25,
  decimals: 2,
  initval: 10  // Sets value before Core initialization
});
await apiHelpers.incrementViaAPI(page, 'test-input');
expect(await apiHelpers.getNumericValue(page, 'test-input')).toBe(10.25);
```

**Key Differences:**
- **`initializeTouchspinWithVanilla`**: Creates full TouchSpin Core with VanillaRenderer
- **`initializeTouchspinJQuery`**: Uses jQuery wrapper with Bootstrap renderer
- **`initval` option**: Sets input value BEFORE Core initialization to avoid normalization issues
- **Full Core provides buttons and complete API**: All interaction methods available

### Phase 3: Renderer Packages 📅 (Planned)

* **Status**: Planned after core package foundation
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

### Phase 4: Integration & E2E 🔄 (Future)

* **Status**: Planned after individual package completion
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

## 🚨 CRITICAL: USE THE FUCKING HELPERS!

### THE GOLDEN RULE: Use Existing Helpers - That's Why We Built Them!

**🎯 We have helpers for EVERYTHING. Stop reinventing the wheel!**

```typescript
// ✅ CORRECT - Use the helpers we already built
import * as apiHelpers from '@touchspin/core/test-helpers';

// Want to click up button?
await apiHelpers.clickUpButton(page, testId);

// Want to get input value?
const value = await apiHelpers.readInputValue(page, testId);

// Want to fill input?
await apiHelpers.fillWithValue(page, testId, '50');

// Want to increment via API (Core tests)?
await apiHelpers.incrementViaAPI(page, testId);

// Want to check if initialized?
expect(await apiHelpers.isTouchSpinInitialized(page, testId)).toBe(true);
```

### ABSOLUTELY FORBIDDEN in Test Code:

```typescript
// ❌ NEVER DO THIS - Use helpers instead!
document.querySelector('[data-testid="test-input"]')
page.locator('[data-testid="test-input"]').click()
document.getElementById('something')

// ❌ NEVER WRITE NEW LOCATOR CODE - Use existing helpers!
export async function clickUpButton(page: Page, testId: string) {
  const button = page.locator(`[data-testid="${testId}-up"]`); // WRONG!
  await button.click();
}
```

### ✅ querySelector IS legitimate in these contexts ONLY:

**1. Browser Runtime Context (page.evaluate, page.waitForFunction):**
```typescript
// ✅ CORRECT - Inside browser execution context where Playwright locators don't work
await page.evaluate(({ testId }) => {
  const input = document.querySelector(`[data-testid="${testId}"]`); // Required here
  return input.value;
}, { testId });

await page.waitForFunction(({ testId, expected }) => {
  const input = document.querySelector(`[data-testid="${testId}"]`); // Required here
  return input && input.value === expected;
}, { testId, expected });
```

**2. Runtime Helper Functions (installDomHelpers.ts, events/setup.ts):**
```typescript
// ✅ CORRECT - Browser-side utilities injected into window
window.__ts = {
  byId: (id: string) => document.querySelector(`[data-testid="${id}"]`) // Required here
};

// ✅ CORRECT - Event listeners run in browser context
document.addEventListener('touchspin.on.max', (e: Event) => {
  const input = target?.querySelector('input[data-testid]'); // Required here
}, true);
```

### Why This Rule is CRITICAL:

1. **We already solved all the problems**: Helpers handle edge cases, retries, error handling
2. **Consistency**: All tests use the same reliable patterns
3. **Maintainability**: One place to fix selector issues
4. **Stop wasting time**: Don't rewrite what already exists and works
5. **Guard Protection**: Automated guards prevent regressions

**💡 Rule of thumb**: If you're about to write ANY selector code in test files or test helpers, STOP and find the existing helper that does what you need.

### 🚀 Performance Evidence: Why Helpers Matter

**We've proven that using canonical helpers provides significant performance improvements** through comprehensive benchmarking:

**Key Performance Insights:**
1. **Canonical helpers are dramatically more efficient** - using `apiHelpers.incrementViaAPI()` vs duplicated functions
2. **DOM manipulation is the main bottleneck** - textarea writes cause most performance cost
3. **Event handling overhead is minimal** - registering listeners has little impact vs DOM writes
4. **Single page.evaluate calls are faster** - canonical helpers use `window.__ts` infrastructure optimally

**Why Canonical Helpers Win:**
- **Optimized architecture**: Single `page.evaluate` with `window.__ts.requireCoreByTestId()`
- **Reduced round trips**: No extra element lookups or evaluations
- **Proven infrastructure**: Built and tested for efficiency

**Performance Test Commands:**
```bash
# Build first (always required after source changes)
yarn build

# Run performance benchmarks
yarn exec playwright test packages/core/tests/specs/api-operations.spec.ts -g "API performance" --project=chromium --reporter=list
```

**The evidence is clear**: Using existing helpers isn't just about code organization - it delivers measurable performance gains.

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


---

## 📖 Testing Methodology Overview

> **📚 Complete Testing Guide**: See "📚 AI Agent Testing Guides" section below for comprehensive initialization patterns, best practices, debugging guidance, and copy-paste examples.

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

**Project tmp folder**: Use `/apps/touchspin-openai/tmp/` (not system `/tmp/`) for:
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

## 📚 AI Agent Testing Guides

This section consolidates essential testing guidance for AI agents working on TouchSpin tests.

### 🔧 Test Initialization Patterns

Understanding the correct initialization patterns is crucial for writing working tests. **Different packages require different initialization approaches.**

#### Core Package Tests

**Key Helper:** `initializeTouchspinWithVanilla` from `@touchspin/core/test-helpers`

Core tests focus on fundamental business logic, independent of any specific UI framework.

```typescript
import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { initializeTouchspinWithVanilla } from '@touchspin/core/test-helpers';

test.describe('Core API operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
    await apiHelpers.startCoverage(page);
    await apiHelpers.waitForPageReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test('upOnce increments value by one step', async ({ page }) => {
    await initializeTouchspinWithVanilla(page, 'test-input', {
      step: 2, initval: 10
    });

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(12);
  });
});
```

**Explanation:**
- Creates a full TouchSpin Core instance with VanillaRenderer
- Provides complete functionality including buttons and all API methods
- Supports API calls, button clicks, and keyboard/wheel events

#### jQuery Plugin Tests

**Key Helper:** `initializeTouchspinJQuery` from `packages/jquery-plugin/tests/helpers/jquery-initialization.ts`

```typescript
import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { installJqueryPlugin, initializeTouchspinJQuery } from '../helpers/jquery-initialization';

test.describe('jQuery plugin initialization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
    await installJqueryPlugin(page);
  });

  test('initializes single element with touchspin method', async ({ page }) => {
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });
    await apiHelpers.expectTouchSpinInitialized(page, 'test-input');
  });
});
```

#### Renderer Tests

**Key Helper:** `initializeTouchspinWithRenderer` from `@touchspin/core/test-helpers`

```typescript
import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { installDomHelpers, initializeTouchspinWithRenderer } from '@touchspin/core/test-helpers';

const BOOTSTRAP5_RENDERER_URL = '/packages/renderers/bootstrap5/devdist/index.js';

test.describe('Bootstrap 5 specific behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
    await installDomHelpers(page);
  });

  test('uses Bootstrap 5 input-group-text for buttons', async ({ page }) => {
    await initializeTouchspinWithRenderer(page, 'test-input', BOOTSTRAP5_RENDERER_URL);
    const wrapper = page.getByTestId('test-input-wrapper');
    // ... assertions
  });
});
```

#### Web Component Tests

**Key Helper:** `initializeWebComponentTest` from `@touchspin/core/test-helpers`

```typescript
import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { initializeWebComponentTest } from '@touchspin/core/test-helpers';

test.describe('TouchSpin Web Component lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await initializeWebComponentTest(page);
  });

  test('initializes when connected to DOM', async ({ page }) => {
    await page.evaluate(() => {
      const element = document.createElement('touchspin-input');
      element.setAttribute('min', '0');
      element.setAttribute('max', '100');
      element.setAttribute('data-testid', 'web-component-test');
      document.body.appendChild(element);
    });
    // Assertions
  });
});
```

### 🎯 Core Testing Best Practices

#### 1. No Manual Waits: Use Polling Assertions

**❌ NEVER use manual waits** - they lead to flaky, slow, unreliable tests:

```typescript
// 🚨 WRONG - Fixed wait makes test unreliable
await page.waitForTimeout(500);
const value = await apiHelpers.readInputValue(page, 'test-input');
expect(value).toBe('11');
```

**✅ ALWAYS use polling assertion helpers** - they wait intelligently:

```typescript
// ✅ CORRECT - Polls until condition is true or timeout
await apiHelpers.expectValueToBe(page, 'test-input', '11');
```

#### 2. Use Human-Readable Helpers

**✅ Use high-level helpers** for simple, readable tests:

```typescript
// ✅ CORRECT - Intent is immediately clear
await apiHelpers.clickUpButton(page, 'test-input');
await apiHelpers.expectValueToBe(page, 'test-input', '6');
await apiHelpers.expectEventFired(page, 'change');
```

**❌ Don't use low-level Playwright APIs** directly:

```typescript
// ❌ WRONG - Too low-level, harder to read and maintain
await page.locator('[data-testid="test-input-up"]').click();
const inputValue = await page.locator('[data-testid="test-input"]').inputValue();
expect(inputValue).toBe('6');
```

#### 3. Test Behavior Once

Each distinct behavior should be tested by **one focused test**:

**✅ Good - Separate tests for behavior and edge cases:**

```typescript
test('should increment the value by the step amount', async ({ page }) => {
  await apiHelpers.initializeTouchspinWithVanilla(page, 'test-input', { initval: 10, step: 5 });
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '15');
});

test('should not increment past the maximum value', async ({ page }) => {
  await apiHelpers.initializeTouchspinWithVanilla(page, 'test-input', { initval: 100, max: 100 });
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '100');
});
```

### 🍳 Test Helper Cookbook

Copy-paste examples for common testing scenarios:

#### Initialization

```typescript
// Core tests with full functionality
import { initializeTouchspinWithVanilla } from '@touchspin/core/test-helpers';
await initializeTouchspinWithVanilla(page, 'test-input', { step: 5, initval: 10 });

// jQuery plugin tests
import { initializeTouchspinJQuery } from '../helpers/jquery-initialization';
await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

// Renderer tests
import { initializeTouchspinWithRenderer } from '@touchspin/core/test-helpers';
const RENDERER_URL = '/packages/renderers/bootstrap5/devdist/index.js';
await initializeTouchspinWithRenderer(page, 'test-input', RENDERER_URL);
```

#### Interactions

```typescript
// Button clicks
await apiHelpers.clickUpButton(page, 'test-input');
await apiHelpers.clickDownButton(page, 'test-input');

// Keyboard interactions
await apiHelpers.pressUpArrowKeyOnInput(page, 'test-input');
await apiHelpers.pressDownArrowKeyOnInput(page, 'test-input');

// Input operations
await apiHelpers.typeInInput(page, 'test-input', '50');
await apiHelpers.fillWithValueAndBlur(page, 'test-input', '75');
```

#### Core API Interactions

**⚠️ Important:** These only work with tests initialized using `initializeTouchspinWithVanilla`, `initializeTouchspinWithRenderer`, or jQuery plugin initialization, NOT with stub `core-adapter`.

```typescript
// First, initialize with a method that provides full API access
await initializeTouchspinWithVanilla(page, 'test-input', { step: 5, initval: 10 });

// Now API interactions work:
await apiHelpers.incrementViaAPI(page, 'test-input');
await apiHelpers.decrementViaAPI(page, 'test-input');
await apiHelpers.setValueViaAPI(page, 'test-input', '88');
await apiHelpers.updateSettingsViaAPI(page, 'test-input', { step: 10 });
```

#### Value Reading

```typescript
// Display value (string as appears in input)
const displayValue = await apiHelpers.readInputValue(page, 'test-input');
expect(displayValue).toBe('50.00');

// Numeric value (parsed number)
const numericValue = await apiHelpers.getNumericValue(page, 'test-input');
expect(numericValue).toBe(50);
```

#### Assertions

```typescript
// Value assertions (poll until true)
await apiHelpers.expectValueToBe(page, 'test-input', '25');
await apiHelpers.expectValueToBeGreaterThan(page, 'test-input', 10);
await apiHelpers.expectValueToBeLessThan(page, 'test-input', 30);

// Component state
await apiHelpers.expectTouchSpinInitialized(page, 'test-input');
await apiHelpers.expectButtonToBeDisabled(page, 'test-input', 'up');
await apiHelpers.expectButtonToBeEnabled(page, 'test-input', 'down');

// Event assertions
await apiHelpers.clearEventLog(page); // Clear before acting
// ... perform action ...
await apiHelpers.expectEventFired(page, 'change');
await apiHelpers.expectEventFired(page, 'touchspin.on.max');
await apiHelpers.expectNoEvent(page, 'touchspin.on.startspin');
await apiHelpers.expectEventCount(page, 'change', 3);
```

### 🐛 Debugging Failing Tests

#### Step 1: Analyze Test Intent
- Read the Gherkin scenario comments (`/** Scenario: ... */`)
- Compare test implementation to described behavior
- Verify correct helpers are being used

#### Step 2: Examine Error Messages
- **Timeout errors**: Polling assertion didn't become true (most common)
- **Locator errors**: Element not found, selector wrong, or element not visible
- **Assertion errors**: Value received didn't match expected value

#### Step 3: Use Event Log for Debugging

```typescript
// Add temporary logging to see what actually happened
console.log(await apiHelpers.getEventLog(page));
```

Analyze the log:
- Did expected events fire? (e.g., `change`, `touchspin.on.max`)
- Did any unexpected events fire?
- What was the last event before failure?

#### Step 4: Common Fixes

**Flaky Tests:** Replace `page.waitForTimeout()` with polling assertions like `expectValueToBe()`

**Incorrect Assertions:** Double-check the Gherkin scenario - are you checking `string` vs `number`? Using `readInputValue` vs `getNumericValue`?

**Timing Issues:** Ensure all helper functions are `await`ed. Initialization helpers wait for component readiness.

**Wrong Helper Usage:** Using `clickUpButton` in core test with no UI? Refer to cookbook for correct helper.

#### Step 5: Interactive Debugging

```typescript
// Pause execution for manual inspection
await page.pause();
```

Then run: `yarn exec playwright test --headed [test-file]`

### ❌ Common Anti-Patterns to Avoid

#### Wrong Initialization for Test Type

```typescript
// 🚨 WRONG - Don't use jQuery helpers in core tests
test('bad core test', async ({ page }) => {
  await initializeTouchspinJQuery(page, 'test-input', { step: 1 }); // jQuery not loaded!
  await apiHelpers.clickUpButton(page, 'test-input'); // No buttons in core tests!
});
```

#### Bypassing Helpers

```typescript
// 🚨 WRONG - Don't bypass setup logic in helpers
test('bad manual initialization', async ({ page }) => {
  await page.evaluate(() => {
    const $ = (window as any).$;
    $('[data-testid="test-input"]').TouchSpin({ step: 5 }); // Brittle, bypasses setup
  });
});
```

#### Importing from /src

```typescript
// 🚨 WRONG - Never import from /src in tests
import { TouchSpinCore } from '../../src/core'; // Forbidden - bypasses build
```

**Correction:** All necessary modules are exported from `@touchspin/core/test-helpers`

---

*End of Testing Strategy Document - Let's achieve 100% coverage with clean, maintainable tests!*
