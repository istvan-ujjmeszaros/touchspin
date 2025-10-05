# TouchSpin Renderers

This directory contains the renderer packages for TouchSpin. Renderers are responsible for creating the visual representation of the spinner component for a specific CSS framework.

## How Renderers Work

Renderers extend either `AbstractRendererSimple` or `AbstractRendererSurgical` from `@touchspin/core/renderer` and implement the `Renderer` interface. They are responsible for:

-   Creating the HTML structure for the spinner component.
-   Applying the appropriate CSS classes for the target framework.
-   Handling DOM events and delegating them to the core.

## Renderer Strategies

TouchSpin provides two base strategies for building renderers:

- **AbstractRendererSimple**: Simple attribute-based cleanup. Best for most use cases.
- **AbstractRendererSurgical**: LIFO operation tracking for complex DOM manipulation (element movement, floating labels).

See [Creating Custom Renderers Guide](../../docs/architecture/creating-custom-renderer.md) for choosing the right strategy.

## Available Renderers

| Package | Description | Strategy | README |
|---|---|---|---|
| `@touchspin/renderer-bootstrap5` | Renderer for Bootstrap 5 | 🔬 Surgical | [README](./bootstrap5/README.md) |
| `@touchspin/renderer-bootstrap4` | Renderer for Bootstrap 4 | ✅ Simple | [README](./bootstrap4/README.md) |
| `@touchspin/renderer-bootstrap3` | Renderer for Bootstrap 3 | ✅ Simple | [README](./bootstrap3/README.md) |
| `@touchspin/renderer-tailwind` | Renderer for Tailwind CSS | ✅ Simple | [README](./tailwind/README.md) |
| `@touchspin/renderer-vanilla` | Framework-agnostic renderer | ✅ Simple | [README](./vanilla/README.md) |

**Why different strategies?**
- **Simple** (4 renderers): Standard input wrappers, straightforward cleanup
- **Surgical** (Bootstrap 5 only): Needed for complex floating label support with element repositioning