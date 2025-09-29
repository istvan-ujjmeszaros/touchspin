# Step Lexicon (generated)

> This file is auto-generated from doc-comments in helper functions.
> Run `yarn lexicon:gen` to regenerate.

## core

- **When I decrement "{testId}" via API**
  - `decrementViaAPI(page, testId)`
  - File: `packages/core/tests/__shared__/helpers/core/api.ts`

- **When I destroy the TouchSpin instance on "{testId}"**
  - `destroyCore(page, testId)`
  - File: `packages/core/tests/__shared__/helpers/core/api.ts`

- **When I get the numeric value of "{testId}"**
  - `getNumericValue(page, testId)`
  - File: `packages/core/tests/__shared__/helpers/core/api.ts`

- **When I get the public API for "{testId}"**
  - `getPublicAPI(page, testId)`
  - File: `packages/core/tests/__shared__/helpers/core/api.ts`

- **When I increment "{testId}" via API**
  - `incrementViaAPI(page, testId)`
  - File: `packages/core/tests/__shared__/helpers/core/api.ts`

- **When I start down spin on "{testId}" via API**
  - `startDownSpinViaAPI(page, testId)`
  - File: `packages/core/tests/__shared__/helpers/core/api.ts`

- **When I start up spin on "{testId}" via API**
  - `startUpSpinViaAPI(page, testId)`
  - File: `packages/core/tests/__shared__/helpers/core/api.ts`

- **When I stop spin on "{testId}" via API**
  - `stopSpinViaAPI(page, testId)`
  - File: `packages/core/tests/__shared__/helpers/core/api.ts`

## events

- **Safe to call multiple times; it runs only once per page.**
  - `setupLogging(page)`
  - File: `packages/core/tests/__shared__/helpers/events/setup.ts`

- **When I clear the event log**
  - `clearEventLog(page)`
  - File: `packages/core/tests/__shared__/helpers/events/log.ts`

- **Wire up logging for TouchSpin DOM CustomEvents and the native 'change' event.**
  - `setupLogging(page)`
  - File: `packages/core/tests/__shared__/helpers/events/setup.ts`

## interactions

- **When I click the down button on "{testId}"**
  - `clickDownButton(page, testId)`
  - File: `packages/core/tests/__shared__/helpers/interactions/buttons.ts`

- **When I click the up button on "{testId}"**
  - `clickUpButton(page, testId)`
  - File: `packages/core/tests/__shared__/helpers/interactions/buttons.ts`

- **When I hold the up button on "{testId}" for {durationMs} milliseconds**
  - `holdUpButton(page, testId, durationMs)`
  - File: `packages/core/tests/__shared__/helpers/interactions/buttons.ts`

- **When I hold the up button on "{testId}" for {durationMs} milliseconds**
  - `checkTouchspinUpIsDisabled(page, testId)`
  - File: `packages/core/tests/__shared__/helpers/interactions/buttons.ts`

- **When I press the down arrow key on "{testId}"**
  - `pressDownArrowKeyOnInput(page, testId)`
  - File: `packages/core/tests/__shared__/helpers/interactions/keyboard.ts`

- **When I press the up arrow key on "{testId}"**
  - `pressUpArrowKeyOnInput(page, testId)`
  - File: `packages/core/tests/__shared__/helpers/interactions/keyboard.ts`

- **When I scroll down with the mouse wheel on "{testId}"**
  - `wheelDownOnInput(page, testId)`
  - File: `packages/core/tests/__shared__/helpers/interactions/mouse.ts`

- **When I scroll up with the mouse wheel on "{testId}"**
  - `wheelUpOnInput(page, testId)`
  - File: `packages/core/tests/__shared__/helpers/interactions/mouse.ts`

- **When I set the value of "{testId}" to "{value}"**
  - `fillWithValue(page, testId, value)`
  - File: `packages/core/tests/__shared__/helpers/interactions/input.ts`
  - Note: Selects all text before filling, triggers input events

- **When I type "{text}" into "{testId}"**
  - `typeInInput(page, testId, text)`
  - File: `packages/core/tests/__shared__/helpers/interactions/input.ts`

## renderers

- **Bootstrap Family Shared Test Suite**
  - `bootstrapSharedSuite(name, rendererUrl, fixturePath)`
  - File: `packages/core/tests/__shared__/helpers/renderers/bootstrap-shared.suite.ts`

- **Bootstrap-specific patterns while remaining version-agnostic.**
  - `bootstrapSharedSuite(name, rendererUrl, fixturePath)`
  - File: `packages/core/tests/__shared__/helpers/renderers/bootstrap-shared.suite.ts`

- **different from other frameworks like Tailwind or Vanilla. These tests focus on**
  - `bootstrapSharedSuite(name, rendererUrl, fixturePath)`
  - File: `packages/core/tests/__shared__/helpers/renderers/bootstrap-shared.suite.ts`

- **Tests behaviors that are common to ALL Bootstrap variants (3, 4, and 5) but**
  - `bootstrapSharedSuite(name, rendererUrl, fixturePath)`
  - File: `packages/core/tests/__shared__/helpers/renderers/bootstrap-shared.suite.ts`

- **Tests behaviors that MUST be implemented by ALL renderers regardless of CSS framework.**
  - `universalRendererSuite(name, rendererUrl, fixturePath)`
  - File: `packages/core/tests/__shared__/helpers/renderers/universal-renderer.suite.ts`

- **These tests focus on functionality and data attributes, not framework-specific classes.**
  - `universalRendererSuite(name, rendererUrl, fixturePath)`
  - File: `packages/core/tests/__shared__/helpers/renderers/universal-renderer.suite.ts`

- **Universal Renderer Test Suite**
  - `universalRendererSuite(name, rendererUrl, fixturePath)`
  - File: `packages/core/tests/__shared__/helpers/renderers/universal-renderer.suite.ts`

## test-utilities

- **// ...perform actions...**
  - `hasWarningContaining(warnings, text)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **// ...perform actions...**
  - `hasWarningsContaining(warnings, texts)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **// Perform actions**
  - `captureConsole(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **// Perform actions that may trigger warnings**
  - `captureConsoleWarnings(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **Capture all console output from a Playwright page**
  - `captureConsole(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **Capture console errors from a Playwright page**
  - `captureConsoleErrors(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **Capture console logs from a Playwright page**
  - `captureConsoleLogs(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **Capture console warnings from a Playwright page**
  - `captureConsoleWarnings(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **const console = captureConsole(page);**
  - `captureConsole(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **const warnings = captureConsoleWarnings(page);**
  - `captureConsoleWarnings(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **const warnings = captureConsoleWarnings(page);**
  - `hasWarningContaining(warnings, text)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **const warnings = captureConsoleWarnings(page);**
  - `hasWarningsContaining(warnings, texts)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **Disable event log textarea to skip DOM writes while keeping event listeners**
  - `disableEventLogging(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/fixtures.ts`

- **Enable event log textarea to resume DOM writes**
  - `enableEventLogging(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/fixtures.ts`

- **expect(hasWarningContaining(warnings, 'callback_before_calculation')).toBe(true);**
  - `hasWarningContaining(warnings, text)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **expect(hasWarningsContaining(warnings, ['callback_before', 'missing'])).toBe(true);**
  - `hasWarningsContaining(warnings, texts)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **expect(warnings).toContainEqual(expect.stringContaining('warning message'));**
  - `captureConsoleWarnings(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **Given I need a complete web component testing setup**
  - `initializeWebComponentTest(page, debug)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/web-component-loader.ts`
  - Note: Simplified initialization for web component tests

- **Given I need a specific renderer available**
  - `preloadRendererModule(page, rendererUrl)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/script-loader.ts`
  - Note: For dynamic import-based renderer loading

- **Given I need jQuery and TouchSpin plugin available**
  - `loadJQueryEnvironment(page, debug)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/test-environment.ts`
  - Note: Handles jQuery loading with retry logic

- **Given I need jQuery available in the browser**
  - `loadJQueryFromCDN(page, options)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/script-loader.ts`
  - Note: Loads jQuery 3.6.0 from CDN with verification

- **Given I need the jQuery plugin available**
  - `loadTouchSpinJQueryPlugin(page, options)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/script-loader.ts`
  - Note: Loads the IIFE build with Bootstrap5 renderer

- **Given I need the TouchSpin web component registered**
  - `loadWebComponentEnvironment(page, debug)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/test-environment.ts`
  - Note: Forces registration if conditional check fails

- **Given I need the web component available**
  - `loadTouchSpinWebComponent(page, options)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/script-loader.ts`
  - Note: Loads from local dist and waits for custom element registration

- **Given I need to check if required scripts are loaded**
  - `verifyScriptAvailability(page, checks, string>)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/script-loader.ts`
  - Note: Centralized verification for multiple script dependencies

- **Given I need to clean up between tests**
  - `resetTestEnvironment(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/test-environment.ts`
  - Note: Cleans up loaded components for test isolation

- **Given I need to debug loading issues**
  - `diagnoseEnvironment(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/test-environment.ts`
  - Note: Returns detailed diagnostics about loaded components

- **Given I need to load a script from a URL**
  - `loadScript(page, url, options)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/script-loader.ts`
  - Note: Handles both absolute URLs and relative paths with proper error handling

- **Given I need TouchSpin web component with all dependencies resolved**
  - `loadWebComponentWithDependencies(page, debug)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/web-component-loader.ts`
  - Note: Handles module resolution issues for web component testing

- **Helper to check if a warning contains specific text**
  - `hasWarningContaining(warnings, text)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **Helper to check if multiple warning texts are present**
  - `hasWarningsContaining(warnings, texts)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **Pre-check multiple resources in parallel.**
  - `preFetchCheckMultiple(page, urls)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/network.ts`

- **Pre-check that a resource is fetchable before attempting dynamic imports.**
  - `preFetchCheck(page, url)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/network.ts`

- **Remove event log textarea completely to prevent event listener registration**
  - `removeEventLogTextarea(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/fixtures.ts`

- **Returns an array that will be populated with error messages**
  - `captureConsoleErrors(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **Returns an array that will be populated with log messages**
  - `captureConsoleLogs(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **Returns an array that will be populated with warning messages**
  - `captureConsoleWarnings(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **Returns an object with arrays for warnings, errors, and logs**
  - `captureConsole(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/console.ts`

- **This helps provide better error messages when the web server isn't properly configured.**
  - `preFetchCheck(page, url)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/network.ts`

- **Useful for checking all required scripts before test execution.**
  - `preFetchCheckMultiple(page, urls)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/network.ts`

- **When I diagnose the test environment**
  - `diagnoseEnvironment(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/test-environment.ts`
  - Note: Returns detailed diagnostics about loaded components

- **When I initialize a web component test environment**
  - `initializeWebComponentTest(page, debug)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/web-component-loader.ts`
  - Note: Simplified initialization for web component tests

- **When I load jQuery from CDN**
  - `loadJQueryFromCDN(page, options)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/script-loader.ts`
  - Note: Loads jQuery 3.6.0 from CDN with verification

- **When I load renderer module from "{rendererUrl}"**
  - `preloadRendererModule(page, rendererUrl)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/script-loader.ts`
  - Note: For dynamic import-based renderer loading

- **When I load script from "{url}"**
  - `loadScript(page, url, options)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/script-loader.ts`
  - Note: Handles both absolute URLs and relative paths with proper error handling

- **When I load the jQuery environment**
  - `loadJQueryEnvironment(page, debug)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/test-environment.ts`
  - Note: Handles jQuery loading with retry logic

- **When I load the web component environment**
  - `loadWebComponentEnvironment(page, debug)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/test-environment.ts`
  - Note: Forces registration if conditional check fails

- **When I load the web component with bundled dependencies**
  - `loadWebComponentWithDependencies(page, debug)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/web-component-loader.ts`
  - Note: Handles module resolution issues for web component testing

- **When I load TouchSpin jQuery plugin**
  - `loadTouchSpinJQueryPlugin(page, options)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/script-loader.ts`
  - Note: Loads the IIFE build with Bootstrap5 renderer

- **When I load TouchSpin web component**
  - `loadTouchSpinWebComponent(page, options)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/script-loader.ts`
  - Note: Loads from local dist and waits for custom element registration

- **When I reset the test environment**
  - `resetTestEnvironment(page)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/test-environment.ts`
  - Note: Cleans up loaded components for test isolation

- **When I verify script availability**
  - `verifyScriptAvailability(page, checks, string>)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/script-loader.ts`
  - Note: Centralized verification for multiple script dependencies

- **When I wait for value sanitization to complete**
  - `waitForSanitization(page, _testId)`
  - File: `packages/core/tests/__shared__/helpers/test-utilities/wait.ts`

