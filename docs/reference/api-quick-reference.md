# TouchSpin API Quick Reference

This document provides quick lookup for all TouchSpin API methods, events, and configuration options with practical examples.

## Core API Methods

### Instance Creation

```javascript
// Modern API (recommended)
const api = TouchSpin(inputElement, options);
const api = TouchSpin('#selector', options);

// jQuery wrapper (backward compatibility)
$('#selector').TouchSpin(options);

// Get existing instance
const api = getTouchSpin('#selector');
const core = getTouchSpinCore(inputElement);
```

### Value Operations

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getValue()` | none | `number` | Get current numeric value |
| `setValue(value)` | `number` | `void` | Set value with constraint application |
| `getDisplayValue()` | none | `string` | Get formatted display value |

```javascript
// Examples
const api = TouchSpin('#spinner');

// Get/set values
const current = api.getValue(); // e.g., 42
api.setValue(100);
const display = api.getDisplayValue(); // e.g., "100.00"
```

### Spin Operations

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `upOnce()` | none | `void` | Increment by one step |
| `downOnce()` | none | `void` | Decrement by one step |
| `startUpSpin()` | none | `void` | Start continuous increment |
| `startDownSpin()` | none | `void` | Start continuous decrement |
| `stopSpin()` | none | `void` | Stop any continuous spinning |

```javascript
// Single operations
api.upOnce();     // +1 step
api.downOnce();   // -1 step

// Continuous operations
api.startUpSpin();    // Start incrementing
api.startDownSpin();  // Start decrementing
api.stopSpin();       // Stop spinning
```

### Configuration Management

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `updateSettings(options)` | `object` | `void` | Update configuration with validation |

```javascript
// Update settings
api.updateSettings({
    max: 200,
    step: 5,
    decimals: 1
});

// Access current settings
console.log(api.settings.max); // 200
```

### Event Management

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `on(event, callback)` | `string, function` | `void` | Add event listener |
| `off(event, callback?)` | `string, function?` | `void` | Remove event listener |
| `emit(event, data?)` | `string, any?` | `void` | Emit event (internal use) |

```javascript
// Add event listeners
api.on('max', (data) => console.log('Hit maximum!', data));
api.on('min', (data) => console.log('Hit minimum!', data));
api.on('change', (data) => console.log('Value changed:', data));

// Remove event listeners
api.off('max'); // Remove all 'max' listeners
api.off('max', specificCallback); // Remove specific callback
```

### Instance Management

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `destroy()` | none | `void` | Clean up instance and remove from DOM |

```javascript
// Cleanup
api.destroy(); // Removes events, DOM elements, and instance reference
```

## Configuration Options

### Core Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `min` | `number \| null` | `null` | Minimum allowed value |
| `max` | `number \| null` | `null` | Maximum allowed value |
| `step` | `number` | `1` | Increment/decrement amount |
| `decimals` | `number` | `0` | Number of decimal places |
| `forcestepdivisibility` | `string` | `'round'` | Step alignment: 'round', 'floor', 'ceil', 'none' |

```javascript
TouchSpin('#spinner', {
    min: 0,
    max: 100,
    step: 0.5,
    decimals: 1,
    forcestepdivisibility: 'round'
});
```

### Initialization Values

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `initval` | `number \| null` | `null` | Initial value (if input empty) |
| `replacementval` | `number \| string` | `''` | Value when input becomes empty |
| `firstclickvalueifempty` | `number \| null` | `null` | Value on first click if empty |

```javascript
TouchSpin('#spinner', {
    initval: 10,              // Start at 10 if input is empty
    replacementval: 0,        // Show 0 when cleared
    firstclickvalueifempty: 1 // First click sets to 1 if empty
});
```

### Spin Behavior

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `stepinterval` | `number` | `100` | Milliseconds between steps during spin |
| `stepintervaldelay` | `number` | `500` | Delay before starting rapid spinning |
| `booster` | `boolean` | `true` | Enable step size acceleration |
| `boostat` | `number` | `10` | Steps before acceleration starts |
| `maxboostedstep` | `number` | `1000` | Maximum accelerated step size |

```javascript
TouchSpin('#spinner', {
    stepinterval: 50,      // Fast spinning (50ms between steps)
    stepintervaldelay: 200, // Quick acceleration (200ms delay)
    booster: true,         // Enable acceleration
    boostat: 5,            // Accelerate after 5 steps
    maxboostedstep: 100    // Max step size of 100
});
```

### UI Customization

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `prefix` | `string` | `''` | Text/HTML before input |
| `postfix` | `string` | `''` | Text/HTML after input |
| `prefix_extraclass` | `string` | `''` | Extra CSS class for prefix |
| `postfix_extraclass` | `string` | `''` | Extra CSS class for postfix |
| `verticalbuttons` | `boolean` | `false` | Stack buttons vertically |

```javascript
TouchSpin('#spinner', {
    prefix: '$',
    postfix: '.00',
    prefix_extraclass: 'text-success',
    postfix_extraclass: 'text-muted',
    verticalbuttons: true
});
```

### Button Customization

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `verticalup` | `string` | `'+'` | Text for up button (vertical layout) |
| `verticaldown` | `string` | `'-'` | Text for down button (vertical layout) |
| `verticalupclass` | `string` | `''` | CSS class for up button |
| `verticaldownclass` | `string` | `''` | CSS class for down button |

```javascript
TouchSpin('#spinner', {
    verticalbuttons: true,
    verticalup: '▲',
    verticaldown: '▼',
    verticalupclass: 'btn-success',
    verticaldownclass: 'btn-danger'
});
```

### Interactive Features

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mousewheel` | `boolean` | `true` | Enable mouse wheel support |

```javascript
TouchSpin('#spinner', {
    mousewheel: false // Disable wheel scrolling
});
```

## Events

### Boundary Events

| Event | When Fired | Data |
|-------|------------|------|
| `min` | Value reaches minimum boundary | `{value: number}` |
| `max` | Value reaches maximum boundary | `{value: number}` |

```javascript
api.on('min', (data) => {
    console.log(`Hit minimum value: ${data.value}`);
    // Disable decrement button, show warning, etc.
});

api.on('max', (data) => {
    console.log(`Hit maximum value: ${data.value}`);
    // Disable increment button, show warning, etc.
});
```

### Spin Events

| Event | When Fired | Data |
|-------|------------|------|
| `startspin` | Any spinning starts | `{direction: 'up'|'down'}` |
| `startupspin` | Upward spinning starts | `{direction: 'up'}` |
| `startdownspin` | Downward spinning starts | `{direction: 'down'}` |
| `stopspin` | Any spinning stops | `{direction: 'up'|'down'}` |
| `stopupspin` | Upward spinning stops | `{direction: 'up'}` |
| `stopdownspin` | Downward spinning stops | `{direction: 'down'}` |

```javascript
api.on('startspin', (data) => {
    console.log(`Started spinning ${data.direction}`);
});

api.on('stopspin', (data) => {
    console.log(`Stopped spinning ${data.direction}`);
});
```

### Value Events

| Event | When Fired | Data |
|-------|------------|------|
| `change` | Value changes and display updates | `{oldValue: number, newValue: number}` |

```javascript
api.on('change', (data) => {
    console.log(`Value changed from ${data.oldValue} to ${data.newValue}`);
    // Update related UI, save to database, etc.
});
```

### Booster Events

| Event | When Fired | Data |
|-------|------------|------|
| `boostchange` | Step size changes due to acceleration | `{step: number, isCapped: boolean}` |

```javascript
api.on('boostchange', (data) => {
    console.log(`Step size boosted to ${data.step}, capped: ${data.isCapped}`);
});
```

## jQuery Wrapper Compatibility

### Command API

For backward compatibility, the jQuery wrapper supports string commands:

```javascript
// jQuery command API (backward compatibility)
$('#spinner').TouchSpin('uponce');
$('#spinner').TouchSpin('downonce');
$('#spinner').TouchSpin('startUpSpin');
$('#spinner').TouchSpin('stopSpin');

// Get/set values
const value = $('#spinner').TouchSpin('getValue');
$('#spinner').TouchSpin('setValue', 42);

// Update settings
$('#spinner').TouchSpin('updateSettings', {max: 200});

// Destroy
$('#spinner').TouchSpin('destroy');
```

### Event Compatibility

jQuery events are mapped from core events:

```javascript
// Legacy jQuery events (still supported)
$('#spinner').on('touchspin.on.min', function() {
    console.log('Hit minimum (jQuery event)');
});

$('#spinner').on('touchspin.on.max', function() {
    console.log('Hit maximum (jQuery event)');
});

$('#spinner').on('touchspin.on.startspin', function() {
    console.log('Started spinning (jQuery event)');
});
```

## Common Usage Patterns

### Currency Input

```javascript
const currencySpinner = TouchSpin('#currency', {
    min: 0,
    max: 999999.99,
    step: 0.01,
    decimals: 2,
    prefix: '$',
    postfix: ' USD',
    forcestepdivisibility: 'round'
});

currencySpinner.on('change', (data) => {
    document.getElementById('total').textContent = `Total: $${data.newValue.toFixed(2)}`;
});
```

### Quantity Selector

```javascript
const quantitySpinner = TouchSpin('#quantity', {
    min: 1,
    max: 100,
    step: 1,
    initval: 1,
    verticalbuttons: true,
    mousewheel: true
});

quantitySpinner.on('max', () => {
    alert('Maximum quantity reached!');
});
```

### Percentage Input

```javascript
const percentageSpinner = TouchSpin('#percentage', {
    min: 0,
    max: 100,
    step: 5,
    postfix: '%',
    decimals: 1,
    booster: false // Disable acceleration for precise control
});
```

### Settings Form

```javascript
const settingsSpinner = TouchSpin('#setting-value', {
    min: 1,
    max: 1000,
    step: 1,
    stepinterval: 200,
    stepintervaldelay: 800,
    boostat: 15,
    maxboostedstep: 50
});

// Update related setting when value changes
settingsSpinner.on('change', (data) => {
    updateApplicationSetting('maxItems', data.newValue);
});
```

### Dynamic Configuration

```javascript
const dynamicSpinner = TouchSpin('#dynamic', {
    min: 0,
    max: 10,
    step: 1
});

// Update configuration based on other inputs
document.getElementById('max-input').addEventListener('change', (e) => {
    dynamicSpinner.updateSettings({
        max: parseInt(e.target.value)
    });
});

document.getElementById('step-input').addEventListener('change', (e) => {
    dynamicSpinner.updateSettings({
        step: parseFloat(e.target.value)
    });
});
```

## Advanced Usage

### Programmatic Control

```javascript
const api = TouchSpin('#advanced');

// Programmatically simulate user interactions
function incrementByTen() {
    for (let i = 0; i < 10; i++) {
        api.upOnce();
    }
}

// Controlled spinning
function timedSpin() {
    api.startUpSpin();
    setTimeout(() => api.stopSpin(), 2000); // Spin for 2 seconds
}
```

### Validation Integration

```javascript
const validatedSpinner = TouchSpin('#validated', {
    min: 1,
    max: 100
});

validatedSpinner.on('change', (data) => {
    // Custom validation beyond min/max
    if (data.newValue % 5 !== 0) {
        showWarning('Value should be divisible by 5');
    } else {
        clearWarning();
    }
});
```

### Integration with Forms

```javascript
const formSpinner = TouchSpin('#form-field', {
    min: 0,
    max: 1000,
    step: 10
});

// Form validation
document.getElementById('myForm').addEventListener('submit', (e) => {
    const value = formSpinner.getValue();
    if (value < 50) {
        e.preventDefault();
        alert('Value must be at least 50');
        return;
    }
    
    // Form will submit with current spinner value
});
```

## Troubleshooting

### Common Issues

**Issue:** Events not firing
```javascript
// ❌ Wrong - using jQuery event names with modern API
api.on('touchspin.on.max', callback);

// ✅ Correct - use modern event names
api.on('max', callback);

// ✅ Or use jQuery wrapper for compatibility
$('#spinner').on('touchspin.on.max', callback);
```

**Issue:** Value not updating
```javascript
// ❌ Wrong - direct DOM manipulation
document.getElementById('spinner').value = '42';

// ✅ Correct - use API
api.setValue(42);
```

**Issue:** Boundary not enforced
```javascript
// ❌ Wrong - trying to set invalid value
api.setValue(999); // When max is 100

// ✅ Correct - value will be clamped to max
api.setValue(999); // Results in value = 100
console.log(api.getValue()); // 100
```

### Debugging

```javascript
const api = TouchSpin('#debug');

// Enable debug logging
api.on('change', (data) => console.log('Change:', data));
api.on('min', (data) => console.log('Min boundary:', data));
api.on('max', (data) => console.log('Max boundary:', data));
api.on('startspin', (data) => console.log('Start spin:', data));
api.on('stopspin', (data) => console.log('Stop spin:', data));

// Check current state
console.log('Current value:', api.getValue());
console.log('Settings:', api.settings);
console.log('Is spinning:', api.spinning); // Internal property
```