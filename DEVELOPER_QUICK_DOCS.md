# Developer Quick Docs

> **💡 For comprehensive workflow documentation, see [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md)**

## 🚀 Quick Start

```bash
# Install dependencies
yarn install

# Start development (auto-builds on first run, port 8866)
yarn dev

# Start development with hot-reload (port 3000)
yarn dev:hot
```

**Note**: Both `yarn dev` and `yarn test` include automatic build guards that ensure all required artifacts are built before starting. No manual build commands needed!

## 📁 Development Servers

| Mode | Port | Hot-Reload | Use Case |
|------|------|------------|----------|
| `yarn dev` | 8866 | ❌ | Stable debugging, performance testing |
| `yarn dev:hot` | 3000 | ✅ | Rapid UI development, instant feedback |

## 🔧 Essential Commands

### Development
```bash
yarn dev          # TypeScript watch + static server (8866)
yarn dev:hot      # TypeScript watch + server + hot-reload (3000)
yarn serve        # Static server only at port 8866
yarn watch        # TypeScript compilation watch only
yarn watch:test   # Watch mode for test files
```

### Building
```bash
yarn build        # Build all packages
yarn build:test   # Build for testing
yarn typecheck    # Type checking without emit
```

### Testing
```bash
yarn test         # Run tests
yarn test:ui      # Interactive test UI
yarn test:headed  # Run tests in browser
yarn coverage     # Generate coverage report
```

### Code Quality
```bash
yarn lint         # Run ESLint
yarn lint:fix     # Fix linting issues
yarn format       # Format with Prettier
```

## 🎯 Workflow Tips

### When to use port 8866 (`yarn dev`)
- Debugging complex JavaScript behavior
- Testing exact production-like behavior
- Performance profiling
- When hot-reload interferes with state

### When to use port 3000 (`yarn dev:hot`)
- Rapid CSS/HTML development
- UI tweaking and layout work
- Quick iteration on visual changes
- Multi-device testing

## 📝 Example Pages

After starting dev server, visit:
- http://localhost:8866/ - Main demo page
- http://localhost:8866/packages/renderers/bootstrap5/example/ - Bootstrap 5 examples
- http://localhost:8866/packages/jquery-plugin/demo/ - jQuery plugin demo

With hot-reload:
- http://localhost:3000/ - Same pages with auto-refresh

## 💡 PHPStorm Integration

PHPStorm is configured to use port 8866 by default. To debug:
1. Start dev server: `yarn dev`
2. Right-click HTML file → Debug
3. Browser opens with debugger attached

## 🔧 Build Automation

TouchSpin uses **automatic build guards** that ensure artifacts are always up-to-date:

- **`yarn dev`** - Runs pre-dev guard, rebuilds stale packages automatically
- **`yarn test`** - Runs pre-test guard, rebuilds stale packages automatically
- **Manual builds** - Usually not needed thanks to guards!

### Updating External Dependencies

```bash
# Update all framework assets (Bootstrap, jQuery, Tailwind)
yarn update-external-deps

# Update specific framework
yarn update-external-deps:bootstrap5
```

## ⚡ Quick Fixes

**Changes not showing?**
- The build guards should handle this automatically!
- If still issues: `yarn build:test`
- Clear browser cache: Ctrl+Shift+R (Cmd+Shift+R on Mac)

**Fixture errors or console issues?**
```bash
# Debug any page with the inspector
yarn inspect /packages/renderers/bootstrap5/tests/fixtures/bootstrap5-fixture.html
```

**Port already in use?**
```bash
# Kill process on port 8866
lsof -i :8866 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

---

**See [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md) for detailed documentation on build automation, testing, debugging, and contributing.**