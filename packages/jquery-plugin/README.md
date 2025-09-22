# @touchspin/jquery-plugin

> [!NOTE]
> This is an alpha version of Bootstrap TouchSpin v5. The package is not yet published to npm.

jQuery plugin wrapper for TouchSpin that provides **full backward compatibility** with the original Bootstrap TouchSpin jQuery plugin while leveraging the modern core architecture.

## Overview

This plugin preserves the complete original TouchSpin jQuery API while adding support for multiple UI frameworks through pluggable renderers (Bootstrap 3/4/5, Tailwind, vanilla, etc.). It acts as a thin bridge between jQuery and the modern TouchSpin core, delegating all logic to the core while maintaining the familiar jQuery interface.

## Features

- ✅ **100% API Compatible** - Drop-in replacement for the original jQuery TouchSpin
- ✅ **Multiple Renderers** - Works with Bootstrap 3/4/5, Tailwind, and custom renderers
- ✅ **Full Event Support** - All jQuery events and callable triggers preserved
- ✅ **Chaining Support** - Standard jQuery method chaining works as expected
- ✅ **Clean Architecture** - Thin wrapper that delegates to modern core

## Installation

### Alpha Version from NPM

```bash
npm install bootstrap-touchspin@next
```

### ES Modules

```javascript
import { installJqueryTouchSpin } from '@touchspin/jquery-plugin';
import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';

// Option 1: Install with a default renderer (recommended)
import { installWithRenderer } from '@touchspin/jquery-plugin';
installWithRenderer(Bootstrap5Renderer);

// Option 2: Manual installation (renderer must be passed in options)
installJqueryTouchSpin(window.jQuery);
```

### CDN / UMD

This package provides UMD bundles that include the core, a renderer, and the jQuery wrapper in a single file. Choose the bundle that matches your Bootstrap version:

```html
<!-- For Bootstrap 5 -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap-touchspin@5.0.0-alpha.1/dist/touchspin.jquery.bs5.min.js"></script>

<!-- For Bootstrap 4 -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap-touchspin@5.0.0-alpha.1/dist/touchspin.jquery.bs4.min.js"></script>

<!-- For Bootstrap 3 -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap-touchspin@5.0.0-alpha.1/dist/touchspin.jquery.bs3.min.js"></script>
```

## Initialization

### Basic Usage

```javascript
// Basic initialization
$('#myinput').TouchSpin({
  min: 0,
  max: 100,
  step: 1
});

// With all options
$('#myinput').TouchSpin({
  min: 0,                    // Minimum value
  max: 100,                  // Maximum value
  step: 1,                   // Step increment
  decimals: 0,               // Number of decimal places
  prefix: '$',               // Prefix text
  postfix: 'USD',            // Postfix text
  verticalbuttons: false,    // Vertical button layout
});
```

## Command API Reference

All commands are called using the pattern: `$(selector).TouchSpin('command', [args])`

Commands are **case-insensitive** - both `'upOnce'` and `'uponce'` work.

### Value Operations

```javascript
// Get current value
var value = $('#myinput').TouchSpin('get');
var value = $('#myinput').TouchSpin('getvalue'); // Alias

// Set value
$('#myinput').TouchSpin('set', 50);
$('#myinput').TouchSpin('setvalue', 50); // Alias
```

**Note:** `get`/`getvalue` returns the raw input value even if no TouchSpin instance exists.

### Increment/Decrement

```javascript
// Increment value by one step
$('#myinput').TouchSpin('uponce');

// Decrement value by one step
$('#myinput').TouchSpin('downonce');
```

### Continuous Spinning

```javascript
// Start continuous increment (until stopped)
$('#myinput').TouchSpin('startupspin');

// Start continuous decrement (until stopped)
$('#myinput').TouchSpin('startdownspin');

// Stop any active spinning
$('#myinput').TouchSpin('stopspin');
```

### Settings & Lifecycle

```javascript
// Update settings dynamically
$('#myinput').TouchSpin('updatesettings', {
  min: -50,
  max: 50,
  step: 0.5
});

// Destroy TouchSpin instance
$('#myinput').TouchSpin('destroy');
```

## Callable jQuery Events

You can trigger these events to control TouchSpin programmatically:

```javascript
// Increment/decrement
$('#myinput').trigger('touchspin.uponce');
$('#myinput').trigger('touchspin.downonce');

// Continuous spinning
$('#myinput').trigger('touchspin.startupspin');
$('#myinput').trigger('touchspin.startdownspin');
$('#myinput').trigger('touchspin.stopspin');

// Update settings
$('#myinput').trigger('touchspin.updatesettings', [{
  min: 0,
  max: 200,
  step: 5
}]);

// Destroy instance
$('#myinput').trigger('touchspin.destroy');
```

## Emitted jQuery Events

TouchSpin emits these events that you can listen to:

### Boundary Events

```javascript
// Fired when minimum value is reached
$('#myinput').on('touchspin.on.min', function() {
  console.log('Minimum value reached');
});

// Fired when maximum value is reached
$('#myinput').on('touchspin.on.max', function() {
  console.log('Maximum value reached');
});
```

### Spin Events

```javascript
// Fired when any spinning starts (up or down)
$('#myinput').on('touchspin.on.startspin', function() {
  console.log('Spinning started');
});

// Fired when increment spinning starts
$('#myinput').on('touchspin.on.startupspin', function() {
  console.log('Incrementing started');
});

// Fired when decrement spinning starts
$('#myinput').on('touchspin.on.startdownspin', function() {
  console.log('Decrementing started');
});

// Fired when any spinning stops
$('#myinput').on('touchspin.on.stopspin', function() {
  console.log('Spinning stopped');
});

// Fired when increment spinning stops
$('#myinput').on('touchspin.on.stopupspin', function() {
  console.log('Incrementing stopped');
});

// Fired when decrement spinning stops
$('#myinput').on('touchspin.on.stopdownspin', function() {
  console.log('Decrementing stopped');
});
```

## Complete Example

```javascript
// Initialize with options
$('#quantity').TouchSpin({
  min: 1,
  max: 100,
  step: 1,
  prefix: 'Qty: '
});

// Listen for events
$('#quantity').on('touchspin.on.min', function() {
  alert('Cannot order less than 1 item');
});

$('#quantity').on('touchspin.on.max', function() {
  alert('Maximum quantity reached');
});

// Programmatic control
$('#increase-btn').click(function() {
  $('#quantity').trigger('touchspin.uponce');
});

$('#set-default-btn').click(function() {
  $('#quantity').TouchSpin('set', 10);
});

// Dynamic settings update
$('#wholesale-mode').change(function() {
  if ($(this).is(':checked')) {
    $('#quantity').TouchSpin('updatesettings', {
      min: 10,
      step: 10
    });
  }
});

// Get current value
$('#show-value').click(function() {
  var qty = $('#quantity').TouchSpin('get');
  alert('Current quantity: ' + qty);
});

// Cleanup
$('#remove-btn').click(function() {
  $('#quantity').TouchSpin('destroy');
});
```

## Chaining Support

All command methods support jQuery chaining:

```javascript
$('#myinput')
  .TouchSpin({ min: 0, max: 100 })
  .TouchSpin('set', 50)
  .TouchSpin('uponce')
  .addClass('highlighted')
  .on('touchspin.on.max', function() {
    $(this).addClass('at-maximum');
  });
```

## Architecture Notes

The jQuery plugin is a thin wrapper that:
1. **Forwards to Core** - All logic is handled by `@touchspin/core`
2. **Element Storage** - Uses core's `getTouchSpin()` instead of jQuery data
3. **Event Bridge** - Converts between core events and jQuery events
4. **No DOM Logic** - Core handles all DOM event management

## Important Notes

- **Renderer Requirement**: The plugin requires either a global default renderer (set via `installWithRenderer`) or a `renderer` option passed during initialization
- **Case Insensitivity**: All command names are case-insensitive
- **Change Event**: The native `change` event is fired when values change, in addition to TouchSpin-specific events
- **Safe Commands**: Commands are safely ignored if no TouchSpin instance exists (except `get`/`getvalue` which return the raw value)
- **Multiple Instances**: Each input maintains its own independent TouchSpin instance

## TypeScript Support

For TypeScript users:

```typescript
import { installWithRenderer } from '@touchspin/jquery-plugin';
import type { TSRenderer } from '@touchspin/core/renderer';
import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';

// The renderer type is TSRenderer
const renderer: typeof TSRenderer = Bootstrap5Renderer;
installWithRenderer(renderer);
```

## Migration from Original TouchSpin

This plugin is a **drop-in replacement** for the original Bootstrap TouchSpin. Simply:

1. Replace the old script includes with the new ones
2. Add a renderer (Bootstrap 3/4/5 depending on your framework)
3. All existing code continues to work without changes

```javascript
// Old code - still works!
$('.spinner').TouchSpin({
  min: 0,
  max: 100,
  prefix: '$'
});

$('.spinner').TouchSpin('set', 50);
```

## License

MIT
