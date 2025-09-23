# Gemini Project Context: TouchSpin

This document provides context for the TouchSpin project, a mobile and touch-friendly input spinner component.

## Project Overview

This is a monorepo for the TouchSpin project, a JavaScript library that enhances number inputs into spinner controls. The project has a modern, modular architecture with a framework-agnostic core, renderers for different CSS frameworks (Bootstrap 3, 4, 5, and Tailwind), and a jQuery plugin for backward compatibility.

The project is written in TypeScript and uses Yarn 4 (Berry) with PnP and workspaces for package management.

### Key Technologies

*   **Core:** Vanilla JavaScript (TypeScript)
*   **CSS Frameworks:** Bootstrap (3, 4, 5), Tailwind CSS
*   **Testing:** Playwright
*   **Build:** Rollup
*   **Linting:** ESLint
*   **Formatting:** Prettier
*   **Package Management:** Yarn 4 (Berry) with PnP and Workspaces

### Architecture

The project is structured as a monorepo with the following key packages:

*   `packages/core`: The framework-agnostic core logic.
*   `packages/renderers`: Renderers for different CSS frameworks (Bootstrap 3, 4, 5, and Tailwind).
*   `packages/jquery-plugin`: A jQuery wrapper for backward compatibility.
*   `packages/web-component`: A standards-based custom element.

The architecture is designed to be extensible, with plans for future wrappers for frameworks like React, and Angular.

## Building and Running

### Key Commands

*   **Install dependencies:**
    ```bash
    yarn install
    ```
*   **Start the development server:**
    ```bash
    yarn dev
    ```
*   **Build all packages:**
    ```bash
    yarn build
    ```
*   **Run tests:**
    ```bash
    yarn test
    ```
*   **Run tests in watch mode:**
    ```bash
    yarn test:watch
    ```
*   **Run linter:**
    ```bash
    yarn lint
    ```
*   **Fix linting errors:**
    ```bash
    yarn lint:fix
    ```
*   **Format code:**
    ```bash
    yarn format
    ```

## Development Conventions

*   **Source Code:** All new code should be placed in the `packages/` directory. The legacy `src/` directory at the root is for reference only.
*   **Testing:** The project uses Playwright for end-to-end testing. Tests are located in the `tests` directory of each package. The project has a very strict testing methodology, with the goal of 100% test coverage. All tests are written from scratch using a Gherkin-style format and a comprehensive set of test helpers. The testing strategy is documented in detail in the `CLAUDE.md` file.
*   **AI-assisted development:** The `CLAUDE.md` and `AGENTS.md` files indicate that AI agents are used to assist in development, particularly in writing tests.
*   **Linting:** The project uses ESLint with a configuration that extends `eslint:recommended` and `plugin:@typescript-eslint/recommended`.
*   **Formatting:** The project uses Prettier for code formatting.
*   **Commits:** The project uses Changesets to manage versioning and changelogs.
*   **Contributions:** Contributions are welcome. See `CONTRIBUTING.md` for more details.
