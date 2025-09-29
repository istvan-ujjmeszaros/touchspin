
# AI Agent Guide: Initializing TouchSpin Tests

This guide provides AI agents with the correct procedures for initializing tests in the TouchSpin project. Adhering to these established patterns is crucial for writing new tests and modifying existing ones.

## Core Principles

- **Use Existing Helpers:** The project provides a rich set of helper functions for test initialization. Always use these helpers instead of creating custom initialization logic.
- **One Pattern Per Test Type:** Different packages (`core`, `jquery-plugin`, `renderers`, `web-component`) have their own specific initialization patterns. Use the correct pattern for the type of test you are writing.
- **Dist-Only Rule:** All tests must run against the built artifacts in the `/dist` directory, never against the source files in `/src`. The helper functions are designed to enforce this rule.

---

## ✅ Good Examples

Here are the correct initialization patterns for each type of test in the project.

### 1. Core Package Tests

Core tests focus on the fundamental business logic of TouchSpin, independent of any specific UI framework.

**Key Helper:** `initializeTouchspin` from `@touchspin/core/test-helpers`

**Example:** (`packages/core/tests/specs/api-operations.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { initializeTouchspin } from '@touchspin/core/test-helpers';

test.describe('Core API operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/fixtures/core-api-fixture.html');
    await apiHelpers.startCoverage(page);
    await apiHelpers.waitForPageReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test('upOnce increments value by one step', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 2, initval: 10
    });

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(12);
  });
});
```

**Explanation:**

-   `initializeTouchspin` mounts the core engine without relying on any renderer. Use this for API, keyboard, or mouse-wheel behaviours that do not require renderer-specific DOM.
-   Pass the Playwright `page`, the target `testId`, and any core options you need for the scenario.
-   Renderer interactions (DOM structure, button styling, prefix/postfix injection, etc.) belong in the renderer packages where dedicated fixtures exist.

---

### 2. jQuery Plugin Tests

These tests validate the functionality of the TouchSpin jQuery plugin, including its integration with the Bootstrap renderer.

**Key Helper:** `initializeTouchspinJQuery` from `packages/jquery-plugin/tests/helpers/jquery-initialization.ts`

**Example:** (`packages/jquery-plugin/tests/specs/plugin-initialization.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { installJqueryPlugin, initializeTouchspinJQuery } from '../helpers/jquery-initialization';

test.describe('jQuery plugin initialization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/jquery-plugin/tests/fixtures/jquery-plugin-fixture.html');
    await installJqueryPlugin(page);
  });

  test('initializes single element with touchspin method', async ({ page }) => {
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 10 });

    await apiHelpers.expectTouchSpinInitialized(page, 'test-input');
  });
});
```

**Explanation:**

-   `installJqueryPlugin` is called in `beforeEach` to load jQuery and the plugin script.
-   `initializeTouchspinJQuery` is used to initialize the plugin on a specific input.
-   This setup creates the full UI, including buttons, which can be interacted with using helpers like `apiHelpers.clickUpButton`.

---

### 3. Renderer Tests

Renderer tests verify that each UI framework (Bootstrap 5, Tailwind, etc.) is rendered correctly.

**Key Helper:** `initializeTouchspinWithRenderer` from `@touchspin/core/test-helpers`

**Example:** (`packages/renderers/bootstrap5/tests/dom-structure.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { installDomHelpers, initializeTouchspinWithRenderer } from '@touchspin/core/test-helpers';

const BOOTSTRAP5_RENDERER_URL = '/packages/renderers/bootstrap5/devdist/Bootstrap5Renderer.js';

test.describe('Bootstrap 5 specific behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/fixtures/core-api-fixture.html');
    await installDomHelpers(page);
  });

  test('uses Bootstrap 5 input-group-text for buttons', async ({ page }) => {
    await initializeTouchspinWithRenderer(page, 'test-input', BOOTSTRAP5_RENDERER_URL);

    const wrapper = page.getByTestId('test-input-wrapper');
    // ... assertions
  });
});
```

**Explanation:**

-   `initializeTouchspinWithRenderer` takes the `page` object, `testId`, the URL of the renderer's distributed JavaScript file, and an options object.
-   This allows testing each renderer in isolation.

---

### 4. Web Component Tests

These tests validate the `touchspin-input` custom element.

**Key Helper:** `initializeWebComponentTest` from `@touchspin/core/test-helpers`

**Example:** (`packages/web-component/tests/lifecycle.spec.ts`)

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

**Explanation:**

-   `initializeWebComponentTest` loads the web component definition.
-   Tests then create and append `<touchspin-input>` elements to the DOM using `document.createElement`.
-   The component initializes automatically when connected to the DOM.

---

## ❌ Bad Examples

Avoiding these common mistakes will prevent broken tests and ensure consistency.

### 1. Incorrectly Initializing Core Tests

**Mistake:** Using jQuery or renderer-specific helpers in a core test.

```typescript
// 🚨 WRONG - Don't use jQuery helpers in core tests
test('bad core test', async ({ page }) => {
  // This will fail because jQuery is not loaded for core tests
  await initializeTouchspinJQuery(page, 'test-input', { step: 1 });

  // This will also fail because core-only tests have no buttons
  await apiHelpers.clickUpButton(page, 'test-input');
});
```

**Why it's wrong:** Core tests are meant to be UI-agnostic. They do not load jQuery or any renderer, so UI-related helpers will fail.

**Correction:** Use `initializeTouchspin` and API/keyboard helpers.

### 2. Bypassing Initialization Helpers

**Mistake:** Manually creating the TouchSpin instance or calling the jQuery plugin directly within a test.

```typescript
// 🚨 WRONG - Don't bypass the helpers
test('bad manual initialization', async ({ page }) => {
  await page.evaluate(() => {
    // This makes the test brittle and bypasses setup logic in the helper
    const $ = (window as any).$;
    $('[data-testid="test-input"]').TouchSpin({ step: 5 });
  });
});
```

**Why it's wrong:** The helper functions (`initializeTouchspinJQuery`, etc.) contain important setup logic, including waiting for the component to be fully ready. Bypassing them leads to flaky and inconsistent tests.

**Correction:** Always use the appropriate `initialize...` helper for your test type.

### 3. Importing from `/src`

**Mistake:** Importing modules directly from the `/src` directory in a test file.

```typescript
// 🚨 WRONG - Never import from /src in tests
import { TouchSpinCore } from '../../src/core'; // This is forbidden

test('bad src import', async ({ page }) => {
  // ...
});
```

**Why it's wrong:** Tests **must** validate the built artifacts that will be published and used by consumers. Importing from `/src` bypasses the build process and can lead to tests passing locally but failing in CI or production. The project has guards in place to prevent this.

**Correction:** All necessary modules and helpers are exported from the `@touchspin/core/test-helpers` package or other test-specific entry points.
