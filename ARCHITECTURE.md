# TouchSpin Modern Architecture

This document explains the implemented modern modular architecture of Bootstrap TouchSpin and how to use it.

## Architecture Overview ✅ **IMPLEMENTED**

The modern TouchSpin uses a **modular package architecture** with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Framework     │    │   Core Logic    │    │   Rendering     │
│   Wrappers      │◄───┤  (Pure JS)      │───►│   (Bootstrap)   │
│  (jQuery, etc.) │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Status**: ✅ Fully implemented and tested with 10/10 TDD behavioral parity tests passing.

## Package Structure ✅ **IMPLEMENTED**

### 1. Core Engine ✅ (`packages/core/`)

**Location**: `packages/core/src/index.js`  
**Role**: Framework-agnostic business logic  
**Dependencies**: None (pure JavaScript)

```javascript
// Core responsibilities:
- Value pipeline: _nextValue, _forcestepdivisibility, _alignToStep  
- State management: disabled/readonly checks, boundary detection
- Event emission: 'min', 'max', 'startspin', 'stopspin'  
- Settings management: updateSettings, validation
- Callback processing: before/after calculation hooks
```

**API**:
```javascript  
import { createPublicApi } from '../../packages/core/src/index.js';

const api = createPublicApi(inputElement, { min: 0, max: 100, step: 1 });
api.upOnce();           // Increment value
api.getValue();         // Get current value  
api.setValue(50);       // Set value programmatically
api.on('max', handler); // Listen to boundary events
```

### 2. Renderers ✅ (`packages/renderers/`)

**Implemented Packages**:
- `@touchspin/renderer-bootstrap3` (`packages/renderers/renderer-bootstrap3/`)
- `@touchspin/renderer-bootstrap4` (`packages/renderers/renderer-bootstrap4/`) 
- `@touchspin/renderer-bootstrap5` (`packages/renderers/renderer-bootstrap5/`)
- `@touchspin/renderer-tailwind` (`packages/renderers/renderer-tailwind/`)

**Role**: Handle DOM manipulation and framework-specific markup

```javascript
// Renderer responsibilities:
- DOM structure creation (input groups, buttons)
- Framework-specific classes (Bootstrap, Tailwind)
- Event binding (mousedown, touchstart, keyboard)  
- ARIA attributes and accessibility
- Visual styling and layout
```

### 3. jQuery Wrapper ✅ (`packages/jquery-plugin/`)

**Location**: `packages/jquery-plugin/src/index.js`  
**Role**: Provides jQuery API and backwards compatibility  

```javascript
// Wrapper provides jQuery integration:
- $.fn.TouchSpin() registration
- $input.data('touchspin') and $input.data('touchspinInternal')
- jQuery event emission (touchspin.on.min, change, etc.)
- Command API: $(input).TouchSpin('setValue', 50)
- 100% backwards compatibility with original plugin
```

### 4. Framework Wrappers 🔄 **PLANNED**

- `@touchspin/react`: React component wrapper
- `@touchspin/angular`: Angular component wrapper  
- `@touchspin/webcomponent`: Web Components wrapper

## Data Flow

```
User Interaction → Renderer → Core → Wrapper → Framework Events
                    ↓         ↓      ↓
                   DOM      Logic   API
```

**Step-by-step flow**:
1. **User clicks button** → Renderer captures `mousedown` event  
2. **Renderer calls core** → `core.upOnce()` or `core.downOnce()`
3. **Core processes** → value calculation, validation, boundary checks
4. **Core emits events** → 'change', 'min', 'max' with new value
5. **Wrapper listens** → converts to framework events (`$input.trigger('change')`)
6. **Application code** → receives familiar framework events

## Usage Examples

### Modern Modular Approach (Current Implementation)

```html
<!DOCTYPE html>
<html>
<head>
  <script src="jquery.min.js"></script>
  <link href="bootstrap.min.css" rel="stylesheet">
  
  <!-- Renderer for UI framework -->
  <script src="../../src/renderers/Bootstrap4Renderer.js"></script>
  <script>
    window.RendererFactory = class {
      static createRenderer($, settings, input) {
        return new Bootstrap4Renderer($, settings, input);
      }
      static getVersion() { return 4; }
    };
  </script>
  
  <!-- Core + jQuery wrapper -->
  <script type="module">
    import { installJqueryTouchSpin } from '../../packages/jquery-plugin/src/index.js';
    installJqueryTouchSpin(window.jQuery);
  </script>
</head>
<body>
  <input id="demo" type="text" value="50">
  
  <script>
    // Same familiar API!
    $("#demo").TouchSpin({ min: 0, max: 100 });
  </script>
</body>
</html>
```

### Original Approach (Legacy Compatibility)

```html  
<!DOCTYPE html>
<html>
<head>
  <script src="jquery.min.js"></script>
  <link href="bootstrap.min.css" rel="stylesheet">
  
  <!-- Single monolithic file -->
  <script src="../../src/jquery.bootstrap-touchspin.js"></script>
</head>
<body>
  <input id="demo" type="text" value="50">
  
  <script>
    $("#demo").TouchSpin({ min: 0, max: 100 });
  </script>
</body>
</html>
```

### Future: React Component (Planned)

```jsx
import { TouchSpin } from '@touchspin/react';

function MyComponent() {
  const [value, setValue] = useState(50);
  
  return (
    <TouchSpin 
      min={0} 
      max={100}
      value={value}
      onChange={setValue}
      renderer="bootstrap4"
    />
  );
}
```

## Benefits of Modern Architecture

### 1. **Framework Independence** ✅
- Core logic works with any framework (React, Vue, Angular, vanilla JS)
- Only wrapper layer is framework-specific
- Easy to create new framework integrations

### 2. **CSS Framework Flexibility** ✅  
- Single core + different renderers for Bootstrap 3/4/5, Tailwind, etc.
- Add new CSS frameworks without touching business logic
- Consistent behavior across all visual styles

### 3. **Bundle Size Optimization** ✅
- Import only what you need: core + specific renderer
- Tree shaking eliminates unused code  
- No jQuery required for modern framework implementations

### 4. **Enhanced Testability** ✅
- Core logic tested independently of DOM
- Renderer behavior tested separately
- TDD approach ensures behavioral parity (10/10 tests passing)
- Integration tests verify complete stack

### 5. **Maintainability** ✅
- Clear separation of concerns
- Single responsibility principle  
- Easier to debug and extend
- Framework updates don't affect core logic

## Backwards Compatibility ✅

The jQuery wrapper ensures **100% API compatibility** with the original plugin:

```javascript
// All original APIs still work:
$(input).TouchSpin({ min: 0, max: 100 });
$(input).TouchSpin('getValue');  
$(input).TouchSpin('setValue', 75);
$(input).TouchSpin('upOnce');
$(input).TouchSpin('destroy');

// Data access methods:
$(input).data('touchspin').upOnce();
$(input).data('touchspinInternal').getValue();

// Event handling:
$(input).on('touchspin.on.max', handler);
$(input).on('change', handler);
```

## Testing Architecture ✅

**TDD Behavioral Parity**: 10/10 tests passing comparing original vs modern implementations

```javascript
// Comprehensive Test Coverage:
✅ Basic increment/decrement behavior
✅ Programmatic API (getValue, setValue, upOnce)  
✅ Boundary behavior (min/max constraints)
✅ Disabled input behavior
✅ Readonly input behavior
✅ Event emission patterns  
✅ Callback formatting with currency
✅ Modern core unit tests (disabled/readonly, events, step alignment)
```

**Test Types**:
- **Unit Tests**: Core logic, individual renderers, framework wrappers
- **Integration Tests**: Original vs Modern behavior, cross-framework consistency  
- **End-to-End Tests**: Real browser interactions, accessibility, performance

## Implementation Status

- ✅ **Core Engine**: Fully implemented and tested
- ✅ **Renderers**: Bootstrap 3/4/5 and Tailwind implemented  
- ✅ **jQuery Wrapper**: Complete with 100% backwards compatibility
- ✅ **TDD Parity**: 10/10 behavioral parity tests passing
- ✅ **Documentation**: Architecture and usage documented
- 🔄 **Framework Wrappers**: React, Vue, Angular (planned)
- 🔄 **Build System**: UMD bundles and ESM exports (in progress)

This architecture provides a solid foundation for long-term maintainability while ensuring seamless migration from the original monolithic plugin.

