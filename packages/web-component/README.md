# @touchspin/web-component



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

### Alpha Version from NPM

```bash
npm install @touchspin/web-component
```

## Getting Started

1.  **Install the component:**

    ```bash
    npm install @touchspin/web-component@next
    ```

2.  **Import the component and its styles:**

    ```html
    <script type="module" src="node_modules/@touchspin/web-component/dist/index.js"></script>
    <link rel="stylesheet" href="node_modules/@touchspin/renderer-vanilla/dist/touchspin-vanilla.css">
    ```

3.  **Use the component in your HTML:**

    ```html
    <touchspin-input min="0" max="100" value="50"></touchspin-input>
    ```

## CDN (UMD)

```html
<script src="https://cdn.jsdelivr.net/npm/@touchspin/web-component@5.0.0/dist/index.umd.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-vanilla@5.0.0-alpha.1/dist/touchspin-vanilla.css" />

<touchspin-input min="0" max="100" value="50"></touchspin-input>
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
const spinner = document.querySelector('touchspin-input');

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
const spinner = document.querySelector('touchspin-input');

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
const spinner = document.querySelector('touchspin-input');

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
touchspin-input {
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
import { useEffect, useRef } from 'react';

function MyComponent() {
  const ref = useRef(null);

  useEffect(() => {
    const handleChange = (e) => console.log('Value:', e.detail.value);
    ref.current.addEventListener('touchspin-change', handleChange);
    return () => ref.current.removeEventListener('touchspin-change', handleChange);
  }, []);

  return (
    <touchspin-input
      ref={ref}
      min={0}
      max={100}
      value={50}
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
<touchspin-input 
  [min]="0" 
  [max]="100" 
  [(ngModel)]="currentValue"
  (touchspin-change)="onValueChange($event)">
</touchspin-input>
```

### Vue

```vue
<template>
  <touchspin-input 
    :min="0" 
    :max="100" 
    v-model="currentValue"
    @touchspin-change="onValueChange">
  </touchspin-input>
</template>

<script setup>
import '@touchspin/web-component';
import { ref } from 'vue';

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
import { TouchSpinInput } from '@touchspin/web-component';
import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';

// Register with custom renderer
class CustomTouchSpinElement extends TouchSpinInput {
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
class ShadowTouchSpinElement extends TouchSpinInput {
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

See the main [TouchSpin repository](https://github.com/istvan-ujjmeszaros/touchspin) for contribution guidelines.

## License

MIT License - see the [LICENSE](../../LICENSE) file for details.
