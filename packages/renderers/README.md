Renderer Packages (Placeholder)
===============================

Status: scaffold only. Each renderer package will encapsulate markup/classes for a UI framework:
- @touchspin/renderer-bootstrap3
- @touchspin/renderer-bootstrap4
- @touchspin/renderer-bootstrap5
- @touchspin/renderer-tailwind

Renderers extend `AbstractRenderer` and implement the core `Renderer` contract (init, finalizeWrapperAttributes, optional teardown). Import types from `@touchspin/core/renderer` if you’re building a custom renderer.
