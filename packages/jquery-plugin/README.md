@touchspin/jquery-plugin
=======================

**jQuery plugin wrapper that preserves the original TouchSpin API while using the modern core.**

## Status: ✅ IMPLEMENTED

Complete jQuery plugin wrapper with full backward compatibility.

## Features

- **Full API Compatibility**: Preserves all original jQuery TouchSpin methods
- **Callable Events**: All touchspin.* events supported
- **Command API**: All TouchSpin('command') methods work
- **Element-Attached**: Uses modern core with element-attached instances
- **Event Bridging**: Forwards core events to jQuery events
- **Clean Integration**: No DOM event logic - delegates everything to core

## Installation

```javascript
import { installJqueryTouchSpin } from '@touchspin/jquery-plugin';
installJqueryTouchSpin(window.jQuery);
```

### With a Default Renderer

The core requires a renderer class. You can set a global default via the jQuery plugin helper so jQuery users don’t need to pass a renderer on every call.

```ts
import { installWithRenderer } from '@touchspin/jquery-plugin';
import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';

// Expects a RendererConstructor (a renderer class)
installWithRenderer(Bootstrap5Renderer);

// Now jQuery usage works without specifying a renderer in options
$('#myinput').TouchSpin({ min: 0, max: 100 });
```

## Usage

### Initialization
```javascript
$('#myinput').TouchSpin({
  min: 0,
  max: 100,
  step: 1
});
```

### Command API
```javascript
$('#myinput').TouchSpin('uponce');           // Increment once
$('#myinput').TouchSpin('downonce');         // Decrement once
$('#myinput').TouchSpin('get');              // Get value
$('#myinput').TouchSpin('set', 50);          // Set value
$('#myinput').TouchSpin('destroy');          // Destroy
```

### Callable Events
```javascript
$('#myinput').trigger('touchspin.uponce');
$('#myinput').trigger('touchspin.updatesettings', [{step: 5}]);
```

### jQuery Events
```javascript
$('#myinput').on('touchspin.on.min', function() {
  console.log('Hit minimum value');
});
```

## Architecture

The jQuery wrapper is a thin bridge that:

1. **Forwards to Core**: All methods delegate to `@touchspin/core`
2. **Element Storage**: Uses `getTouchSpin()` instead of jQuery data
3. **Event Bridge**: Converts core events to jQuery events
4. **No DOM Logic**: Core handles all DOM event management

### Types

- `installWithRenderer` expects a `RendererConstructor` (from `@touchspin/core/renderer`).
- For TypeScript users, you can import: `import type { RendererConstructor } from '@touchspin/core/renderer'`.

### CDN (UMD)

```html
<!-- Core + a renderer (Bootstrap 5) + jQuery plugin -->
<script src="https://cdn.jsdelivr.net/npm/@touchspin/core/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5/dist/index.umd.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5/dist/touchspin-bootstrap5.css" />
<script src="https://cdn.jsdelivr.net/npm/@touchspin/jquery-plugin/dist/index.umd.js"></script>

<script>
  // Set default renderer for core via plugin helper
  TouchSpinJquery.installWithRenderer(TouchSpinRendererBootstrap5);
  // Now you can use the jQuery API
  jQuery('#myinput').TouchSpin({ min: 0, max: 100 });
  // Or trigger commands/events
  jQuery('#myinput').TouchSpin('uponce');
<\/script>
```

## Supported Methods

### Command API
- `destroy`, `uponce`, `downonce`, `startupspin`, `startdownspin`, `stopspin`
- `updatesettings`, `getvalue`/`get`, `setvalue`/`set`

### Callable Events
- `touchspin.uponce`, `touchspin.downonce`, `touchspin.startupspin`
- `touchspin.startdownspin`, `touchspin.stopspin`, `touchspin.updatesettings`

### jQuery Events (Emitted)
- `touchspin.on.min`, `touchspin.on.max`, `touchspin.on.startspin`
- `touchspin.on.stopspin`, `touchspin.on.startupspin`, `touchspin.on.startdownspin`
