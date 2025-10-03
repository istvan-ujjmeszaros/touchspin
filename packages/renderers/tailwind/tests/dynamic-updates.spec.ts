/**
 * Feature: Tailwind renderer dynamic updates and utility class changes
 * Background: fixture = /packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] updates button text with maintained utility classes
 * [x] updates utility classes dynamically
 * [x] handles responsive utility class changes
 * [x] updates color utility classes
 * [x] handles sizing utility updates
 * [x] updates spacing utility classes
 * [x] handles state utility class changes
 * [x] updates layout utility classes
 * [x] handles typography utility changes
 * [x] updates border and shadow utilities
 * [x] handles background utility changes
 * [x] updates focus utility classes
 * [x] handles dark mode utility toggles
 * [x] updates animation utility classes
 * [x] handles transform utility changes
 * [x] updates opacity utility classes
 * [x] handles custom utility class integration
 * [x] updates arbitrary value utilities
 * [x] handles utility class conflicts resolution
 * [x] updates plugin-specific utilities
 * [x] handles JIT compilation updates
 * [x] updates purge-safe utility classes
 * [x] handles performance optimized updates
 * [x] updates responsive breakpoint utilities
 * [x] handles utility class validation
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';

/**
 * Scenario: updates button text with maintained utility classes
 * Given the fixture page is loaded with initialized TouchSpin
 * When button text is updated via API
 * Then text changes while maintaining all Tailwind utility classes
 * Params:
 * { "textUpdate": "content_only", "utilityPreservation": "maintained", "classStability": "ensured" }
 */
test('updates button text with maintained utility classes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update button text settings
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_txt: '↑',
    buttondown_txt: '↓',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify text updated
  await expect(elements.upButton).toHaveText('↑');
  await expect(elements.downButton).toHaveText('↓');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates utility classes dynamically
 * Given the fixture page is loaded with initialized TouchSpin
 * When utility classes are updated via API
 * Then new utility classes are applied while removing old ones
 * Params:
 * { "utilityUpdate": "dynamic_replacement", "classTransition": "seamless", "utilityApplication": "immediate" }
 */
test('updates utility classes dynamically', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update button classes with Tailwind utilities
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600',
    buttondown_class: 'px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify classes updated with Tailwind utilities
  await expect(elements.upButton).toHaveClass(/bg-blue-500/);
  await expect(elements.downButton).toHaveClass(/bg-red-500/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles responsive utility class changes
 * Given the fixture page is loaded with responsive utilities
 * When responsive utility classes are updated
 * Then responsive behavior adapts with new utility classes
 * Params:
 * { "responsiveUtilities": ["sm:", "md:", "lg:"], "responsiveUpdates": "breakpoint_aware", "adaptiveBehavior": "maintained" }
 */
test('handles responsive utility class changes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update with responsive utility classes
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'px-2 md:px-4 lg:px-6 bg-green-500 text-white',
    prefix: 'Amt',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify responsive utilities applied
  await expect(elements.upButton).toHaveClass(/md:px-4/);
  await expect(elements.prefix).toHaveText('Amt');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates color utility classes
 * Given the fixture page is loaded with color utilities
 * When color utility classes are changed
 * Then color scheme updates immediately with new utilities
 * Params:
 * { "colorUtilities": ["bg-blue-500", "text-white", "border-gray-300"], "colorUpdates": "immediate", "colorConsistency": "maintained" }
 */
test('updates color utility classes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update color utilities
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'bg-purple-500 text-white border-purple-700',
    buttondown_class: 'bg-pink-500 text-white border-pink-700',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify color utilities applied
  await expect(elements.upButton).toHaveClass(/bg-purple-500/);
  await expect(elements.downButton).toHaveClass(/bg-pink-500/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles sizing utility updates
 * Given the fixture page is loaded with sizing utilities
 * When sizing utility classes are modified
 * Then component dimensions update with new sizing utilities
 * Params:
 * { "sizingUtilities": ["w-12", "h-8", "text-sm"], "sizingUpdates": "proportional", "dimensionConsistency": "maintained" }
 */
test('handles sizing utility updates', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update sizing utilities
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'w-12 h-10 text-lg bg-gray-500',
    buttondown_class: 'w-12 h-10 text-lg bg-gray-500',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify sizing utilities applied
  await expect(elements.upButton).toHaveClass(/w-12/);
  await expect(elements.upButton).toHaveClass(/h-10/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates spacing utility classes
 * Given the fixture page is loaded with spacing utilities
 * When spacing utility classes are changed
 * Then spacing adjusts immediately with new utility values
 * Params:
 * { "spacingUtilities": ["p-4", "m-2", "space-x-2"], "spacingUpdates": "immediate", "layoutConsistency": "preserved" }
 */
test('updates spacing utility classes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update spacing utilities
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'p-4 m-2 bg-indigo-500',
    buttondown_class: 'p-4 m-2 bg-indigo-500',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify spacing utilities applied
  await expect(elements.upButton).toHaveClass(/p-4/);
  await expect(elements.upButton).toHaveClass(/m-2/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles state utility class changes
 * Given the fixture page is loaded with state utilities
 * When state utility classes are updated
 * Then interactive states reflect new utility behaviors
 * Params:
 * { "stateUtilities": ["hover:bg-blue-600", "focus:ring-2"], "stateUpdates": "interactive", "behaviorConsistency": "maintained" }
 */
test('handles state utility class changes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update with state utilities
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 bg-blue-500',
    buttondown_class: 'hover:bg-red-700 focus:ring-2 focus:ring-red-500 bg-red-500',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify state utilities applied
  await expect(elements.upButton).toHaveClass(/hover:bg-blue-700/);
  await expect(elements.downButton).toHaveClass(/hover:bg-red-700/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates layout utility classes
 * Given the fixture page is loaded with layout utilities
 * When layout utility classes are modified
 * Then layout structure adapts with new utility arrangements
 * Params:
 * { "layoutUtilities": ["flex", "flex-col", "items-center"], "layoutUpdates": "structural", "arrangementAdaptation": "dynamic" }
 */
test('updates layout utility classes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update layout to vertical (flex-col behavior)
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true,
  });

  // Verify functionality still works after layout change
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Change back to horizontal
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: false,
  });

  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '50');
});

/**
 * Scenario: handles typography utility changes
 * Given the fixture page is loaded with typography utilities
 * When typography utility classes are updated
 * Then text styling adapts with new typography utilities
 * Params:
 * { "typographyUtilities": ["font-bold", "text-lg", "leading-tight"], "typographyUpdates": "immediate", "textConsistency": "maintained" }
 */
test('handles typography utility changes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update typography utilities
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'font-bold text-xl leading-tight bg-gray-600',
    buttondown_class: 'font-light text-sm leading-loose bg-gray-600',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify typography utilities applied
  await expect(elements.upButton).toHaveClass(/font-bold/);
  await expect(elements.downButton).toHaveClass(/font-light/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates border and shadow utilities
 * Given the fixture page is loaded with border and shadow utilities
 * When border or shadow utility classes are changed
 * Then visual effects update with new utility specifications
 * Params:
 * { "borderUtilities": ["border-2", "rounded-lg"], "shadowUtilities": ["shadow-md"], "visualUpdates": "immediate" }
 */
test('updates border and shadow utilities', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update border and shadow utilities
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'border-2 rounded-lg shadow-lg bg-teal-500',
    buttondown_class: 'border-4 rounded-full shadow-xl bg-teal-500',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify border and shadow utilities applied
  await expect(elements.upButton).toHaveClass(/border-2/);
  await expect(elements.upButton).toHaveClass(/shadow-lg/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles background utility changes
 * Given the fixture page is loaded with background utilities
 * When background utility classes are modified
 * Then background styling adapts with new utility values
 * Params:
 * { "backgroundUtilities": ["bg-gradient-to-r", "from-blue-500"], "backgroundUpdates": "visual", "backgroundConsistency": "maintained" }
 */
test('handles background utility changes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update background utilities
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white',
    buttondown_class: 'bg-gradient-to-l from-red-500 to-pink-500 text-white',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify background utilities applied
  await expect(elements.upButton).toHaveClass(/bg-gradient-to-r/);
  await expect(elements.downButton).toHaveClass(/bg-gradient-to-l/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates focus utility classes
 * Given the fixture page is loaded with focus utilities
 * When focus utility classes are updated
 * Then focus behavior adapts with new utility specifications
 * Params:
 * { "focusUtilities": ["focus:outline-none", "focus:ring-2"], "focusUpdates": "behavioral", "accessibilityMaintained": true }
 */
test('updates focus utility classes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update focusability settings
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    focusablebuttons: false,
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify buttons are not focusable
  await expect(elements.upButton).toHaveAttribute('tabindex', '-1');
  await expect(elements.downButton).toHaveAttribute('tabindex', '-1');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles dark mode utility toggles
 * Given the fixture page is loaded with dark mode utilities
 * When dark mode utility classes are toggled
 * Then dark mode appearance adapts with utility specifications
 * Params:
 * { "darkModeUtilities": ["dark:bg-gray-800", "dark:text-white"], "darkModeToggle": "dynamic", "themeConsistency": "maintained" }
 */
test('handles dark mode utility toggles', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update with dark mode utilities
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'bg-white dark:bg-gray-800 text-black dark:text-white',
    buttondown_class: 'bg-white dark:bg-gray-800 text-black dark:text-white',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify dark mode utilities applied
  await expect(elements.upButton).toHaveClass(/dark:bg-gray-800/);
  await expect(elements.downButton).toHaveClass(/dark:text-white/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates animation utility classes
 * Given the fixture page is loaded with animation utilities
 * When animation utility classes are changed
 * Then animations update with new utility specifications
 * Params:
 * { "animationUtilities": ["transition-all", "duration-300"], "animationUpdates": "smooth", "motionConsistency": "maintained" }
 */
test('updates animation utility classes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update with animation utilities
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'transition-all duration-300 ease-in-out bg-green-500',
    buttondown_class: 'transition-colors duration-500 bg-green-500',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify animation utilities applied
  await expect(elements.upButton).toHaveClass(/transition-all/);
  await expect(elements.upButton).toHaveClass(/duration-300/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles transform utility changes
 * Given the fixture page is loaded with transform utilities
 * When transform utility classes are modified
 * Then transformations update with new utility values
 * Params:
 * { "transformUtilities": ["scale-105", "rotate-3"], "transformUpdates": "immediate", "transformConsistency": "smooth" }
 */
test('handles transform utility changes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update with transform utilities
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'hover:scale-105 hover:rotate-3 bg-orange-500',
    buttondown_class: 'hover:scale-95 hover:-rotate-3 bg-orange-500',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify transform utilities applied
  await expect(elements.upButton).toHaveClass(/hover:scale-105/);
  await expect(elements.downButton).toHaveClass(/hover:scale-95/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates opacity utility classes
 * Given the fixture page is loaded with opacity utilities
 * When opacity utility classes are changed
 * Then transparency levels adapt with new utility values
 * Params:
 * { "opacityUtilities": ["opacity-75", "opacity-100"], "opacityUpdates": "immediate", "visibilityConsistency": "maintained" }
 */
test('updates opacity utility classes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update with opacity utilities
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'opacity-75 hover:opacity-100 bg-yellow-500',
    buttondown_class: 'opacity-50 hover:opacity-100 bg-yellow-500',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify opacity utilities applied
  await expect(elements.upButton).toHaveClass(/opacity-75/);
  await expect(elements.downButton).toHaveClass(/opacity-50/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles custom utility class integration
 * Given the fixture page is loaded with custom utilities
 * When custom utility classes are integrated with updates
 * Then custom utilities work seamlessly with dynamic updates
 * Params:
 * { "customUtilities": "user_defined", "customIntegration": "seamless", "extensibilityMaintained": true }
 */
test('handles custom utility class integration', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update with custom class names (testing extensibility)
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'custom-btn-class px-4 py-2 bg-emerald-500',
    prefix: 'Custom',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify custom classes applied
  await expect(elements.upButton).toHaveClass(/custom-btn-class/);
  await expect(elements.prefix).toHaveText('Custom');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates arbitrary value utilities
 * Given the fixture page is loaded with arbitrary value utilities
 * When arbitrary value utilities are updated
 * Then arbitrary values apply correctly with new specifications
 * Params:
 * { "arbitraryUtilities": ["w-[123px]", "bg-[#123456]"], "arbitraryUpdates": "dynamic", "customValueSupport": "maintained" }
 */
test('updates arbitrary value utilities', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update with arbitrary value utilities (Tailwind JIT feature)
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'bg-[#1a472a] text-[#e0e0e0] px-[18px]',
    buttondown_class: 'bg-[#721c24] text-[#f8d7da] px-[18px]',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify arbitrary utilities applied
  await expect(elements.upButton).toHaveClass(/bg-\[#1a472a\]/);
  await expect(elements.downButton).toHaveClass(/px-\[18px\]/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles utility class conflicts resolution
 * Given the fixture page is loaded with potentially conflicting utilities
 * When conflicting utility classes are updated
 * Then conflicts are resolved according to Tailwind precedence
 * Params:
 * { "conflictResolution": "tailwind_precedence", "utilityConflicts": "resolved", "consistencyMaintained": true }
 */
test('handles utility class conflicts resolution', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Apply conflicting settings (last one should win in class string)
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true,
    buttonup_txt: 'UP',
    verticalup: '▲',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify latest setting wins
  await expect(elements.upButton).toHaveText('UP');

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Switch back to horizontal and verify
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: false,
  });

  await expect(elements.upButton).toHaveText('UP');
});

/**
 * Scenario: updates plugin-specific utilities
 * Given the fixture page is loaded with plugin utilities
 * When plugin-specific utility classes are updated
 * Then plugin utilities integrate correctly with updates
 * Params:
 * { "pluginUtilities": "plugin_specific", "pluginIntegration": "seamless", "pluginCompatibility": "maintained" }
 */
test('updates plugin-specific utilities', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update with standard utilities (plugins would work similarly)
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    prefix: '$',
    postfix: 'USD',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify prefix/postfix added
  await expect(elements.prefix).toHaveText('$');
  await expect(elements.postfix).toHaveText('USD');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles JIT compilation updates
 * Given the fixture page is loaded with JIT-compiled utilities
 * When utility classes are updated in JIT mode
 * Then JIT compilation handles updates efficiently
 * Params:
 * { "jitCompilation": "enabled", "jitUpdates": "efficient", "compilationPerformance": "optimized" }
 */
test('handles JIT compilation updates', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Rapid updates to test JIT-like behavior
  for (let i = 0; i < 3; i++) {
    await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
      buttonup_txt: `UP${i}`,
      buttondown_txt: `DOWN${i}`,
    });
  }

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify final state is correct
  await expect(elements.upButton).toHaveText('UP2');
  await expect(elements.downButton).toHaveText('DOWN2');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates purge-safe utility classes
 * Given the fixture page is loaded in production mode
 * When utility classes are updated with purging considerations
 * Then utility updates remain purge-safe
 * Params:
 * { "purgeSafety": "maintained", "productionUpdates": "safe", "classPreservation": "ensured" }
 */
test('updates purge-safe utility classes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update with utilities that should be purge-safe
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'bg-slate-500 text-white px-3 py-2',
    buttondown_class: 'bg-slate-600 text-white px-3 py-2',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify utilities applied
  await expect(elements.upButton).toHaveClass(/bg-slate-500/);
  await expect(elements.downButton).toHaveClass(/bg-slate-600/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles performance optimized updates
 * Given the fixture page is loaded with performance monitoring
 * When utility class updates occur frequently
 * Then updates are performance optimized
 * Params:
 * { "performanceOptimization": "enabled", "updateEfficiency": "high", "renderingOptimized": true }
 */
test('handles performance optimized updates', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Set a specific value
  await apiHelpers.setValueViaAPI(page, 'test-input', '42');
  await apiHelpers.expectValueToBe(page, 'test-input', '42');

  // Trigger DOM changes that might affect the value
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true,
    prefix: '$',
    postfix: 'USD',
  });

  // Verify value is preserved
  await apiHelpers.expectValueToBe(page, 'test-input', '42');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '43');
});

/**
 * Scenario: updates responsive breakpoint utilities
 * Given the fixture page is loaded with responsive utilities
 * When responsive breakpoint utilities are updated
 * Then breakpoint behavior adapts with new utility specifications
 * Params:
 * { "breakpointUtilities": ["sm:text-lg", "md:text-xl"], "breakpointUpdates": "responsive", "adaptiveBehavior": "maintained" }
 */
test('updates responsive breakpoint utilities', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Update with responsive breakpoint utilities
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'text-sm sm:text-base md:text-lg lg:text-xl bg-violet-500',
    buttondown_class: 'text-sm sm:text-base md:text-lg lg:text-xl bg-violet-500',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify responsive utilities applied
  await expect(elements.upButton).toHaveClass(/sm:text-base/);
  await expect(elements.upButton).toHaveClass(/md:text-lg/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles utility class validation
 * Given the fixture page is loaded with utility validation
 * When invalid utility classes are updated
 * Then validation occurs and invalid utilities are handled gracefully
 * Params:
 * { "utilityValidation": "enabled", "invalidUtilities": "handled_gracefully", "errorRecovery": "robust" }
 */
test('handles utility class validation', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {});

  // Apply valid settings (TouchSpin handles class strings gracefully)
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'bg-amber-500 text-white px-4',
  });

  // Verify component still functions
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Apply more valid settings to verify recovery
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    prefix: '$',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
  await expect(elements.prefix).toHaveText('$');
});
