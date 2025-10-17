# @touchspin/jquery

jQuery adapter for TouchSpin with 100% backward compatibility with the legacy jQuery plugin API.

## Installation

```bash
npm install @touchspin/jquery jquery
```

## Usage

### UMD (Browser - Drop-in Replacement)

The simplest way to use TouchSpin with jQuery:

```html
<!-- jQuery -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<!-- Bootstrap 5 CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- TouchSpin jQuery adapter (Bootstrap 5) -->
<script src="https://cdn.jsdelivr.net/npm/@touchspin/jquery@5/dist/umd/jquery.touchspin-bootstrap5.umd.js"></script>

<script>
  // Canonical usage (recommended)
  $('#my-input').touchspin({
    min: 0,
    max: 100,
    step: 1
  });

  // Legacy alias (still supported)
  $('#my-input').TouchSpin({
    min: 0,
    max: 100
  });
</script>
```

### ESM + Manual Install

For modern build tools:

```ts
import { installJQueryAdapter, autoInstall } from '@touchspin/jquery';
import { mount } from '@touchspin/standalone/bootstrap5';
import $ from 'jquery';

// Auto-install if jQuery is on window
autoInstall(mount);

// Or install manually
installJQueryAdapter($, mount);

// Use the plugin
$('#my-input').touchspin({
  min: 0,
  max: 100
});
```

## Available UMD Files

Each file bundles the adapter + standalone + specific renderer:

| Framework | UMD Filename | Global Name |
|-----------|--------------|-------------|
| Bootstrap 3 | `dist/umd/jquery.touchspin-bootstrap3.umd.js` | `TouchSpinJQueryBootstrap3` |
| Bootstrap 4 | `dist/umd/jquery.touchspin-bootstrap4.umd.js` | `TouchSpinJQueryBootstrap4` |
| Bootstrap 5 | `dist/umd/jquery.touchspin-bootstrap5.umd.js` | `TouchSpinJQueryBootstrap5` |
| Tailwind | `dist/umd/jquery.touchspin-tailwind.umd.js` | `TouchSpinJQueryTailwind` |
| Vanilla | `dist/umd/jquery.touchspin-vanilla.umd.js` | `TouchSpinJQueryVanilla` |

**Note**: The UMD files automatically install the jQuery plugin on `window.jQuery` when loaded.

## API Compatibility

The jQuery adapter maintains full compatibility with the legacy plugin API:

### Initialization

```js
// Canonical
$('#input').touchspin({ min: 0, max: 100 });

// Legacy alias
$('#input').TouchSpin({ min: 0, max: 100 });
```

### Command API

```js
// Set value
$('#input').touchspin('setValue', 42);

// Get value
const value = $('#input').touchspin('getValue');

// Increment/decrement
$('#input').touchspin('uponce');
$('#input').touchspin('downonce');

// Start/stop spin
$('#input').touchspin('startUpSpin');
$('#input').touchspin('stopSpin');

// Update settings
$('#input').touchspin('updateSettings', { max: 200 });

// Destroy
$('#input').touchspin('destroy');
```

### Events

The adapter bridges TouchSpin core events to jQuery custom events:

```js
// Canonical events (recommended)
$('#input').on('touchspin.on.change', function(e, value) {
  console.log('Value changed:', value);
});

$('#input').on('touchspin.on.max', function() {
  console.log('Maximum value reached');
});

$('#input').on('touchspin.on.min', function() {
  console.log('Minimum value reached');
});

// Callable events (trigger actions)
$('#input').trigger('touchspin.uponce');
$('#input').trigger('touchspin.downonce');
$('#input').trigger('touchspin.updatesettings', { max: 200 });
```

**Available emitted events**:
- `touchspin.on.change`
- `touchspin.on.min`
- `touchspin.on.max`
- `touchspin.on.startspin`
- `touchspin.on.stopspin`

## Example

```html
<!DOCTYPE html>
<html>
<head>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <label for="quantity">Quantity:</label>
    <input id="quantity" type="number" value="0" />
  </div>

  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@touchspin/jquery@5/dist/umd/jquery.touchspin-bootstrap5.umd.js"></script>

  <script>
    $(document).ready(function() {
      // Initialize
      $('#quantity').touchspin({
        min: 0,
        max: 100,
        step: 1,
        prefix: 'Qty: ',
        verticalbuttons: true
      });

      // Listen for changes
      $('#quantity').on('touchspin.on.change', function(e, newValue) {
        console.log('New value:', newValue);
      });

      // Handle max boundary
      $('#quantity').on('touchspin.on.max', function() {
        alert('Maximum quantity reached!');
      });
    });
  </script>
</body>
</html>
```

## Method Name Conventions

- **Canonical**: `.touchspin()` (lowercase) - **Recommended**
- **Legacy alias**: `.TouchSpin()` (CamelCase) - Still supported for backward compatibility

Both work identically, but we recommend using the lowercase `.touchspin()` for consistency with jQuery conventions.

## Notes

- **One renderer per page**: Each UMD file bundles a specific renderer. Don't load multiple renderer files on the same page.
- **jQuery version**: Requires jQuery 1.9.0 or higher.
- **Form integration**: The input remains part of the DOM and participates in form submission.
- **Cleanup**: Call `.touchspin('destroy')` before removing elements to prevent memory leaks.

## License

MIT
