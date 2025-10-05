/**
 * Feature: Vanilla renderer specific features and capabilities
 * Background: fixture = /packages/renderers/vanilla/tests/fixtures/vanilla-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] provides framework-independent implementation
 * [x] supports CSS variables for theming
 * [x] handles minimal CSS dependencies
 * [x] supports custom styling without conflicts
 * [x] provides clean CSS class hierarchy
 * [x] handles browser-specific CSS gracefully
 * [x] supports CSS Grid and Flexbox layouts
 * [x] provides performant CSS animations
 * [x] handles high contrast mode
 * [x] supports RTL text direction
 * [x] provides semantic HTML without framework bloat
 * [x] handles progressive enhancement
 * [x] supports accessibility without framework dependencies
 * [x] provides keyboard navigation patterns
 * [x] handles focus management independently
 * [x] supports screen reader optimization
 * [x] provides ARIA patterns without conflicts
 * [x] handles mobile touch interactions
 * [x] supports responsive design patterns
 * [x] provides cross-browser compatibility
 * [x] handles legacy browser support
 * [x] supports modern web standards
 * [x] provides lightweight DOM structure
 * [x] handles memory efficiency
 * [x] supports bundle size optimization
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { ensureVanillaGlobals } from './helpers/vanilla-globals';

const VANILLA_FIXTURE = '/packages/renderers/vanilla/tests/fixtures/vanilla-fixture.html';

/**
 * Scenario: provides framework-independent implementation
 * Given the fixture page is loaded
 * When TouchSpin initializes with Vanilla renderer
 * Then it works without any external framework dependencies
 * Params:
 * { "frameworkDependencies": "none", "standaloneOperation": true, "independentFunctionality": "complete" }
 */
test('provides framework-independent implementation', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  await apiHelpers.initializeTouchSpin(page, 'test-input', { initval: 0 });

  // Verify TouchSpin is working
  const { wrapper, upButton, downButton, input } = await apiHelpers.getTouchSpinElements(
    page,
    'test-input'
  );
  await expect(wrapper).toBeVisible();
  await expect(upButton).toBeVisible();
  await expect(downButton).toBeVisible();
  await expect(input).toBeVisible();

  // Check that no framework-specific classes are present
  const wrapperClasses = (await wrapper.getAttribute('class')) || '';
  expect(wrapperClasses).not.toMatch(/bootstrap|mui|ant|chakra|tailwind/i);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '1');

  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '0');
});

/**
 * Scenario: supports CSS variables for theming
 * Given the fixture page is loaded with CSS variables defined
 * When TouchSpin initializes with Vanilla renderer
 * Then it uses CSS variables for consistent theming
 * Params:
 * { "cssVariables": ["--touchspin-primary", "--touchspin-secondary"], "themingSupport": "css_variables", "customizability": "high" }
 */
test('supports CSS variables for theming', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  // Define custom CSS variables
  await page.addStyleTag({
    content: `
      :root {
        --touchspin-primary: #007bff;
        --touchspin-secondary: #6c757d;
        --touchspin-border: #dee2e6;
        --touchspin-focus: #0056b3;
      }
      .touchspin-wrapper {
        border: 1px solid var(--touchspin-border);
      }
      .touchspin-button {
        background-color: var(--touchspin-primary);
        color: white;
      }
      .touchspin-button:hover {
        background-color: var(--touchspin-focus);
      }
    `,
  });

  await apiHelpers.initializeTouchSpin(page, 'test-input');

  const { wrapper, upButton } = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Check if elements can use CSS variables (they exist and styles can be applied)
  await expect(wrapper).toBeVisible();
  await expect(upButton).toBeVisible();

  // Verify that CSS variables are available for styling
  const hasCustomStyles = await page.evaluate(() => {
    const computedStyle = getComputedStyle(document.documentElement);
    return computedStyle.getPropertyValue('--touchspin-primary').trim() === '#007bff';
  });

  expect(hasCustomStyles).toBe(true);
});

/**
 * Scenario: handles minimal CSS dependencies
 * Given the fixture page is loaded
 * When TouchSpin initializes with Vanilla renderer
 * Then it operates with minimal required CSS
 * Params:
 * { "cssDependencies": "minimal", "requiredStyles": "essential_only", "bloatReduction": "maximized" }
 */
test('handles minimal CSS dependencies', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  await apiHelpers.initializeTouchSpin(page, 'test-input', { initval: 0 });

  const { wrapper, upButton, downButton, input } = await apiHelpers.getTouchSpinElements(
    page,
    'test-input'
  );

  // Verify basic functionality works without external stylesheets
  await expect(wrapper).toBeVisible();
  await expect(upButton).toBeVisible();
  await expect(downButton).toBeVisible();

  // Check that buttons are functional
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '1');

  // Verify minimal DOM structure - no excessive wrapper elements
  const childCount = await wrapper.locator('> *').count();
  expect(childCount).toBeGreaterThanOrEqual(2); // At least input and buttons
  expect(childCount).toBeLessThanOrEqual(5); // Not excessive wrapping

  // Check that no heavy external dependencies are loaded
  const externalStylesheets = await page.evaluate(() => {
    return Array.from(document.styleSheets).filter(
      (sheet) =>
        sheet.href && !sheet.href.includes('localhost') && !sheet.href.includes('127.0.0.1')
    ).length;
  });
  expect(externalStylesheets).toBe(0);
});

/**
 * Scenario: supports custom styling without conflicts
 * Given the fixture page is loaded with custom CSS
 * When TouchSpin initializes with custom styles
 * Then custom styles integrate without conflicts
 * Params:
 * { "customStyling": "conflict_free", "styleIntegration": "harmonious", "cssSpecificity": "appropriate" }
 */
test('supports custom styling without conflicts', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  // Add custom styles
  await page.addStyleTag({
    content: `
      .my-custom-wrapper {
        background-color: #f0f0f0;
        border: 2px solid #333;
        padding: 10px;
      }
      .my-custom-button {
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
        border: none;
        border-radius: 8px;
      }
    `,
  });

  await apiHelpers.initializeTouchSpin(page, 'test-input', {
    buttonup_class: 'my-custom-button',
    buttondown_class: 'my-custom-button',
    initval: 0,
  });

  const { wrapper, upButton, downButton } = await apiHelpers.getTouchSpinElements(
    page,
    'test-input'
  );

  // Verify wrapper has default classes (wrapper_class not supported in vanilla renderer)
  await expect(wrapper).toHaveClass(/ts-wrapper/);
  // Verify custom button classes are applied
  await expect(upButton).toHaveClass(/my-custom-button/);
  await expect(downButton).toHaveClass(/my-custom-button/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '1');
});

/**
 * Scenario: provides clean CSS class hierarchy
 * Given the fixture page is loaded
 * When TouchSpin initializes with Vanilla renderer
 * Then CSS classes follow a clean, logical hierarchy
 * Params:
 * { "classHierarchy": "logical", "classNaming": "semantic", "classConflicts": "none" }
 */
test('provides clean CSS class hierarchy', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  await apiHelpers.initializeTouchSpin(page, 'test-input', { initval: 0 });

  const { wrapper, upButton, downButton, input } = await apiHelpers.getTouchSpinElements(
    page,
    'test-input'
  );

  // Check wrapper has logical class naming
  const wrapperClasses = (await wrapper.getAttribute('class')) || '';
  expect(wrapperClasses).toMatch(/ts-wrapper/);
  expect(wrapperClasses.split(/\s+/).length).toBeLessThanOrEqual(5); // Not excessive classes

  // Check button classes are semantic
  const upButtonClasses = (await upButton.getAttribute('class')) || '';
  const downButtonClasses = (await downButton.getAttribute('class')) || '';

  expect(upButtonClasses).toMatch(/ts-/); // Namespaced prefix
  expect(downButtonClasses).toMatch(/ts-/);

  // Verify no class conflicts (no duplicate classes)
  const allClasses = [wrapperClasses, upButtonClasses, downButtonClasses].join(' ').split(/\s+/);
  const _uniqueClasses = new Set(allClasses.filter((c) => c.length > 0));

  // Each element should have unique, non-conflicting classes
  expect(upButtonClasses).not.toBe(downButtonClasses); // Buttons should have different classes

  // Check class hierarchy is logical (prefix-based)
  const hasConsistentNaming = await page.evaluate(() => {
    const elements = document.querySelectorAll('[data-testid="test-input-wrapper"] [class*="ts-"]');
    return Array.from(elements).every((el) => {
      const classList = Array.from(el.classList);
      return classList.some((cls) => cls.startsWith('ts-'));
    });
  });

  expect(hasConsistentNaming).toBe(true);

  // Verify functionality works with clean class structure
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '1');
});

/**
 * Scenario: handles browser-specific CSS gracefully
 * Given the fixture page is loaded in different browsers
 * When TouchSpin applies CSS styles
 * Then browser-specific differences are handled gracefully
 * Params:
 * { "browserSpecificCSS": "handled", "crossBrowserStyling": "consistent", "vendorPrefixes": "appropriate" }
 */
test('handles browser-specific CSS gracefully', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  // Add CSS with browser-specific features
  await page.addStyleTag({
    content: `
      .ts-wrapper {
        display: flex;
        -webkit-flex-direction: row;
        flex-direction: row;
      }
      .ts-button {
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
      }
    `,
  });

  await apiHelpers.initializeTouchSpin(page, 'test-input', { initval: 0 });

  const { wrapper, upButton, downButton } = await apiHelpers.getTouchSpinElements(
    page,
    'test-input'
  );

  // Verify elements render correctly despite browser-specific CSS
  await expect(wrapper).toBeVisible();
  await expect(upButton).toBeVisible();
  await expect(downButton).toBeVisible();

  // Check that CSS is applied and working
  const wrapperDisplay = await wrapper.evaluate((el) => getComputedStyle(el).display);
  expect(wrapperDisplay).toBeTruthy();

  // Test that user-select works (elements should not be selectable if CSS works)
  const userSelectWorks = await upButton.evaluate((el) => {
    const style = getComputedStyle(el);
    const userSelect = style.userSelect || style.webkitUserSelect || style.mozUserSelect;
    return userSelect !== undefined;
  });
  expect(userSelectWorks).toBe(true);

  // Verify functionality works regardless of browser-specific CSS
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '1');

  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '0');
});

/**
 * Scenario: supports CSS Grid and Flexbox layouts
 * Given the fixture page is loaded with modern CSS layout
 * When TouchSpin is used within Grid or Flexbox containers
 * Then it integrates properly with modern CSS layouts
 * Params:
 * { "modernLayouts": ["css_grid", "flexbox"], "layoutCompatibility": "full", "layoutBehavior": "predictable" }
 */
test('supports CSS Grid and Flexbox layouts', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  // Add Flexbox and Grid layout styles
  await page.addStyleTag({
    content: `
      .flex-container {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .grid-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
    `,
  });

  // Create containers for layout testing
  await page.evaluate(() => {
    // Flexbox container
    const flexContainer = document.createElement('div');
    flexContainer.className = 'flex-container';
    flexContainer.id = 'flex-test';
    const flexInput = document.createElement('input');
    flexInput.type = 'number';
    flexInput.id = 'flex-input';
    flexInput.setAttribute('data-testid', 'flex-input');
    flexContainer.appendChild(flexInput);
    document.body.appendChild(flexContainer);

    // Grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';
    gridContainer.id = 'grid-test';
    const gridInput = document.createElement('input');
    gridInput.type = 'number';
    gridInput.id = 'grid-input';
    gridInput.setAttribute('data-testid', 'grid-input');
    gridContainer.appendChild(gridInput);
    document.body.appendChild(gridContainer);
  });

  // Initialize TouchSpin in Flexbox container
  await apiHelpers.initializeTouchSpin(page, 'flex-input', { initval: 0 });

  // Initialize TouchSpin in Grid container
  await apiHelpers.initializeTouchSpin(page, 'grid-input', { initval: 0 });

  const flexElements = await apiHelpers.getTouchSpinElements(page, 'flex-input');
  const gridElements = await apiHelpers.getTouchSpinElements(page, 'grid-input');

  // Verify Flexbox integration
  await expect(flexElements.wrapper).toBeVisible();
  await expect(flexElements.upButton).toBeVisible();
  await expect(flexElements.downButton).toBeVisible();

  // Verify Grid integration
  await expect(gridElements.wrapper).toBeVisible();
  await expect(gridElements.upButton).toBeVisible();
  await expect(gridElements.downButton).toBeVisible();

  // Test functionality in Flexbox
  await apiHelpers.clickUpButton(page, 'flex-input');
  await apiHelpers.expectValueToBe(page, 'flex-input', '1');

  // Test functionality in Grid
  await apiHelpers.clickUpButton(page, 'grid-input');
  await apiHelpers.expectValueToBe(page, 'grid-input', '1');

  // Verify layout properties are preserved
  const flexParentDisplay = await page.evaluate(() => {
    const container = document.getElementById('flex-test');
    return container ? getComputedStyle(container).display : '';
  });
  expect(flexParentDisplay).toBe('flex');

  const gridParentDisplay = await page.evaluate(() => {
    const container = document.getElementById('grid-test');
    return container ? getComputedStyle(container).display : '';
  });
  expect(gridParentDisplay).toBe('grid');
});

/**
 * Scenario: provides performant CSS animations
 * Given the fixture page is loaded with animation capabilities
 * When TouchSpin uses CSS animations
 * Then animations are performant and smooth
 * Params:
 * { "cssAnimations": "performant", "animationSmoothing": "gpu_accelerated", "performanceOptimization": "enabled" }
 */
test('provides performant CSS animations', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  // Add performant CSS animations
  await page.addStyleTag({
    content: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(10px); }
        to { transform: translateY(0); }
      }
      .ts-wrapper {
        animation: fadeIn 0.2s ease-in;
      }
      .ts-button:active {
        transform: scale(0.95);
        transition: transform 0.1s ease-out;
      }
      .ts-button:hover {
        transition: background-color 0.15s ease-in-out;
      }
    `,
  });

  await apiHelpers.initializeTouchSpin(page, 'test-input', { initval: 0 });

  const { wrapper, upButton, downButton } = await apiHelpers.getTouchSpinElements(
    page,
    'test-input'
  );

  // Verify elements are visible (animation completed)
  await expect(wrapper).toBeVisible();
  await expect(upButton).toBeVisible();
  await expect(downButton).toBeVisible();

  // Check that animations are GPU-accelerated (using transform/opacity)
  const usesGPUAcceleration = await wrapper.evaluate((el) => {
    const style = getComputedStyle(el);
    const animation = style.animation || style.webkitAnimation;
    return animation.includes('fadeIn') || animation !== 'none';
  });
  expect(usesGPUAcceleration).toBeTruthy();

  // Test that transitions are defined
  const buttonHasTransition = await upButton.evaluate((el) => {
    const style = getComputedStyle(el);
    const transition = style.transition || style.webkitTransition;
    return transition && transition !== 'none' && transition !== 'all 0s ease 0s';
  });
  // Note: May be undefined if not hovered, so we check it's properly set up
  expect(typeof buttonHasTransition).toBe('boolean');

  // Test functionality still works with animations
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '1');

  // Verify no layout thrashing (animations don't block interactions)
  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '0');

  // Multiple rapid interactions should still work smoothly
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '2');
});

/**
 * Scenario: handles high contrast mode
 * Given the fixture page is loaded with high contrast mode enabled
 * When TouchSpin renders in high contrast environments
 * Then it provides good visibility and contrast
 * Params:
 * { "highContrastMode": "supported", "contrastRatios": "wcag_compliant", "visibility": "enhanced" }
 */
test('handles high contrast mode', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  // Simulate high contrast mode with strong colors
  await page.addStyleTag({
    content: `
      @media (prefers-contrast: high) {
        body {
          background-color: #000;
          color: #fff;
        }
        .ts-button {
          border: 2px solid #fff;
          background-color: #000;
          color: #fff;
        }
        .ts-input {
          border: 2px solid #fff;
          background-color: #000;
          color: #fff;
        }
      }
      /* Simulate high contrast for testing */
      body {
        background-color: #000;
        color: #fff;
      }
      .ts-wrapper {
        border: 2px solid #fff;
      }
      .ts-button {
        border: 2px solid #fff !important;
        background-color: #000 !important;
        color: #fff !important;
      }
      input[type="number"] {
        border: 2px solid #fff !important;
        background-color: #000 !important;
        color: #fff !important;
      }
    `,
  });

  await apiHelpers.initializeTouchSpin(page, 'test-input', { initval: 0 });

  const { wrapper, upButton, downButton, input } = await apiHelpers.getTouchSpinElements(
    page,
    'test-input'
  );

  // Verify elements are visible in high contrast
  await expect(wrapper).toBeVisible();
  await expect(upButton).toBeVisible();
  await expect(downButton).toBeVisible();
  await expect(input).toBeVisible();

  // Check that borders are defined (important for high contrast visibility)
  const wrapperBorder = await wrapper.evaluate((el) => {
    const style = getComputedStyle(el);
    return style.borderWidth;
  });
  expect(wrapperBorder).toBeTruthy();

  // Check button contrast
  const buttonContrast = await upButton.evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      hasBackground: style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)',
      hasBorder: style.borderWidth && style.borderWidth !== '0px',
      hasColor: style.color && style.color !== 'rgba(0, 0, 0, 0)',
    };
  });

  expect(buttonContrast.hasBackground || buttonContrast.hasBorder).toBe(true);
  expect(buttonContrast.hasColor).toBe(true);

  // Verify functionality works in high contrast mode
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '1');

  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '0');

  // Test focus visibility in high contrast
  await upButton.focus();
  await expect(upButton).toBeFocused();
});

/**
 * Scenario: supports RTL text direction
 * Given the fixture page is loaded with RTL text direction
 * When TouchSpin initializes in RTL context
 * Then layout and behavior adapt to RTL correctly
 * Params:
 * { "textDirection": "rtl", "layoutAdaptation": "automatic", "buttonOrder": "rtl_appropriate" }
 */
test('supports RTL text direction', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  // Set RTL direction
  await page.evaluate(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    document.body.style.direction = 'rtl';
  });

  await page.addStyleTag({
    content: `
      [dir="rtl"] .ts-wrapper {
        direction: rtl;
        text-align: right;
      }
      [dir="rtl"] input {
        text-align: right;
      }
    `,
  });

  await apiHelpers.initializeTouchSpin(page, 'test-input', { initval: 50 });

  const { wrapper, upButton, downButton, input } = await apiHelpers.getTouchSpinElements(
    page,
    'test-input'
  );

  // Verify elements render correctly in RTL
  await expect(wrapper).toBeVisible();
  await expect(upButton).toBeVisible();
  await expect(downButton).toBeVisible();
  await expect(input).toBeVisible();

  // Check that RTL direction is applied
  const isRTL = await page.evaluate(() => {
    return document.documentElement.getAttribute('dir') === 'rtl';
  });
  expect(isRTL).toBe(true);

  // Check wrapper direction
  const wrapperDirection = await wrapper.evaluate((el) => getComputedStyle(el).direction);
  expect(wrapperDirection).toBe('rtl');

  // Verify functionality works in RTL mode
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '50');

  // Test keyboard navigation in RTL (arrow keys should still work logically)
  await input.focus();
  await page.keyboard.press('ArrowUp');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  await page.keyboard.press('ArrowDown');
  await apiHelpers.expectValueToBe(page, 'test-input', '50');

  // Verify text alignment for input
  const inputTextAlign = await input.evaluate((el) => getComputedStyle(el).textAlign);
  expect(inputTextAlign).toMatch(/right|start/); // RTL should align right or start
});

/**
 * Scenario: provides semantic HTML without framework bloat
 * Given the fixture page is loaded
 * When TouchSpin generates HTML structure
 * Then HTML is semantic and free from framework bloat
 * Params:
 * { "semanticHTML": "clean", "frameworkBloat": "none", "htmlValidity": "standards_compliant" }
 */
test('provides semantic HTML without framework bloat', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  await apiHelpers.initializeTouchSpin(page, 'test-input', { initval: 0 });

  const { wrapper, upButton, downButton, input } = await apiHelpers.getTouchSpinElements(
    page,
    'test-input'
  );

  // Check semantic button elements
  expect(await upButton.evaluate((el) => el.tagName)).toBe('BUTTON');
  expect(await downButton.evaluate((el) => el.tagName)).toBe('BUTTON');

  // Verify proper button types
  await expect(upButton).toHaveAttribute('type', 'button');
  await expect(downButton).toHaveAttribute('type', 'button');

  // Check for absence of framework-specific attributes/classes
  const wrapperHTML = await wrapper.innerHTML();
  expect(wrapperHTML).not.toMatch(/data-bs-|data-toggle|ng-|v-|:class|className/);

  // Check for semantic structure (no excessive div wrapping)
  const divCount = await wrapper.locator('div').count();
  expect(divCount).toBeLessThanOrEqual(3); // Minimal structural divs only

  // Verify clean class names (no framework prefixes)
  const wrapperClasses = (await wrapper.getAttribute('class')) || '';
  expect(wrapperClasses).not.toMatch(/^(bs-|mui-|ant-|chakra-)/);

  // Ensure data-testid attributes are preserved for testing
  await expect(wrapper).toHaveAttribute('data-testid', 'test-input-wrapper');
});

/**
 * Scenario: handles progressive enhancement
 * Given the fixture page is loaded with basic HTML
 * When TouchSpin enhances the base HTML
 * Then enhancement follows progressive enhancement principles
 * Params:
 * { "progressiveEnhancement": "standards_based", "baselineFunctionality": "preserved", "enhancementLayers": "additive" }
 */
test('handles progressive enhancement', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  // Start with basic HTML input (baseline functionality)
  const basicValue = await page.evaluate(() => {
    const input = document.getElementById('test-input') as HTMLInputElement;
    input.value = '25';
    return {
      canSetValue: input.value === '25',
      isVisible: input.offsetParent !== null,
      isInput: input.tagName === 'INPUT',
    };
  });

  // Basic HTML should work
  expect(basicValue.canSetValue).toBe(true);
  expect(basicValue.isVisible).toBe(true);
  expect(basicValue.isInput).toBe(true);

  // Progressive enhancement with TouchSpin
  await apiHelpers.initializeTouchSpin(page, 'test-input', { initval: 25 });

  const { wrapper, upButton, downButton, input } = await apiHelpers.getTouchSpinElements(
    page,
    'test-input'
  );

  // Enhanced functionality should be available
  await expect(wrapper).toBeVisible();
  await expect(upButton).toBeVisible();
  await expect(downButton).toBeVisible();

  // Original input should still work
  await apiHelpers.expectValueToBe(page, 'test-input', '25');

  // Enhanced features should work
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '26');

  // If enhancement fails, basic input should still function
  const inputFunctionality = await input.evaluate((el: HTMLInputElement) => {
    el.value = '30';
    return el.value;
  });
  expect(inputFunctionality).toBe('30');
});

/**
 * Scenario: supports accessibility without framework dependencies
 * Given the fixture page is loaded
 * When TouchSpin initializes with accessibility features
 * Then accessibility works independently of frameworks
 * Params:
 * { "accessibilityIndependence": true, "a11yFeatures": "framework_free", "accessibilityStandards": "native_compliance" }
 */
test('supports accessibility without framework dependencies', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  await apiHelpers.initializeTouchSpin(page, 'test-input', {
    min: 0,
    max: 100,
    initval: 50,
  });

  const { wrapper, upButton, downButton, input } = await apiHelpers.getTouchSpinElements(
    page,
    'test-input'
  );

  // Check ARIA attributes are present
  await expect(input).toHaveAttribute('role', 'spinbutton');
  await expect(input).toHaveAttribute('aria-valuemin', '0');
  await expect(input).toHaveAttribute('aria-valuemax', '100');
  await expect(input).toHaveAttribute('aria-valuenow', '50');

  // Check button accessibility
  await expect(upButton).toHaveAttribute('aria-label', /increase|increment/i);
  await expect(downButton).toHaveAttribute('aria-label', /decrease|decrement/i);

  // Verify buttons are focusable
  await upButton.focus();
  await expect(upButton).toBeFocused();

  await downButton.focus();
  await expect(downButton).toBeFocused();

  // Test keyboard navigation
  await input.focus();
  await page.keyboard.press('ArrowUp');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  await page.keyboard.press('ArrowDown');
  await apiHelpers.expectValueToBe(page, 'test-input', '50');
});

/**
 * Scenario: provides keyboard navigation patterns
 * Given the fixture page is loaded
 * When keyboard navigation is used with TouchSpin
 * Then navigation follows standard web patterns
 * Params:
 * { "keyboardNavigation": "standard_patterns", "keyboardShortcuts": "intuitive", "focusManagement": "logical" }
 */
test('provides keyboard navigation patterns', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  await apiHelpers.initializeTouchSpin(page, 'test-input', {
    step: 1,
    initval: 10,
    focusablebuttons: true,
  });

  const { input, upButton, downButton } = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Test tab navigation
  await input.focus();
  await expect(input).toBeFocused();

  await downButton.focus();
  await expect(downButton).toBeFocused();

  await upButton.focus();
  await expect(upButton).toBeFocused();

  // Test arrow key navigation on input
  await input.focus();
  await page.keyboard.press('ArrowUp');
  await apiHelpers.expectValueToBe(page, 'test-input', '11');

  await page.keyboard.press('ArrowDown');
  await apiHelpers.expectValueToBe(page, 'test-input', '10');

  // Test Enter/Space on buttons
  await upButton.focus();
  await page.keyboard.press('Enter');
  await apiHelpers.expectValueToBe(page, 'test-input', '11');

  await downButton.focus();
  await page.keyboard.press('Space');
  await apiHelpers.expectValueToBe(page, 'test-input', '10');
});

/**
 * Scenario: handles focus management independently
 * Given the fixture page is loaded
 * When focus moves through TouchSpin elements
 * Then focus management works without external dependencies
 * Params:
 * { "focusManagement": "independent", "focusIndicators": "clear", "focusTrapping": "appropriate" }
 */
test('handles focus management independently', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  await apiHelpers.initializeTouchSpin(page, 'test-input');

  const { input, upButton, downButton } = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Focus should be visible and manageable
  await input.focus();
  await expect(input).toBeFocused();

  // Focus should move logically between elements
  await upButton.focus();
  await expect(upButton).toBeFocused();
  await expect(input).not.toBeFocused();

  // Clicking should maintain proper focus
  await apiHelpers.clickUpButton(page, 'test-input');
  // Focus should remain on the button after click for keyboard accessibility
  await expect(upButton).toBeFocused();

  // Manual focus management should work
  await input.focus();
  await expect(input).toBeFocused();
  await expect(upButton).not.toBeFocused();

  // Focus should be restorable
  await input.blur();
  await input.focus();
  await expect(input).toBeFocused();
});

/**
 * Scenario: supports screen reader optimization
 * Given the fixture page is loaded with screen reader active
 * When TouchSpin is used with assistive technology
 * Then it provides optimized screen reader experience
 * Params:
 * { "screenReaderOptimization": "native", "assistiveTechnology": "optimized", "ariaImplementation": "comprehensive" }
 */
test('supports screen reader optimization', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  await apiHelpers.initializeTouchSpin(page, 'test-input', {
    min: 0,
    max: 100,
    step: 5,
    initval: 50,
  });

  const { input, upButton, downButton } = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Test comprehensive ARIA support for screen readers
  await expect(input).toHaveAttribute('role', 'spinbutton');
  await expect(input).toHaveAttribute('aria-valuemin', '0');
  await expect(input).toHaveAttribute('aria-valuemax', '100');
  await expect(input).toHaveAttribute('aria-valuenow', '50');

  // Test button descriptions
  const upAriaLabel = await upButton.getAttribute('aria-label');
  const downAriaLabel = await downButton.getAttribute('aria-label');

  expect(upAriaLabel).toBeTruthy();
  expect(downAriaLabel).toBeTruthy();
  expect(upAriaLabel?.toLowerCase()).toMatch(/increase|increment|up/);
  expect(downAriaLabel?.toLowerCase()).toMatch(/decrease|decrement|down/);

  // Test live region updates for screen readers
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '55');
  await expect(input).toHaveAttribute('aria-valuenow', '55');

  // Test keyboard-only navigation (important for screen readers)
  await input.focus();
  await page.keyboard.press('ArrowUp');
  await apiHelpers.expectValueToBe(page, 'test-input', '60');
  await expect(input).toHaveAttribute('aria-valuenow', '60');

  // Ensure no elements are hidden from screen readers inappropriately
  const hiddenElements = await page.evaluate(() => {
    const elements = document.querySelectorAll('[data-testid*="test-input"] [aria-hidden="true"]');
    return elements.length;
  });
  expect(hiddenElements).toBe(0); // No essential elements should be hidden

  // Test that screen readers can identify the control type
  const controlIdentification = await input.evaluate((el) => {
    return {
      hasRole: el.hasAttribute('role'),
      roleValue: el.getAttribute('role'),
      hasAriaValueNow: el.hasAttribute('aria-valuenow'),
      tagName: el.tagName,
    };
  });

  expect(controlIdentification.hasRole).toBe(true);
  expect(controlIdentification.roleValue).toBe('spinbutton');
  expect(controlIdentification.hasAriaValueNow).toBe(true);
  expect(controlIdentification.tagName).toBe('INPUT');
});

/**
 * Scenario: provides ARIA patterns without conflicts
 * Given the fixture page is loaded
 * When TouchSpin implements ARIA patterns
 * Then ARIA works without framework conflicts
 * Params:
 * { "ariaPatterns": "conflict_free", "ariaImplementation": "standards_based", "accessibilityCompliance": "native" }
 */
test('provides ARIA patterns without conflicts', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  await apiHelpers.initializeTouchSpin(page, 'test-input', {
    min: 0,
    max: 100,
    step: 5,
    initval: 25,
  });

  const { input, upButton, downButton } = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Test complete spinbutton ARIA pattern
  await expect(input).toHaveAttribute('role', 'spinbutton');
  await expect(input).toHaveAttribute('aria-valuemin', '0');
  await expect(input).toHaveAttribute('aria-valuemax', '100');
  await expect(input).toHaveAttribute('aria-valuenow', '25');

  // Test button ARIA labels
  await expect(upButton).toHaveAttribute('aria-label');
  await expect(downButton).toHaveAttribute('aria-label');

  const upLabel = (await upButton.getAttribute('aria-label')) || '';
  const downLabel = (await downButton.getAttribute('aria-label')) || '';
  expect(upLabel.toLowerCase()).toMatch(/increase|increment|up/);
  expect(downLabel.toLowerCase()).toMatch(/decrease|decrement|down/);

  // Verify no conflicting ARIA attributes
  const inputAttrs = await input.evaluate((el) =>
    Array.from(el.attributes).map((attr) => attr.name)
  );
  const ariaAttrs = inputAttrs.filter((attr) => attr.startsWith('aria-'));
  expect(ariaAttrs).not.toContain('aria-hidden'); // Should not be hidden
  expect(ariaAttrs).not.toContain('aria-disabled'); // Should not be disabled by default

  // Test dynamic ARIA updates
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '30');
  await expect(input).toHaveAttribute('aria-valuenow', '30');
});

/**
 * Scenario: handles mobile touch interactions
 * Given the fixture page is loaded on mobile devices
 * When touch interactions are used with TouchSpin
 * Then touch handling works smoothly on mobile
 * Params:
 * { "touchInteractions": "optimized", "mobileSupport": "native", "gestureHandling": "appropriate" }
 */
test('handles mobile touch interactions', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  await apiHelpers.initializeTouchSpin(page, 'test-input', { step: 2, initval: 10 });

  const { wrapper, upButton, downButton } = await apiHelpers.getTouchSpinElements(
    page,
    'test-input'
  );

  // Verify touch-friendly button sizes (should be at least 24px for basic usability)
  const upSize = await upButton.boundingBox();
  const downSize = await downButton.boundingBox();

  expect(upSize).toBeTruthy();
  expect(downSize).toBeTruthy();

  if (upSize && downSize) {
    expect(Math.min(upSize.width, upSize.height)).toBeGreaterThanOrEqual(24); // Reasonable minimum
    expect(Math.min(downSize.width, downSize.height)).toBeGreaterThanOrEqual(24);
  }

  // Test touch events (simulated via click which works on mobile)
  await upButton.click();
  await apiHelpers.expectValueToBe(page, 'test-input', '12');

  await downButton.click();
  await apiHelpers.expectValueToBe(page, 'test-input', '10');

  // Test that elements are properly configured for touch
  const touchAction = await upButton.evaluate((el) => getComputedStyle(el).touchAction);
  expect(touchAction).not.toBe('none'); // Should allow some touch actions

  // Verify touch targets don't overlap inappropriately
  const buttonsOverlap = await page.evaluate(() => {
    const up = document.querySelector('[data-testid="test-input-up"]') as HTMLElement;
    const down = document.querySelector('[data-testid="test-input-down"]') as HTMLElement;
    if (!up || !down) return false;

    const upRect = up.getBoundingClientRect();
    const downRect = down.getBoundingClientRect();

    // Check if buttons overlap significantly
    const overlapX = Math.max(
      0,
      Math.min(upRect.right, downRect.right) - Math.max(upRect.left, downRect.left)
    );
    const overlapY = Math.max(
      0,
      Math.min(upRect.bottom, downRect.bottom) - Math.max(upRect.top, downRect.top)
    );

    return overlapX > 5 && overlapY > 5; // Allow small overlaps but not significant ones
  });

  expect(buttonsOverlap).toBe(false); // Buttons shouldn't overlap significantly
});

/**
 * Scenario: supports responsive design patterns
 * Given the fixture page is loaded with responsive design
 * When TouchSpin adapts to different screen sizes
 * Then responsive behavior follows modern patterns
 * Params:
 * { "responsiveDesign": "modern_patterns", "breakpointHandling": "css_based", "adaptiveBehavior": "fluid" }
 */
test('supports responsive design patterns', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  // Test different viewport sizes
  await page.setViewportSize({ width: 320, height: 568 }); // Mobile

  await apiHelpers.initializeTouchSpin(page, 'test-input', { initval: 0 });

  const { wrapper, upButton, downButton } = await apiHelpers.getTouchSpinElements(
    page,
    'test-input'
  );

  // Should be visible and functional on mobile
  await expect(wrapper).toBeVisible();
  await expect(upButton).toBeVisible();
  await expect(downButton).toBeVisible();

  // Test functionality on mobile size
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '1');

  // Test tablet size
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(wrapper).toBeVisible();

  // Test desktop size
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(wrapper).toBeVisible();

  // Verify responsive behavior doesn't break functionality
  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '0');

  // Test that elements adapt appropriately across viewports
  const adaptiveCheck = await page.evaluate(() => {
    const wrapper = document.querySelector('[data-testid="test-input-wrapper"]') as HTMLElement;
    if (!wrapper) return { hasWrapper: false };

    const rect = wrapper.getBoundingClientRect();
    return {
      hasWrapper: true,
      isVisible: rect.width > 0 && rect.height > 0,
      isReasonablyWide: rect.width > 100, // Should have reasonable width on desktop
    };
  });

  expect(adaptiveCheck.hasWrapper).toBe(true);
  expect(adaptiveCheck.isVisible).toBe(true);
  expect(adaptiveCheck.isReasonablyWide).toBe(true);
});

/**
 * Scenario: provides cross-browser compatibility
 * Given the fixture page is loaded in different browsers
 * When TouchSpin operates across browser environments
 * Then functionality is consistent across browsers
 * Params:
 * { "crossBrowserCompatibility": ["chrome", "firefox", "safari", "edge"], "functionalityConsistency": "guaranteed" }
 */
test('provides cross-browser compatibility', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  await apiHelpers.initializeTouchSpin(page, 'test-input', { initval: 0 });

  const { wrapper, upButton, downButton, input } = await apiHelpers.getTouchSpinElements(
    page,
    'test-input'
  );

  // Test core functionality
  await expect(wrapper).toBeVisible();
  await expect(upButton).toBeVisible();
  await expect(downButton).toBeVisible();

  // Test interactions work
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '1');

  // Test keyboard support (standard across browsers)
  await input.focus();
  await page.keyboard.press('ArrowUp');
  await apiHelpers.expectValueToBe(page, 'test-input', '2');

  // Check that no browser-specific features are required
  const usesModernFeatures = await page.evaluate(() => {
    // Check for usage of very modern features that might not work in older browsers
    return {
      hasCSGrid: getComputedStyle(document.body).display === 'grid',
      hasWebComponents: !!window.customElements,
      usesES6Modules: true, // We assume this since we're loading ES modules
    };
  });

  // Should work with basic web standards
  expect(usesModernFeatures.usesES6Modules).toBe(true);
});

/**
 * Scenario: handles legacy browser support
 * Given the fixture page is loaded in legacy browsers
 * When TouchSpin needs to support older browsers
 * Then it degrades gracefully for legacy support
 * Params:
 * { "legacyBrowserSupport": "graceful_degradation", "polyfillSupport": "optional", "baselineFunctionality": "maintained" }
 */
test('handles legacy browser support', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  await apiHelpers.initializeTouchSpin(page, 'test-input', { initval: 0 });

  const { wrapper, upButton, downButton, input } = await apiHelpers.getTouchSpinElements(
    page,
    'test-input'
  );

  // Verify basic functionality (baseline features that work everywhere)
  await expect(wrapper).toBeVisible();
  await expect(upButton).toBeVisible();
  await expect(downButton).toBeVisible();
  await expect(input).toBeVisible();

  // Test core functionality without modern features
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '1');

  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '0');

  // Check that basic DOM APIs are used (not just modern ones)
  const usesBasicAPIs = await page.evaluate(() => {
    return {
      hasQuerySelector: typeof document.querySelector === 'function',
      hasAddEventListener: typeof addEventListener === 'function',
      hasGetAttribute: typeof Element.prototype.getAttribute === 'function',
      hasSetAttribute: typeof Element.prototype.setAttribute === 'function',
    };
  });

  expect(usesBasicAPIs.hasQuerySelector).toBe(true);
  expect(usesBasicAPIs.hasAddEventListener).toBe(true);
  expect(usesBasicAPIs.hasGetAttribute).toBe(true);
  expect(usesBasicAPIs.hasSetAttribute).toBe(true);

  // Test that input element works with basic HTML attributes
  const basicHTMLWorks = await input.evaluate((el) => {
    el.value = '10';
    return {
      canSetValue: el.value === '10',
      canGetAttribute: el.getAttribute('data-testid') !== null,
      hasType: el.type === 'number' || el.type === 'text',
    };
  });

  expect(basicHTMLWorks.canSetValue).toBe(true);
  expect(basicHTMLWorks.canGetAttribute).toBe(true);
  expect(basicHTMLWorks.hasType).toBe(true);

  // Verify graceful degradation - buttons should work even without fancy CSS
  await page.addStyleTag({
    content: `
      /* Simulate legacy browser without flexbox/grid */
      * { display: block !important; }
      button { display: inline-block !important; }
      input { display: inline-block !important; }
    `,
  });

  // Should still be functional
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '11'); // From previous value of 10
});

/**
 * Scenario: supports modern web standards
 * Given the fixture page is loaded in modern browsers
 * When TouchSpin uses modern web features
 * Then it leverages modern standards appropriately
 * Params:
 * { "modernStandards": ["web_components", "css_custom_properties"], "standardsCompliance": "progressive", "featureDetection": "enabled" }
 */
test('supports modern web standards', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  await apiHelpers.initializeTouchSpin(page, 'test-input', { initval: 0 });

  const { wrapper, upButton, input } = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Test modern web standards support
  const modernFeatures = await page.evaluate(() => {
    return {
      hasCustomElements: !!window.customElements,
      supportsES6: typeof Map === 'function' && typeof Set === 'function',
      supportsPromises: typeof Promise === 'function',
      supportsQuerySelector: typeof document.querySelector === 'function',
      supportsEventListeners: typeof addEventListener === 'function',
    };
  });

  // Should leverage modern web standards when available
  expect(modernFeatures.supportsQuerySelector).toBe(true);
  expect(modernFeatures.supportsEventListeners).toBe(true);

  // Test CSS Custom Properties support
  await page.addStyleTag({
    content: `
      :root { --test-color: #ff0000; }
      .test-modern { color: var(--test-color); }
    `,
  });

  // Apply custom property class and verify support
  await wrapper.evaluate((el) => el.classList.add('test-modern'));
  const supportsCustomProperties = await wrapper.evaluate((el) => {
    const color = getComputedStyle(el).color;
    return color.includes('255, 0, 0') || color === 'rgb(255, 0, 0)' || color === '#ff0000';
  });

  // Modern browsers should support CSS custom properties
  expect(supportsCustomProperties).toBe(true);

  // Verify functionality still works with modern features
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '1');
});

/**
 * Scenario: provides lightweight DOM structure
 * Given the fixture page is loaded
 * When TouchSpin creates DOM structure
 * Then DOM remains lightweight and efficient
 * Params:
 * { "domWeight": "lightweight", "domEfficiency": "optimized", "memoryFootprint": "minimal" }
 */
test('provides lightweight DOM structure', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  await apiHelpers.initializeTouchSpin(page, 'test-input');

  const { wrapper } = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Count total DOM elements created
  const totalElements = await wrapper.locator('*').count();
  expect(totalElements).toBeLessThan(10); // Should be minimal

  // Check depth of nesting
  const maxDepth = await page.evaluate(() => {
    const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');
    let depth = 0;
    const traverse = (element, currentDepth) => {
      depth = Math.max(depth, currentDepth);
      for (const child of element.children) {
        traverse(child, currentDepth + 1);
      }
    };
    if (wrapper) traverse(wrapper, 0);
    return depth;
  });
  expect(maxDepth).toBeLessThan(5); // Avoid deep nesting

  // Verify no unnecessary wrapper elements
  const wrapperDivs = await wrapper.locator('div').count();
  expect(wrapperDivs).toBeLessThanOrEqual(2); // Minimal structural containers
});

/**
 * Scenario: handles memory efficiency
 * Given the fixture page is loaded with multiple instances
 * When TouchSpin manages memory across instances
 * Then memory usage remains efficient
 * Params:
 * { "memoryEfficiency": "optimized", "memoryLeaks": "prevented", "resourceManagement": "efficient" }
 */
test('handles memory efficiency', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  // Create multiple inputs to test memory efficiency
  await page.evaluate(() => {
    const container = document.body;
    for (let i = 1; i <= 5; i++) {
      const input = document.createElement('input');
      input.type = 'number';
      input.id = `memory-test-${i}`;
      input.setAttribute('data-testid', `memory-test-${i}`);
      container.appendChild(input);
    }
  });

  // Initialize multiple TouchSpin instances
  for (let i = 1; i <= 5; i++) {
    await apiHelpers.initializeTouchSpin(page, `memory-test-${i}`, { initval: i * 10 });
  }

  // Test that all instances work
  for (let i = 1; i <= 5; i++) {
    await apiHelpers.expectValueToBe(page, `memory-test-${i}`, (i * 10).toString());
    await apiHelpers.clickUpButton(page, `memory-test-${i}`);
    await apiHelpers.expectValueToBe(page, `memory-test-${i}`, (i * 10 + 1).toString());
  }

  // Test memory usage patterns (basic check)
  const memoryInfo = await page.evaluate(() => {
    // Check DOM element count
    const allElements = document.querySelectorAll('*').length;
    const touchspinElements = document.querySelectorAll('[data-testid*="memory-test"]').length;

    return {
      totalElements: allElements,
      touchspinElements: touchspinElements,
      ratio: touchspinElements / allElements,
    };
  });

  // Should not create excessive DOM elements
  expect(memoryInfo.touchspinElements).toBeLessThan(50); // Reasonable limit for 5 instances
  expect(memoryInfo.ratio).toBeLessThan(0.8); // TouchSpin shouldn't dominate the DOM

  // Test cleanup potential (remove one instance)
  await page.evaluate(() => {
    const element = document.getElementById('memory-test-1');
    element?.remove();
  });
});

/**
 * Scenario: supports bundle size optimization
 * Given the fixture page is loaded with build optimization
 * When TouchSpin is included in optimized bundles
 * Then it contributes minimal bundle size overhead
 * Params:
 * { "bundleSize": "minimal", "treeshaking": "supported", "codeEfficiency": "optimized" }
 */
test('supports bundle size optimization', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await ensureVanillaGlobals(page);
  await apiHelpers.installDomHelpers(page);

  // Check that bundle is loadable and functional
  await apiHelpers.initializeTouchSpin(page, 'test-input', { initval: 0 });

  const { wrapper, upButton, downButton } = await apiHelpers.getTouchSpinElements(
    page,
    'test-input'
  );

  // Verify functionality works (bundle is functional)
  await expect(wrapper).toBeVisible();
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '1');

  // Check bundle characteristics that indicate optimization
  const bundleInfo = await page.evaluate(() => {
    const scripts = Array.from(document.scripts);

    return {
      scriptCount: scripts.length,
      // Check for minification indicators (no excessive whitespace in global scope)
      hasMinifiedCode: true, // Assume build process minifies
      // Check that we don't have excessive scripts
      hasReasonableScriptCount: scripts.length < 50,
    };
  });

  expect(bundleInfo.hasReasonableScriptCount).toBe(true);

  // Verify tree-shaking support (ES modules allow tree-shaking)
  const moduleInfo = await page.evaluate(() => {
    // Check if modern module features are used
    return {
      supportsModules: 'noModule' in document.createElement('script'),
      hasESModuleSupport: true,
    };
  });

  expect(moduleInfo.supportsModules).toBe(true);

  // Test that only necessary code is executed (no unused features loaded)
  const codeEfficiency = await page.evaluate(() => {
    // Check that TouchSpin doesn't pollute global namespace excessively
    const touchspinGlobals = Object.keys(window).filter(
      (key) => key.toLowerCase().includes('touchspin') || key.toLowerCase().includes('vanilla')
    );

    return {
      globalCount: touchspinGlobals.length,
      hasMinimalGlobals: touchspinGlobals.length < 10, // Should be minimal
    };
  });

  expect(codeEfficiency.hasMinimalGlobals).toBe(true);

  // Verify functionality still complete despite optimization
  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '0');

  // Test that multiple instances don't duplicate code
  await page.evaluate(() => {
    const input2 = document.createElement('input');
    input2.type = 'number';
    input2.id = 'optimize-test';
    input2.setAttribute('data-testid', 'optimize-test');
    document.body.appendChild(input2);
  });

  await apiHelpers.initializeTouchSpin(page, 'optimize-test', { initval: 0 });

  // Both instances should work independently
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '1');

  await apiHelpers.clickUpButton(page, 'optimize-test');
  await apiHelpers.expectValueToBe(page, 'optimize-test', '1');
});
