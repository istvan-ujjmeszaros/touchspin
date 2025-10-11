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

### UMD/Global (Browser)

For CDN or traditional `<script>` tag usage:

```html
<!-- Bootstrap 5 -->
<script src="https://cdn.jsdelivr.net/npm/@touchspin/standalone@5.0.0/dist/umd/bootstrap5.global.js"></script>

<script>
  const api = window.TouchSpinStandaloneBootstrap5.mount('#my-input', {
    min: 0,
    max: 100
  });
</script>
```

## Available Renderers

| Import Path | UMD Global | UMD Filename |
|-------------|------------|--------------|
| `/bootstrap3` | `TouchSpinStandaloneBootstrap3` | `umd/bootstrap3.global.js` |
| `/bootstrap4` | `TouchSpinStandaloneBootstrap4` | `umd/bootstrap4.global.js` |
| `/bootstrap5` | `TouchSpinStandaloneBootstrap5` | `umd/bootstrap5.global.js` |
| `/tailwind` | `TouchSpinStandaloneTailwind` | `umd/tailwind.global.js` |
| `/vanilla` | `TouchSpinStandaloneVanilla` | `umd/vanilla.global.js` |

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

  <!-- Load standalone adapter -->
  <script src="https://cdn.jsdelivr.net/npm/@touchspin/standalone@5.0.0/dist/umd/bootstrap5.global.js"></script>

  <script>
    const api = TouchSpinStandaloneBootstrap5.mount('#quantity', {
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
