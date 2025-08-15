# Bootstrap TouchSpin

[![run-tests](https://github.com/istvan-ujjmeszaros/bootstrap-touchspin/actions/workflows/run-tests.yml/badge.svg)](https://github.com/istvan-ujjmeszaros/bootstrap-touchspin/actions/workflows/run-tests.yml)
[![npm version](https://img.shields.io/npm/v/bootstrap-touchspin)](https://www.npmjs.com/package/bootstrap-touchspin)
[![npm downloads](https://img.shields.io/npm/dm/bootstrap-touchspin)](https://www.npmjs.com/package/bootstrap-touchspin)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/bootstrap-touchspin)](https://bundlephobia.com/package/bootstrap-touchspin)

**A mobile and touch friendly input spinner component for Bootstrap 3, 4 & 5.**

TouchSpin is a mobile-first jQuery plugin that transforms number inputs into user-friendly spinner controls with increment/decrement buttons, perfect for touch interfaces and desktop environments alike.

**[Live Demo & Documentation](https://www.virtuosoft.eu/code/bootstrap-touchspin/)**

---

## Key Features

- **Mobile-First Design** - Optimized for touch interfaces and mobile devices
- **Bootstrap 3/4/5 Support** - Version-specific builds for optimal performance
- **Standard HTML Controls** - Uses semantic button and input elements
- **RTL Language Support** - Full right-to-left language compatibility
- **Lightweight & Fast** - Minimal footprint with targeted builds
- **Highly Customizable** - Extensive configuration options
- **Decimal Precision** - Support for floating-point numbers
- **Booster Mode** - Accelerated value changes for large ranges
- **Event System** - Comprehensive event handling
- **Vertical Layout** - Alternative button arrangement

---

## Quick Start

### CDN Installation (Recommended)

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
npm install bootstrap-touchspin

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

## API Methods

### Destroy
Remove TouchSpin functionality and restore original input:
```javascript
$('#spinner').trigger('touchspin.destroy');
```

### Enable/Disable
```javascript
$('#spinner').trigger('touchspin.updatesettings', {disabled: false}); // Enable
$('#spinner').trigger('touchspin.updatesettings', {disabled: true});  // Disable
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

$('#spinner').on('touchspin.on.stopspinning', function() {
  console.log('Stopped spinning');
});
```

### Available Events
- `touchspin.on.min` - Minimum value reached
- `touchspin.on.max` - Maximum value reached  
- `touchspin.on.startspin` - Started spinning (any direction)
- `touchspin.on.stopspinning` - Stopped spinning (any direction)
- `touchspin.on.startupspin` - Started spinning up
- `touchspin.on.startdownspin` - Started spinning down
- `touchspin.on.stopupspin` - Stopped spinning up
- `touchspin.on.stopdownspin` - Stopped spinning down

---

## Bootstrap Version Support

TouchSpin provides optimized builds for each Bootstrap version:

### Version-Specific Features

| Bootstrap Version | Build File | Key Features |
|------------------|------------|--------------|
| Bootstrap 3 | `jquery.bootstrap-touchspin-bs3.js` | `input-group-btn`, `input-group-addon` |
| Bootstrap 4 | `jquery.bootstrap-touchspin-bs4.js` | `input-group-prepend`, `input-group-append` |
| Bootstrap 5 | `jquery.bootstrap-touchspin-bs5.js` | Simplified structure, improved accessibility |

### Why Version-Specific Builds?

- **Improved reliability** - Eliminates compatibility issues between Bootstrap versions
- **Error prevention** - No risk of using incorrect markup or classes for your Bootstrap version
- **Easier maintenance** - Clear, predictable behavior without version detection logic
- **Smaller file size** - Only includes renderer for your Bootstrap version  
- **Optimized markup** - Tailored HTML structure for each version  
- **Explicit dependencies** - Clear compatibility requirements

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
- Optimized for mobile interfaces
- Gesture-friendly interactions

---

## Accessibility Considerations

TouchSpin uses standard HTML elements but **does not currently implement ARIA attributes**. For improved accessibility, consider:

### Manual ARIA Implementation
```html
<!-- You can manually add ARIA attributes -->
<input type="number" 
       id="spinner"
       aria-label="Quantity" 
       aria-describedby="quantity-help"
       role="spinbutton" 
       aria-valuenow="5"
       aria-valuemin="1" 
       aria-valuemax="100">
<div id="quantity-help" class="sr-only">Use arrow keys or buttons to change value</div>
```

### Current Accessibility Status
- Uses semantic `<input type="number">` and `<button>` elements
- Relies on browser's native accessibility support
- May require additional ARIA attributes for optimal screen reader support
- Keyboard navigation depends on browser's default number input behavior

### Recommendations for Better Accessibility
- Add ARIA labels and descriptions manually
- Consider implementing `aria-valuenow`, `aria-valuemin`, `aria-valuemax` attributes
- Test with screen readers to ensure proper announcement of value changes

---

## Development

### Build Process

TouchSpin uses a modern Vite-based build system:

```bash
# Install dependencies
npm install

# Development server with hot reload
npm run dev

# Production build
npm run build

# Run tests
npm test

```

### Project Structure

```
├── src/                          # Source files
│   ├── jquery.bootstrap-touchspin.js    # Main plugin
│   ├── jquery.bootstrap-touchspin.css   # Styles
│   └── renderers/               # Bootstrap version renderers
├── dist/                        # Built files (generated)
├── demo/                        # Live demos and examples
├── __tests__/                   # Jest + Puppeteer tests
└── tmp/                         # Temporary development files
```

### Testing

Comprehensive test suite using Jest + Puppeteer:

- Cross-browser compatibility testing
- Mobile device simulation
- Bootstrap version compatibility
- Core functionality and UI interactions

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes in `src/` directory
4. Run tests: `npm test`
5. Commit your changes
7. Push to the branch: `git push origin feature/new-feature`
8. Create a Pull Request

**Important**: Never edit files in `dist/` directly - they are automatically generated.

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
Explore the comprehensive demos in the `demo/` directory:
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

---

## Version History

**Latest: v4.7.3** - Modern build system, version-specific builds, improved accessibility

See [CHANGELOG.md](CHANGELOG.md) for complete version history.

---

*Made with ❤️ for the web development community*