# Package Requirements for Testable Packages

This document outlines the requirements for ALL packages in the TouchSpin monorepo that contain tests. These requirements ensure that the test infrastructure can properly build and run tests across all packages.

## Overview

The TouchSpin test infrastructure relies on a consistent build system where:
- **Production builds** go to `dist/` directories
- **Test builds** go to `devdist/` directories
- **Artifacts manifests** (`artifacts.json`) are generated in both directories
- **Test helpers** use these manifests to dynamically locate the correct files

## Required Package.json Scripts

All testable packages MUST include these scripts:

### 1. Production Build Scripts
```json
{
  "scripts": {
    "build": "rm -rf dist && yarn run build:types && yarn run build:js",
    "build:js": "tsup src/index.ts --format esm --sourcemap --target es2020 --tsconfig tsconfig.build.json && node [path]/scripts/write-artifacts-manifest.mjs --dir dist esmEntry=index.js [additional-keys]",
    "build:types": "tsc -p tsconfig.build.json --emitDeclarationOnly"
  }
}
```

### 2. Test Build Scripts
```json
{
  "scripts": {
    "build:test": "tsc -p tsconfig.testbuild.json && node [path]/scripts/write-artifacts-manifest.mjs --dir devdist esmEntry=index.js [additional-keys]",
    "typecheck": "tsc --noEmit"
  }
}
```

### 3. Path Patterns by Package Type

| Package Type | Script Path Pattern | Example |
|--------------|-------------------|---------|
| Core | `../../scripts/write-artifacts-manifest.mjs` | `packages/core/` |
| Direct packages | `../../scripts/write-artifacts-manifest.mjs` | `packages/jquery-plugin/`, `packages/web-component/` |
| Renderer packages | `../../../scripts/write-artifacts-manifest.mjs` | `packages/renderers/bootstrap5/` |

## Required Configuration Files

### 1. tsconfig.build.json
Production TypeScript build configuration (already exists in most packages).

### 2. tsconfig.testbuild.json
**CRITICAL**: Test build configuration that outputs to `devdist/`.

Example for renderer packages:
```json
{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./devdist",
    "rootDir": "./src",
    "sourceMap": true,
    "inlineSources": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "target": "ES2020",
    "importsNotUsedAsValues": "remove",
    "skipLibCheck": true,
    "types": [],
    "incremental": true,
    "tsBuildInfoFile": "./devdist/.tsbuildinfo",
    "baseUrl": "./src",
    "paths": {
      "@touchspin/core": ["../../core/dist/index.d.ts"],
      "@touchspin/core/renderer": ["../../core/dist/renderer.d.ts"]
    }
  },
  "include": ["src/**/*"]
}
```

Example for direct packages (adjust extends and paths):
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    // ... same as above ...
    "paths": {
      "@touchspin/core": ["../core/dist/index.d.ts"],
      "@touchspin/core/renderer": ["../core/dist/renderer.d.ts"]
    }
  },
  "include": ["src/**/*"]
}
```

## Directory Structure Requirements

```
packages/[package-name]/
├── src/                    # Source TypeScript files
├── dist/                   # Production build output
│   ├── index.js           # Main entry point
│   ├── index.d.ts         # Type definitions
│   └── artifacts.json     # ⚠️ CRITICAL: Generated manifest
├── devdist/               # Test build output
│   ├── index.js           # Test entry point
│   ├── [RendererName].js  # Individual class files (renderers)
│   └── artifacts.json     # ⚠️ CRITICAL: Generated manifest
├── tests/                 # Test specifications
└── tsconfig.testbuild.json # ⚠️ CRITICAL: Test build config
```

## Artifacts.json Manifest System

The `artifacts.json` file is **CRITICAL** for the test infrastructure. It contains metadata that test helpers use to locate the correct files.

### Purpose
- **Dynamic file resolution**: Test helpers don't hardcode file names
- **Build target switching**: Different builds (dev vs prod) use different directories
- **Renderer class discovery**: Helps locate specific renderer class files

### Common Keys

| Key | Purpose | Example |
|-----|---------|---------|
| `esmEntry` | Main ES module entry point | `"index.js"` |
| `classModule` | Specific class file (renderers) | `"Bootstrap5Renderer.js"` |
| `rendererEntry` | Renderer entry point (core) | `"renderer.js"` |
| `css` | CSS file reference | `"index.css"` |

### Examples

**Core package artifacts.json:**
```json
{
  "esmEntry": "index.js",
  "rendererEntry": "renderer.js"
}
```

**Renderer package artifacts.json:**
```json
{
  "esmEntry": "index.js",
  "classModule": "Bootstrap5Renderer.js"
}
```

**Web component artifacts.json:**
```json
{
  "esmEntry": "index.js"
}
```

## How Test Infrastructure Uses These

### 1. Build Process
```bash
# Root command builds all packages
yarn build:test

# This runs build:test script in each package, which:
# 1. Compiles TypeScript to devdist/
# 2. Generates artifacts.json in devdist/
```

### 2. Test Runtime
```typescript
// Test helpers read artifacts.json to find files
const manifest = loadManifest('packages/renderers/bootstrap5');
import { rendererClassUrlFor } from '@touchspin/core/test-helpers/runtime/paths';

const rendererUrl = rendererClassUrlFor('bootstrap5');
```

### 3. Dynamic Loading
```javascript
// Tests can dynamically import the correct files
import(`${rendererUrl}`).then(RendererClass => {
  // Use the renderer class
});
```

## Package Type Specific Requirements

### Renderer Packages
- **Must include `classModule`** in artifacts.json pointing to individual renderer class file
- **Must extend AbstractRenderer**
- **Must follow renderer naming convention**: `[FrameworkName]Renderer.js`

### Component Wrappers (Web Component, Future Angular/React/Vue)
- **Must include `esmEntry`** in artifacts.json
- **Must provide component registration/initialization**

### Plugin Packages (jQuery Plugin)
- **Must include `esmEntry`** in artifacts.json
- **Must provide framework-specific API wrapper**

### Core Package
- **Must include both `esmEntry` and `rendererEntry`**
- **Special handling** as the foundation dependency

## Common Issues and Troubleshooting

### Build:test Command Fails
**Problem**: `yarn build:test` fails with script not found.
**Solution**: Add missing `build:test` script to package.json.

### Test Files Cannot Load Packages
**Problem**: Tests fail with import errors.
**Solution**: Check that `artifacts.json` exists in `devdist/` directory.

### Path Resolution Errors
**Problem**: TypeScript compilation fails with path errors.
**Solution**: Check `tsconfig.testbuild.json` paths match actual directory structure.

### Missing devdist Directory
**Problem**: Tests can't find compiled files.
**Solution**: Ensure `build:test` script runs and outputs to `devdist/`.

## Checklist for New Packages

When creating a new testable package:

- [ ] Add `build:test` script to package.json
- [ ] Create `tsconfig.testbuild.json` with correct paths
- [ ] Ensure script calls `write-artifacts-manifest.mjs` with correct parameters
- [ ] Verify `build:test` creates `devdist/` directory
- [ ] Confirm `artifacts.json` is generated in `devdist/`
- [ ] Test that `yarn build:test` works from root
- [ ] Verify test infrastructure can load the package

## Future Packages

This requirement applies to **ALL** future packages with tests, including:
- Vue component wrapper (`@touchspin/vue-component`)
- New renderer packages for other CSS frameworks
- Plugin packages for other libraries

Each must follow these exact same requirements to work with the test infrastructure.

**Note:** React and Angular adapters are now published from separate repositories:
- [@touchspin/react](https://github.com/istvan-ujjmeszaros/touchspin-react)
- [@touchspin/angular](https://github.com/istvan-ujjmeszaros/touchspin-angular)
