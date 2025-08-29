@touchspin/core
==============

**Framework-agnostic TouchSpin core with element-attached architecture.**

## Status: ✅ IMPLEMENTED

The core is fully implemented with modern element-attached architecture.

## Features

- **Element-Attached Instances**: TouchSpin() stores instances directly on DOM elements
- **No jQuery Dependency**: Pure JavaScript with ESM exports
- **Clean Lifecycle**: Simple init/destroy with automatic cleanup
- **Data Attribute Event Handling**: DOM events via data-touchspin-injected attributes only
- **Complete API**: All original TouchSpin functionality preserved

## API

### Core Functions

```javascript
import { TouchSpin, getTouchSpin } from '@touchspin/core';

// Create/update instance attached to element
const api = TouchSpin(inputElement, options);

// Get existing instance from element
const api = getTouchSpin(inputElement);
```

### Instance Methods

```javascript
api.upOnce()              // Increment once
api.downOnce()            // Decrement once  
api.startUpSpin()         // Start continuous increment
api.startDownSpin()       // Start continuous decrement
api.stopSpin()            // Stop spinning
api.getValue()            // Get current value
api.setValue(value)       // Set specific value
api.updateSettings(opts)  // Update options
api.destroy()             // Destroy and remove from element
```

### Event System

```javascript
api.on('min', () => console.log('Hit minimum'));
api.on('max', () => console.log('Hit maximum'));
api.on('startspin', () => console.log('Started spinning'));
```

## DOM Event Handling

The core attaches event listeners to elements with `data-touchspin-injected` attributes:

- **data-touchspin-injected="up"** - mousedown/touchstart for increment
- **data-touchspin-injected="down"** - mousedown/touchstart for decrement
- **Input element** - keydown/keyup/wheel/input/change events

## Renderer Integration

Works with renderer packages that provide `data-touchspin-injected` markup:

```javascript
import { TouchSpin } from '@touchspin/core';
// Renderer creates DOM structure with proper data attributes
const api = TouchSpin(input, options);
api.initDOMEventHandling(); // Attach to rendered elements
```

