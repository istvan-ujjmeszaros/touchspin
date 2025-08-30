@touchspin/core
==============

**Framework-agnostic TouchSpin core with element-attached architecture.**

## Status: ✅ IMPLEMENTED

The core is fully implemented with modern element-attached architecture.

## Features

- **Element-Attached Instances**: TouchSpin() stores instances directly on DOM elements
- **No jQuery Dependency**: Pure JavaScript with ESM exports
- **Mandatory Renderer Architecture**: All instances require a renderer class
- **Observer Pattern**: Renderers can observe setting changes via `observeSetting()`
- **Event Delegation**: Core provides `attachUpEvents()` and `attachDownEvents()` for renderers
- **Clean Lifecycle**: Simple init/destroy with automatic cleanup
- **Data Attribute Event Handling**: DOM events via data-touchspin-injected attributes only
- **Complete API**: All original TouchSpin functionality preserved

## API

### Core Functions

```javascript
import { TouchSpin, getTouchSpin, RawRenderer } from '@touchspin/core';
import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';

// Create/update instance attached to element (renderer required)
const api = TouchSpin(inputElement, {
  renderer: Bootstrap5Renderer, // or RawRenderer for minimal UI
  min: 0,
  max: 100
});

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

### For Renderer Developers

Renderers must extend `AbstractRenderer` and implement `init()`:

```javascript
// Import AbstractRenderer directly from file path
import AbstractRenderer from '../core/src/AbstractRenderer.js';

class CustomRenderer extends AbstractRenderer {
  init() {
    // 1. Build DOM structure around this.input
    this.wrapper = this.createUI();
    
    // 2. Find button elements
    const upBtn = this.wrapper.querySelector('[data-touchspin-injected="up"]');
    const downBtn = this.wrapper.querySelector('[data-touchspin-injected="down"]');
    
    // 3. Tell core to attach event handlers
    this.core.attachUpEvents(upBtn);
    this.core.attachDownEvents(downBtn);
    
    // 4. Observe setting changes (optional)
    this.core.observeSetting('prefix', (value) => this.updatePrefix(value));
  }
}
```

### Available Renderers

- **RawRenderer**: No additional UI elements (imported from core)
- **Bootstrap5Renderer**: Full Bootstrap 5 input group support
- **Bootstrap4Renderer**: Bootstrap 4 input group support (planned)
- **Bootstrap3Renderer**: Bootstrap 3 input group support (planned)

