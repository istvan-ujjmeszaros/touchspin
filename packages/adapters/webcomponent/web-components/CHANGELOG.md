# Changelog

All notable changes to the `@touchspin/web-components` package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.0.0] - 2025-01-XX

### Added
- 🎯 Initial release of `@touchspin/web-components` package
- 🌳 Tree-shakable architecture with separate entry points per renderer
- 🎨 Five specialized web components:
  - `<touchspin-vanilla>` - Pure CSS styling
  - `<touchspin-bootstrap3>` - Bootstrap 3 support
  - `<touchspin-bootstrap4>` - Bootstrap 4 support
  - `<touchspin-bootstrap5>` - Bootstrap 5 support
  - `<touchspin-tailwind>` - Tailwind CSS support
- ⚡ Framework-agnostic custom elements (Web Components v1)
- 📦 Optimized bundle sizes (~30KB per renderer)
- ♿ ARIA-compliant and fully accessible
- 📱 Touch-friendly mobile support
- 🔧 Complete programmatic API (methods, properties, events)
- 📚 Framework integration examples (React, Vue, Angular)
- 📖 Comprehensive documentation and examples

### Architecture
- Abstract `TouchSpinBase` class for shared functionality
- Renderer-specific classes extending the base
- Light DOM (no Shadow DOM) for framework CSS compatibility
- Automatic custom element registration on import

### Changed
- **BREAKING:** Renamed from `@touchspin/web-component` (singular) to `@touchspin/web-components` (plural)
- **BREAKING:** Changed from single `<touchspin-input>` element to renderer-specific elements
- **BREAKING:** Renderers are now optional peer dependencies instead of hard dependencies

### Migration from @touchspin/web-component

#### Before (v4.x)
```javascript
import '@touchspin/web-component';
// Single component with hard-coded vanilla renderer

<touchspin-input min="0" max="100" value="50"></touchspin-input>
```

#### After (v5.0)
```javascript
// Import only the renderer you need
import '@touchspin/web-components/vanilla';

<touchspin-vanilla min="0" max="100" value="50"></touchspin-vanilla>
```

or

```javascript
import '@touchspin/web-components/bootstrap5';

<touchspin-bootstrap5 min="0" max="100" value="50"></touchspin-bootstrap5>
```

### Benefits
- **Bundle size:** 75% smaller when using a single renderer
- **Explicit:** Component name indicates the renderer
- **Flexible:** Easy to use multiple renderers in one app
- **Discoverable:** Better IDE autocomplete and documentation

[5.0.0]: https://github.com/istvan-ujjmeszaros/bootstrap-touchspin/tree/main/packages/web-components
