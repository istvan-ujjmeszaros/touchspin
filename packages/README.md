# TouchSpin Packages

This directory contains the modern multi-package architecture implementation of TouchSpin. The renderer-based architecture provides framework-agnostic core functionality with pluggable UI renderers.

## Active Packages

### Core (`packages/core/`)
- **Framework-agnostic TouchSpin core** - No jQuery dependencies
- **Renderer requirement** - All instances must specify a renderer
- **Observer pattern** - Settings changes notify renderers automatically
- **Element-attached instances** - Clean lifecycle management

### jQuery Plugin (`packages/jquery-plugin/`)
- **Backward-compatible jQuery wrapper** - Familiar `$().TouchSpin()` API
- **Callable event forwarding** - Forwards jQuery events to core methods
- **Renderer integration** - Pass renderer class in options

### Renderers (`packages/renderers/`)
- **Bootstrap 5 Renderer** - Full Bootstrap 5 input group support
- **Advanced input group detection** - Seamlessly integrates with existing markup
- **RawRenderer** - Minimal renderer for keyboard/wheel-only usage

## Planned Packages

- wrappers/*: `@touchspin/react`, `@touchspin/angular`, `@touchspin/webcomponent`
- renderers/bootstrap3: `@touchspin/renderer-bootstrap3`  
- renderers/bootstrap4: `@touchspin/renderer-bootstrap4`
- renderers/tailwind: `@touchspin/renderer-tailwind`

