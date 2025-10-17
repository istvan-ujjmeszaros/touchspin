# @touchspin/webcomponent

Single `<touchspin-input>` web component that works with all TouchSpin renderers.

## Installation

```bash
npm install @touchspin/webcomponent
```

## Usage

### ESM Import

Each renderer is available as a separate import:

```ts
import '@touchspin/webcomponent/bootstrap5';
```

```html
<touchspin-input
  min="0"
  max="100"
  value="42"
  step="1"
  data-testid="quantity"
></touchspin-input>
```

### UMD (Browser)

```html
<script src="https://cdn.jsdelivr.net/npm/@touchspin/webcomponent@5/dist/umd/bootstrap5.touchspin.umd.js"></script>

<touchspin-input min="0" max="100" value="50"></touchspin-input>
```

## Available Renderers

| Import Path | UMD Global | UMD Filename |
|-------------|------------|--------------|
| `/bootstrap3` | `TouchSpinWCBootstrap3` | `dist/umd/bootstrap3.touchspin.umd.js` |
| `/bootstrap4` | `TouchSpinWCBootstrap4` | `dist/umd/bootstrap4.touchspin.umd.js` |
| `/bootstrap5` | `TouchSpinWCBootstrap5` | `dist/umd/bootstrap5.touchspin.umd.js` |
| `/tailwind` | `TouchSpinWCTailwind` | `dist/umd/tailwind.touchspin.umd.js` |
| `/vanilla` | `TouchSpinWCVanilla` | `dist/umd/vanilla.touchspin.umd.js` |

## Attributes

All TouchSpin options are available as attributes:

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `min` | number | `null` | Minimum value |
| `max` | number | `null` | Maximum value |
| `step` | number | `1` | Step interval |
| `decimals` | number | `0` | Decimal places |
| `value` | number/string | `0` | Initial value |
| `prefix` | string | `''` | Text before input |
| `postfix` | string | `''` | Text after input |
| `verticalbuttons` | boolean | `false` | Vertical button layout |
| `data-testid` | string | - | Test identifier for elements |

### Boolean Attributes

For boolean options, presence = true, absence = false:

```html
<!-- Vertical buttons enabled -->
<touchspin-input verticalbuttons></touchspin-input>

<!-- Vertical buttons disabled (default) -->
<touchspin-input></touchspin-input>
```

## Test ID Pattern

When you set `data-testid="quantity"`, the web component generates the following test IDs:

- **Element**: `data-testid="quantity"` (the `<touchspin-input>` element itself)
- **Input**: `data-testid="quantity-input"` (the actual `<input>` element)
- **Up button**: `data-testid="quantity-input-up"`
- **Down button**: `data-testid="quantity-input-down"`
- **Wrapper**: `data-testid="quantity-input-wrapper"`

### Selector Tips

```js
// Select the web component
document.querySelector('touchspin-input[data-testid="quantity"]');

// Select the actual input
document.querySelector('[data-testid="quantity-input"]');

// Select all touchspin inputs with a prefix
document.querySelectorAll('touchspin-input[data-testid^="cart-"]');

// Avoid matching descendants (use direct child selector)
document.querySelector('form > touchspin-input[data-testid="quantity"]');
```

## Example

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <h3>Product Quantity</h3>

    <touchspin-input
      min="1"
      max="100"
      value="1"
      step="1"
      prefix="Qty: "
      verticalbuttons
      data-testid="product-quantity"
    ></touchspin-input>

    <touchspin-input
      min="0"
      max="999.99"
      value="0"
      step="0.01"
      decimals="2"
      prefix="$"
      postfix=".00"
      data-testid="product-price"
    ></touchspin-input>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/@touchspin/webcomponent@5/dist/umd/bootstrap5.touchspin.umd.js"></script>

  <script>
    // Access the component
    const qtyInput = document.querySelector('[data-testid="product-quantity"]');

    // Listen for value changes
    qtyInput.addEventListener('change', (e) => {
      console.log('Quantity changed:', e.target.value);
    });

    // Programmatic access
    qtyInput.setAttribute('value', '5');
  </script>
</body>
</html>
```

## API Access

Access the underlying TouchSpin API via the component's `api` property:

```js
const component = document.querySelector('touchspin-input');
const api = component.api;

// Use core API methods
api.getValue();
api.setValue(42);
api.upOnce();
api.downOnce();
api.destroy();

// Listen to events
api.on('change', (value) => console.log('Changed:', value));
api.on('max', () => console.log('Maximum reached'));
```

## Notes

- **No Shadow DOM**: The web component does not use Shadow DOM. All styles apply globally, so ensure you include the appropriate CSS framework.
- **One renderer per page**: Each import registers `<touchspin-input>` with a specific renderer. Don't import multiple renderers on the same page.
- **Form integration**: The rendered input participates in form submission using the `name` attribute if provided.
- **Attribute updates**: Changing attributes after initialization may not update the component. Use the API for dynamic updates.

## Framework Requirements

Each renderer requires its corresponding CSS framework:

- **bootstrap3**: Bootstrap 3.4.1+
- **bootstrap4**: Bootstrap 4.6.2+
- **bootstrap5**: Bootstrap 5.3.0+
- **tailwind**: Tailwind CSS (utility classes)
- **vanilla**: No framework required

## License

MIT
