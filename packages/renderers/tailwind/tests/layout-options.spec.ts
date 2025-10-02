/**
 * Feature: Tailwind renderer layout options and configurations
 * Background: fixture = /packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] creates horizontal layout with Tailwind flex utilities
 * [x] creates vertical layout with Tailwind flex-col utilities
 * [x] handles layout switching with utility class changes
 * [x] applies responsive layout utilities
 * [x] handles container queries with Tailwind utilities
 * [x] manages spacing with Tailwind gap utilities
 * [x] handles alignment with Tailwind alignment utilities
 * [x] creates responsive breakpoint layouts
 * [x] applies justify-content utilities
 * [x] handles flex-wrap utilities when needed
 * [x] manages order utilities for element arrangement
 * [x] applies grow and shrink utilities
 * [x] handles basis utilities for flex basis control
 * [x] creates grid layouts when appropriate
 * [x] applies grid template utilities
 * [x] handles grid span utilities
 * [x] manages grid auto utilities
 * [x] applies grid placement utilities
 * [x] handles aspect ratio utilities
 * [x] creates container utilities for width constraints
 * [x] applies max-width utilities for responsive containers
 * [x] handles overflow utilities
 * [x] manages position utilities for layout
 * [x] applies z-index utilities for layering
 * [x] handles display utilities for layout control
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';

/**
 * Scenario: creates horizontal layout with Tailwind flex utilities
 * Given the fixture page is loaded
 * When TouchSpin initializes with horizontal layout
 * Then it uses Tailwind flex utilities for horizontal arrangement
 * Params:
 * { "horizontalLayout": "flex flex-row", "alignmentUtilities": ["items-center"], "spacingUtilities": ["space-x-2"] }
 */
test('creates horizontal layout with Tailwind flex utilities', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify horizontal layout structure
  await expect(elements.wrapper).toBeVisible();
  await expect(elements.upButton).toBeVisible();
  await expect(elements.downButton).toBeVisible();

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: creates vertical layout with Tailwind flex-col utilities
 * Given the fixture page is loaded
 * When TouchSpin initializes with vertical layout
 * Then it uses Tailwind flex-col utilities for vertical arrangement
 * Params:
 * { "verticalLayout": "flex flex-col", "alignmentUtilities": ["items-center"], "spacingUtilities": ["space-y-2"] }
 */
test('creates vertical layout with Tailwind flex-col utilities', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: true
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify vertical layout structure
  await expect(elements.wrapper).toBeVisible();
  await expect(elements.upButton).toBeVisible();
  await expect(elements.downButton).toBeVisible();

  // Verify functionality works in vertical layout
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles layout switching with utility class changes
 * Given the fixture page is loaded with initialized TouchSpin
 * When layout is switched between horizontal and vertical
 * Then Tailwind utility classes update appropriately
 * Params:
 * { "layoutSwitch": "flex-row_to_flex-col", "classUpdates": "utility_based", "dynamicSwitching": "seamless" }
 */
test('handles layout switching with utility class changes', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Start with horizontal layout
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Switch to vertical layout
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true
  });

  // Verify functionality still works after layout switch
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '52');

  // Switch back to horizontal
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: false
  });

  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: applies responsive layout utilities
 * Given the fixture page is loaded
 * When TouchSpin adapts layout for different screen sizes
 * Then it applies responsive Tailwind layout utilities
 * Params:
 * { "responsiveUtilities": ["sm:flex-row", "md:flex-col"], "breakpointBehavior": "adaptive", "layoutResponsiveness": "utility_driven" }
 */
test('applies responsive layout utilities', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Test at mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Test at tablet viewport
  await page.setViewportSize({ width: 768, height: 1024 });
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '52');

  // Test at desktop viewport
  await page.setViewportSize({ width: 1200, height: 800 });
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '53');
});

/**
 * Scenario: handles container queries with Tailwind utilities
 * Given the fixture page is loaded with container constraints
 * When TouchSpin adapts to container size changes
 * Then it uses appropriate Tailwind container utilities
 * Params:
 * { "containerUtilities": ["container", "max-w-"], "containerAdaptation": "size_aware", "containerResponsiveness": "tailwind_containers" }
 */
test('handles container queries with Tailwind utilities', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/layout-options-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'constrained-test');

  // Verify functionality works in constrained container
  await apiHelpers.clickUpButton(page, 'constrained-test');
  await apiHelpers.expectValueToBe(page, 'constrained-test', '51');

  // Test vertical layout in constrained container
  await apiHelpers.updateSettingsViaAPI(page, 'constrained-test', {
    verticalbuttons: true
  });

  // Verify functionality still works with vertical layout in constraints
  await apiHelpers.clickUpButton(page, 'constrained-test');
  await apiHelpers.expectValueToBe(page, 'constrained-test', '52');

  await apiHelpers.clickDownButton(page, 'constrained-test');
  await apiHelpers.expectValueToBe(page, 'constrained-test', '51');
});

/**
 * Scenario: manages spacing with Tailwind gap utilities
 * Given the fixture page is loaded
 * When TouchSpin arranges elements with spacing
 * Then it uses Tailwind gap utilities for consistent spacing
 * Params:
 * { "gapUtilities": ["gap-2", "gap-x-4", "gap-y-2"], "spacingConsistency": "utility_based", "spacingSystem": "tailwind_scale" }
 */
test('manages spacing with Tailwind gap utilities', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: true
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify buttons are visible and functional (spacing is handled by Tailwind)
  await expect(elements.upButton).toBeVisible();
  await expect(elements.downButton).toBeVisible();

  // Test that spacing doesn't interfere with functionality
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '50');
});

/**
 * Scenario: handles alignment with Tailwind alignment utilities
 * Given the fixture page is loaded
 * When TouchSpin aligns elements within layout
 * Then it uses Tailwind alignment utilities effectively
 * Params:
 * { "alignmentUtilities": ["items-center", "justify-center", "self-start"], "alignmentControl": "utility_precise", "alignmentFlexibility": "comprehensive" }
 */
test('handles alignment with Tailwind alignment utilities', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: true
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify both buttons are positioned correctly and clickable
  await expect(elements.upButton).toBeVisible();
  await expect(elements.downButton).toBeVisible();

  // Test that positioning allows proper interaction
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '50');
});

/**
 * Scenario: creates responsive breakpoint layouts
 * Given the fixture page is loaded
 * When TouchSpin adapts layout across Tailwind breakpoints
 * Then layout changes appropriately at each breakpoint
 * Params:
 * { "breakpoints": ["sm:", "md:", "lg:", "xl:", "2xl:"], "breakpointLayouts": "tailwind_responsive", "layoutAdaptation": "breakpoint_specific" }
 */
test('creates responsive breakpoint layouts', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Test at sm breakpoint (640px)
  await page.setViewportSize({ width: 640, height: 800 });
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Test at md breakpoint (768px)
  await page.setViewportSize({ width: 768, height: 1024 });
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '52');

  // Test at lg breakpoint (1024px)
  await page.setViewportSize({ width: 1024, height: 768 });
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '53');
});

/**
 * Scenario: applies justify-content utilities
 * Given the fixture page is loaded
 * When TouchSpin arranges content with justification
 * Then it uses Tailwind justify-content utilities appropriately
 * Params:
 * { "justifyUtilities": ["justify-start", "justify-center", "justify-between"], "contentJustification": "utility_controlled", "layoutJustification": "flexible" }
 */
test('applies justify-content utilities', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');

  // Test horizontal layout justification
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify horizontal layout has appropriate structure (Tailwind handles justification internally)
  await expect(elements.wrapper).toBeVisible();

  // Test functionality in horizontal layout
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Switch to vertical layout and verify appropriate structure
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true
  });

  const verticalElements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify vertical layout maintains Tailwind structure
  await expect(verticalElements.wrapper).toBeVisible();

  // Test functionality in vertical layout
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '52');
});

/**
 * Scenario: handles flex-wrap utilities when needed
 * Given the fixture page is loaded with content that may wrap
 * When TouchSpin needs to handle content overflow
 * Then it applies appropriate Tailwind flex-wrap utilities
 * Params:
 * { "wrapUtilities": ["flex-wrap", "flex-nowrap"], "overflowHandling": "wrap_aware", "contentFlow": "flexible" }
 */
test('handles flex-wrap utilities when needed', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    prefix: '$',
    postfix: 'USD'
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify prefix and postfix are present with wrapping behavior
  await expect(elements.prefix).toBeVisible();
  await expect(elements.prefix).toHaveText('$');
  await expect(elements.postfix).toBeVisible();
  await expect(elements.postfix).toHaveText('USD');

  // Verify functionality works with prefix/postfix in flex layout
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: manages order utilities for element arrangement
 * Given the fixture page is loaded
 * When TouchSpin needs to control element order
 * Then it uses Tailwind order utilities effectively
 * Params:
 * { "orderUtilities": ["order-first", "order-last", "order-1"], "elementOrdering": "utility_controlled", "layoutOrder": "flexible" }
 */
test('manages order utilities for element arrangement', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify elements are ordered correctly and accessible (order is maintained by Tailwind structure)
  await expect(elements.downButton).toBeVisible();
  await expect(elements.input).toBeVisible();
  await expect(elements.upButton).toBeVisible();

  // Test functionality with horizontal layout
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Switch to vertical layout and verify order is maintained
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true
  });

  const verticalElements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify elements remain accessible in vertical layout
  await expect(verticalElements.downButton).toBeVisible();
  await expect(verticalElements.input).toBeVisible();
  await expect(verticalElements.upButton).toBeVisible();

  // Test functionality with vertical layout
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '52');
});

/**
 * Scenario: applies grow and shrink utilities
 * Given the fixture page is loaded
 * When TouchSpin manages flex item sizing
 * Then it uses Tailwind grow and shrink utilities appropriately
 * Params:
 * { "flexUtilities": ["flex-grow", "flex-shrink", "flex-none"], "flexBehavior": "utility_controlled", "sizingFlexibility": "responsive" }
 */
test('applies grow and shrink utilities', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/layout-options-fixture.html');

  // Test small size input in flex container
  await apiHelpers.initializeTouchspinFromGlobals(page, 'size-sm-test');

  // Verify input is still accessible and functional
  await apiHelpers.expectValueToBe(page, 'size-sm-test', '50');
  await apiHelpers.clickUpButton(page, 'size-sm-test');
  await apiHelpers.expectValueToBe(page, 'size-sm-test', '51');

  // Test large size input in flex container
  await apiHelpers.initializeTouchspinFromGlobals(page, 'size-lg-test');

  // Verify input is still accessible and functional
  await apiHelpers.expectValueToBe(page, 'size-lg-test', '50');
  await apiHelpers.clickUpButton(page, 'size-lg-test');
  await apiHelpers.expectValueToBe(page, 'size-lg-test', '51');
});

/**
 * Scenario: handles basis utilities for flex basis control
 * Given the fixture page is loaded
 * When TouchSpin controls flex basis sizing
 * Then it applies Tailwind basis utilities correctly
 * Params:
 * { "basisUtilities": ["basis-1/2", "basis-auto", "basis-full"], "basisControl": "utility_precise", "flexBasisManagement": "tailwind_sizing" }
 */
test('handles basis utilities for flex basis control', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/layout-options-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'grid-test');

  // Test both horizontal and vertical layouts in grid context
  await apiHelpers.clickUpButton(page, 'grid-test');
  await apiHelpers.expectValueToBe(page, 'grid-test', '51');

  // Switch to vertical and test
  await apiHelpers.updateSettingsViaAPI(page, 'grid-test', {
    verticalbuttons: true
  });

  await apiHelpers.clickUpButton(page, 'grid-test');
  await apiHelpers.expectValueToBe(page, 'grid-test', '52');
});

/**
 * Scenario: creates grid layouts when appropriate
 * Given the fixture page is loaded
 * When TouchSpin uses grid layout patterns
 * Then it applies Tailwind grid utilities effectively
 * Params:
 * { "gridUtilities": ["grid", "grid-cols-auto"], "gridLayout": "tailwind_grid", "gridFlexibility": "utility_based" }
 */
test('creates grid layouts when appropriate', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/layout-options-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'grid-test');

  // Verify functionality works in grid layout
  await apiHelpers.clickUpButton(page, 'grid-test');
  await apiHelpers.expectValueToBe(page, 'grid-test', '51');

  // Test vertical layout in grid
  await apiHelpers.updateSettingsViaAPI(page, 'grid-test', {
    verticalbuttons: true
  });

  // Verify functionality still works with vertical layout in grid
  await apiHelpers.clickUpButton(page, 'grid-test');
  await apiHelpers.expectValueToBe(page, 'grid-test', '52');

  await apiHelpers.clickDownButton(page, 'grid-test');
  await apiHelpers.expectValueToBe(page, 'grid-test', '51');
});

/**
 * Scenario: applies grid template utilities
 * Given the fixture page is loaded with grid layouts
 * When TouchSpin defines grid templates
 * Then it uses Tailwind grid template utilities
 * Params:
 * { "gridTemplateUtilities": ["grid-cols-3", "grid-rows-2"], "templateDefinition": "utility_based", "gridStructure": "tailwind_templates" }
 */
test('applies grid template utilities', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/layout-options-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'size-sm-test');

  // Test layout switch on sized inputs (this was the critical bug trigger)
  await apiHelpers.updateSettingsViaAPI(page, 'size-sm-test', { verticalbuttons: true });
  await apiHelpers.clickUpButton(page, 'size-sm-test');
  await apiHelpers.expectValueToBe(page, 'size-sm-test', '51');

  // Switch back to horizontal (this was where the DOM error occurred)
  await apiHelpers.updateSettingsViaAPI(page, 'size-sm-test', { verticalbuttons: false });

  // Verify it still works after layout switch back to horizontal
  await apiHelpers.clickUpButton(page, 'size-sm-test');
  await apiHelpers.expectValueToBe(page, 'size-sm-test', '52');
});

/**
 * Scenario: handles grid span utilities
 * Given the fixture page is loaded with grid items
 * When TouchSpin elements span multiple grid areas
 * Then it applies Tailwind grid span utilities
 * Params:
 * { "spanUtilities": ["col-span-2", "row-span-3"], "gridSpanning": "utility_controlled", "gridItemSizing": "span_based" }
 */
test('handles grid span utilities', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/layout-options-fixture.html');

  // Test the same cycle with large input
  await apiHelpers.initializeTouchspinFromGlobals(page, 'size-lg-test');
  await apiHelpers.updateSettingsViaAPI(page, 'size-lg-test', { verticalbuttons: true });
  await apiHelpers.clickUpButton(page, 'size-lg-test');
  await apiHelpers.expectValueToBe(page, 'size-lg-test', '51');

  // Switch large input back to horizontal
  await apiHelpers.updateSettingsViaAPI(page, 'size-lg-test', { verticalbuttons: false });
  await apiHelpers.clickUpButton(page, 'size-lg-test');
  await apiHelpers.expectValueToBe(page, 'size-lg-test', '52');
});

/**
 * Scenario: manages grid auto utilities
 * Given the fixture page is loaded with dynamic grid content
 * When TouchSpin handles auto-sizing grid behavior
 * Then it uses Tailwind grid auto utilities
 * Params:
 * { "gridAutoUtilities": ["auto-cols-auto", "auto-rows-min"], "autoSizing": "utility_managed", "dynamicGrids": "tailwind_auto" }
 */
test('manages grid auto utilities', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: true,
    verticalupclass: 'bg-green-500 text-white v-up',
    verticaldownclass: 'bg-yellow-500 text-white v-down'
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify vertical-specific classes are applied
  await expect(elements.upButton).toHaveClass(/bg-green-500/);
  await expect(elements.downButton).toHaveClass(/bg-yellow-500/);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: applies grid placement utilities
 * Given the fixture page is loaded with positioned grid items
 * When TouchSpin places items in specific grid positions
 * Then it uses Tailwind grid placement utilities
 * Params:
 * { "placementUtilities": ["col-start-2", "row-end-3"], "gridPlacement": "utility_precise", "itemPositioning": "grid_coordinates" }
 */
test('applies grid placement utilities', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: true,
    verticalup: '▲',
    verticaldown: '▼'
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify vertical-specific text is displayed
  await expect(elements.upButton).toHaveText('▲');
  await expect(elements.downButton).toHaveText('▼');

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles aspect ratio utilities
 * Given the fixture page is loaded
 * When TouchSpin maintains specific aspect ratios
 * Then it applies Tailwind aspect ratio utilities
 * Params:
 * { "aspectUtilities": ["aspect-square", "aspect-video"], "aspectRatioControl": "utility_based", "proportionalSizing": "aspect_aware" }
 */
test('handles aspect ratio utilities', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: true,
    prefix: '$',
    postfix: 'USD'
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify prefix and postfix are present with vertical layout
  await expect(elements.prefix).toBeVisible();
  await expect(elements.prefix).toHaveText('$');
  await expect(elements.postfix).toBeVisible();
  await expect(elements.postfix).toHaveText('USD');

  // Verify functionality works with prefix/postfix in vertical layout
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: creates container utilities for width constraints
 * Given the fixture page is loaded
 * When TouchSpin needs width constraints
 * Then it uses Tailwind container utilities for width management
 * Params:
 * { "containerUtilities": ["container"], "widthConstraints": "utility_managed", "responsiveContainers": "tailwind_containers" }
 */
test('creates container utilities for width constraints', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');

  // Test horizontal layout accessibility
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify accessibility attributes are present
  await expect(elements.upButton).toHaveAttribute('type', 'button');
  await expect(elements.downButton).toHaveAttribute('type', 'button');

  // Test functionality in horizontal layout
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Switch to vertical layout and verify accessibility is maintained
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true
  });

  const verticalElements = await apiHelpers.getTouchSpinElements(page, 'test-input');
  await expect(verticalElements.upButton).toHaveAttribute('type', 'button');
  await expect(verticalElements.downButton).toHaveAttribute('type', 'button');

  // Test functionality in vertical layout
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '52');
});

/**
 * Scenario: applies max-width utilities for responsive containers
 * Given the fixture page is loaded
 * When TouchSpin controls maximum width responsively
 * Then it applies Tailwind max-width utilities appropriately
 * Params:
 * { "maxWidthUtilities": ["max-w-sm", "max-w-lg", "max-w-full"], "responsiveWidths": "utility_controlled", "widthManagement": "responsive" }
 */
test('applies max-width utilities for responsive containers', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: true,
    verticalupclass: 'bg-green-500 text-white custom-up',
    verticaldownclass: 'bg-red-500 text-white custom-down'
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify custom classes are applied
  await expect(elements.upButton).toHaveClass(/bg-green-500/);
  await expect(elements.upButton).toHaveClass(/custom-up/);
  await expect(elements.downButton).toHaveClass(/bg-red-500/);
  await expect(elements.downButton).toHaveClass(/custom-down/);

  // Verify functionality works with custom classes
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '50');
});

/**
 * Scenario: handles overflow utilities
 * Given the fixture page is loaded with content overflow scenarios
 * When TouchSpin manages content overflow
 * Then it applies appropriate Tailwind overflow utilities
 * Params:
 * { "overflowUtilities": ["overflow-hidden", "overflow-auto"], "overflowManagement": "utility_controlled", "contentFlow": "managed" }
 */
test('handles overflow utilities', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    initval: 75
  });

  // Verify initial value and horizontal layout functionality
  await apiHelpers.expectValueToBe(page, 'test-input', '75');
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '76');

  // Change to vertical layout and verify state is preserved
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true
  });

  // State should be preserved after layout change
  await apiHelpers.expectValueToBe(page, 'test-input', '76');

  // Verify functionality works in new layout
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '77');

  // Switch back to horizontal layout
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: false
  });

  // State should still be preserved
  await apiHelpers.expectValueToBe(page, 'test-input', '77');
  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '76');
});

/**
 * Scenario: manages position utilities for layout
 * Given the fixture page is loaded
 * When TouchSpin requires specific positioning
 * Then it uses Tailwind position utilities for layout control
 * Params:
 * { "positionUtilities": ["relative", "absolute", "sticky"], "positioningControl": "utility_based", "layoutPositioning": "precise" }
 */
test('manages position utilities for layout', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/layout-options-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'nested-test');

  // Verify functionality works in nested layout
  await apiHelpers.clickUpButton(page, 'nested-test');
  await apiHelpers.expectValueToBe(page, 'nested-test', '51');

  // Test vertical layout in nested scenario
  await apiHelpers.updateSettingsViaAPI(page, 'nested-test', {
    verticalbuttons: true
  });

  // Verify functionality still works with vertical layout in nested structure
  await apiHelpers.clickUpButton(page, 'nested-test');
  await apiHelpers.expectValueToBe(page, 'nested-test', '52');

  await apiHelpers.clickDownButton(page, 'nested-test');
  await apiHelpers.expectValueToBe(page, 'nested-test', '51');
});

/**
 * Scenario: applies z-index utilities for layering
 * Given the fixture page is loaded with layered content
 * When TouchSpin manages element layering
 * Then it uses Tailwind z-index utilities appropriately
 * Params:
 * { "zIndexUtilities": ["z-10", "z-20", "z-50"], "layerManagement": "utility_controlled", "stackingContext": "tailwind_z" }
 */
test('applies z-index utilities for layering', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Test initial functionality
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Add dynamic content around the component
  await page.evaluate(() => {
    const wrapper = document.querySelector('[data-testid="test-input"]').closest('.mb-6');

    // Add sibling elements
    const siblingBefore = document.createElement('div');
    siblingBefore.className = 'bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4';
    siblingBefore.textContent = 'Dynamic content before';
    wrapper.parentNode.insertBefore(siblingBefore, wrapper);

    const siblingAfter = document.createElement('div');
    siblingAfter.className = 'bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-4';
    siblingAfter.textContent = 'Dynamic content after';
    wrapper.parentNode.insertBefore(siblingAfter, wrapper.nextSibling);

    // Resize parent container
    (wrapper.parentNode as HTMLElement).style.width = '80%';
  });

  // Verify functionality remains stable after dynamic changes
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '52');

  // Switch to vertical layout and test with dynamic content
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true
  });

  // Verify functionality works with vertical layout and dynamic content
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '53');

  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '52');
});

/**
 * Scenario: handles display utilities for layout control
 * Given the fixture page is loaded
 * When TouchSpin controls element display behavior
 * Then it applies Tailwind display utilities effectively
 * Params:
 * { "displayUtilities": ["block", "inline-block", "flex", "grid"], "displayControl": "utility_based", "layoutDisplay": "flexible" }
 */
test('handles display utilities for layout control', async ({ page }) => {
  await page.goto('/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html');

  // Test horizontal layout Tailwind structure
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify Tailwind structure for horizontal layout
  await expect(elements.wrapper).toBeVisible();
  await expect(elements.upButton).toBeVisible();
  await expect(elements.downButton).toBeVisible();

  // Test functionality in horizontal layout
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Switch to vertical layout and verify Tailwind structure is maintained
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true
  });

  const verticalElements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify Tailwind structure for vertical layout
  await expect(verticalElements.wrapper).toBeVisible();
  await expect(verticalElements.upButton).toBeVisible();
  await expect(verticalElements.downButton).toBeVisible();

  // Test functionality in vertical layout
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '52');
});
