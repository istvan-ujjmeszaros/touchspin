# @touchspin/web-components

> Standards-based custom elements for TouchSpin with tree-shakable renderer support

[![npm version](https://img.shields.io/npm/v/@touchspin/web-components.svg)](https://www.npmjs.com/package/@touchspin/web-components)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@touchspin/web-components)](https://bundlephobia.com/package/@touchspin/web-components)

## 🌟 Features

- **🎯 Framework-Agnostic** - Use in any framework or vanilla JavaScript
- **🌳 Tree-Shakable** - Import only the renderers you need (~30KB per renderer)
- **🎨 Multiple Renderers** - Bootstrap 3/4/5, Tailwind CSS, and Vanilla CSS
- **⚡ Zero Dependencies** - No jQuery required
- **♿ Accessible** - ARIA-compliant and keyboard navigable
- **📱 Touch-Friendly** - Optimized for mobile devices

## 📦 Installation

```bash
# Install the web components package
npm install @touchspin/web-components

# Install the renderer(s) you need (peer dependencies)
npm install @touchspin/renderer-bootstrap5
```

## 🚀 Quick Start

### Option 1: Using Import Maps (Recommended for Modern Browsers)

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Include your CSS framework (e.g., Bootstrap 5) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">

  <!-- Import map for ESM modules -->
  <script type="importmap">
  {
    "imports": {
      "@touchspin/web-components/bootstrap5": "./node_modules/@touchspin/web-components/dist/bootstrap5.js",
      "@touchspin/renderer-bootstrap5": "./node_modules/@touchspin/renderer-bootstrap5/dist/index.js",
      "@touchspin/core": "./node_modules/@touchspin/core/dist/index.js"
    }
  }
  </script>

  <!-- Import the web component -->
  <script type="module">
    import '@touchspin/web-components/bootstrap5';
  </script>
</head>
<body>
  <!-- Use the custom element -->
  <touchspin-bootstrap5 min="0" max="100" value="50"></touchspin-bootstrap5>
</body>
</html>
```

### Option 2: Using a Bundler (Vite, Webpack, etc.)

```javascript
// main.js
import '@touchspin/web-components/bootstrap5';

// Now use in your HTML
// <touchspin-bootstrap5 min="0" max="100" value="50"></touchspin-bootstrap5>
```

## 🎨 Available Components

### `<touchspin-vanilla>`
Pure CSS styling, no framework dependencies.

```html
<script type="module">
  import '@touchspin/web-components/vanilla';
</script>

<touchspin-vanilla min="0" max="100" value="50"></touchspin-vanilla>
```

**Peer Dependency:** `@touchspin/renderer-vanilla`

### `<touchspin-bootstrap5>`
Bootstrap 5 integration with full component support.

```html
<script type="module">
  import '@touchspin/web-components/bootstrap5';
</script>

<touchspin-bootstrap5
  min="0"
  max="100"
  value="25"
  prefix="$"
  postfix=" USD">
</touchspin-bootstrap5>
```

**Peer Dependencies:** `@touchspin/renderer-bootstrap5`, `bootstrap@>=5.3.0`

### `<touchspin-bootstrap4>`
Bootstrap 4 compatibility.

```html
<script type="module">
  import '@touchspin/web-components/bootstrap4';
</script>

<touchspin-bootstrap4 min="0" max="10" value="5" vertical-buttons></touchspin-bootstrap4>
```

**Peer Dependencies:** `@touchspin/renderer-bootstrap4`, `bootstrap@^4.0.0`

### `<touchspin-bootstrap3>`
Legacy Bootstrap 3 support.

```html
<script type="module">
  import '@touchspin/web-components/bootstrap3';
</script>

<touchspin-bootstrap3 min="0" max="1000" value="500"></touchspin-bootstrap3>
```

**Peer Dependencies:** `@touchspin/renderer-bootstrap3`, `bootstrap@^3.0.0`

### `<touchspin-tailwind>`
Modern utility-first CSS framework.

```html
<script type="module">
  import '@touchspin/web-components/tailwind';
</script>

<touchspin-tailwind min="1" max="99" value="42"></touchspin-tailwind>
```

**Peer Dependencies:** `@touchspin/renderer-tailwind`, `tailwindcss@>=3.0.0`

## 📖 API Reference

### Attributes

All TouchSpin web components support these attributes:

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `min` | number | null | Minimum value |
| `max` | number | null | Maximum value |
| `step` | number | 1 | Increment/decrement step |
| `value` | number | 0 | Initial value |
| `decimals` | number | 0 | Number of decimal places |
| `prefix` | string | '' | Text before the input |
| `postfix` | string | '' | Text after the input |
| `vertical-buttons` | boolean | false | Display buttons vertically |
| `disabled` | boolean | false | Disable the input |
| `readonly` | boolean | false | Make input read-only |
| `mousewheel` | boolean | true | Enable mouse wheel support |
| `focusablebuttons` | boolean | false | Make buttons focusable |

For a complete list of attributes, see the [core documentation](https://github.com/istvan-ujjmeszaros/bootstrap-touchspin/tree/main/packages/core#readme).

### Properties

```javascript
const spinner = document.querySelector('touchspin-bootstrap5');

// Get/set value
spinner.value = 75;
console.log(spinner.value); // 75

// Get/set min/max
spinner.min = 0;
spinner.max = 100;

// Get/set step
spinner.step = 5;

// Get/set disabled state
spinner.disabled = true;

// Get/set readonly state
spinner.readonly = true;
```

### Methods

```javascript
const spinner = document.querySelector('touchspin-bootstrap5');

// Increment/decrement
spinner.upOnce();                    // Increment by step
spinner.downOnce();                  // Decrement by step

// Continuous spinning
spinner.startUpSpin();               // Start continuous increment
spinner.startDownSpin();             // Start continuous decrement
spinner.stopSpin();                  // Stop continuous spinning

// Update settings
spinner.updateSettings({
  step: 10,
  prefix: '$',
  decimals: 2
});

// Get TouchSpin instance (advanced)
const instance = spinner.getTouchSpinInstance();

// Cleanup
spinner.destroy();
```

### Events

All components dispatch standard CustomEvents:

```javascript
const spinner = document.querySelector('touchspin-bootstrap5');

// Value changed
spinner.addEventListener('touchspin.on.change', (e) => {
  console.log('New value:', e.detail.newValue);
});

// Reached minimum
spinner.addEventListener('touchspin.on.min', (e) => {
  console.log('Minimum reached:', e.detail);
});

// Reached maximum
spinner.addEventListener('touchspin.on.max', (e) => {
  console.log('Maximum reached:', e.detail);
});

// Spinning started
spinner.addEventListener('touchspin.on.startspin', (e) => {
  console.log('Spinning started:', e.detail.direction);
});

// Spinning stopped
spinner.addEventListener('touchspin.on.stopspin', (e) => {
  console.log('Spinning stopped');
});
```

For a complete list of events, see the [core documentation](https://github.com/istvan-ujjmeszaros/bootstrap-touchspin/tree/main/packages/core#events).

## 🎯 Use Cases

### E-commerce Product Quantity

```html
<touchspin-bootstrap5
  min="1"
  max="999"
  value="1"
  prefix="Qty: ">
</touchspin-bootstrap5>
```

### Price Input with Currency

```html
<touchspin-bootstrap5
  min="0"
  max="10000"
  value="99.99"
  step="0.01"
  decimals="2"
  prefix="$">
</touchspin-bootstrap5>
```

### Percentage Selector

```html
<touchspin-vanilla
  min="0"
  max="100"
  value="50"
  postfix="%">
</touchspin-vanilla>
```

### Compact Vertical Layout

```html
<touchspin-bootstrap5
  min="0"
  max="10"
  value="5"
  vertical-buttons>
</touchspin-bootstrap5>
```

## 🌳 Tree-Shaking

This package is optimized for tree-shaking. When you import a specific component:

```javascript
import '@touchspin/web-components/bootstrap5';
```

**Only includes:**
- Base component code (~10KB)
- Bootstrap5 renderer (~20KB)
- **Total:** ~30KB minified

**Does NOT include:**
- Vanilla renderer
- Bootstrap3/4 renderers
- Tailwind renderer

This results in **75% smaller bundles** compared to bundling all renderers!

## 🔧 Advanced Usage

### Programmatic Creation

```javascript
import { TouchSpinBootstrap5 } from '@touchspin/web-components/bootstrap5';

// Create element
const spinner = document.createElement('touchspin-bootstrap5');
spinner.setAttribute('min', '0');
spinner.setAttribute('max', '100');
spinner.setAttribute('value', '50');

// Add to DOM
document.body.appendChild(spinner);

// Use API
spinner.value = 75;
spinner.upOnce();
```

### Dynamic Updates

```javascript
const spinner = document.querySelector('touchspin-bootstrap5');

// Update multiple settings at once
spinner.updateSettings({
  min: 0,
  max: 1000,
  step: 10,
  prefix: '$',
  decimals: 2
});

// React to changes
spinner.addEventListener('touchspin.on.change', (e) => {
  console.log('New value:', e.detail.newValue);
});
```

### Integration with Forms

```html
<form id="myForm">
  <label for="quantity">Quantity:</label>
  <touchspin-bootstrap5
    id="quantity"
    name="quantity"
    min="1"
    max="100"
    value="1">
  </touchspin-bootstrap5>

  <button type="submit">Submit</button>
</form>

<script type="module">
  import '@touchspin/web-components/bootstrap5';

  document.getElementById('myForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const spinner = document.getElementById('quantity');
    console.log('Submitted value:', spinner.value);
  });
</script>
```

## 🌐 Browser Support

- Chrome/Edge: ✅ Latest 2 versions
- Firefox: ✅ Latest 2 versions
- Safari: ✅ Latest 2 versions
- Modern browsers with Custom Elements v1 support

For older browsers, use a [polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs).

## 📚 Framework Guides

### React

```jsx
import '@touchspin/web-components/bootstrap5';

function MyComponent() {
  const spinnerRef = useRef(null);

  useEffect(() => {
    const spinner = spinnerRef.current;
    const handleChange = (e) => console.log('Value:', e.detail.newValue);

    spinner.addEventListener('touchspin.on.change', handleChange);
    return () => spinner.removeEventListener('touchspin.on.change', handleChange);
  }, []);

  return (
    <touchspin-bootstrap5
      ref={spinnerRef}
      min="0"
      max="100"
      value="50"
    />
  );
}
```

### Vue 3

```vue
<template>
  <touchspin-bootstrap5
    :min="0"
    :max="100"
    :value="value"
    @touchspin.on.change="handleChange"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import '@touchspin/web-components/bootstrap5';

const value = ref(50);

const handleChange = (e) => {
  value.value = e.detail.newValue;
};
</script>
```

### Angular

```typescript
// app.component.ts
import '@touchspin/web-components/bootstrap5';

@Component({
  selector: 'app-root',
  template: `
    <touchspin-bootstrap5
      [attr.min]="0"
      [attr.max]="100"
      [attr.value]="value"
      (touchspin.on.change)="handleChange($event)">
    </touchspin-bootstrap5>
  `
})
export class AppComponent {
  value = 50;

  handleChange(event: CustomEvent) {
    this.value = event.detail.newValue;
  }
}

// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
```

## 📄 License

MIT © TouchSpin Contributors

## 🔗 Links

- [GitHub Repository](https://github.com/istvan-ujjmeszaros/bootstrap-touchspin)
- [Core Package](https://github.com/istvan-ujjmeszaros/bootstrap-touchspin/tree/main/packages/core)
- [Issue Tracker](https://github.com/istvan-ujjmeszaros/bootstrap-touchspin/issues)
- [Changelog](./CHANGELOG.md)

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](https://github.com/istvan-ujjmeszaros/bootstrap-touchspin/blob/main/CONTRIBUTING.md) first.
