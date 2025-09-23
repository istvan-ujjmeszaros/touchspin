# TouchSpin Packages



This directory contains the modern multi-package architecture implementation of TouchSpin. The renderer-based architecture provides framework-agnostic core functionality with pluggable UI renderers.

## Architecture

The project is structured as a monorepo with a clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Framework     │    │   Core Logic    │    │   Rendering     │
│   Wrappers      │◄───┤  (Pure JS)      │───►│   (UI Framework)  │
│(jQuery, Web Comp)│    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Active Packages

### Core (`packages/core/`)

*   **[@touchspin/core](./core/README.md):** The framework-agnostic core of TouchSpin. It contains all the business logic for managing the input's value, handling state, and processing settings. It has no UI and is intended to be used with a renderer.

### Wrappers (`packages/wrappers/`)

*   **[@touchspin/jquery-plugin](./jquery-plugin/README.md):** A backward-compatible jQuery wrapper that provides the familiar `$().TouchSpin()` API. It acts as a bridge between jQuery and the modern TouchSpin core.
*   **[@touchspin/web-component](./web-component/README.md):** A standards-based Web Component (`<touchspin-input>`) that encapsulates the plugin's functionality. It can be used in any framework that supports web components.

### Renderers (`packages/renderers/`)

Renderers are responsible for creating the visual representation of the spinner component. They extend `AbstractRenderer` and implement the core `Renderer` contract.

*   **[@touchspin/renderer-bootstrap5](./renderers/bootstrap5/README.md):** Renderer for Bootstrap 5.
*   **[@touchspin/renderer-bootstrap4](./renderers/bootstrap4/README.md):** Renderer for Bootstrap 4.
*   **[@touchspin/renderer-bootstrap3](./renderers/bootstrap3/README.md):** Renderer for Bootstrap 3.
*   **[@touchspin/renderer-tailwind](./renderers/tailwind/README.md):** Renderer for Tailwind CSS.
*   **[@touchspin/renderer-vanilla](./renderers/vanilla/README.md):** A framework-agnostic renderer with no CSS dependencies.

## Future Development

We are continuously working to expand TouchSpin's ecosystem. Here are some areas for future development:

-   `@touchspin/react`: An official React wrapper.
-   `@touchspin/angular`: An official Angular wrapper.
-   Other framework wrappers and renderers as community needs arise.