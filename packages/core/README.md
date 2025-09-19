@touchspin/core
==============

Framework-agnostic TouchSpin core with element-attached architecture. Core is strictly jQuery-free; any jQuery integration lives in the `@touchspin/jquery-plugin` package (including test helpers).

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

Renderers extend `AbstractRenderer` and satisfy the `Renderer` interface (init, finalizeWrapperAttributes, optional teardown). Import from the subpath:

```ts
import { AbstractRenderer, type Renderer } from '@touchspin/core/renderer';

class CustomRenderer extends AbstractRenderer implements Renderer {
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
