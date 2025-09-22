# Bootstrap TouchSpin v5.0.0-alpha.1

> [!WARNING]
> This is an alpha version of Bootstrap TouchSpin v5. It is not yet ready for production use. Please use it for testing purposes only and report any issues you find.

[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa)](https://github.com/sponsors/istvan-ujjmeszaros)
[![run-tests](https://github.com/istvan-ujjmeszaros/bootstrap-touchspin/actions/workflows/run-tests.yml/badge.svg)](https://github.com/istvan-ujjmeszaros/bootstrap-touchspin/actions/workflows/run-tests.yml)
[![npm version](https://img.shields.io/npm/v/bootstrap-touchspin/next)](https://www.npmjs.com/package/bootstrap-touchspin)
[![npm downloads](https://img.shields.io/npm/dm/bootstrap-touchspin)](https://www.npmjs.com/package/bootstrap-touchspin)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**A mobile and touch friendly input spinner component for Bootstrap 3, 4 & 5.**

TouchSpin is a mobile-first JavaScript library with a modern renderer-based architecture that transforms number inputs into spinner controls with increment/decrement buttons for touch interfaces and desktop environments. Available as both a framework-agnostic core, a jQuery plugin wrapper, and a standards-based Web Component.

**[Live Demo & Documentation](https://www.virtuosoft.eu/code/bootstrap-touchspin/)**

---

## Key Features

- **Modern Renderer Architecture** - Modular, framework-agnostic core with pluggable renderers
- **Web Component** - Standards-based `<touchspin-input>` custom element
- **Mobile-First Design** - Designed for touch interfaces and mobile devices
- **Bootstrap 3/4/5 Support** - Dedicated renderers for each Bootstrap version
- **Framework Agnostic** - Works with or without jQuery, ready for React/Vue/Angular
- **Standard HTML Controls** - Uses semantic button and input elements
- **RTL Language Support** - Full right-to-left language compatibility
- **Lightweight & Fast** - Minimal footprint with targeted builds
- **Customizable** - Multiple configuration options and renderer flexibility
- **Decimal Precision** - Support for floating-point numbers
- **Booster Mode** - Accelerated value changes for large ranges
- **Event System** - Programmatic event handling with blur-based sanitization
- **Vertical Layout** - Alternative button arrangement
- **ARIA Support** - Automatic accessibility attributes for screen readers

---

## Quick Start

### Package Manager Installation

Install the alpha version from npm:

```bash
# yarn
yarn add bootstrap-touchspin@next

# npm
npm install bootstrap-touchspin@next
```

### UMD Builds (for jQuery)

Choose the build that matches your Bootstrap version:

```html
<!-- Bootstrap 3 -->
<link rel="stylesheet" href="dist/jquery.bootstrap-touchspin.min.css">
<script src="dist/jquery.bootstrap-touchspin-bs3.min.js"></script>

<!-- Bootstrap 4 -->
<link rel="stylesheet" href="dist/jquery.bootstrap-touchspin.min.css">
<script src="dist/jquery.bootstrap-touchspin-bs4.min.js"></script>

<!-- Bootstrap 5 -->
<link rel="stylesheet" href="dist/jquery.bootstrap-touchspin.min.css">
<script src="dist/jquery.bootstrap-touchspin-bs5.min.js"></script>
```

### Basic Usage (jQuery)

```html
<input type="number" id="quantity" name="quantity" value="5">

<script>
  $('#quantity').TouchSpin({
    min: 1,
    max: 100,
    step: 1,
    boostat: 5,
    maxboostedstep: 10,
    postfix: '%'
  });
</script>
```

### Web Component Usage

```html
<script type="module" src="node_modules/@touchspin/web-component/dist/index.js"></script>
<link rel="stylesheet" href="node_modules/@touchspin/vanilla-renderer/dist/touchspin-vanilla.css">

<touchspin-input min="0" max="100" value="50"></touchspin-input>
```

---

## Monorepo Documentation

- [docs/index.md](docs/index.md) — architecture, migration, and extension guides
- [ARCHITECTURE.md](ARCHITECTURE.md) — high-level summary of the modern modular build
- [BUILDING.md](BUILDING.md) — running `yarn build`, `yarn build:test`, and workspace builds
- [TESTING.md](TESTING.md) — Playwright, coverage, and guard scripts

---

## Renderer Architecture

TouchSpin now uses a modern renderer-based architecture that separates core functionality from UI presentation. This enables framework-agnostic usage and easy customization.

### Available Renderers

| Renderer | Purpose | Import Path |
|---|---|---|
| **Bootstrap5Renderer** | Bootstrap 5 input groups | `@touchspin/renderer-bootstrap5` |
| **Bootstrap4Renderer** | Bootstrap 4 input groups | `@touchspin/renderer-bootstrap4` |
| **Bootstrap3Renderer** | Bootstrap 3 input groups | `@touchspin/renderer-bootstrap3` |
| **TailwindRenderer** | Tailwind CSS styling | `@touchspin/renderer-tailwind` |
| **VanillaRenderer** | Framework-agnostic styling | `@touchspin/renderer-vanilla` |
| **RawRenderer** | No UI elements (keyboard/wheel only) | `@touchspin/core` |


---

## v5 Roadmap

This project is currently in alpha. The following is a high-level roadmap for the v5 release:

-   **API Stability:** Finalize the core API and the API for the framework wrappers.
-   **Framework Wrappers:** Create wrappers for popular frameworks like React, Vue, and Angular.
-   **Documentation:** Improve the documentation and add more examples.
-   **Testing:** Reach 100% test coverage and add more visual regression tests.
-   **Performance:** Profile and optimize the performance of the core and renderers.

### Migration from v4

A detailed migration guide will be provided with the first stable release of v5. The jQuery plugin is designed to be 100% backward compatible, so the migration should be straightforward for most users.

---

## AI-Assisted Development

This project uses AI agents to assist in development, particularly in writing tests and documentation. For more information, see the `AGENTS.md` and `CLAUDE.md` files.

---

## Version History

**Latest: v5.0.0-alpha.1**

See [CHANGELOG.md](CHANGELOG.md) for complete version history.