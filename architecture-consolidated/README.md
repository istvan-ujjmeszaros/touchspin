# Bootstrap TouchSpin Architecture Guide

A comprehensive guide to the modular architecture of Bootstrap TouchSpin - a framework-agnostic numeric input component with 100% backward compatibility.

## Architecture Overview

TouchSpin uses a **modular architecture** that separates concerns into focused packages:

```
packages/
├── core/              # Framework-agnostic business logic
├── jquery-plugin/     # jQuery compatibility wrapper  
└── renderers/         # UI builders for CSS frameworks
    ├── bootstrap3/    # Bootstrap 3 support
    ├── bootstrap4/    # Bootstrap 4 support  
    ├── bootstrap5/    # Bootstrap 5 support
    └── tailwind/      # Tailwind CSS support
```

This design enables:
- **Framework Independence**: Core logic works with any CSS framework
- **100% Backward Compatibility**: Existing jQuery code works unchanged
- **Extensibility**: Easy to add new renderers and framework wrappers
- **Testability**: Each package can be tested in isolation
- **Modern JavaScript**: Uses contemporary patterns while supporting legacy usage

## Package Responsibilities

### Core Package (`packages/core/`)

**Responsibilities:**
- Business logic (validation, calculations, state management)
- Event system (framework-agnostic event emitter)
- Settings management with comprehensive sanitization
- Public API for direct usage

**Key Classes:**
- `TouchSpinCore` - Main business logic class
- `AbstractRenderer` - Base class for all renderers
- Factory functions: `TouchSpin()`, `getTouchSpin()`

**Usage:**
```javascript
import { TouchSpin } from '@touchspin/core';

const api = TouchSpin(inputElement, {
    min: 0,
    max: 100,
    step: 1
});

api.on('change', (data) => console.log('Value:', data.newValue));
api.upOnce();
```

### Renderer Packages (`packages/renderers/*`)

**Responsibilities:**
- Framework-specific DOM construction
- CSS class management
- Visual element updates (prefix/postfix, button states)
- Event attachment coordination with core

**Available Renderers:**
- `Bootstrap3Renderer` - Bootstrap 3.x support
- `Bootstrap4Renderer` - Bootstrap 4.x support  
- `Bootstrap5Renderer` - Bootstrap 5.x support
- `TailwindRenderer` - Tailwind CSS support

**Renderer Pattern:**
```javascript
class CustomRenderer extends AbstractRenderer {
    init() {
        // 1. Build DOM structure
        this.wrapper = this.buildWrapper();
        
        // 2. Find buttons and elements
        const upButton = this.wrapper.querySelector('[data-touchspin-injected="up"]');
        
        // 3. Attach core event handlers
        this.core.attachUpEvents(upButton);
        
        // 4. Observe setting changes
        this.core.observeSetting('prefix', (value) => this.updatePrefix(value));
    }
}
```

### jQuery Plugin (`packages/jquery-plugin/`)

**Responsibilities:**
- Backward compatibility with jQuery-based code
- Event bridging (core events → jQuery events)
- Command API support (`TouchSpin('uponce')`)
- Chainable jQuery interface

**Compatibility Layer:**
```javascript
// Modern API
const api = TouchSpin('#spinner', options);

// jQuery API (same functionality)
$('#spinner').TouchSpin(options);
$('#spinner').TouchSpin('uponce');
$('#spinner').on('touchspin.on.max', handler);
```

## Core Architecture Details

### TouchSpinCore Class

The heart of the system is the `TouchSpinCore` class:

```javascript
class TouchSpinCore {
    constructor(inputEl, settings) {
        this.inputEl = inputEl;
        this.settings = sanitizeSettings(settings);
        this.eventEmitter = new Map();
        this.spinning = false;
        
        this.setupEventHandlers();
        this.initializeValue();
    }
    
    // Public API methods
    upOnce() { /* Increment by one step */ }
    downOnce() { /* Decrement by one step */ }
    startUpSpin() { /* Begin continuous increment */ }
    stopSpin() { /* Stop continuous operation */ }
    getValue() { /* Get current numeric value */ }
    setValue(value) { /* Set value with validation */ }
    updateSettings(options) { /* Update configuration */ }
    
    // Event system
    on(event, callback) { /* Add event listener */ }
    off(event, callback) { /* Remove event listener */ }
    emit(event, data) { /* Emit event */ }
    
    // Lifecycle
    destroy() { /* Clean up instance */ }
}
```

### Event System

TouchSpin uses a **framework-agnostic event system** with automatic jQuery bridging:

**Core Events:**
- `change` - Value changed
- `min` / `max` - Boundary reached
- `startspin` / `stopspin` - Spinning state changes
- `boostchange` - Step size changed during acceleration

**Event Flow:**
```javascript
// Core emits framework-agnostic events
core.emit('max', {value: 100, direction: 'up'});

// jQuery wrapper automatically bridges to legacy events
$(input).trigger('touchspin.on.max', {value: 100, direction: 'up'});
```

### Settings Management

Settings undergo **comprehensive sanitization** to ensure valid configurations:

```javascript
// Input sanitization
const settings = sanitizeSettings({
    step: 0,      // Invalid - corrected to 1
    decimals: -1, // Invalid - corrected to 0
    min: 'invalid', // Invalid - corrected to null
    max: 100
});

// Result: {step: 1, decimals: 0, min: null, max: 100}
```

**Observer Pattern** for reactive updates:
```javascript
// Renderers can observe setting changes
core.observeSetting('prefix', (newValue) => {
    this.prefixElement.textContent = newValue;
});
```

### Boundary Logic

TouchSpin uses **proactive boundary checking** for optimal performance:

```javascript
upOnce() {
    // Check boundary BEFORE operation
    if (this.getValue() === this.settings.max) {
        this.emit('max');
        return; // Prevent unnecessary calculation
    }
    
    // Safe to proceed with increment
    const nextValue = this._nextValue('up', this.getValue());
    this._setDisplay(nextValue, true);
}
```

This prevents wasted calculations and provides predictable event timing.

## Extending TouchSpin

### Creating Custom Renderers

TouchSpin can support any CSS framework through custom renderers. See the **[Creating Custom Renderers Guide](creating-custom-renderer.md)** for complete details.

**Quick Example:**
```javascript
import { AbstractRenderer } from '@touchspin/core';

class MaterialRenderer extends AbstractRenderer {
    init() {
        this.wrapper = this.buildMaterialWrapper();
        const upButton = this.wrapper.querySelector('.mdc-button--up');
        this.core.attachUpEvents(upButton);
        
        // Observe settings for reactive updates
        this.core.observeSetting('prefix', this.updateMaterialPrefix);
    }
    
    buildMaterialWrapper() {
        // Material Design HTML structure
        const wrapper = document.createElement('div');
        wrapper.className = 'mdc-text-field mdc-text-field--outlined';
        // ... Material-specific DOM construction
        return wrapper;
    }
}
```

### Creating Framework Wrappers

TouchSpin can be integrated into any JavaScript framework. See the **[Creating Framework Wrappers Guide](creating-framework-wrapper.md)** for detailed examples.

**Angular Example:**
```typescript
@Component({
    selector: 'app-touchspin',
    template: '<input [id]="inputId">'
})
export class TouchSpinComponent implements OnInit, OnDestroy {
    @Input() options: TouchSpinOptions = {};
    @Output() valueChange = new EventEmitter<number>();
    
    private api: TouchSpinAPI;
    
    ngOnInit() {
        this.api = TouchSpin(`#${this.inputId}`, this.options);
        this.api.on('change', (data) => this.valueChange.emit(data.newValue));
    }
    
    ngOnDestroy() {
        this.api?.destroy();
    }
}
```

**React Hook Example:**
```javascript
function useTouchSpin(inputRef, options) {
    const [value, setValue] = useState(0);
    const apiRef = useRef(null);
    
    useEffect(() => {
        if (inputRef.current) {
            apiRef.current = TouchSpin(inputRef.current, options);
            apiRef.current.on('change', (data) => setValue(data.newValue));
        }
        
        return () => apiRef.current?.destroy();
    }, [inputRef, options]);
    
    return { value, api: apiRef.current };
}
```

## API Reference

### Core API Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getValue()` | none | `number` | Get current numeric value |
| `setValue(value)` | `number` | `void` | Set value with validation |
| `upOnce()` | none | `void` | Increment by one step |
| `downOnce()` | none | `void` | Decrement by one step |
| `startUpSpin()` | none | `void` | Begin continuous increment |
| `startDownSpin()` | none | `void` | Begin continuous decrement |
| `stopSpin()` | none | `void` | Stop any spinning |
| `updateSettings(opts)` | `object` | `void` | Update configuration |
| `on(event, callback)` | `string, function` | `void` | Add event listener |
| `off(event, callback)` | `string, function` | `void` | Remove event listener |
| `destroy()` | none | `void` | Clean up instance |

### Configuration Options

**Core Settings:**
- `min` / `max` - Value boundaries
- `step` - Increment/decrement amount  
- `decimals` - Display precision
- `initval` - Initial value if input empty

**UI Settings:**
- `prefix` / `postfix` - Text before/after input
- `verticalbuttons` - Button layout
- `mousewheel` - Mouse wheel support

**Behavior Settings:**
- `booster` - Step size acceleration
- `stepinterval` - Spinning speed
- `forcestepdivisibility` - Step alignment

See **[Options Reference](reference/options-feature-matrix.md)** for complete details.

### Events

**Value Events:**
- `change` - Value changed: `{oldValue, newValue}`
- `min` / `max` - Boundary reached: `{value, direction}`

**Interaction Events:**
- `startspin` / `stopspin` - Spinning state: `{direction}`
- `startupspin` / `startdownspin` - Direction-specific start
- `stopupspin` / `stopdownspin` - Direction-specific stop

**Acceleration Events:**
- `boostchange` - Step size changed: `{step, isCapped, level}`

See **[Event Reference](reference/event-matrix.md)** for timing and data details.

## Getting Started

### Installation

```bash
npm install @touchspin/core @touchspin/bootstrap5
```

### Basic Usage

```javascript
import { TouchSpin } from '@touchspin/core';
import '@touchspin/bootstrap5'; // Registers Bootstrap 5 renderer

const api = TouchSpin('#my-input', {
    min: 0,
    max: 100,
    step: 1,
    prefix: '$'
});

api.on('change', (data) => {
    console.log(`Value changed to: ${data.newValue}`);
});
```

### jQuery Compatibility

```javascript
// Existing jQuery code works unchanged
$('#my-input').TouchSpin({
    min: 0,
    max: 100,
    step: 1,
    prefix: '$'
});

$('#my-input').on('touchspin.on.change', function(e, data) {
    console.log(`Value changed to: ${data.newValue}`);
});
```

## Documentation Structure

- **[API Quick Reference](reference/api-quick-reference.md)** - Complete API documentation with examples
- **[Options Reference](reference/options-feature-matrix.md)** - All configuration options
- **[Event Reference](reference/event-matrix.md)** - Event system details
- **[Common Patterns](reference/common-patterns.md)** - Implementation examples
- **[Creating Custom Renderers](creating-custom-renderer.md)** - Build CSS framework support
- **[Creating Framework Wrappers](creating-framework-wrapper.md)** - Framework integration guide
- **[Architecture History](HISTORY.md)** - Evolution story and design decisions
- **[Case Studies](case-study-blog.md)** - Detailed refactoring analysis

## Architecture Principles

### 1. Separation of Concerns
- **Core**: Business logic only
- **Renderers**: UI construction only  
- **Wrappers**: Framework integration only

### 2. Framework Independence
- Core works with any CSS framework
- Renderers provide framework-specific UI
- No framework assumptions in business logic

### 3. Backward Compatibility
- 100% compatibility with existing jQuery code
- New features available alongside legacy interface
- Migration is opt-in, never required

### 4. Extensibility
- Plugin architecture for renderers
- Observer pattern for reactive updates
- Clean interfaces for framework integration

### 5. Modern JavaScript
- ES6+ classes and modules
- Comprehensive JSDoc documentation
- Tree-shakable package structure
- Native event system with fallbacks

This architecture enables TouchSpin to serve both legacy projects needing stability and modern projects requiring flexibility, all while maintaining the simple, familiar interface that made it popular.