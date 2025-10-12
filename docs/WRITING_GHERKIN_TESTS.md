# Writing Gherkin Tests Guide

> A comprehensive guide to writing clean, maintainable Playwright tests using our Gherkin-style format

## 📋 Quick Start

### Basic Test Structure

```typescript
/**
 * Feature: Core value management
* Background: fixture = /packages/core/tests/fixtures/core-api-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] increments value on up button click
 * [x] decrements value on down button click
 * [ ] clamps value at maximum boundary
 * [ ] clamps value at minimum boundary
 */

import { test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';

/**
 * Scenario: increments value on up button click
 * Given the fixture page is loaded with initial value 5
 * When I click the up button
 * Then the value increases to 6
 */
test('increments value on up button click', async ({ page }) => {
  await apiHelpers.initializeTouchspin(page, 'test-input', { initval: 5 });
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '6');
});

/**
 * Scenario: clamps value at maximum boundary
 * Given the fixture page is loaded with max value 10
 * When I increment beyond the maximum
 * Then the value clamps at 10
 * Params:
 * { "settings": { "min": 0, "max": 10, "step": 1, "initval": "10" } }
 */
test.skip('clamps value at maximum boundary', async ({ page }) => {
  // Implementation pending
});
```

## 🎯 Core Principles

### 1. **One Behavior Per Test**
- If your test title contains "and", split it into separate tests
- Each test should verify exactly one behavior
- Tests should be independent and can run in any order

### 2. **Behavioral Naming**
- Use descriptive, behavior-focused names: `"increments value on up button click"`
- Avoid implementation details: ~~`"calls upOnce method"`~~
- Focus on the user-visible outcome

### 3. **Gherkin Structure**
Every test file must have:
- **Feature** header with description
- **CHECKLIST** with all scenarios marked `[x]` (implemented) or `[ ]` (planned)
- **Scenario** comments with Given/When/Then for each test

### 4. **Use test.skip() for Planning**
- Mark planned scenarios with `[ ]` in the checklist
- Use `test.skip()` with detailed scenario comments
- Include parameter examples where relevant
- Add `// Implementation pending` as placeholder

## 📁 File Structure

### Test File Location
```
packages/
  core/tests/specs/           # Core package tests
  jquery-plugin/tests/specs/  # jQuery plugin tests
  renderers/*/tests/specs/    # Renderer-specific tests
```

### File Naming Convention
- `feature-name.spec.ts` - descriptive, kebab-case
- Examples: `value-management.spec.ts`, `boundary-enforcement.spec.ts`

## 🔧 Helper Usage

### Import Pattern
```typescript
import * as apiHelpers from '@touchspin/core/test-helpers';

// For specific modules (optional)
import { clickUpButton } from '@touchspin/core/test-helpers/interactions/buttons';
import { expectValueToBe } from '@touchspin/core/test-helpers/assertions/values';
```

### Available Steps
See [`tests/STEP-LEXICON.md`](../tests/STEP-LEXICON.md) for the complete list of available helper functions with their Gherkin descriptions.

### Key Helper Categories

**Initialization:**
- `initializeTouchspin()` - Core package initialization
- `initializeTouchspinJQuery()` - jQuery plugin initialization

**Interactions:**
- `clickUpButton()`, `clickDownButton()` - Button clicks
- `pressUpArrowKeyOnInput()` - Keyboard events
- `wheelUpOnInput()` - Mouse wheel events
- `fillWithValue()` - Input manipulation

**Assertions:**
- `expectValueToBe()` - Value expectations
- `expectButtonToBeDisabled()` - UI state expectations
- `expectEventFired()` - Event expectations

**API Operations:**
- `incrementViaAPI()`, `decrementViaAPI()` - Direct API calls
- `setValueViaAPI()` - Programmatic value changes
- `updateSettingsViaAPI()` - Configuration updates

## ✅ Test Writing Guidelines

### 1. **Standard Test Template**

```typescript
import { test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';

test.describe('TouchSpin: [Feature Name]', () => {
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
    await apiHelpers.initializeTouchspin(page, 'test-input', {
      min: 0, max: 100, step: 1, initval: 50
    });

    // Act
    await apiHelpers.clickUpButton(page, 'test-input');

    // Assert
    await apiHelpers.expectValueToBe(page, 'test-input', '51');
    await apiHelpers.expectEventFired(page, 'change');
  });
});
```

### 2. **Checklist Management**
- **Start** with `[ ]` for all scenarios in the checklist
- **Use test.skip()** for planned scenarios with full scenario comments
- **Mark `[x]`** only when the test is fully implemented and passing
- **Keep checklist in sync** with actual test implementations

### 3. **Scenario Documentation**
```typescript
/**
 * Scenario: [descriptive name matching test title]
 * Given [initial state/context]
 * When [action performed]
 * Then [expected outcome]
 * Params: [optional - for complex scenarios]
 * { "settings": { "min": 0, "max": 10 }, "expectedValue": "5" }
 */
```

### 4. **Test Organization**
- **Group related tests** in `test.describe()` blocks
- **Use consistent fixtures** - prefer the minimal test fixture
- **Initialize once per test** - don't share state between tests
- **Clean setup/teardown** in beforeEach/afterEach

## 🚫 Common Anti-Patterns

### ❌ Don't Do This

```typescript
// Multiple behaviors in one test
test('increments value and triggers change event and disables button at max', async ({ page }) => {
  // Too many concerns in one test
});

// Implementation-focused naming
test('calls upOnce method', async ({ page }) => {
  // Focuses on how, not what
});

// Missing checklist/scenario comments
test('basic increment', async ({ page }) => {
  // No Given/When/Then documentation
});

// Direct DOM manipulation
await page.locator('.btn-touchspin-up').click(); // Use helpers instead

// Hardcoded selectors
await page.locator('.input-group .form-control').fill('10'); // Use testId helpers
```

### ✅ Do This Instead

```typescript
/**
 * Scenario: increments value on up button click
 * Given the fixture page is loaded with value 5
 * When I click the up button
 * Then the value increases to 6
 */
test('increments value on up button click', async ({ page }) => {
  await apiHelpers.initializeTouchspin(page, 'test-input', { initval: 5 });
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '6');
});

/**
 * Scenario: triggers change event on value increment
 * Given the fixture page is loaded
 * When I click the up button
 * Then a change event is fired
 */
test('triggers change event on value increment', async ({ page }) => {
  await apiHelpers.initializeTouchspin(page, 'test-input', { initval: 5 });
  await apiHelpers.clearEventLog(page);
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectEventFired(page, 'change');
});
```

## 🔍 Testing Different Scenarios

### Core Package Tests
Focus on logic and state management:
- Value normalization and validation
- Boundary enforcement (min/max)
- Step calculations
- Event emission
- API operations
- Configuration handling

### jQuery Plugin Tests
Focus on jQuery integration:
- Plugin initialization patterns
- jQuery method chaining
- Data attribute handling
- jQuery event delegation
- DOM structure creation

### Renderer Tests
Focus on UI and styling:
- Button placement and styling
- Bootstrap/Material/Tailwind integration
- ARIA attributes and accessibility
- Responsive behavior
- Theme integration

## 📊 Coverage Strategy

### Complete Behavior Coverage
- **Happy path**: Standard use cases
- **Edge cases**: Boundary conditions, empty values, invalid input
- **Error scenarios**: Invalid configuration, missing DOM elements
- **Integration**: Multiple components working together

### Test Categorization
```typescript
// Core functionality
test.describe('Value Management', () => { /* ... */ });

// Edge cases
test.describe('Edge Cases', () => { /* ... */ });

// Error handling
test.describe('Error Scenarios', () => { /* ... */ });

// Integration
test.describe('Multi-Component Integration', () => { /* ... */ });
```

## 🛠️ Development Workflow

### 1. **Plan First**
- Create test file with Feature header and comprehensive checklist
- Use test.skip() for all scenarios initially
- Document all Given/When/Then scenarios upfront

### 2. **Implement Incrementally**
- Implement one test at a time
- Mark `[x]` in checklist as you complete each test
- Commit after each logical group of tests

### 3. **Verify with Guards**
- Husky pre-commit hooks validate checklist/test parity
- Guard ensures `[x]` items have implemented tests
- Guard ensures `[ ]` items have test.skip() placeholders

### 4. **Review and Refine**
- Run `yarn lexicon:gen` to update Step Lexicon after helper changes
- Use `yarn test:guard` to validate checklist consistency
- Review test readability and behavioral focus

## 🎓 Advanced Patterns

### Parameterized Scenarios
```typescript
/**
 * Scenario: handles decimal step increments correctly
 * Given the fixture page is loaded with decimal step
 * When I increment the value
 * Then the value increases by the decimal step amount
 * Params:
 * { "settings": { "step": 0.1, "decimals": 1, "initval": "1.0" }, "expected": "1.1" }
 */
test('handles decimal step increments correctly', async ({ page }) => {
  await apiHelpers.initializeTouchspin(page, 'test-input', {
    step: 0.1, decimals: 1, initval: 1.0
  });
  await apiHelpers.incrementViaAPI(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '1.1');
});
```

### Error Scenario Testing
```typescript
/**
 * Scenario: handles invalid configuration gracefully
 * Given invalid settings are provided
 * When TouchSpin initializes
 * Then appropriate error handling occurs
 * Params:
 * { "settings": { "min": 10, "max": 5 }, "expectError": true }
 */
test('handles invalid configuration gracefully', async ({ page }) => {
  // Test error handling for inverted min/max
});
```

### Multi-Instance Testing
```typescript
/**
 * Scenario: maintains state independence between instances
 * Given multiple TouchSpin instances exist
 * When I modify one instance
 * Then other instances remain unaffected
 */
test('maintains state independence between instances', async ({ page }) => {
  await apiHelpers.initializeTouchspin(page, 'input-1', { initval: 10 });
  await apiHelpers.initializeTouchspin(page, 'input-2', { initval: 20 });

  await apiHelpers.incrementViaAPI(page, 'input-1');

  await apiHelpers.expectValueToBe(page, 'input-1', '11');
  await apiHelpers.expectValueToBe(page, 'input-2', '20'); // Unchanged
});
```

## 📚 Related Documentation

- [Step Lexicon](../tests/STEP-LEXICON.md) - Available helper functions
- [Project README](../README.md) - Overall project documentation

---

*Happy testing! Write tests that tell the story of how TouchSpin should behave.*
