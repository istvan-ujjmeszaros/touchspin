# Development Workflow

> **Comprehensive guide to developing, testing, and contributing to TouchSpin**

This document covers the complete development workflow for TouchSpin, including build automation, environment setup, testing strategies, debugging techniques, and contribution guidelines.

## 🚀 Quick Start

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd bootstrap-touchspin-openai

# Install dependencies
yarn install

# Start development server (auto-builds on first run)
yarn dev
```

The first time you run `yarn dev` or `yarn test`, the build guards will automatically ensure all required artifacts are built. You don't need to run manual build commands for development!

### Development Modes

| Command | Port | Hot-Reload | Build Guard | Use Case |
|---------|------|------------|-------------|----------|
| `yarn dev` | 8866 | ❌ | ✅ | Stable debugging, performance testing |
| `yarn dev:hot` | 3000 | ✅ | ✅ | Rapid UI development, instant feedback |
| `yarn serve` | 8866 | ❌ | ❌ | Static server only (no watch) |

**Recommended**: Use `yarn dev` for most development work. It provides:
- Automatic build guard ensuring artifacts are up-to-date
- TypeScript watch mode (auto-compiles on changes)
- Static file server for testing in browser
- Stable performance for debugging

## 🔧 Build Automation System

TouchSpin uses an intelligent build automation system that ensures all required artifacts are available and up-to-date before running development servers or tests.

### Pre-Dev Guard (Development Server)

When you run `yarn dev` or `yarn dev:hot`, the **pre-dev guard** automatically:

1. ✅ Checks if all `devdist/` build artifacts exist
2. ✅ Detects stale artifacts (source newer than build)
3. 🔨 Rebuilds only the packages that need updating (targeted builds)
4. ✅ Verifies all required files exist after build
5. 🚀 Starts the development server

**Benefits**:
- Never start development with missing or stale build artifacts
- Automatic rebuild after git branch switches
- Targeted builds avoid dependency cycles
- Faster than full rebuilds (only rebuilds what changed)

**Example output**:
```
🛡️  Running pre-dev guardrails...

🔍 DevDist build artifacts...
🔍 Checking devdist build artifacts...
  ✅ @touchspin/core: devdist up to date
  ✅ @touchspin/jquery-plugin: devdist up to date
  ✅ @touchspin/renderer-bootstrap5: devdist up to date

📋 Issues found:
  📦 @touchspin/renderer-tailwind: devdist is stale (src newer than devdist)

🔨 Building devdist artifacts for specific packages...
📦 Building packages/renderers/tailwind...
  ✅ @touchspin/renderer-tailwind build completed

✅ All guardrails passed - development server ready to start
```

### Pre-Test Guard (Test Execution)

When you run `yarn test`, the **pre-test guard** automatically:

1. ✅ Validates no `/src/` imports in tests (dist-only policy)
2. ✅ Validates no `page.locator()` usage (helper-only policy)
3. 🔨 Checks and rebuilds devdist artifacts if needed
4. 🧪 Runs tests with guaranteed fresh artifacts

**Benefits**:
- Tests always run against current source code
- No manual rebuild required between source changes
- Catches common test anti-patterns
- Reliable CI builds

### Targeted Build Strategy

Both guard systems use **targeted builds** to avoid dependency cycles:

```javascript
// Instead of: yarn build:test (full rebuild, may hit cycles)
// Guards use: yarn workspace @touchspin/renderer-tailwind build:test

// Only rebuilds specific packages that need updating
```

This approach:
- ⚡ Faster than full rebuilds
- 🔄 Avoids circular dependency errors
- 🎯 Rebuilds only what's stale or missing
- 🛡️ Reliable for all packages

## 📦 External Dependencies Management

TouchSpin vendors external framework assets (Bootstrap, jQuery, Tailwind) for **offline CI support**. These assets are committed to the repository and automatically extracted during builds.

### Updating External Dependencies

```bash
# Update all framework assets (Bootstrap 3/4/5, Tailwind, jQuery)
yarn update-external-deps

# Update specific framework
yarn update-external-deps:bootstrap5
yarn update-external-deps:bootstrap4
yarn update-external-deps:bootstrap3
yarn update-external-deps:tailwind
```

### When to Update External Dependencies

- 📦 After updating Bootstrap version in package.json
- 🔄 After updating jQuery version in package.json
- 🌐 After changing Tailwind CDN URL
- 🚀 Initial repository setup (though build guards handle this automatically)

### How External Assets Work

1. **Build Time**: `extract-framework-assets.mjs` downloads assets from npm or CDN
2. **Storage**: Assets stored in `packages/renderers/*/devdist/external/`
3. **Git Tracking**: External assets ARE committed (for offline CI)
4. **Fixture Loading**: Test fixtures load from `../../devdist/external/`

**Example structure**:
```
packages/renderers/bootstrap5/devdist/external/
├── css/
│   └── bootstrap.min.css
└── js/
    └── bootstrap.bundle.min.js
```

## 🧪 Testing Workflow

### Running Tests

```bash
# Run all tests (with pre-test guard)
yarn test

# Run tests in UI mode (interactive debugging)
yarn test:ui

# Run specific test file
yarn exec playwright test packages/core/tests/value-operations.spec.ts

# Run with coverage
COVERAGE=1 yarn test
```

### Test Development Pattern

1. **Write test** in appropriate spec file
2. **Run `yarn test`** - guard automatically rebuilds if needed
3. **Debug with `yarn test:ui`** - interactive Playwright UI
4. **Use helpers** - never write raw selectors
5. **Check coverage** - aim for 100% coverage

### Debugging Test Fixtures

TouchSpin provides a powerful **page inspector** for debugging fixture issues:

```bash
# Inspect any page for console errors and TouchSpin status
yarn inspect /packages/renderers/bootstrap5/tests/fixtures/bootstrap5-fixture.html

# Returns JSON with:
# - Console errors/warnings
# - Network failures (404s, missing assets)
# - TouchSpin initialization status
# - Summary statistics
```

**Example output**:
```json
{
  "summary": {
    "totalConsoleErrors": 0,
    "totalNetworkErrors": 0,
    "touchspinInitialized": 3,
    "touchspinNotInitialized": 0
  },
  "consoleErrors": [],
  "networkErrors": [],
  "touchspinStatus": [
    {
      "testid": "test-input",
      "initialized": true
    }
  ]
}
```

**When to use `yarn inspect`**:
- ❌ Fixture showing console errors
- 🔗 Module import failures
- 🚫 404 errors for assets
- 🧩 TouchSpin not initializing correctly
- 🐛 Mysterious test failures

### Fixture Development Patterns

TouchSpin test fixtures use **IIFE builds with global variables** for maximum compatibility:

#### ✅ Correct Pattern (IIFE)

```html
<!-- Load IIFE builds -->
<script src="../../../../core/devdist/iife/touchspin-core.js"></script>
<script src="../../devdist/iife/Bootstrap5Renderer.global.js"></script>

<script>
    // Set up globals
    globalThis.TouchSpinDefaultRenderer = window.Bootstrap5Renderer;
    window.TouchSpinCore = window.TouchSpinCore;
    window.testPageReady = true;
</script>
```

#### ❌ Incorrect Pattern (ES6 Modules)

```html
<script type="module">
    // This FAILS in browser context!
    import { Bootstrap5Renderer } from '@touchspin/renderer-bootstrap5';
</script>
```

**Why IIFE?**
- ✅ Works in all browsers without module support
- ✅ No import map configuration needed
- ✅ Simple global variable access
- ✅ Matches production IIFE build patterns
- ✅ Reliable for test automation

## 🛠️ Development Commands Reference

### Build Commands

```bash
# Development builds (creates devdist/)
yarn build:test              # Build all packages for testing

# Production builds (creates dist/)
yarn build:prod              # Build all packages for production
yarn build                   # Full monorepo build

# Watch modes (auto-compile on changes)
yarn watch                   # Watch all packages (production mode)
yarn watch:test              # Watch all packages (test mode)
```

### Package-Specific Builds

```bash
# Build specific package
yarn workspace @touchspin/core build:test
yarn workspace @touchspin/renderer-bootstrap5 build:test

# Watch specific package
yarn workspace @touchspin/core watch:test
```

### Quality Commands

```bash
# Type checking
yarn typecheck               # Check all TypeScript code
yarn typecheck:tests         # Check test TypeScript code

# Linting
yarn lint                    # Check all code
yarn lint:fix                # Fix auto-fixable issues

# Coverage
yarn coverage:build          # Build with coverage instrumentation
yarn coverage:all <path>     # Run tests with coverage
# View: reports/coverage/index.html
```

### Guard Commands (Manual Execution)

```bash
# Run individual guards
node scripts/guard-devdist-build.mjs    # DevDist build guard
node scripts/pre-test.mjs               # All pre-test guards
node scripts/pre-dev.mjs                # All pre-dev guards

# Usually not needed - guards run automatically!
```

## 🐛 Debugging & Troubleshooting

### Common Issues

#### Issue: Tests Failing After Source Changes

**Cause**: Stale build artifacts
**Solution**: This should never happen with guards! If it does:

```bash
# Manually trigger rebuild
yarn build:test

# Or delete devdist and let guards rebuild
rm -rf packages/*/devdist
yarn test
```

#### Issue: "Cannot find module" in Fixtures

**Cause**: ES6 imports in browser context
**Solution**: Use IIFE pattern (see Fixture Development Patterns above)

```bash
# Debug the fixture
yarn inspect /path/to/fixture.html
```

#### Issue: External Assets Missing (404 errors)

**Cause**: External assets not extracted
**Solution**:

```bash
# Update external dependencies
yarn update-external-deps

# Or for specific framework
yarn update-external-deps:bootstrap5
```

#### Issue: Dependency Cycle During Build

**Cause**: Full `yarn build:test` triggers circular dependencies
**Solution**: Guards use targeted builds automatically. If building manually:

```bash
# Build specific package instead of all
yarn workspace @touchspin/renderer-bootstrap5 build:test
```

### Debug Tools

#### 1. Playwright UI Mode

```bash
yarn test:ui
```

Interactive test runner with:
- Step-by-step execution
- DOM snapshots
- Network logs
- Console output

#### 2. Page Inspector

```bash
yarn inspect /path/to/fixture.html
```

Analyzes pages for:
- Console errors
- Network failures
- TouchSpin status
- Missing resources

#### 3. Browser DevTools

When running `yarn dev`:
1. Open http://localhost:8866
2. Navigate to fixture/example page
3. Open browser DevTools (F12)
4. Check Console, Network, Elements tabs

### Performance Profiling

```bash
# Build without watch (faster for performance testing)
yarn build:test

# Start server without watch
yarn serve

# Run specific performance tests
yarn exec playwright test --grep "performance"
```

## 📝 Contributing Workflow

### 1. Branch Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes to source files
# ...

# Let guards handle rebuilds automatically
yarn test                    # Auto-rebuilds before testing
```

### 2. Test-Driven Development

```bash
# Start dev server with watch mode
yarn dev

# In another terminal, run tests
yarn test:ui

# Edit source → Auto-compiles → Refresh test UI → See results
```

### 3. Pre-Commit Checks

Pre-commit hooks automatically run:
- ✅ Gherkin workflow validation
- ✅ Helper querySelector guard
- ✅ Spec page.locator guard

```bash
# These run automatically on commit
# No manual action needed!
```

### 4. Creating Pull Requests

```bash
# Ensure all tests pass
yarn test

# Type check
yarn typecheck

# Lint
yarn lint:fix

# Create commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/my-feature
```

### Code Quality Standards

- ✅ **100% Test Coverage**: All new features must have comprehensive tests
- ✅ **TypeScript**: All code must be TypeScript with strict typing
- ✅ **Dist-Only Tests**: Tests import from `/devdist/`, never `/src/`
- ✅ **Helper Functions**: Tests use helper functions, never raw selectors
- ✅ **Gherkin Format**: Tests follow Given/When/Then scenario format
- ✅ **Documentation**: Public APIs must have TSDoc comments

## 📚 Architecture & Patterns

### Monorepo Structure

```
packages/
├── core/                    # Core TouchSpin engine
├── jquery-plugin/           # jQuery wrapper
├── web-component/           # Web Component wrapper
└── renderers/
    ├── bootstrap3/          # Bootstrap 3 renderer
    ├── bootstrap4/          # Bootstrap 4 renderer
    ├── bootstrap5/          # Bootstrap 5 renderer
    ├── tailwind/            # Tailwind CSS renderer
    └── vanilla/             # Vanilla CSS renderer
```

### Build Output Directories

- **`dist/`**: Production builds (gitignored, not tracked)
- **`devdist/`**: Development/test builds (gitignored except external assets)
- **`devdist/external/`**: Framework assets (committed for offline CI)

### Test Infrastructure

```
packages/core/test-helpers/
├── index.ts                 # Canonical helper exports
├── core-adapter.ts          # Core-specific initialization
└── fixtures/                # Shared test fixtures

packages/*/tests/
├── *.spec.ts               # Test specifications
├── fixtures/               # Package-specific fixtures
└── helpers/                # Package-specific helpers (if needed)
```

## 🔄 CI/CD Integration

### CI Workflow

```bash
# CI runs these commands in order:
yarn install                 # Install dependencies
yarn test:ci                 # Build + guards + tests

# No internet required for external assets!
# Bootstrap, jQuery, Tailwind assets are committed
```

### Local CI Simulation

```bash
# Test what CI will run
yarn test:ci
```

## 🎯 Best Practices

### DO ✅

- ✅ Use `yarn dev` for all development
- ✅ Let guards handle builds automatically
- ✅ Use `yarn inspect` to debug fixture issues
- ✅ Write tests using helper functions
- ✅ Follow IIFE pattern for test fixtures
- ✅ Commit external framework assets
- ✅ Run `yarn test` before committing
- ✅ Use Gherkin format for test scenarios

### DON'T ❌

- ❌ Manually run `yarn build:test` (guards do this)
- ❌ Import from `/src/` in tests (use `/devdist/`)
- ❌ Use `page.locator()` in test specs (use helpers)
- ❌ Use ES6 imports in browser fixtures (use IIFE)
- ❌ Commit `devdist/` build artifacts (only external assets)
- ❌ Skip tests before committing
- ❌ Use manual waits (`page.waitForTimeout()`)

## 📖 Additional Documentation

- **[README.md](README.md)** - Project overview and quick start
- **[CLAUDE.md](CLAUDE.md)** - AI agent testing strategy and comprehensive testing guide
- **[BUILDING.md](BUILDING.md)** - Detailed build system documentation
- **[TESTING.md](TESTING.md)** - Testing strategy and patterns
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design
- **[DEVELOPER_QUICK_DOCS.md](DEVELOPER_QUICK_DOCS.md)** - Quick reference commands

## 🚀 Getting Help

1. **Check existing documentation** (see Additional Documentation above)
2. **Use `yarn inspect`** for fixture debugging
3. **Run guards manually** to see detailed build output
4. **Check test logs** in `yarn test:ui` for interactive debugging
5. **Review TROUBLESHOOTING.md** for common issues
6. **Open an issue** on GitHub with reproduction steps

---

**Ready to contribute?** Start with `yarn dev` and let the build automation handle the rest! 🎉
