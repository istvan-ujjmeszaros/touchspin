@touchspin/renderer-bootstrap5 (Scaffold)
=====================================

Status: scaffold only. Extracted from `src/renderers/Bootstrap5Renderer.js` with the same markup/classes. Intended for consumption by core/wrappers once Phase B4 wires builds to use packages.

Exports (planned)
- createRenderer($, settings, originalinput) → instance
- getFrameworkId() → 'bootstrap5'

Notes
- This package currently includes a migrated copy of `AbstractRenderer` and `Bootstrap5Renderer` for isolation. API wiring to ESM exports happens in Phase B4.

