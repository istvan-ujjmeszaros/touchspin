# TouchSpin Renderers

> [!NOTE]
> This is an alpha version of Bootstrap TouchSpin v5. The packages are not yet published to npm.

This directory contains the renderer packages for TouchSpin. Renderers are responsible for creating the visual representation of the spinner component for a specific CSS framework.

## How Renderers Work

Renderers extend the `AbstractRenderer` class from `@touchspin/core` and implement the `Renderer` interface. They are responsible for:

-   Creating the HTML structure for the spinner component.
-   Applying the appropriate CSS classes for the target framework.
-   Handling DOM events and delegating them to the core.

## Available Renderers

| Package | Description | README |
|---|---|---|
| `@touchspin/renderer-bootstrap5` | Renderer for Bootstrap 5 | [README](./bootstrap5/README.md) |
| `@touchspin/renderer-bootstrap4` | Renderer for Bootstrap 4 | [README](./bootstrap4/README.md) |
| `@touchspin/renderer-bootstrap3` | Renderer for Bootstrap 3 | [README](./bootstrap3/README.md) |
| `@touchspin/renderer-tailwind` | Renderer for Tailwind CSS | [README](./tailwind/README.md) |
| `@touchspin/renderer-vanilla` | Framework-agnostic renderer | [README](./vanilla/README.md) |