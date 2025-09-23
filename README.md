# TouchSpin v5.0.0



[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa)](https://github.com/sponsors/istvan-ujjmeszaros)
[![run-tests](https://github.com/istvan-ujjmeszaros/touchspin/actions/workflows/run-tests.yml/badge.svg)](https://github.com/istvan-ujjmeszaros/touchspin/actions/workflows/run-tests.yml)
[![npm version](https://img.shields.io/npm/v/touchspin/next)](https://www.npmjs.com/package/touchspin)
[![npm downloads](https://img.shields.io/npm/dm/touchspin)](https://www.npmjs.com/package/touchspin)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**A mobile and touch friendly input spinner component for Bootstrap 3, 4 & 5.**

TouchSpin is a mobile-first JavaScript library with a modern renderer-based architecture that transforms number inputs into spinner controls with increment/decrement buttons for touch interfaces and desktop environments. Available as both a framework-agnostic core, a jQuery plugin wrapper, and a standards-based Web Component.

**[Live Demo & Documentation](https://www.virtuosoft.eu/code/touchspin/)**

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

#### For jQuery Users (Backward Compatible)

```bash
# yarn
yarn add bootstrap-touchspin

# npm
npm install bootstrap-touchspin
```

#### For Modern JavaScript/TypeScript Projects

```bash
# Core package (framework-agnostic)
npm install @touchspin/core

# jQuery wrapper (ESM, if using jQuery)
npm install @touchspin/jquery-plugin

# Web Component
npm install @touchspin/web-component

# Specific renderers (as needed)
npm install @touchspin/renderer-bootstrap5
npm install @touchspin/renderer-tailwind
```

### UMD Builds (for jQuery)

Choose the build that matches your Bootstrap version:

```html
<!-- Bootstrap 3 -->
<link rel="stylesheet" href="dist/jquery.bootstrap-touchspin.css">
<script src="dist/jquery.bootstrap-touchspin-bs3.js"></script>

<!-- Bootstrap 4 -->
<link rel="stylesheet" href="dist/jquery.bootstrap-touchspin.css">
<script src="dist/jquery.bootstrap-touchspin-bs4.js"></script>

<!-- Bootstrap 5 -->
<link rel="stylesheet" href="dist/jquery.bootstrap-touchspin.css">
<script src="dist/jquery.bootstrap-touchspin-bs5.js"></script>
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

## Future Development

This project is now stable with the v5.0.0 release. We are continuously working to improve TouchSpin. Here are some areas for future development:

-   **Framework Wrappers:** Create official wrappers for popular frameworks like React, Vue, and Angular to provide more idiomatic usage.
-   **Enhanced Documentation:** Continuously improve documentation with more examples, use cases, and detailed guides.
-   **Testing Expansion:** Expand test coverage, including more visual regression tests and cross-browser compatibility checks.
-   **Performance Optimizations:** Further profile and optimize the performance of the core and renderers for even faster and smoother operation.
-   **New Renderers:** Explore adding support for other CSS frameworks or design systems.

---

## AI-Assisted Development

This project uses AI agents to assist in development, particularly in writing tests and documentation. For more information, see the `AGENTS.md` and `CLAUDE.md` files.

---

## Version History

**Latest: v5.0.0**

See [CHANGELOG.md](CHANGELOG.md) for complete version history.