# @touchspin/core



Framework-agnostic TouchSpin core with element-attached architecture. Core is strictly jQuery-free; any jQuery integration lives in the `@touchspin/jquery-plugin` package (including test helpers).

📚 **Documentation**: See [`docs/architecture/overview.md`](../../docs/architecture/overview.md) for a full package map and [`docs/architecture/renderer-guide.md`](../../docs/architecture/renderer-guide.md) for extension patterns.

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

## Getting Started

To use the core package, you need to provide a renderer. Here is a basic example using the `VanillaRenderer`:

```html
<input type="number" id="my-spinner" value="50">

<script type="module">
  import { TouchSpin } from '@touchspin/core';
  import { VanillaRenderer } from '@touchspin/renderer-vanilla';

  const input = document.getElementById('my-spinner');
  const instance = TouchSpin(input, {
    renderer: VanillaRenderer,
    min: 0,
    max: 100,
    step: 5
  });
</script>
```

### Using the RawRenderer (No UI)

If you only need the core functionality without any UI, you can achieve this by setting the `renderer` option to `null`. This is useful for programmatic control or for building your own custom UI.

```javascript
import { TouchSpin } from '@touchspin/core';

const input = document.getElementById('my-spinner');
const instance = TouchSpin(input, {
  renderer: null, // Explicitly no UI
  min: 0,
  max: 100,
  step: 1
});

// You can still control the input programmatically
instance.upOnce();
```

## API

### Core Functions

```ts
import { TouchSpin, getTouchSpin } from '@touchspin/core';
import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';

// Create/update instance attached to element (renderer required)
const api = TouchSpin(document.querySelector('input') as HTMLInputElement, {
  renderer: Bootstrap5Renderer,
  min: 0,
  max: 100,
});

// Get existing instance from element
const existing = getTouchSpin(document.querySelector('input') as HTMLInputElement);
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

### Value Sanitization & HTML5 Input Types

TouchSpin's sanitization behavior depends on both **event triggers** and **HTML5 input type constraints**:

#### HTML5 Input Type Behavior
- **`type="number"`**: Browser automatically rejects/clears non-numeric input
- **`type="text"`**: Browser accepts any input, allowing TouchSpin to handle sanitization

#### TouchSpin Sanitization Rules

**User Input → Auto-Sanitization** (only on `type="text"`)
```javascript
// On type="text" input: User types "42abc" and presses Tab
// → Change event fires → TouchSpin sanitizes → Value becomes "42"

// On type="number" input: User tries to type "42abc"
// → Browser rejects non-numeric characters → Only "42" gets entered
```

**Programmatic Input → No Auto-Sanitization**
```javascript
// On type="text": Programmatically set non-numeric value
input.value = "42abc";
// → No change event → No sanitization → Value remains "42abc"

// On type="number": Programmatically set non-numeric value
input.value = "42abc";
// → Browser rejects → Value becomes "" (empty string)

// To trigger sanitization on type="text":
input.value = "42abc";
input.dispatchEvent(new Event('change', { bubbles: true }));
// → Change event fires → TouchSpin sanitizes → Value becomes "42"
```

#### Recommendation
- Use **`type="number"`** for most TouchSpin instances (browser handles basic validation)
- Use **`type="text"`** only when you need custom input patterns that TouchSpin should sanitize
- Remember: `type="number"` prevents non-numeric input entirely, while `type="text"` + TouchSpin sanitizes on user events

#### When TouchSpin Sanitization Occurs
- ✅ **User keyboard input on type="text"** + blur/tab
- ✅ **Manual change event dispatch on type="text"**
- ✅ **Form submission** (if it triggers change events)
- ❌ **Direct property assignment** (`input.value = "..."`)
- ❌ **Any input on type="number"** (browser handles validation)
- ❌ **Programmatic setValue()** without explicit event dispatch

This behavior ensures TouchSpin respects programmatic control while providing user-friendly sanitization for interactive input.

### Event System

The core emits the following events that you can listen to:

| Event | Description |
|---|---|
| `min` | Fired when the minimum value is reached. |
| `max` | Fired when the maximum value is reached. |
| `startspin` | Fired when spinning starts in any direction. |
| `startupspin` | Fired when spinning up starts. |
| `startdownspin` | Fired when spinning down starts. |
| `stopspin` | Fired when spinning stops in any direction. |
| `stopupspin` | Fired when spinning up stops. |
| `stopdownspin` | Fired when spinning down stops. |

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

### Renderer Strategies

TouchSpin provides two base classes for building renderers:

| Strategy | Use Case | Complexity | Currently Used By |
|----------|----------|------------|-------------------|
| **AbstractRendererSimple** | Standard wrappers, no element movement | ✅ Simple | Bootstrap 3, Bootstrap 4, Vanilla, Tailwind |
| **AbstractRendererSurgical** | Complex DOM, element repositioning | 🔬 Advanced | Bootstrap 5 (floating labels) |

**Quick Decision:**
- Start with `AbstractRendererSimple` (easier, works for 80% of cases)
- Switch to `AbstractRendererSurgical` only if you need element movement or precise DOM restoration

See [Creating Custom Renderers Guide](../../docs/architecture/creating-custom-renderer.md) for detailed comparison and examples.

### For Renderer Developers

Renderers extend either `AbstractRendererSimple` or `AbstractRendererSurgical` (both extend `AbstractRendererBase`) and satisfy the `Renderer` interface (init, finalizeWrapperAttributes, optional teardown). Import from the subpath:

```ts
import { AbstractRendererSimple, type Renderer } from '@touchspin/core/renderer';

class CustomRenderer extends AbstractRendererSimple implements Renderer {
  init(): void {
    // 1) Build DOM structure around this.input
    this.wrapper = this.buildUI();

    // 2) Locate elements for event wiring
    const upBtn = this.wrapper.querySelector('[data-touchspin-injected="up"]');
    const downBtn = this.wrapper.querySelector('[data-touchspin-injected="down"]');

    // 3) Delegate events to core
    this.core.attachUpEvents(upBtn as HTMLElement | null);
    this.core.attachDownEvents(downBtn as HTMLElement | null);

    // 4) Observe settings as needed
    this.core.observeSetting('prefix', (v) => this.updatePrefix(v));
  }
}
```

Notes:
- `AbstractRenderer` already implements `finalizeWrapperAttributes()` and a default `teardown()`.
- `RendererConstructor` is the type expected in `TouchSpinCoreOptions.renderer`.

```ts
import type { RendererConstructor } from '@touchspin/core/renderer';

declare const MyRenderer: RendererConstructor;
TouchSpin(input, { renderer: MyRenderer });
```

### Typecheck Stability (structural constructor)

To avoid src/dist private-field brand collisions during typecheck, the `RendererConstructor` in `@touchspin/core/renderer` uses a structural constructor signature. Renderers still get the full `core` instance at runtime, but the constructor is typed against a minimal facade to keep typecheck stable across workspaces.

You do not need to change your runtime code — just import the constructor type from `@touchspin/core/renderer`.

### Renderer Option Schemas (DX only)

For better DX without changing public, flat options, you can define a small schema next to your renderer and project a typed view from `AbstractRenderer`:

```ts
import { AbstractRenderer, type RendererOptionSchema, type InferOptionsFromSchema } from '@touchspin/core/renderer';

const schema = Object.freeze({
  buttonup_txt: { kind: 'string' },
  buttondown_txt: { kind: 'string' },
  // ... more keys your renderer uses
} as const satisfies RendererOptionSchema);

class MyRenderer extends AbstractRenderer {
  private opts!: Readonly<Partial<InferOptionsFromSchema<typeof schema>>>;
  private refreshOpts() { this.opts = this.projectRendererOptions(schema); }

  init(): void {
    this.refreshOpts();
    // use this.opts.key in templates; read live values via this.settings in update paths
  }
}
```

This preserves the flat public API while giving strong autocomplete inside your renderer.

### Default Renderer (Global)

You can register a default renderer class (a `RendererConstructor`) that core uses when none is provided in options:

```ts
import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';
globalThis.TouchSpinDefaultRenderer = Bootstrap5Renderer;

// Now this uses Bootstrap5Renderer automatically
TouchSpin(document.querySelector('input') as HTMLInputElement);
```

## Renderer Authoring Checklist

- Extend `AbstractRenderer` and implement `Renderer`.
- Export your renderer class as the default.
- Provide a matching CSS file (`dist/touchspin-<flavor>.css`).
- Verify with the examples hub.
- Add Playwright smoke tests.

For a detailed guide, see [CONTRIBUTING.md](../../CONTRIBUTING.md).