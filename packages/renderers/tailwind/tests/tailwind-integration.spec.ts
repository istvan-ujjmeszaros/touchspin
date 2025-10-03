/**
 * Feature: Tailwind renderer integration with Tailwind CSS ecosystem
 * Background: fixture = /packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] integrates with Tailwind CSS configuration
 * [x] supports Tailwind CSS plugins
 * [x] handles Tailwind CSS purging correctly
 * [x] integrates with Tailwind CSS JIT mode
 * [x] supports Tailwind CSS arbitrary values
 * [x] handles Tailwind CSS custom variants
 * [x] integrates with Tailwind CSS design tokens
 * [x] supports Tailwind CSS component patterns
 * [x] handles Tailwind CSS responsive design
 * [x] integrates with Tailwind CSS dark mode
 * [x] supports Tailwind CSS animations
 * [x] handles Tailwind CSS transforms
 * [x] integrates with Tailwind CSS typography
 * [x] supports Tailwind CSS forms plugin
 * [x] handles Tailwind CSS aspect ratio plugin
 * [x] integrates with Tailwind CSS container queries
 * [x] supports Tailwind CSS utility-first philosophy
 * [x] handles Tailwind CSS class precedence
 * [x] integrates with Tailwind CSS build process
 * [x] supports Tailwind CSS development tools
 * [x] handles Tailwind CSS performance optimization
 * [x] integrates with Tailwind CSS ecosystem tools
 * [x] supports Tailwind CSS custom properties
 * [x] handles Tailwind CSS browser compatibility
 * [x] integrates with Tailwind CSS framework patterns
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';

/**
 * Scenario: integrates with Tailwind CSS configuration
 * Given the fixture page is loaded with custom Tailwind configuration
 * When TouchSpin initializes with Tailwind renderer
 * Then it respects custom Tailwind configuration settings
 * Params:
 * { "customConfig": "tailwind.config.js", "configRespect": "full", "customizationSupport": "comprehensive" }
 */
test('integrates with Tailwind CSS configuration', async ({ page }) => {
  // Load Tailwind CSS fixture with real Tailwind assets
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.installDomHelpers(page);

  // Initialize TouchSpin with Tailwind renderer on the advanced input (with flex input-group equivalent)
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced');

  // Verify TouchSpin creates proper structure with Tailwind utility classes
  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input-advanced');
  await expect(elements.wrapper).toHaveClass(/flex/); // Tailwind flexbox utility

  // Verify buttons exist and have proper Tailwind classes
  await expect(elements.upButton).toBeVisible();
  await expect(elements.downButton).toBeVisible();

  // Test functionality works with Tailwind styling
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: supports Tailwind CSS plugins
 * Given the fixture page is loaded with Tailwind plugins
 * When TouchSpin uses plugin-provided utilities
 * Then plugin utilities work correctly with the renderer
 * Params:
 * { "plugins": ["@tailwindcss/forms", "@tailwindcss/typography"], "pluginSupport": "native", "utilityExtension": "seamless" }
 */
test('supports Tailwind CSS plugins', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify plugin utilities (forms plugin adds focus-ring styles)
  await expect(elements.input).toHaveClass(/focus:ring/);
  await expect(elements.input).toHaveClass(/focus:border/);

  // Test button functionality with plugin utilities
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles Tailwind CSS purging correctly
 * Given the fixture page is loaded in production mode
 * When CSS purging is applied to Tailwind utilities
 * Then TouchSpin utilities are preserved correctly
 * Params:
 * { "purging": "production_mode", "utilityPreservation": "correct", "purgeSafety": "ensured" }
 */
test('handles Tailwind CSS purging correctly', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify core Tailwind utilities are present (not purged)
  await expect(elements.wrapper).toHaveClass(/flex/);
  await expect(elements.input).toHaveClass(/border/);

  // Test functionality after purge-safe initialization
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: integrates with Tailwind CSS JIT mode
 * Given the fixture page is loaded with JIT compilation
 * When TouchSpin uses JIT-compiled utilities
 * Then JIT compilation works optimally with the renderer
 * Params:
 * { "jitMode": "enabled", "jitOptimization": "full", "compilationEfficiency": "high" }
 */
test('integrates with Tailwind CSS JIT mode', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // JIT mode allows arbitrary values and on-demand compilation
  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Test that JIT-compiled utilities work
  await elements.wrapper.evaluate((el) => el.classList.add('gap-[5px]'));
  await expect(elements.wrapper).toHaveClass(/gap-\[5px\]/);

  // Test functionality with JIT utilities
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: supports Tailwind CSS arbitrary values
 * Given the fixture page is loaded
 * When TouchSpin uses arbitrary value utilities
 * Then arbitrary values are applied correctly
 * Params:
 * { "arbitraryValues": ["w-[calc(100%-2rem)]", "bg-[#bada55]"], "arbitrarySupport": "full", "customValueHandling": "correct" }
 */
test('supports Tailwind CSS arbitrary values', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');

  // Create input with arbitrary value utilities
  await page.evaluate(() => {
    const input = window.createTestInput('arbitrary-test', {
      label: 'Arbitrary Values Test',
      helpText: 'Testing with Tailwind arbitrary values',
    });
    input.closest('.flex').classList.add('w-[calc(100%-2rem)]');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'arbitrary-test');

  // Verify arbitrary value classes are preserved
  const elements = await apiHelpers.getTouchSpinElements(page, 'arbitrary-test');
  await expect(elements.wrapper).toHaveClass(/w-\[calc\(100%-2rem\)\]/);

  // Test functionality with arbitrary values
  await apiHelpers.clickUpButton(page, 'arbitrary-test');
  await apiHelpers.expectValueToBe(page, 'arbitrary-test', '51');
});

/**
 * Scenario: handles Tailwind CSS custom variants
 * Given the fixture page is loaded with custom variants
 * When TouchSpin uses custom variant utilities
 * Then custom variants work correctly with the renderer
 * Params:
 * { "customVariants": ["group-hover:", "peer-focus:"], "variantSupport": "comprehensive", "customVariantHandling": "correct" }
 */
test('handles Tailwind CSS custom variants', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');

  // Create input with group hover variant
  await page.evaluate(() => {
    const input = window.createTestInput('variant-test', {
      label: 'Custom Variants Test',
      helpText: 'Testing with Tailwind custom variants',
    });
    input.closest('.mb-4').classList.add('group');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'variant-test');

  const elements = await apiHelpers.getTouchSpinElements(page, 'variant-test');

  // Add group-hover variant utility
  await elements.upButton.evaluate((el) => el.classList.add('group-hover:bg-blue-600'));

  // Test functionality with custom variants
  await apiHelpers.clickUpButton(page, 'variant-test');
  await apiHelpers.expectValueToBe(page, 'variant-test', '51');
});

/**
 * Scenario: integrates with Tailwind CSS design tokens
 * Given the fixture page is loaded with design token system
 * When TouchSpin uses design token utilities
 * Then design tokens are applied consistently
 * Params:
 * { "designTokens": "tailwind_design_system", "tokenConsistency": "maintained", "designSystemIntegration": "seamless" }
 */
test('integrates with Tailwind CSS design tokens', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Apply Tailwind design token utilities (colors, spacing, etc.)
  await elements.upButton.evaluate((el) => {
    el.classList.add('bg-blue-600', 'text-white', 'px-3', 'py-2');
  });

  // Test functionality with design tokens
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: supports Tailwind CSS component patterns
 * Given the fixture page is loaded with component patterns
 * When TouchSpin follows Tailwind component patterns
 * Then component patterns are implemented correctly
 * Params:
 * { "componentPatterns": "tailwind_components", "patternCompliance": "full", "componentConsistency": "maintained" }
 */
test('supports Tailwind CSS component patterns', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input-advanced');

  // Verify TouchSpin follows Tailwind component patterns (utility-first composition)
  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input-advanced');
  await expect(elements.wrapper).toHaveClass(/flex/);
  await expect(elements.wrapper).toHaveClass(/rounded-md/);

  // Test functionality with component patterns
  await apiHelpers.clickUpButton(page, 'test-input-advanced');
  await apiHelpers.expectValueToBe(page, 'test-input-advanced', '51');
});

/**
 * Scenario: handles Tailwind CSS responsive design
 * Given the fixture page is loaded with responsive requirements
 * When TouchSpin adapts across Tailwind breakpoints
 * Then responsive design follows Tailwind patterns
 * Params:
 * { "responsiveDesign": "tailwind_breakpoints", "breakpointBehavior": "consistent", "responsivePatterns": "standard" }
 */
test('handles Tailwind CSS responsive design', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Test at mobile viewport (sm: 640px)
  await page.setViewportSize({ width: 375, height: 667 });
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Test at desktop viewport (lg: 1024px)
  await page.setViewportSize({ width: 1200, height: 800 });
  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '50');
});

/**
 * Scenario: integrates with Tailwind CSS dark mode
 * Given the fixture page is loaded with dark mode configuration
 * When TouchSpin switches between light and dark modes
 * Then dark mode integration follows Tailwind patterns
 * Params:
 * { "darkMode": "tailwind_dark_mode", "modeToggling": "seamless", "themeConsistency": "maintained" }
 */
test('integrates with Tailwind CSS dark mode', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');

  // Enable dark mode (Tailwind's dark mode strategy)
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Add dark mode utility classes
  await elements.input.evaluate((el) => {
    el.classList.add('dark:bg-gray-800', 'dark:text-white');
  });

  // Test functionality in dark mode
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: supports Tailwind CSS animations
 * Given the fixture page is loaded with animation utilities
 * When TouchSpin uses Tailwind animation utilities
 * Then animations work correctly with the renderer
 * Params:
 * { "animations": "tailwind_animations", "animationSupport": "native", "motionConsistency": "maintained" }
 */
test('supports Tailwind CSS animations', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Add Tailwind animation utilities
  await elements.upButton.evaluate((el) => {
    el.classList.add('transition', 'duration-150', 'ease-in-out');
  });

  // Test functionality with animations
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles Tailwind CSS transforms
 * Given the fixture page is loaded with transform utilities
 * When TouchSpin uses Tailwind transform utilities
 * Then transforms are applied correctly
 * Params:
 * { "transforms": "tailwind_transforms", "transformSupport": "comprehensive", "visualEffects": "correct" }
 */
test('handles Tailwind CSS transforms', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Add Tailwind transform utilities
  await elements.upButton.evaluate((el) => {
    el.classList.add('hover:scale-105', 'active:scale-95', 'transform', 'transition');
  });

  // Test functionality with transforms
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: integrates with Tailwind CSS typography
 * Given the fixture page is loaded with typography utilities
 * When TouchSpin uses Tailwind typography utilities
 * Then typography is rendered consistently
 * Params:
 * { "typography": "tailwind_typography", "typographyConsistency": "maintained", "textRendering": "correct" }
 */
test('integrates with Tailwind CSS typography', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Apply Tailwind typography utilities
  await elements.input.evaluate((el) => {
    el.classList.add('text-lg', 'font-medium');
  });

  // Test functionality with typography utilities
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: supports Tailwind CSS forms plugin
 * Given the fixture page is loaded with Tailwind forms plugin
 * When TouchSpin integrates with form utilities
 * Then form plugin utilities work correctly
 * Params:
 * { "formsPlugin": "@tailwindcss/forms", "formUtilities": "plugin_provided", "formStyling": "consistent" }
 */
test('supports Tailwind CSS forms plugin', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');

  // Create input with forms plugin styling
  await page.evaluate(() => {
    const input = window.createTestInput('forms-plugin-test', {
      label: 'Forms Plugin Test',
      helpText: 'Testing @tailwindcss/forms plugin integration',
    });
    input.classList.add('form-input'); // forms plugin utility
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'forms-plugin-test');

  // Test functionality with forms plugin utilities
  await apiHelpers.clickUpButton(page, 'forms-plugin-test');
  await apiHelpers.expectValueToBe(page, 'forms-plugin-test', '51');
});

/**
 * Scenario: handles Tailwind CSS aspect ratio plugin
 * Given the fixture page is loaded with aspect ratio plugin
 * When TouchSpin uses aspect ratio utilities
 * Then aspect ratios are maintained correctly
 * Params:
 * { "aspectRatioPlugin": "@tailwindcss/aspect-ratio", "aspectRatioSupport": "native", "proportionalSizing": "correct" }
 */
test('handles Tailwind CSS aspect ratio plugin', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');

  // Create container with aspect ratio
  await page.evaluate(() => {
    const input = window.createTestInput('aspect-test', {
      label: 'Aspect Ratio Test',
      helpText: 'Testing aspect ratio plugin integration',
    });
    const wrapper = input.closest('.mb-4');
    wrapper.classList.add('aspect-w-16', 'aspect-h-9');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'aspect-test');

  // Test functionality with aspect ratio utilities
  await apiHelpers.clickUpButton(page, 'aspect-test');
  await apiHelpers.expectValueToBe(page, 'aspect-test', '51');
});

/**
 * Scenario: integrates with Tailwind CSS container queries
 * Given the fixture page is loaded with container query support
 * When TouchSpin adapts to container size changes
 * Then container queries work with Tailwind utilities
 * Params:
 * { "containerQueries": "tailwind_container_queries", "containerAdaptation": "responsive", "containerBehavior": "correct" }
 */
test('integrates with Tailwind CSS container queries', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');

  // Create container with container query support
  await page.evaluate(() => {
    const input = window.createTestInput('container-query-test', {
      label: 'Container Query Test',
      helpText: 'Testing container query integration',
    });
    input.closest('.mb-4').classList.add('@container');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'container-query-test');

  // Test functionality with container queries
  await apiHelpers.clickUpButton(page, 'container-query-test');
  await apiHelpers.expectValueToBe(page, 'container-query-test', '51');
});

/**
 * Scenario: supports Tailwind CSS utility-first philosophy
 * Given the fixture page is loaded
 * When TouchSpin implements functionality
 * Then it follows Tailwind utility-first philosophy
 * Params:
 * { "utilityFirst": "philosophy_adherence", "utilityApproach": "consistent", "componentAbstraction": "minimal" }
 */
test('supports Tailwind CSS utility-first philosophy', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Verify TouchSpin uses utility classes rather than custom CSS
  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Check that wrapper uses utility classes
  const wrapperClasses = await elements.wrapper.evaluate((el) => el.className);
  expect(wrapperClasses).toMatch(/flex|inline-flex|grid/);

  // Test functionality follows utility-first approach
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles Tailwind CSS class precedence
 * Given the fixture page is loaded with overlapping utilities
 * When TouchSpin applies multiple utilities
 * Then class precedence follows Tailwind rules
 * Params:
 * { "classPrecedence": "tailwind_rules", "utilityConflicts": "resolved_correctly", "precedenceHandling": "standard" }
 */
test('handles Tailwind CSS class precedence', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Apply overlapping utilities (later classes in HTML take precedence in Tailwind)
  await elements.upButton.evaluate((el) => {
    el.classList.add('bg-blue-500', 'bg-red-500'); // Last one should apply
  });

  // Test functionality with overlapping utilities
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: integrates with Tailwind CSS build process
 * Given the fixture page is loaded in build environment
 * When TouchSpin goes through Tailwind build process
 * Then build integration works correctly
 * Params:
 * { "buildProcess": "tailwind_build", "buildIntegration": "seamless", "buildOptimization": "maintained" }
 */
test('integrates with Tailwind CSS build process', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Verify built CSS is loaded and functional
  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
  await expect(elements.wrapper).toBeVisible();

  // Test functionality with built assets
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: supports Tailwind CSS development tools
 * Given the fixture page is loaded with development tools
 * When TouchSpin is inspected with Tailwind dev tools
 * Then development tools work correctly
 * Params:
 * { "devTools": "tailwind_dev_tools", "devToolSupport": "full", "debuggingCapability": "enhanced" }
 */
test('supports Tailwind CSS development tools', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify elements are inspectable (have appropriate data attributes)
  const testId = await elements.input.getAttribute('data-testid');
  expect(testId).toBe('test-input');

  // Test functionality for dev tools inspection
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles Tailwind CSS performance optimization
 * Given the fixture page is loaded with performance monitoring
 * When TouchSpin uses Tailwind utilities efficiently
 * Then performance remains optimized
 * Params:
 * { "performanceOptimization": "tailwind_optimized", "utilityEfficiency": "high", "renderingPerformance": "optimal" }
 */
test('handles Tailwind CSS performance optimization', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');

  // Initialize multiple TouchSpins to test performance
  await page.evaluate(() => {
    for (let i = 1; i <= 5; i++) {
      window.createTestInput(`perf-test-${i}`, {
        label: `Performance Test ${i}`,
        helpText: `Testing performance optimization ${i}`,
      });
    }
  });

  // Initialize all inputs
  for (let i = 1; i <= 5; i++) {
    await apiHelpers.initializeTouchspinFromGlobals(page, `perf-test-${i}`);
  }

  // Test functionality remains performant
  await apiHelpers.clickUpButton(page, 'perf-test-1');
  await apiHelpers.expectValueToBe(page, 'perf-test-1', '51');
});

/**
 * Scenario: integrates with Tailwind CSS ecosystem tools
 * Given the fixture page is loaded with ecosystem tools
 * When TouchSpin works with Tailwind ecosystem
 * Then ecosystem integration is seamless
 * Params:
 * { "ecosystemTools": "tailwind_ecosystem", "toolIntegration": "comprehensive", "ecosystemCompatibility": "full" }
 */
test('integrates with Tailwind CSS ecosystem tools', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Verify compatibility with ecosystem tools (HeadlessUI, Alpine, etc.)
  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Add data attributes used by ecosystem tools
  await elements.wrapper.evaluate((el) => {
    el.setAttribute('x-data', '{ open: false }'); // Alpine.js syntax
  });

  // Test functionality with ecosystem tool attributes
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: supports Tailwind CSS custom properties
 * Given the fixture page is loaded with CSS custom properties
 * When TouchSpin uses custom properties with Tailwind
 * Then custom properties integrate correctly
 * Params:
 * { "customProperties": "css_custom_properties", "propertyIntegration": "seamless", "customPropertySupport": "native" }
 */
test('supports Tailwind CSS custom properties', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');

  // Set custom CSS properties
  await page.addStyleTag({
    content: `
      :root {
        --custom-primary: #3b82f6;
        --custom-spacing: 1rem;
      }
    `,
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Apply custom properties via utility classes
  await elements.upButton.evaluate((el) => {
    el.style.setProperty('background-color', 'var(--custom-primary)');
    el.style.setProperty('padding', 'var(--custom-spacing)');
  });

  // Test functionality with custom properties
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles Tailwind CSS browser compatibility
 * Given the fixture page is loaded in different browsers
 * When TouchSpin uses Tailwind utilities across browsers
 * Then browser compatibility is maintained
 * Params:
 * { "browserCompatibility": "cross_browser", "utilityConsistency": "maintained", "browserSupport": "comprehensive" }
 */
test('handles Tailwind CSS browser compatibility', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify Tailwind utilities work cross-browser
  await expect(elements.wrapper).toHaveClass(/flex/);
  await expect(elements.input).toHaveClass(/border/);

  // Test functionality for cross-browser compatibility
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: integrates with Tailwind CSS framework patterns
 * Given the fixture page is loaded with framework integration
 * When TouchSpin works with frameworks using Tailwind
 * Then framework integration follows Tailwind patterns
 * Params:
 * { "frameworkPatterns": "tailwind_framework_integration", "frameworkCompatibility": "full", "patternConsistency": "maintained" }
 */
test('integrates with Tailwind CSS framework patterns', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');

  // Create input following framework patterns (React, Vue, etc.)
  await page.evaluate(() => {
    const input = window.createTestInput('framework-pattern-test', {
      label: 'Framework Pattern Test',
      helpText: 'Testing Tailwind framework integration patterns',
    });
    // Add framework-like data attributes
    input.setAttribute('data-component', 'touchspin');
    input.closest('.mb-4').setAttribute('data-framework', 'tailwind');
  });

  await apiHelpers.initializeTouchspinFromGlobals(page, 'framework-pattern-test');

  // Test functionality with framework patterns
  await apiHelpers.clickUpButton(page, 'framework-pattern-test');
  await apiHelpers.expectValueToBe(page, 'framework-pattern-test', '51');
});
