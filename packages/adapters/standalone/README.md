# @touchspin/standalone

Standalone TouchSpin adapter providing a simple mount API that bundles core + renderer together.

## Installation

```bash
npm install @touchspin/standalone
```

## Usage

### ESM Import (Per-Renderer)

Each renderer is available as a separate subpath export:

```ts
import { mount } from '@touchspin/standalone/bootstrap5';

const api = mount('#my-input', {
  min: 0,
  max: 100,
  step: 1
});
```

### Browser via CDN (ESM)

Use a `type="module"` script to import the renderer-specific entry:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5/dist/touchspin-bootstrap5.css">
<script type="module">
  import { mount } from 'https://cdn.jsdelivr.net/npm/@touchspin/standalone@5/dist/bootstrap5.js';

  mount('#my-input', {
    min: 0,
    max: 100,
    step: 1
  });
</script>
```

## API

The `mount()` function returns the TouchSpin core API:

```ts
const api = mount('#input', options);

// Core methods
api.getValue()          // Get current value
api.setValue(42)        // Set value
api.upOnce()           // Increment once
api.downOnce()         // Decrement once
api.startUpSpin()      // Start continuous increment
api.stopSpin()         // Stop continuous spin
api.destroy()          // Clean up and remove

// Events
api.on('change', (value) => console.log('Changed:', value));
api.on('max', () => console.log('Maximum reached'));
api.on('min', () => console.log('Minimum reached'));
```

## Example

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Include Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <input id="quantity" type="number" value="0" />

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5/dist/touchspin-bootstrap5.css">

  <script type="module">
    import { mount } from 'https://cdn.jsdelivr.net/npm/@touchspin/standalone@5/dist/bootstrap5.js';

    const api = mount('#quantity', {
      min: 0,
      max: 100,
      step: 1,
      prefix: '$',
      postfix: '.00'
    });

    // Listen for changes
    api.on('change', (value) => {
      console.log('New value:', value);
    });
  </script>
</body>
</html>
```

## Notes

- **One renderer per page**: Each renderer import registers itself as the default. Don't mix renderers on the same page.
- **Form integration**: The input element is part of the rendered markup and participates in normal form submission.
- **No Shadow DOM**: All styles apply globally - ensure you include the appropriate CSS framework.

## Framework Requirements

Each renderer requires its corresponding CSS framework:

- **bootstrap3**: Bootstrap 3.4.1+
- **bootstrap4**: Bootstrap 4.6.2+
- **bootstrap5**: Bootstrap 5.3.0+
- **tailwind**: Tailwind CSS (utility classes)
- **vanilla**: No framework required

## License

MIT
