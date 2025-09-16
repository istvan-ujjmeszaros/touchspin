# TouchSpin Testing Guidelines

## Test Structure

### Single Input Per Test
- Each test uses a single input with `data-testid="test-input"`
- Page is reloaded in `beforeEach` for clean state
- Additional inputs can be created dynamically using `createAdditionalInput()`

### Test Fixture
- Location: `/packages/jquery-plugin/tests/html/test-fixture.html`
- Contains single input, event log textarea, and containers for dynamic content
- Event log format: `target:value event` (e.g., `test-input:50 touchspin.on.stopspin`)

## Helper Functions

### Core Helpers (`__tests__/helpers/touchspinHelpers.ts`)

#### Initialization
- `startCoverage(page)` - Start coverage collection (must be called first)
- `installJqueryPlugin(page)` - Install jQuery plugin with Bootstrap5 renderer
- `initializeTouchSpin(page, testId, options)` - Initialize TouchSpin on an input

#### Element Access
- `getTouchSpinWrapper(page, testId)` - Get the wrapper container
- `getTouchSpinElements(page, testId)` - Get all TouchSpin elements (wrapper, input, buttons, prefix, postfix)
- `hasPrefix(page, testId, expectedText?)` - Check if prefix exists and optionally verify text
- `hasPostfix(page, testId, expectedText?)` - Check if postfix exists and optionally verify text

#### Dynamic Inputs
- `createAdditionalInput(page, testId, options)` - Create additional test inputs
- `clearAdditionalInputs(page)` - Remove all dynamically created inputs

#### Value Operations
- `readInputValue(page, testId)` - Read input value
- `touchspinClickUp(page, testId)` - Click up button
- `touchspinClickDown(page, testId)` - Click down button

## Common Test Patterns

### Test Setup
```typescript
test.beforeEach(async ({ page }) => {
  await touchspinHelpers.startCoverage(page);
  await page.goto('http://localhost:8866/packages/jquery-plugin/tests/html/test-fixture.html');
  await page.waitForFunction(() => (window as any).testPageReady === true);
  await touchspinHelpers.installJqueryPlugin(page);
  await page.waitForFunction(() => (window as any).touchSpinReady === true);
});
```

### Finding TouchSpin Elements
```typescript
// Use helpers instead of manual DOM queries
const elements = await touchspinHelpers.getTouchSpinElements(page, 'test-input');
await elements.upButton.click();

// Check for prefix/postfix
const hasPrefix = await touchspinHelpers.hasPrefix(page, 'test-input', '€');
expect(hasPrefix).toBe(true);
```

### Multiple Inputs
```typescript
// Create additional inputs when needed
await touchspinHelpers.createAdditionalInput(page, 'input-2', { value: '30' });
await touchspinHelpers.initializeTouchSpin(page, 'input-2', { min: 0, max: 100 });
```

## Important Notes

### Selector Strategy
- Always use `data-testid` attributes, not IDs
- Use `[data-testid="test-input"]` selector in jQuery operations
- TouchSpin wrapper can be found via parent of input element

### Event Logging
- All TouchSpin events are automatically logged to the event log textarea
- Format: `target:value event` without timestamps
- Useful for debugging test failures in Playwright UI

### Coverage
- Tests must call `startCoverage()` before page navigation
- Coverage is collected in `afterEach` with `collectCoverage()`
- Run with `COVERAGE=1` environment variable to enable

### Common Pitfalls to Avoid
1. **Wrong expectations in spin tests**: Remember that values change during spinning
   - Get initial value before starting spin
   - Compare final value with appropriate reference point

2. **Incorrect selectors for injected elements**: Use the helper functions
   - Don't use `[data-touchspin-injected]` directly
   - Use `getTouchSpinElements()` to access buttons, prefix, postfix

3. **Timing issues**: Add small waits when needed
   - After triggering events that update DOM
   - During continuous spinning operations

4. **Test isolation**: Each test should be independent
   - Page is reloaded between tests
   - Don't rely on state from previous tests

## Running Tests

### Individual test file
```bash
yarn exec playwright test packages/jquery-plugin/tests/commands.spec.ts
```

### With coverage
```bash
COVERAGE=1 yarn exec playwright test --config=playwright-coverage.config.ts packages/jquery-plugin/tests/
```

### With UI for debugging
```bash
yarn exec playwright test --ui packages/jquery-plugin/tests/
```

### Headed mode (see browser)
```bash
yarn exec playwright test --headed packages/jquery-plugin/tests/
```