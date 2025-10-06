# Building

> **💡 For comprehensive build automation documentation, see [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md)**

## Automatic Build Guards

TouchSpin uses **intelligent build guards** that automatically ensure all required artifacts are built before running tests or starting development servers:

- **Pre-Dev Guard** - Runs before `yarn dev` and `yarn dev:hot`
  - Checks if `devdist/` artifacts exist and are up-to-date
  - Rebuilds only stale packages (targeted builds)
  - Avoids dependency cycles with package-specific builds

- **Pre-Test Guard** - Runs before `yarn test`
  - Validates test code quality (no `/src/` imports, no raw selectors)
  - Checks and rebuilds devdist artifacts if needed
  - Ensures tests run against current source code

**In most cases, you don't need to run build commands manually!** The guards handle everything automatically.

## Manual Build Commands

For cases where you need manual control:

- **Development build for tests**: `yarn build:test` (topological tsc → devdist)
- **Production build**: `yarn build:prod` (topological types then js)
- **Incremental build**: `yarn build` (full monorepo build)
- **Package-specific**: `yarn workspace @touchspin/core build:test`

Monorepo scripts intentionally use `-t` (topological) to guarantee cross-package d.ts availability.

## Build Output Directories

- **`dist/`** - Production builds (gitignored, not tracked)
- **`devdist/`** - Development/test builds (gitignored except external assets)
- **`devdist/external/`** - Framework assets (committed for offline CI)

External framework assets (Bootstrap, jQuery, Tailwind) are committed to enable offline CI builds.

## Updating External Dependencies

```bash
# Update all framework assets (Bootstrap, jQuery, Tailwind)
yarn update-external-deps

# Update specific framework
yarn update-external-deps:bootstrap5
yarn update-external-deps:bootstrap4
yarn update-external-deps:bootstrap3
yarn update-external-deps:tailwind
```

Use these commands after updating framework versions in package.json.

## Development Servers

TouchSpin provides dual development modes:

- **`yarn dev`** - Pre-dev guard + TypeScript watch + static server (port 8866)
  - Automatic build guard ensures artifacts are current
  - Stable, no hot-reload
  - Best for debugging and performance testing
  - PHPStorm integration configured for this port

- **`yarn dev:hot`** - Pre-dev guard + watch + hot-reload server (port 3000)
  - Automatic build guard ensures artifacts are current
  - Browser-sync with auto-refresh
  - Best for rapid UI development
  - Proxies the static server with live reload

## Targeted Build Strategy

The build guards use **targeted builds** to avoid dependency cycles:

```bash
# Instead of: yarn build:test (may hit circular dependencies)
# Guards run: yarn workspace @touchspin/renderer-tailwind build:test
```

This approach:
- ⚡ Faster than full rebuilds
- 🔄 Avoids circular dependency errors
- 🎯 Rebuilds only what's stale or missing

For detailed workflow information, see [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md).