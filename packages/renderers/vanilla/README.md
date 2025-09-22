# @touchspin/renderer-vanilla

> [!NOTE]
> This is an alpha version of Bootstrap TouchSpin v5. The package is not yet published to npm.

A vanilla CSS-based renderer for TouchSpin components without framework dependencies.

This renderer extends `AbstractRenderer` and implements the core `Renderer` contract from `@touchspin/core/renderer`.

## Features

- 🎨 **Pure CSS** - No framework dependencies (no Bootstrap, Tailwind, etc.)
- ♿ **Accessibility** - Proper ARIA attributes and keyboard navigation
- 📱 **Responsive** - Works on all screen sizes
- 🎛️ **Clean Styling** - Modern appearance with sensible defaults
- 🔧 **Zero Dependencies** - Just CSS and JavaScript
- ⚡ **Lightweight** - Minimal CSS footprint

## Installation

### Alpha Version from NPM

```bash
npm install @touchspin/renderer-vanilla@next
```

## Quick Start

### HTML

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/@touchspin/renderer-vanilla/dist/touchspin-vanilla.css">
</head>
<body>
  <input type="number" id="my-spinner" value="5" min="0" max="100" step="1">
  
  <script type="module">
    import { TouchSpin } from '@touchspin/core';
    import { VanillaRenderer } from '@touchspin/renderer-vanilla';
    
    const spinner = TouchSpin(document.getElementById('my-spinner'), {
      renderer: VanillaRenderer
    });
  </script>
</body>
</html>
```

### CDN (UMD)

```html
<script src="https://cdn.jsdelivr.net/npm/@touchspin/core@5.0.0-alpha.1/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@touchspin/renderer-vanilla@5.0.0-alpha.1/dist/index.umd.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-vanilla@5.0.0-alpha.1/dist/touchspin-vanilla.css" />
```

### JavaScript Modules

```javascript
import { TouchSpin } from '@touchspin/core';
import { VanillaRenderer } from '@touchspin/renderer-vanilla';

// Initialize with VanillaRenderer
const input = document.getElementById('my-spinner');
const touchspin = TouchSpin(input, {
  renderer: VanillaRenderer,
  min: 0,
  max: 100,
  step: 1,
  prefix: '$',
  postfix: 'USD'
});

// Event listeners
touchspin.on('min', () => console.log('Minimum reached'));
touchspin.on('max', () => console.log('Maximum reached'));
touchspin.on('change', (value) => console.log('Value:', value));
```

### Global Default

Set VanillaRenderer as the default for all TouchSpin instances:

```javascript
import { VanillaRenderer } from '@touchspin/renderer-vanilla';

// Set global default
globalThis.TouchSpinDefaultRenderer = VanillaRenderer;

// Now all TouchSpin instances use VanillaRenderer automatically
const spinner1 = TouchSpin(input1);
const spinner2 = TouchSpin(input2);
```

## Configuration

All standard TouchSpin options are supported:

```javascript
const touchspin = TouchSpin(input, {
  renderer: VanillaRenderer,
  
  // Values
  min: 0,
  max: 100,
  step: 1,
  decimals: 0,
  initval: '10',
  
  // Appearance  
  prefix: '$',
  postfix: 'USD',
  verticalbuttons: false,
  
  // Behavior
  mousewheel: true,
  booster: true,
  focusablebuttons: false,
  
  // Custom classes
  buttonup_class: 'my-up-btn',
  buttondown_class: 'my-down-btn',
  prefix_extraclass: 'my-prefix',
  postfix_extraclass: 'my-postfix'
});
```

## Layout Options

### Horizontal Layout (Default)
```html
<input type="number" id="horizontal-spinner">
```

### Vertical Layout
```javascript
TouchSpin(input, {
  renderer: VanillaRenderer,
  verticalbuttons: true
});
```

### Size Variants

The renderer automatically detects size classes:

```html
<!-- Small -->
<input type="number" class="form-control-sm">

<!-- Normal (default) -->
<input type="number">

<!-- Large -->
<input type="number" class="form-control-lg">
```

## Customization

Override CSS variables to customize appearance:

```css
.ts-wrapper {
  /* Colors */
  --ts-color-bg: #ffffff;
  --ts-color-border: #d1d5db;
  --ts-color-border-focus: #3b82f6;
  --ts-color-text: #374151;
  --ts-button-bg: #f3f4f6;
  --ts-button-bg-hover: #e5e7eb;
  
  /* Spacing */
  --ts-spacing: 0.75rem;
  --ts-radius: 0.375rem;
  
  /* Typography */
  --ts-font-size: 1rem;
  --ts-font-weight: 400;
}
```

Or apply custom classes:

```css
.my-custom-spinner .ts-wrapper {
  border: 2px solid #007bff;
  border-radius: 10px;
}

.my-custom-spinner .ts-btn {
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
}
```

## Browser Support

Works in all modern browsers:
- Chrome 60+
- Firefox 55+  
- Safari 12+
- Edge 79+

## License

MIT License. See [LICENSE](LICENSE) for details.