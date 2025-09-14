# Bootstrap TouchSpin

[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa)](https://github.com/sponsors/istvan-ujjmeszaros)
[![run-tests](https://github.com/istvan-ujjmeszaros/bootstrap-touchspin/actions/workflows/run-tests.yml/badge.svg)](https://github.com/istvan-ujjmeszaros/bootstrap-touchspin/actions/workflows/run-tests.yml)
[![npm version](https://img.shields.io/npm/v/bootstrap-touchspin)](https://www.npmjs.com/package/bootstrap-touchspin)
[![npm downloads](https://img.shields.io/npm/dm/bootstrap-touchspin)](https://www.npmjs.com/package/bootstrap-touchspin)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**A mobile and touch friendly input spinner component for Bootstrap 3, 4 & 5.**

TouchSpin is a mobile-first JavaScript library with a modern renderer-based architecture that transforms number inputs into spinner controls with increment/decrement buttons for touch interfaces and desktop environments. Available as both a framework-agnostic core and a jQuery plugin wrapper that is fully compatible with the original Bootstrap TouchSpin library.

**[Live Demo & Documentation](https://www.virtuosoft.eu/code/bootstrap-touchspin/)**

---

## Key Features

- **Modern Renderer Architecture** - Modular, framework-agnostic core with pluggable renderers
- **Mobile-First Design** - Designed for touch interfaces and mobile devices
- **Bootstrap 3/4/5 Support** - Dedicated renderers for each Bootstrap version
- **Framework Agnostic** - Works with or without jQuery, ready for React/Vue/Angular
- **Standard HTML Controls** - Uses semantic button and input elements
- **RTL Language Support** - Full right-to-left language compatibility
- **Lightweight & Fast** - Minimal footprint with targeted builds
- **Customizable** - Multiple configuration options and renderer flexibility
- **Decimal Precision** - Support for floating-point numbers
- **Booster Mode** - Accelerated value changes for large ranges
- **Event System** - Programmatic event handling with blur-based sanitization
- **Vertical Layout** - Alternative button arrangement
- **ARIA Support** - Automatic accessibility attributes for screen readers

---

## Quick Start

### File Installation (Recommended)

Choose the build that matches your Bootstrap version:

```html
<!-- Bootstrap 3 -->
<link rel="stylesheet" href="dist/jquery.bootstrap-touchspin.min.css">
<script src="dist/jquery.bootstrap-touchspin-bs3.min.js"></script>

<!-- Bootstrap 4 -->
<link rel="stylesheet" href="dist/jquery.bootstrap-touchspin.min.css">
<script src="dist/jquery.bootstrap-touchspin-bs4.min.js"></script>

<!-- Bootstrap 5 -->
<link rel="stylesheet" href="dist/jquery.bootstrap-touchspin.min.css">
<script src="dist/jquery.bootstrap-touchspin-bs5.min.js"></script>
```

### Package Manager Installation

```bash
# npm
yarn add bootstrap-touchspin

# bower
bower install bootstrap-touchspin
```

### Basic Usage

```html
<input type="number" id="quantity" name="quantity" value="5">

<script>
  $('#quantity').TouchSpin({
    min: 1,
    max: 100,
    step: 1,
    boostat: 5,
    maxboostedstep: 10,
    postfix: '%'
  });
</script>
```

---

## Usage Examples

### Basic Number Spinner

```html
<input type="number" id="basic-spinner" value="50">

<script>
  $('#basic-spinner').TouchSpin({
    min: 0,
    max: 100,
    step: 5
  });
</script>
```

### Decimal Precision

```html
<input type="number" id="decimal-spinner" value="10.50">

<script>
  $('#decimal-spinner').TouchSpin({
    min: 0,
    max: 1000,
    step: 0.25,
    decimals: 2,
    prefix: '$'
  });
</script>
```

### Vertical Button Layout

```html
<input type="number" id="vertical-spinner" value="5">

<script>
  $('#vertical-spinner').TouchSpin({
    verticalbuttons: true,
    verticalup: '<i class="fa fa-plus"></i>',
    verticaldown: '<i class="fa fa-minus"></i>',
    verticalupclass: 'btn-success',
    verticaldownclass: 'btn-danger'
  });
</script>
```

### Input Groups with Styling

```html
<div class="input-group">
  <input type="number" id="styled-spinner" class="form-control" value="1">
</div>

<script>
  $('#styled-spinner').TouchSpin({
    min: 1,
    max: 999,
    prefix: 'Qty:',
    postfix: 'items',
    buttonup_class: 'btn btn-primary',
    buttondown_class: 'btn btn-primary'
  });
</script>
```

### Keyboard Accessible Buttons

```html
<input type="number" id="accessible-spinner" value="5">

<script>
  $('#accessible-spinner').TouchSpin({
    min: 0,
    max: 100,
    step: 1,
    focusablebuttons: true  // Enable Tab navigation and Enter/Space activation
  });
</script>
```

### Modern Core API (framework-agnostic)

```html
<input type="number" id="modern-input" value="5">

<script type="module">
  import { TouchSpin } from './packages/core/src/index.js';
  import Bootstrap5Renderer from './packages/renderers/bootstrap5/src/Bootstrap5Renderer.js';
  
  const input = document.getElementById('modern-input');
  const instance = TouchSpin(input, {
    renderer: Bootstrap5Renderer, // Required: specify renderer
    min: 0,
    max: 100,
    step: 1
  });
  
  // API methods available
  instance.upOnce();
  instance.downOnce();
  instance.startUpSpin();
  instance.stopSpin();
  instance.updateSettings({ step: 10 });
  instance.destroy();
</script>
```

### jQuery Wrapper (backward compatible)

```html
<input type="number" id="jquery-input" value="5">

<script type="module">
  import { installJqueryTouchSpin } from './packages/jquery-plugin/src/index.js';
  import Bootstrap5Renderer from './packages/renderers/bootstrap5/src/Bootstrap5Renderer.js';
  
  // Install jQuery plugin
  installJqueryTouchSpin(window.jQuery);
  
  // Use familiar jQuery API
  $('#jquery-input').TouchSpin({
    renderer: Bootstrap5Renderer, // Required: specify renderer
    min: 0,
    max: 100,
    step: 1
  });
</script>
```

---

## Renderer Architecture

TouchSpin now uses a modern renderer-based architecture that separates core functionality from UI presentation. This enables framework-agnostic usage and easy customization.

### Available Renderers

| Renderer | Purpose | Import Path |
|----------|---------|-------------|
| **Bootstrap5Renderer** | Bootstrap 5 input groups | `packages/renderers/bootstrap5/src/Bootstrap5Renderer.js` |
| **RawRenderer** | No UI elements (keyboard/wheel only) | `packages/core/src/RawRenderer.js` |

### Renderer Requirements

**All TouchSpin instances require a renderer:**

```javascript
// ✅ Correct - renderer specified
TouchSpin(input, { renderer: Bootstrap5Renderer, min: 0, max: 100 });

// ❌ Error - no renderer specified  
TouchSpin(input, { min: 0, max: 100 }); // Throws: "TouchSpin requires a renderer"
```

### RawRenderer for Minimal UI

Use `RawRenderer` when you only need core functionality without additional UI elements:

```javascript
import { TouchSpin, RawRenderer } from './packages/core/src/index.js';

TouchSpin(input, {
  renderer: RawRenderer, // No buttons added to DOM
  min: 0,
  max: 100,
  step: 1
});

// Keyboard arrows, mouse wheel, and API methods still work
// Perfect for custom implementations or programmatic-only usage
```

### Advanced Input Groups

Bootstrap renderers automatically detect existing input groups and integrate seamlessly:

```html
<!-- Existing input group -->
<div class="input-group">
  <span class="input-group-text">€</span>
  <input id="advanced-input" type="number" value="50" class="form-control">
  <span class="input-group-text">per item</span>
</div>

<script type="module">
  // TouchSpin integrates without nesting input-group elements
  TouchSpin(document.getElementById('advanced-input'), {
    renderer: Bootstrap5Renderer,
    prefix: '$',        // Adds TouchSpin prefix
    postfix: 'USD',     // Adds TouchSpin postfix
    min: 1,
    max: 999
  });
  // Result: € [prefix] [-] [input] [+] [postfix] per item
</script>
```

### Custom Renderers

Create custom renderers by extending `AbstractRenderer`:

```javascript
import AbstractRenderer from './packages/core/src/AbstractRenderer.js';

class CustomRenderer extends AbstractRenderer {
  init() {
    // 1. Build your UI around this.input
    this.wrapper = this.createCustomUI();
    
    // 2. Find your up/down buttons
    const upBtn = this.wrapper.querySelector('.my-up-button');
    const downBtn = this.wrapper.querySelector('.my-down-button');
    
    // 3. Tell core to attach event handlers
    this.core.attachUpEvents(upBtn);
    this.core.attachDownEvents(downBtn);
    
    // 4. Observe setting changes (optional)
    this.core.observeSetting('prefix', (value) => this.updatePrefix(value));
  }
  
  createCustomUI() {
    // Return your custom wrapper element
    // Must include data-touchspin-injected attributes for cleanup
  }
}
```

---

## Build Outputs and Variants

- UMD builds (choose your UI stack):
  - `dist/jquery.bootstrap-touchspin-bs3(.min).js`
  - `dist/jquery.bootstrap-touchspin-bs4(.min).js`
  - `dist/jquery.bootstrap-touchspin-bs5(.min).js`
  - `dist/jquery.bootstrap-touchspin-tailwind(.min).js`
- CSS:
  - `dist/jquery.bootstrap-touchspin(.min).css`
- ESM Core (experimental):
  - `dist/esm/touchspin.js`
  - Note: The ESM core is a scaffold for future framework wrappers; the UMD plugin remains the single source of truth. Use the UMD builds in production unless you are experimenting with custom wrappers.
- Dev-only ESM twin loader:
  - `src/jquery.bootstrap-touchspin.esm.js` registers the classic plugin in module contexts for the ESM manual page/tests.

New filenames (preview)
- Alongside existing filenames, the build now also emits:
  - `dist/touchspin.jquery.bs3(.min).js`
  - `dist/touchspin.jquery.bs4(.min).js`
  - `dist/touchspin.jquery.bs5(.min).js`
  - `dist/touchspin.jquery.tailwind(.min).js`
- ESM core alias: `dist/esm/touchspin-core.js` (same as `dist/esm/touchspin.js`).

Wrapper inclusion
- Modern facade is appended to UMD builds by default (LGTM‑8) to preserve prior inline behavior.
- Control wrapper append via env var:
  - `APPEND_WRAPPERS=modern-facade` (default)
  - `APPEND_WRAPPERS=none` to disable
  - `APPEND_WRAPPERS=jquery-bridge,modern-facade` to include both
- The plugin remains the single source of truth; wrappers only provide facades.

Publishing note: Tests load from `src/` during development. Rebuild `dist/` at checkpoints or before publishing, and always commit `dist/` (CI verifies build integrity).
```

---

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `min` | number/null | `0` | Minimum allowed value |
| `max` | number/null | `100` | Maximum allowed value |
| `initval` | string | `''` | Initial value if input is empty |
| `step` | number | `1` | Step increment/decrement |
| `decimals` | number | `0` | Number of decimal places |
| `stepinterval` | number | `100` | Milliseconds between steps when holding |
| `stepintervaldelay` | number | `500` | Delay before stepinterval kicks in |
| `booster` | boolean | `true` | Enable booster for rapid value changes |
| `boostat` | number | `10` | Steps before booster activates |
| `maxboostedstep` | number/false | `false` | Maximum step when boosting |
| `mousewheel` | boolean | `true` | Enable mouse wheel support |
| `verticalbuttons` | boolean | `false` | Stack buttons vertically |
| `verticalup` | string | `'&plus;'` | Content for vertical up button |
| `verticaldown` | string | `'&minus;'` | Content for vertical down button |
| `verticalupclass` | string | `''` | CSS class for vertical up button |
| `verticaldownclass` | string | `''` | CSS class for vertical down button |
| `focusablebuttons` | boolean | `false` | Enable keyboard navigation for spinner buttons (Tab navigation + Enter/Space activation) |
| `prefix` | string | `''` | Text/HTML before input |
| `postfix` | string | `''` | Text/HTML after input |
| `prefix_extraclass` | string | `''` | Additional CSS class for prefix |
| `postfix_extraclass` | string | `''` | Additional CSS class for postfix |
| `buttonup_class` | string | `'btn btn-primary'` | CSS classes for up button |
| `buttondown_class` | string | `'btn btn-primary'` | CSS classes for down button |
| `buttonup_txt` | string | `'&plus;'` | Content for up button |
| `buttondown_txt` | string | `'&minus;'` | Content for down button |
| `forcestepdivisibility` | string | `'round'` | How to handle step divisibility (`'round'`, `'floor'`, `'ceil'`, `'none'`) |
| `replacementval` | string | `''` | Value to show when input is empty |
| `firstclickvalueifempty` | number/null | `null` | Value to set on first click if input is empty |
| `callback_before_calculation` | function | `function(value) { return value; }` | Callback before value calculation |
| `callback_after_calculation` | function | `function(value) { return value; }` | Callback after value calculation |

### Data Attributes

All options can also be set via data attributes using the `data-bts-` prefix:

```html
<input type="number"
       data-bts-min="0"
       data-bts-max="100"
       data-bts-step="5"
       data-bts-decimals="1"
       data-bts-prefix="$"
       data-bts-postfix=".00"
       data-bts-boostat="10"
       data-bts-vertical-buttons="true">
```

---

## Accessibility Notes

- Display value: `aria-valuetext` reflects the formatted display string, including any prefixes/postfixes or custom formatting applied via `callback_after_calculation` (for example, `€ 35` or `$5,000.10`).
- Bounds: When applicable, ARIA min/max reflect the effective, step‑aligned bounds that the user can actually reach with the configured `step`. This may differ from the raw `min`/`max` settings if alignment is required.
- Where to verify: Use the manual pages under `__tests__/html/` (e.g., `index-bs5.html`, the bridge and ESM pages) to confirm keyboard, mouse wheel, Enter/focusout sanitation, and change emission behavior. The non‑visual Playwright tests also exercise these paths.

---

## API Methods

### Destroy
Remove TouchSpin functionality and restore original input:
```javascript
$('#spinner').trigger('touchspin.destroy');
```

### Disabled State
TouchSpin automatically observes the `disabled` and `readonly` attributes:
```html
<input type="number" id="spinner" disabled>
<!-- TouchSpin buttons automatically become disabled -->

<input type="number" id="spinner" readonly>
<!-- TouchSpin buttons automatically become disabled -->
```

### Update Settings
```javascript
// Update any configuration option
$('#spinner').trigger('touchspin.updatesettings', {min: 5, max: 50});
```

---

## Events

TouchSpin triggers several events during interaction:

```javascript
$('#spinner').on('touchspin.on.min', function() {
  console.log('Minimum value reached');
});

$('#spinner').on('touchspin.on.max', function() {
  console.log('Maximum value reached'); 
});

$('#spinner').on('touchspin.on.startspin', function() {
  console.log('Started spinning');
});

$('#spinner').on('touchspin.on.stopspin', function() {
  console.log('Stopped spinning');
});
```

### Available Events
- `touchspin.on.min` - Minimum value reached
- `touchspin.on.max` - Maximum value reached  
- `touchspin.on.startspin` - Started spinning (any direction)
- `touchspin.on.stopspin` - Stopped spinning (any direction)
- `touchspin.on.startupspin` - Started spinning up
- `touchspin.on.startdownspin` - Started spinning down
- `touchspin.on.stopupspin` - Stopped spinning up
- `touchspin.on.stopdownspin` - Stopped spinning down

### Change Events & Value Sanitization

TouchSpin fires the standard `change` event when values are committed. Value sanitization (step enforcement, min/max clamping) occurs automatically when focus leaves the input:

```javascript
$('#spinner').on('change', function() {
  console.log('Value changed to:', $(this).val());
});
```

**Sanitization Triggers:**
- **Focus Loss**: Tab key, clicking outside the input, blur events
- **Enter Key**: Pressing Enter commits and sanitizes the current value  
- **Button Clicks**: Up/down buttons automatically commit changes
- **Programmatic Updates**: `touchspin.updatesettings` and mutation observer changes

**Important**: Only **one** `change` event fires per value commitment, and only when the final sanitized value actually differs from the previous committed value.

---

## RTL Support

TouchSpin includes built-in support for right-to-left (RTL) languages. The plugin automatically detects RTL context and adjusts button positions accordingly.

### Border Radius Rendering

When using TouchSpin with RTL layouts, proper border-radius rendering requires Bootstrap's RTL CSS file. Without it, rounded corners may appear on the wrong sides of buttons.

**Bootstrap 3:**
```html
<link rel="stylesheet" href="path/to/bootstrap-rtl.css">
```

**Bootstrap 4/5:**
```html
<link rel="stylesheet" href="path/to/bootstrap.rtl.css">
```

**Note:** This is a visual-only limitation that does not affect functionality. The TouchSpin controls will work correctly in RTL mode regardless of whether the RTL CSS file is included.

---

## Bootstrap Version Support

TouchSpin provides separate builds for each Bootstrap version:

### Version-Specific Features

| Bootstrap Version | Build File | Key Features |
|------------------|------------|--------------|
| Bootstrap 3 | `jquery.bootstrap-touchspin-bs3.js` | `input-group-btn`, `input-group-addon` |
| Bootstrap 4 | `jquery.bootstrap-touchspin-bs4.js` | `input-group-prepend`, `input-group-append` |
| Bootstrap 5 | `jquery.bootstrap-touchspin-bs5.js` | Simplified structure, improved accessibility |

### Why Version-Specific Builds?

- **Reliability** - Eliminates compatibility issues between Bootstrap versions
- **Error prevention** - No risk of using incorrect markup or classes for your Bootstrap version
- **Easier maintenance** - Clear, predictable behavior without version detection logic
- **Smaller file size** - Only includes renderer for your Bootstrap version  
- **Tailored markup** - HTML structure specific to each version  
- **Explicit dependencies** - Clear compatibility requirements

### Extensible Architecture

TouchSpin's simplified renderer system is designed for easy extension to other CSS frameworks:

- **Framework-agnostic core** - AbstractRenderer base class with no Bootstrap assumptions
- **Template-based renderers** - Each renderer simply provides HTML templates with framework-specific classes
- **Future framework support** - Architecture ready for Tailwind CSS, Foundation, Bulma, and custom frameworks

### Framework-Agnostic Element Identification

TouchSpin uses data attributes for internal functionality while maintaining CSS classes for styling and backward compatibility:

#### Data Attributes for Functional Elements
```html
<!-- Main container identification -->
<div data-touchspin="container" class="bootstrap-touchspin">
  <input type="number" value="1">
  
  <!-- Functional buttons identified by role -->
  <button data-touchspin-role="down" class="bootstrap-touchspin-down">-</button>
  <button data-touchspin-role="up" class="bootstrap-touchspin-up">+</button>
  
  <!-- Injected elements marked for cleanup -->
  <span data-touchspin="injected" class="bootstrap-touchspin-injected">...</span>
</div>
```

#### Benefits of Data Attribute Approach
- **Framework Independence** - Core functionality works without CSS framework dependencies
- **Backward Compatibility** - Existing CSS class selectors continue to work
- **Semantic Clarity** - Data attributes clearly indicate functional purpose vs styling
- **Future Proof** - Easy migration path for framework-agnostic implementations

#### Selector Compatibility
Both approaches work identically:
```javascript
// Legacy CSS class selectors (still supported)
$('.bootstrap-touchspin-up').click();
$('.bootstrap-touchspin').find('input');

// Modern data attribute selectors  
$('[data-touchspin-role="up"]').click();
$('[data-touchspin="container"]').find('input');
```

---

## Browser & Device Support

### Desktop Browsers
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 15+
- Internet Explorer 11

### Mobile Devices  
- iOS Safari 11+
- Chrome Mobile 60+
- Android Browser 4.4+
- Samsung Internet 7+

### Touch Support
- Full touch event support
- Responsive touch targets (44px minimum)
- Designed for mobile interfaces
- Gesture-friendly interactions

---

## Accessibility Considerations

TouchSpin automatically implements ARIA attributes for enhanced screen reader support:

### Automatic ARIA Implementation
- **Role Attribution**: Inputs automatically receive `role="spinbutton"`
- **Value Attributes**: `aria-valuenow`, `aria-valuemin`, `aria-valuemax` automatically maintained
- **Button Labels**: Up/down buttons get descriptive `aria-label` attributes
- **Dynamic Updates**: ARIA attributes update automatically when values or settings change

```html
<!-- TouchSpin automatically adds these attributes -->
<input type="number" 
       id="spinner"
       role="spinbutton"
       aria-valuenow="5"
       aria-valuemin="1" 
       aria-valuemax="100">
```

### Accessibility Features
- **Semantic Elements**: Uses proper `<input type="number">` and `<button>` elements
- **Keyboard Navigation**: Full keyboard support with Up/Down arrows, Tab, Enter, Space
- **Screen Reader Support**: Values and changes properly announced to assistive technologies
- **Focus Management**: Proper focus handling with blur-based value sanitization

### Additional Customization
For specialized accessibility needs, you can add additional attributes:

```html
<input type="number" 
       id="spinner"
       aria-label="Quantity selector"
       aria-describedby="quantity-help">
<div id="quantity-help" class="sr-only">Use arrow keys, buttons, or type to change value</div>
```

---

## Development

### Quick Start for Contributors

```bash
# Install dependencies
yarn install

# Start dev server (safe to run multiple times)  
yarn dev

# Inspect any page for issues (in another terminal)
yarn inspect /__tests__/html/index-bs4.html text

# Run tests
npm test

# Build the project
yarn build
```

### Developer Tools

**Page Inspection Script**  
Use `yarn inspect <path> [json|text]` for comprehensive page diagnostics:

```bash
# Get detailed diagnostics in human-readable format
yarn inspect /__tests__/html/index-bs5.html text

# Get JSON output for automated processing
yarn inspect /__tests__/html/index-bs5.html | jq '.summary'
```

The inspect script provides:
- **Network diagnostics**: Failed requests, HTTP errors
- **JavaScript diagnostics**: Console errors, warnings, page exceptions  
- **TouchSpin status**: Initialization status for all instances
- **Summary statistics**: Quick health overview

**Development Server**  
- Always uses port 8866 for consistency
- Safe to run `yarn dev` multiple times (checks if already running)
- Serves static files from project root with disabled caching

### Build Process

TouchSpin uses a Rollup-based build system:

```bash
# Production build
yarn build

# Run tests with automatic coverage report generation
yarn test:coverage

# Open coverage HTML report in browser
yarn coverage:open
```

### Project Structure

```
├── packages/                    # Modern multi-package architecture
│   ├── core/                   # Framework-agnostic TouchSpin core
│   │   └── src/
│   │       ├── index.js        # Main TouchSpin core
│   │       ├── AbstractRenderer.js  # Renderer base class
│   │       └── RawRenderer.js  # Minimal renderer
│   ├── jquery-plugin/          # jQuery wrapper
│   │   └── src/index.js
│   └── renderers/              # Framework-specific renderers
│       └── bootstrap5/
│           └── src/Bootstrap5Renderer.js
├── src/                        # Legacy source files (maintained)
│   ├── jquery.bootstrap-touchspin.js
│   └── jquery.bootstrap-touchspin.css
├── dist/                       # Built files (generated)
├── demo/                       # Live demos and examples
├── __tests__/                  # Playwright browser tests
└── tmp/                        # Temporary development files
```

### Testing

You can run tests (Playwright) and the dev examples server together while iterating:

- `yarn test` — run Playwright tests once (non‑watch)
- `yarn test:watch` — open the Playwright UI (watch mode)
- `yarn test:dev` — run both the examples dev server and tests in watch mode
- `yarn dev:test` — alias for `yarn test:dev`

The combined mode uses `concurrently` to run:

```
yarn dev   # Vite on port 8866, opens /examples/
yarn test:watch  # Playwright UI
```

Test suite using Playwright with automated coverage reporting:

- **Real browser testing** with Chromium 
- **Touch and mobile interaction** simulation
- **Bootstrap version compatibility** (3, 4 & 5)
- **UI component and event testing** with coverage reporting
- **Automated coverage reports** using NYC/Istanbul with LCOV and HTML formats
- **PHPStorm integration** via LCOV format at `reports/coverage/lcov.info`
- **Visual HTML reports** automatically generated at `reports/coverage/html/index.html`
- **Single command workflow** - `yarn test:coverage` runs tests and generates all reports

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes in `src/` directory
4. Run tests: `yarn test` (fast) or `yarn test:coverage` (with automatic report generation)
5. Review coverage with `yarn coverage:open` to view detailed HTML reports
6. Commit your changes
7. Push to the branch: `git push origin feature/new-feature`
8. Create a Pull Request

**Important**: Never edit files in `dist/` directly - they are automatically generated.

---

## Migration Guide for v4.8.0

### Breaking Changes: CSS Class Dependencies Removed

To improve framework independence, TouchSpin no longer uses certain CSS classes for internal functionality. These classes have been replaced with data attributes:

#### Removed CSS Classes (Internal Use Only)
- `.bootstrap-touchspin-prefix` 
- `.bootstrap-touchspin-postfix`
- `.bootstrap-touchspin-injected`

#### Maintained CSS Classes (For Styling)
These classes remain unchanged and are still applied for styling purposes:
- `.bootstrap-touchspin` (container)
- `.bootstrap-touchspin-up` (up button)
- `.bootstrap-touchspin-down` (down button)
- `.bootstrap-touchspin-vertical-button-wrapper` (vertical wrapper)

### Migration Steps

If you were using the removed classes for custom styling or JavaScript targeting:

#### CSS Selectors
```css
/* Before */
.bootstrap-touchspin-prefix { color: blue; }
.bootstrap-touchspin-postfix { color: red; }
.bootstrap-touchspin-injected { opacity: 0.8; }

/* After */
[data-touchspin-injected="prefix"] { color: blue; }
[data-touchspin-injected="postfix"] { color: red; }
[data-touchspin-injected] { opacity: 0.8; }
```

#### JavaScript Selectors
```javascript
// Before
$('.bootstrap-touchspin-prefix').text('New prefix');
$('.bootstrap-touchspin-postfix').text('New postfix');
$('.bootstrap-touchspin-injected').remove();

// After
$('[data-touchspin-injected="prefix"]').text('New prefix');
$('[data-touchspin-injected="postfix"]').text('New postfix');
$('[data-touchspin-injected]').remove();
```

### Why This Change?

This change enables TouchSpin to work with any CSS framework while maintaining full backward compatibility for styling classes. The plugin's internal functionality is now completely independent of Bootstrap-specific CSS classes.

---

## Troubleshooting

### Common Issues

**TouchSpin is not a function**
```javascript
// Ensure jQuery is loaded first
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="path/to/jquery.bootstrap-touchspin.min.js"></script>
```

**Wrong Bootstrap styling**  
Make sure you're using the correct build for your Bootstrap version:
- Bootstrap 3: Use `jquery.bootstrap-touchspin-bs3.js`
- Bootstrap 4: Use `jquery.bootstrap-touchspin-bs4.js`  
- Bootstrap 5: Use `jquery.bootstrap-touchspin-bs5.js`

**Mobile touch not working**  
Ensure your viewport meta tag is set correctly:
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

**Values not updating**  
Ensure your input element is properly initialized:
```html
<input type="text" id="spinner" value="0">
<!-- or -->
<input type="number" id="spinner" value="0">
```
Note: Both text and number input types are supported.

**Native Spinner Synchronization**  
TouchSpin automatically synchronizes with browser native spinner controls when using `type="number"`:

- **TouchSpin settings take precedence** - When both TouchSpin options and native attributes are present, TouchSpin settings override native values
- **Native attributes are automatically updated** - TouchSpin sets native `min`, `max`, and `step` attributes to match its configuration
- **Bidirectional sync** - Changes to native attributes are automatically reflected in TouchSpin settings
- **Consistent behavior** - Both TouchSpin buttons and native browser spinners respect the same limits

```html
<!-- TouchSpin will override native attributes and keep them in sync -->
<input type="number" min="1" max="50" step="2" id="spinner" value="10">
<script>
$('#spinner').TouchSpin({
  min: 5,    // This overrides native min="1"
  max: 100,  // This overrides native max="50"  
  step: 1    // This overrides native step="2"
});
// Native attributes are now: min="5" max="100" step="1"
</script>
```

To hide native browser spinners if desired:
```css
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
```

---

## Examples & Demos

### Live Demos
- **[Main Demo Site](https://www.virtuosoft.eu/code/bootstrap-touchspin/)** - Interactive examples
- **Local Demos** - Open `demo/index-new.html` in your browser

### Local Examples
Explore the demos in the `demo/` directory:
- `demo/bootstrap3.html` - Bootstrap 3 examples
- `demo/bootstrap4.html` - Bootstrap 4 examples  
- `demo/bootstrap5.html` - Bootstrap 5 examples
- `demo/index-new.html` - Main demo hub

---

## License

MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

## Author & Contributors

**Author**: [István Ujj-Mészáros](https://github.com/istvan-ujjmeszaros)  
**Website**: [Virtuosoft](https://www.virtuosoft.eu/)

### Contributing
We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Support
- **Issues**: [GitHub Issues](https://github.com/istvan-ujjmeszaros/bootstrap-touchspin/issues)
- **Discussions**: [GitHub Discussions](https://github.com/istvan-ujjmeszaros/bootstrap-touchspin/discussions)
- **Documentation**: [Official Docs](https://www.virtuosoft.eu/code/bootstrap-touchspin/)
- **Sponsorship**: [GitHub Sponsors](https://github.com/sponsors/istvan-ujjmeszaros) - Support ongoing development

---

## Version History

**Latest: v4.7.3** - Rollup build system, version-specific builds, accessibility updates

See [CHANGELOG.md](CHANGELOG.md) for complete version history.

---
## Architecture and Roadmap

- See `ARCHITECTURE.md` for the target multi‑package layout (core, renderers, wrappers).  
- See `ROADMAP.md` for milestones (core extraction, renderer packages, React/Angular/Web Component wrappers) and planned artifact naming.
