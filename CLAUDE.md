# TouchSpin - Testing Strategy & Agent Reference

## 🎯 PRIMARY MISSION: Achieve 100% Test Coverage with Clean Behavioral Tests

**We are rewriting ALL tests from scratch** for maintainability and 100% coverage.

### Core Principles
* **DIST-ONLY TESTS** - import built artifacts (`/dist/`), never `/src/`
* **TESTID SELECTORS** - use `data-testid` selectors for reliability
* **ONE behavior per test** - simple, focused tests
* **Event log for everything** - single source of truth
* **Fail fast** - no silent failures

**Philosophy:** Every test should be so simple that any developer can read the test name, understand what it tests, and fix it when behavior changes.

## 🚨 CRITICAL: Test Simplicity Rules

**NEVER overcomplicate tests. Keep them SIMPLE and SHORT.**

### Framework Integration Testing Rules

1. **Use Real Framework Dependencies**:
   - For Bootstrap tests, add `bootstrap` as devDependency
   - Create dedicated fixture with real CSS/JS loaded from node_modules
   - NEVER manually inject CSS to mimic frameworks

2. **Keep Tests Short and Focused**:
   - Each test should be 10-30 lines maximum
   - Test ONE specific behavior per test
   - Avoid massive CSS injection blocks (page.addStyleTag with 50+ lines)
   - Focus on functionality, not style mimicking

3. **Framework Test Fixture Pattern**:
   ```
   packages/core/tests/__shared__/fixtures/
   ├── test-fixture.html (vanilla)
   ├── bootstrap5-fixture.html (with Bootstrap 5)
   ├── bootstrap4-fixture.html (with Bootstrap 4)
   └── tailwind-fixture.html (with Tailwind)
   ```

4. **Relative Path Rules for Fixtures**:
   - **ALWAYS use relative paths** from the fixture file location, never absolute paths from server root
   - **Example**: From `packages/renderers/bootstrap5/tests/fixtures/bootstrap5-fixture.html` use `../../devdist/external/css/bootstrap.min.css`
   - **NEVER use server root paths** like `/packages/renderers/bootstrap5/devdist/external/...`
   - **Benefits**: Fixtures work with any server configuration, file:// URLs, and different deployment setups

5. **Simple Test Structure Example**:
   ```typescript
   test('simple bootstrap integration', async ({ page }) => {
     await page.goto('/fixtures/bootstrap5-fixture.html');
     await initializeTouchspinWithRenderer(page, 'test-input', RENDERER_URL);

     // Test the actual behavior, not CSS
     await clickUpButton(page, 'test-input');
     await expectValueToBe(page, 'test-input', '1');
   });
   ```

### What NOT to Do (Anti-Patterns)

❌ **NEVER inject massive CSS blocks**:
```typescript
await page.addStyleTag({
  content: `
    .btn { /* 50+ lines of CSS */ }
    .form-control { /* 50+ lines of CSS */ }
    // ... hundreds more lines
  `
});
```

❌ **NEVER write 100+ line test functions**
❌ **NEVER manually recreate framework CSS**
❌ **NEVER test styling details in integration tests**

✅ **DO write simple, focused tests**:
```typescript
test('works with bootstrap buttons', async ({ page }) => {
  await page.goto('/fixtures/bootstrap5-fixture.html');
  await initializeTouchspinWithRenderer(page, 'test-input', RENDERER_URL);
  await clickUpButton(page, 'test-input');
  await expectValueToBe(page, 'test-input', '1');
});
```

### Code Review Checkpoints

Before implementing framework integration tests:
- [ ] Is there a real framework dependency added?
- [ ] Is there a dedicated fixture with framework assets?
- [ ] Are individual tests under 30 lines?
- [ ] Are we testing behavior, not recreating CSS?
- [ ] Could this test be simpler?

**If you find yourself writing CSS in tests, STOP and add the real framework dependency instead.**

### 🎯 Test Implementation Rules

**CRITICAL**: Implement **EXISTING** test specifications only.

* **Follow Gherkin scenarios exactly** - Given/When/Then with provided params
* **Use exact parameters** - never modify values in scenarios
* **Complete `test.skip()` placeholders** systematically
* **Document source bugs** with TODO comments, don't fix code during test implementation

## 🔧 Testing Requirements

* **Dist-Only**: Load built artifacts (`/dist/`) only, never `/src/`. Guard enforced.
* **Selectors**: Use `data-testid` selectors only, never CSS classes
* **Coverage**: `yarn coverage:build` → `yarn coverage:all <path>` → view `reports/coverage/index.html`
* **Helpers**: Don't modify shared helpers in `__tests__/helpers/` - keep stable
* **No Webfont Icons**: Never use icon webfonts (Bootstrap Icons, Font Awesome, Glyphicons) in test fixtures. Use Unicode symbols (⚙️, 📝, 🗑️) or plain text labels instead. This ensures fixtures render consistently without external font dependencies.

## 📊 Coverage Roadmap

**Phase 1: jQuery Plugin** ✅ - Reference patterns established (`packages/jquery-plugin/tests/`)
**Phase 2: Core Package** 🚀 - Active development (`packages/core/tests/`) - shared infrastructure
**Phase 3: Renderers** 📅 - Framework-specific testing (`packages/renderers/*/tests/`)
**Phase 4: Integration** 🔄 - Cross-package workflows

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

#### Core Testing Strategy: Renderer-Free First

**IMPORTANT**: Core specs should exercise the engine without mounting a renderer. Use `initializeTouchspin` with `/packages/core/tests/fixtures/core-api-fixture.html` to cover API behaviours, keyboard and wheel interactions, and value-change events.

If you need to make assertions about DOM markup, button layout, prefix/postfix injection, or renderer-specific classes, move those cases into the appropriate renderer package and use its dedicated clean fixture.

**Core Testing Approaches**:
1. **Engine & API behaviour**: `initializeTouchspin` (no renderer) + `core-api-fixture.html`
2. **Renderer behaviour**: test inside the renderer package with its clean fixture and `initializeTouchspinWithRenderer`
3. **Callback-only stubs**: `core-adapter.ts` for synthetic callback validation when no DOM is needed

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
await initializeTouchspin(page, 'test-input', { step: 3 });

// ✅ Prefer supplying a divisible init value
await initializeTouchspin(page, 'test-input', { step: 3, initval: 48 });
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
// Use initval option with renderer-free initialization
await initializeTouchspin(page, 'test-input', {
  step: 0.25,
  decimals: 2,
  initval: 10  // Sets value before Core initialization
});
await apiHelpers.incrementViaAPI(page, 'test-input');
expect(await apiHelpers.getNumericValue(page, 'test-input')).toBe(10.25);
```

**Key Differences:**
- **`initializeTouchspin`**: Mounts the core engine only—ideal for API, keyboard, mouse-wheel, and event tests
- **`initializeTouchspinWithRenderer`**: Use inside renderer packages when you need framework-specific DOM assertions
- **`initializeTouchspinJQuery`**: Uses jQuery wrapper with Bootstrap renderer
- **`initval` option**: Sets input value BEFORE Core initialization to avoid normalization issues
- **Full Core API via helpers**: All interaction methods (`incrementViaAPI`, `updateSettings`, etc.) remain available without the renderer

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

## 🚨 CRITICAL: Use Existing Helpers

**GOLDEN RULE**: Use helpers for ALL TouchSpin interactions. Never write raw selectors in tests.

```typescript
// ✅ CORRECT - Use the helpers
import * as apiHelpers from '@touchspin/core/test-helpers';
await apiHelpers.clickUpButton(page, testId);
await apiHelpers.expectValueToBe(page, testId, '50');

// ❌ WRONG - Don't write raw selectors
page.locator('[data-testid="test-input"]').click(); // Use helpers instead!
```

**Why**: Helpers handle edge cases, provide performance optimizations, ensure consistency, and prevent regressions.

### 🎯 Element Access Helper

**Use `getTouchSpinElements()` for accessing multiple UI elements**:

```typescript
// ✅ CORRECT - Use the elements helper
import * as apiHelpers from '@touchspin/core/test-helpers';
const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
await elements.upButton.click();
await elements.downButton.hover();

// ❌ WRONG - Don't use raw locators
const upButton = page.locator('[data-testid="test-input-up"]');
const downButton = page.locator('[data-testid="test-input-down"]');
```

**Available Elements in TouchSpinElements**:
- **wrapper**: Root wrapper around the TouchSpin input and controls
- **input**: Underlying input element with the given data-testid
- **upButton**: The "up" button (increment)
- **downButton**: The "down" button (decrement)
- **prefix**: Optional prefix element rendered before the input
- **postfix**: Optional postfix element rendered after the input

**Note**: HTML fixtures should use relative paths from the actual file location, never relative to the project root.

## 🖼️ Renderer Usage in Core Tests

### Problem

* Core without a renderer creates **no buttons** (only supports keyboard/wheel events and API methods).
* Button-based helpers (`clickUpButton`, `clickDownButton`) only work if a renderer is attached.


---

## 📖 Testing Methodology Overview

> **📚 Complete Testing Guide**: See "📚 AI Agent Testing Guides" section below for comprehensive initialization patterns, best practices, debugging guidance, and copy-paste examples.

## 📚 Quick Reference

**Test ID Pattern**: `data-testid="my-input"` creates `my-input-wrapper`, `my-input-up`, `my-input-down`, etc.

**Check Initialization**: `expect(await apiHelpers.isTouchSpinInitialized(page, 'test-input')).toBe(true);`

**Event Log Format**: `[native/touchspin] target:value eventName`

**Key Helpers**: `clearEventLog`, `hasEventInLog`, `expectEventFired`, `expectValueToBe`

**Running Tests:**
```bash
yarn exec playwright test packages/core/tests/
yarn exec playwright test --ui  # Debug mode
COVERAGE=1 yarn exec playwright test packages/  # With coverage
```

**Project Structure:**
- Test Helpers: `packages/core/test-helpers/`
- New Tests: `packages/*/tests/*.spec.ts`
- Archived Tests: `__tests__/*.spec.deprecated.ts` (reference only)

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
 * Given I mount TouchSpin core on "{testId}" with {settings}
 * Given TouchSpin is initialized on "{testId}" with {settings}
 * @note Renderer-agnostic initialization for core specs
 */
export async function initializeTouchspin(page, testId, settings) { ... }
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
  await page.goto('/packages/core/tests/fixtures/core-api-fixture.html');
  await initializeTouchspin(page, 'test-input', { step: 1, initval: '0' });
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
+   await page.goto('/packages/core/tests/fixtures/core-api-fixture.html');
+   await initializeTouchspin(page, 'test-input', { step: 1, initval: '0' });
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

## 🔧 Improved Development Workflow

### 🎉 NEW: Watch Mode - No More Manual Rebuilds!

**The DX nightmare is OVER!** You no longer need to manually rebuild after source changes.

#### 🚀 Quick Start - Three Development Modes:

**Option 1: Full Development Mode (Recommended)**
```bash
yarn dev  # Starts watch + server + test UI
# Edit source → Auto-compiles → Tests auto-refresh! 🎉
```

**Option 2: Watch Mode Only**
```bash
yarn watch:test  # Watch all packages for changes
# In another terminal:
yarn test        # Run tests anytime - no build needed!
```

**Option 3: Test Development**
```bash
yarn test:dev    # Watch + server + test UI in one command
# Perfect for test-driven development
```

#### 📋 Available Commands:

- **`yarn dev`** - Watch mode + static server
- **`yarn watch`** - Watch all packages (production builds)
- **`yarn watch:test`** - Watch all packages (test builds)
- **`yarn test:dev`** - Watch + serve + test UI
- **`yarn test`** - Run tests (no build needed with watch!)
- **`yarn build:test`** - Manual build (for CI/troubleshooting)

#### 🔧 How It Works:

- **TypeScript watch** compiles `.ts` → `.js` automatically
- **Tests use `/devdist/`** - auto-updated by watch mode
- **No manual rebuilds** required during development
- **Coverage still works** - runs build when needed

#### 💡 Pro Tips:

- Start with `yarn dev` and keep it running
- Edit source files and see changes instantly
- Use `yarn test` in another terminal when needed
- For CI/production, still use `yarn build` and `yarn build:test`

### 🔙 Legacy Workflow (CI Only):

```bash
yarn build:test  # Only needed for CI or troubleshooting
yarn test        # Traditional workflow
```

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

### 🔧 Critical Initialization Patterns

**Core Tests** - Use `initializeTouchspin` (renderer-free engine):
```typescript
import { initializeTouchspin } from '@touchspin/core/test-helpers';
await initializeTouchspin(page, 'test-input', { step: 2, initval: 10 });
```

**jQuery Plugin Tests** - Use `initializeTouchspinJQuery`:
```typescript
import { installJqueryPlugin, initializeTouchspinJQuery } from '../helpers/jquery-initialization';
await installJqueryPlugin(page);
await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });
```

**Renderer Tests** - Use `initializeTouchspinWithRenderer`:
```typescript
import { initializeTouchspinWithRenderer } from '@touchspin/core/test-helpers';
await initializeTouchspinWithRenderer(page, 'test-input', RENDERER_URL);
```


### 🎯 Essential Best Practices

1. **No Manual Waits** - Use `expectValueToBe()` not `page.waitForTimeout()`
2. **Use Helpers** - `clickUpButton()` not `page.locator().click()`
3. **One Behavior per Test** - Simple, focused tests only

```typescript
// ✅ CORRECT Pattern (core test)
await initializeTouchspin(page, 'test-input', { step: 5, initval: 10 });
await apiHelpers.incrementViaAPI(page, 'test-input');
await apiHelpers.expectValueToBe(page, 'test-input', '15');
```

### 🔄 Input Value Helper Distinctions

**Critical**: Choose the right helper based on whether you expect input events:

**Programmatic Value Setting (No Input Events):**
```typescript
await setValueSilentlyAndBlur(page, 'test-input', 'value');
// - Uses el.value = value (programmatic)
// - Does NOT fire input/change events
// - Use for: Testing that programmatic changes don't trigger sanitization
```

**User Input Simulation (Fires Input Events):**
```typescript
await fillWithValueAndBlur(page, 'test-input', 'value');
// - Uses keyboard input + blur
// - DOES fire input/change events
// - Use for: Testing user input that should trigger sanitization
```

**Rule of Thumb:**
- Expect change events = use `fillWithValueAndBlur`
- Expect NO change events = use `setValueSilentlyAndBlur`

### 🍳 Quick Reference

**Key Interactions:**
```typescript
await apiHelpers.clickUpButton(page, 'test-input');
await apiHelpers.incrementViaAPI(page, 'test-input');  // API method
await apiHelpers.typeInInput(page, 'test-input', '50');
```

**Essential Assertions:**
```typescript
await apiHelpers.expectValueToBe(page, 'test-input', '25');
await apiHelpers.expectEventFired(page, 'change');
await apiHelpers.expectButtonToBeDisabled(page, 'test-input', 'up');
```

**Event Debugging:**
```typescript
console.log(await apiHelpers.getEventLog(page)); // See what happened
```

### 🐛 Debugging Guide

**Common Error Types:**
- **Timeout errors**: Use polling assertions (`expectValueToBe`), not manual waits
- **Locator errors**: Element not found - check initialization and testid
- **Wrong initialization**: Use correct helper for test type (Core vs jQuery vs Renderer)

**Debug Tools:**
```typescript
console.log(await apiHelpers.getEventLog(page)); // See events
await page.pause(); // Interactive debugging
```

**Anti-Patterns:**
- ❌ Never import from `/src/` in tests (use `/dist/`)
- ❌ Never use `page.locator()` directly (use helpers)
- ❌ Never use `page.waitForTimeout()` (use `expectValueToBe`)

---

*End of Testing Strategy Document - Let's achieve 100% coverage with clean, maintainable tests!*
