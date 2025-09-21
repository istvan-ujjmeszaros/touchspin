# TouchSpin Web Component

A standards-based Web Component implementation of TouchSpin, providing a framework-agnostic custom element for number input with increment/decrement controls.

📚 For core architecture details see [`docs/architecture/overview.md`](../../docs/architecture/overview.md). Attribute documentation lives in [`docs/reference/options-and-events.md`](../../docs/reference/options-and-events.md).

## Features

- 🌐 **Framework Agnostic** - Works with React, Angular, Vue, or vanilla JavaScript
- 🎯 **Standards-Based** - Uses native Web Components API
- 🎨 **Themeable** - CSS variables for complete customization
- ♿ **Accessible** - Full ARIA support and keyboard navigation
- 🌍 **RTL Support** - Right-to-left language support
- 📱 **Responsive** - Mobile-friendly touch interactions
- 🔧 **Zero Dependencies** - Pure Web Components, no framework required

## Installation

```bash
yarn add @touchspin/web-component
```

## Quick Start

### Import and Use

```html
<!-- Import the Web Component -->
<script type="module">
  import '@touchspin/web-component';
</script>

<!-- Use the custom element -->
<touchspin-element min="0" max="100" value="50"></touchspin-element>
```

## Styles

The web component uses the Vanilla renderer styles. Include the CSS in your page or bundle it once in your app entry:

```html
<link rel="stylesheet" href="/node_modules/@touchspin/vanilla-renderer/dist/touchspin-vanilla.css" />
```

## CDN (UMD)

```html
<script src="/node_modules/@touchspin/web-component/dist/index.umd.js"></script>
<link rel="stylesheet" href="/node_modules/@touchspin/vanilla-renderer/dist/touchspin-vanilla.css" />
<touchspin-element min="0" max="100" value="50"></touchspin-element>
```

### Basic Examples

```html
<!-- Basic spinner -->
<touchspin-element min="0" max="100" value="50" step="1"></touchspin-element>

<!-- Currency input -->
<touchspin-element min="0" max="1000" value="25.50" step="0.01" 
                   prefix="$" postfix=".00"></touchspin-element>

<!-- Vertical buttons -->
<touchspin-element min="0" max="100" value="75" 
                   vertical-buttons="true"></touchspin-element>

<!-- Custom button text -->
<touchspin-element min="1" max="10" value="5" 
                   button-up-txt="▲" button-down-txt="▼"></touchspin-element>

<!-- Disabled state -->
<touchspin-element min="0" max="100" value="42" disabled></touchspin-element>
```

## API Reference

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `min` | number | - | Minimum value |
| `max` | number | - | Maximum value |
| `step` | number | `1` | Step increment |
| `value` | number | `0` | Current value |
| `decimals` | number | `0` | Number of decimal places |
| `prefix` | string | - | Text before input |
| `postfix` | string | - | Text after input |
| `vertical-buttons` | boolean | `false` | Use vertical button layout |
| `button-up-txt` | string | `+` | Up button text |
| `button-down-txt` | string | `−` | Down button text |
| `disabled` | boolean | `false` | Disable input |
| `readonly` | boolean | `false` | Make input readonly |
| `mouse-wheel` | boolean | `true` | Enable mousewheel support |

### Properties

Access via JavaScript:

```javascript
const spinner = document.querySelector('touchspin-element');

// Get/set value
console.log(spinner.value); // Get current value
spinner.value = 75;          // Set value

// Get/set constraints
spinner.min = 0;
spinner.max = 200;
spinner.step = 5;

// Get/set state
spinner.disabled = true;
spinner.readonly = false;
```

### Methods

```javascript
const spinner = document.querySelector('touchspin-element');

// Increment/decrement
spinner.upOnce();      // Increment by one step
spinner.downOnce();    // Decrement by one step

// Continuous spinning
spinner.startUpSpin();   // Start spinning up
spinner.startDownSpin(); // Start spinning down
spinner.stopSpin();      // Stop spinning

// Settings
spinner.updateSettings({
  min: 0,
  max: 200,
  step: 10
});

// Advanced
const touchspinInstance = spinner.getTouchSpinInstance();
spinner.destroy(); // Manual cleanup
```

### Events

All events bubble and include the current value in `event.detail`:

```javascript
const spinner = document.querySelector('touchspin-element');

// Value changes
spinner.addEventListener('touchspin-change', (e) => {
  console.log('New value:', e.detail.value);
});

// Limit reached
spinner.addEventListener('touchspin-min', (e) => {
  console.log('Minimum reached:', e.detail.value);
});

spinner.addEventListener('touchspin-max', (e) => {
  console.log('Maximum reached:', e.detail.value);
});

// Spinning events
spinner.addEventListener('touchspin-start-spin', (e) => {
  console.log('Started spinning');
});

spinner.addEventListener('touchspin-stop-spin', (e) => {
  console.log('Stopped spinning');
});
```

#### Available Events

- `touchspin-change` - Value changed
- `touchspin-min` - Minimum value reached
- `touchspin-max` - Maximum value reached
- `touchspin-start-spin` - Started spinning
- `touchspin-stop-spin` - Stopped spinning
- `touchspin-start-up` - Started spinning up
- `touchspin-start-down` - Started spinning down
- `touchspin-stop-up` - Stopped spinning up
- `touchspin-stop-down` - Stopped spinning down

## Theming

TouchSpin Web Component uses CSS variables for complete customization:

```css
touchspin-element {
  --ts-wrapper-border-color: #3b82f6;
  --ts-button-background-color: #f0f9ff;
  --ts-button-background-color-hover: #dbeafe;
  --ts-button-text-color: #1e40af;
  --ts-wrapper-border-radius: 0.5rem;
  --ts-button-min-width: 3rem;
}
```

See the [VanillaRenderer documentation](../vanilla-renderer/README.md) for all available CSS variables.

## Framework Integration

### React

```jsx
import '@touchspin/web-component';

function MyComponent() {
  const handleChange = (e) => {
    console.log('Value:', e.detail.value);
  };

  return (
    <touchspin-element
      min={0}
      max={100}
      defaultValue={50}
      onTouchspinChange={handleChange}
    />
  );
}
```

### Angular

```typescript
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
```

```html
<!-- component.html -->
<touchspin-element 
  [min]="0" 
  [max]="100" 
  [value]="currentValue"
  (touchspin-change)="onValueChange($event)">
</touchspin-element>
```

### Vue

```vue
<template>
  <touchspin-element 
    :min="0" 
    :max="100" 
    :value="currentValue"
    @touchspin-change="onValueChange">
  </touchspin-element>
</template>

<script setup>
import '@touchspin/web-component';

const currentValue = ref(50);

const onValueChange = (event) => {
  currentValue.value = event.detail.value;
};
</script>
```

## Browser Support

- Chrome 54+
- Firefox 63+
- Safari 10.1+
- Edge 79+

For older browsers, use a [Web Components polyfill](https://www.webcomponents.org/polyfills/).

## Advanced Usage

### Custom Renderers

```javascript
import { TouchSpinElement } from '@touchspin/web-component';
import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';

// Register with custom renderer
class CustomTouchSpinElement extends TouchSpinElement {
  _resolveRenderer(name) {
    if (name === 'bootstrap5') {
      return Bootstrap5Renderer;
    }
    return super._resolveRenderer(name);
  }
}

customElements.define('custom-touchspin', CustomTouchSpinElement);
```

```html
<custom-touchspin renderer="bootstrap5"></custom-touchspin>
```

### Shadow DOM

```javascript
class ShadowTouchSpinElement extends TouchSpinElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    // Add styles to shadow root
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = '/path/to/touchspin-vanilla.css';
    this.shadowRoot.appendChild(style);
    
    super.connectedCallback();
  }
}
```

## Contributing

See the main [TouchSpin repository](https://github.com/istvan-ujjmeszaros/bootstrap-touchspin) for contribution guidelines.

## License

MIT License - see the [LICENSE](../../LICENSE) file for details.
