# Bootstrap TouchSpin Architecture Guide

This guide describes the TypeScript architecture that powers the TouchSpin monorepo. The goal is to show how responsibilities are split across packages, how data flows through the system, and where you can extend the component safely.

## Architecture Overview

TouchSpin uses a **workspace-first architecture** backed by Yarn 4. Each package focuses on a single concern:

```
packages/
├── core/               # Framework-agnostic business logic (TypeScript)
├── jquery-plugin/      # jQuery compatibility wrapper
├── renderers/          # DOM renderers for design systems
│   ├── bootstrap3/
│   ├── bootstrap4/
│   ├── bootstrap5/
│   └── tailwind/
├── vanilla-renderer/   # CSS-variable driven renderer used by the web component
└── web-component/      # Standards-based `<touchspin-input>` custom element
```

This separation gives us:
- **Framework Independence**: Core logic works with any CSS framework
- **100% Backward Compatibility**: Existing jQuery code works unchanged
- **Extensibility**: Easy to add new renderers and framework wrappers
- **Testability**: Each package can be tested in isolation
- **TypeScript DX**: Shared types keep renderers and wrappers honest

## Package Responsibilities

### Core Package (`packages/core`)

**Responsibilities:**
- Business logic (validation, calculations, state management)
- Event system (framework-agnostic event emitter)
- Settings management with comprehensive sanitization
- Public API for direct usage

**Key Exports:**
- `TouchSpinCore` — state machine that owns business rules
- `AbstractRenderer` / `RendererConstructor` — renderer contracts
- `TouchSpin()` / `getTouchSpin()` — factory helpers that attach instances to inputs

**Usage (TypeScript):**
```ts
import { TouchSpin } from '@touchspin/core';
import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';

const input = document.querySelector('input[type="number"]') as HTMLInputElement;
const api = TouchSpin(input, {
  renderer: Bootstrap5Renderer,
  min: 0,
  max: 100,
  step: 1,
});

api.on('change', ({ newValue }) => console.log('Value:', newValue));
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
```ts
import { AbstractRenderer } from '@touchspin/core/renderer';

export default class CustomRenderer extends AbstractRenderer {
  init(): void {
    this.wrapper = this.buildInputGroup();

    const upButton = this.wrapper.querySelector('[data-touchspin-injected="up"]');
    const downButton = this.wrapper.querySelector('[data-touchspin-injected="down"]');

    this.core.attachUpEvents(upButton);
    this.core.attachDownEvents(downButton);

    this.core.observeSetting('prefix', (value) => this.updatePrefix(value ?? ''));
  }
}
```

### jQuery Plugin (`packages/jquery-plugin`)

**Responsibilities:**
- Backward compatibility with jQuery-based code
- Event bridging (core events → jQuery events)
- Command API support (`TouchSpin('uponce')`)
- Chainable jQuery interface

**Compatibility Layer:**
```ts
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

```ts
class TouchSpinCore {
  constructor(input: HTMLInputElement, options: TouchSpinCoreOptions) {
    this.input = input;
    this.settings = TouchSpinCore.sanitizePartialSettings(options, DEFAULTS);
    this.attachLifecycle();
  }

  upOnce() { /* ... */ }
  downOnce() { /* ... */ }
  startUpSpin() { /* ... */ }
  startDownSpin() { /* ... */ }
  stopSpin() { /* ... */ }
  getValue() { /* ... */ }
  setValue(value: string | number) { /* ... */ }
  updateSettings(options: Partial<TouchSpinCoreOptions>) { /* ... */ }

  on(event: TouchSpinCallableEvent, handler: (detail?: unknown) => void) { /* ... */ }
  off(event: TouchSpinCallableEvent, handler: (detail?: unknown) => void) { /* ... */ }
  destroy() { /* ... */ }
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
```ts
// Core emits framework-agnostic events
core.emit('max', { value: 100, direction: 'up' });

// jQuery wrapper automatically bridges to legacy events
$(input).trigger('touchspin.on.max', { value: 100, direction: 'up' });
```

### Settings Management

Settings undergo **comprehensive sanitization** to ensure valid configurations:

```ts
const sanitized = TouchSpinCore.sanitizePartialSettings(
  { step: 0, decimals: -1, min: Number.NaN, max: 100 },
  core.settings,
);

// Result: { step: 1, decimals: 0, min: null, max: 100 }
```

**Observer Pattern** for reactive updates:
```ts
this.core.observeSetting('prefix', (next) => {
  this.prefixElement.textContent = next ?? '';
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
yarn add @touchspin/core @touchspin/renderer-bootstrap5
```

### Basic Usage

```ts
import { TouchSpin } from '@touchspin/core';
import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';

const input = document.querySelector('#my-input') as HTMLInputElement;
const api = TouchSpin(input, {
  renderer: Bootstrap5Renderer,
  min: 0,
  max: 100,
  step: 1,
  prefix: '$',
});

api.on('change', ({ newValue }) => {
  console.log(`Value changed to: ${newValue}`);
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
