# Building

## Development Builds

- **Development build for tests**: `yarn build:test` (topological tsc → devdist)
- **Production build**: `yarn build:prod` (topological types then js)
- **Incremental build**: `yarn build` (full monorepo build)

Monorepo scripts intentionally use `-t` (topological) to guarantee cross-package d.ts availability.

## Development Servers

TouchSpin provides dual development modes:

- **`yarn dev`** - TypeScript watch + static server (port 8866)
  - Stable, no hot-reload
  - Best for debugging and performance testing
  - PHPStorm integration configured for this port

- **`yarn dev:hot`** - TypeScript watch + hot-reload server (port 3000)
  - Browser-sync with auto-refresh
  - Best for rapid UI development
  - Proxies the static server with live reload

For detailed workflow information, see [DEVELOPER_QUICK_DOCS.md](DEVELOPER_QUICK_DOCS.md).