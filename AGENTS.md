# AGENTS.md - Bootstrap TouchSpin Development Guide

This is the **single source of truth** for all AI agents (Claude, Cursor, Copilot, etc.) working on this codebase.

## AI Agent Rules (All Agents)

These rules apply to ALL AI agents working on this codebase:

### Testing
- **Never run the FULL test suite** (`npm test`) without user request
- **Running specific tests is fine** and encouraged for debugging
- Always use `--reporter=list` when running multiple tests (prevents hanging)

### Build Management
- Run `npm run build` before pushing to avoid CI failures
- **Never run `npm run check-build-integrity`** (it's only for GitHub workflows)
- The build output in `dist/` must be committed to git

### Development Server
- **Always use port 8866** for development servers
- `npm run dev` is safe to run multiple times (checks if server already running)
- If port 8866 is already in use, script exits gracefully with message
- `npm run kill-dev` stops any processes using port 8866

### Code Management
- **Never commit temporary files** to git
- Create temp files in `tmp/` folder (gitignored)

### Debugging Workflow
- Follow the systematic test debugging workflow (see below)
- **Always try to debug independently** before asking user
- Only ask user for help after exhausting automated approaches

## Environment Setup

Based on the CI workflow, set up your development environment:

```bash
# 1. Clone and setup
git clone <repository-url>
cd bootstrap-touchspin-new

# 2. Install Node.js 18+ (required)
# Use nvm, fnm, or download from nodejs.org

# 3. Install dependencies
npm ci

# 4. Install Playwright browsers (required for tests)
npx playwright install --with-deps chromium

# 5. Run tests to verify setup
npm test
```

## Build/Test Commands

### Primary Commands
- `npm test` - Run Playwright tests (browser-based)
- `npm run build` - Rollup build (UMD per renderer + ESM core)
- `npm run dev` - Local static server for manual pages/tests (no HMR)
- `npm run kill-dev` - Stop the development server running on port 8866

### Testing Commands
- `npm run test:headed` - Run tests with visible browser
- `npm run test:ui` - Run tests with Playwright UI
- `npm run test:coverage` - Run tests with automatic coverage report generation
- `npm run coverage:open` - Open HTML coverage reports in browser
- `npm run inspect <path> [json|text]` - Inspect page for errors and TouchSpin status

### Page Inspection Script

Use `npm run inspect <path> [json|text]` to get comprehensive page diagnostics:

**Auto-starts development server:** The inspect script automatically starts the development server on port 8866 if it's not already running, making it completely self-sufficient.

**JSON output includes:**
- Console messages (errors, warnings, logs)
- Page JavaScript errors
- Network errors (failed requests, 4xx/5xx responses)
- TouchSpin initialization status for each instance
- Summary statistics

**Examples:**
```bash
# Get JSON output (default) - path automatically uses localhost:8866
npm run inspect /__tests__/html/index-bs4.html

# Get human-readable text output
npm run inspect /__tests__/html/index-bs4.html text

# Use with jq for specific data
npm run inspect /__tests__/html/index-bs4.html | jq '.networkErrors'
npm run inspect /__tests__/html/index-bs4.html | jq '.touchspinStatus'
```

## Test Debugging Workflow

When investigating test failures, use this simplified workflow:

### 1. Run the inspect script
```bash
# Inspect the page (automatically starts dev server if needed)
npm run inspect /__tests__/html/index-bs4.html text
```

The inspect script provides comprehensive diagnostics:
- ✅ **Page loading**: Network errors, 404s, resource failures
- ✅ **TouchSpin status**: Initialization status for all instances  
- ✅ **JavaScript errors**: Console errors, warnings, page errors
- ✅ **Summary**: Quick overview of all issues found

### 2. Analyze the output
- **Network Errors: 0** = Page loads correctly
- **TouchSpin Initialized: X/Y** = Instance status  
- **Console Errors: 0** = No JavaScript issues
- **Page Errors: 0** = No runtime exceptions

### 3. Debug specific issues
Only after inspect script identifies the problem area:
- Use browser DevTools for complex debugging
- Validate selectors if DOM issues found
- Check test logic if TouchSpin instances working correctly

## Architecture

### Modern Architecture (Multi-Package)
- **`packages/core/`** - Framework-agnostic core logic with element-attached instances
- **`packages/jquery-plugin/`** - jQuery wrapper that bridges to core (callable events only)
- **`packages/renderers/`** - Framework-specific DOM rendering (Bootstrap 3/4/5, Tailwind)

### Legacy Architecture
- **`src/`** - Source files (never edit `dist/` directly)
  - `src/jquery.bootstrap-touchspin.js` - Main jQuery plugin implementation 
  - `src/jquery.bootstrap-touchspin.css` - Component styles

### Build Output
- **`dist/`** - Generated files (transpiled, minified versions with source maps)

### Testing
- **`__tests__/`** - Playwright browser tests with NYC/Istanbul coverage
  - Various test files for different functionality
  - `helpers/` - Test utilities and Playwright setup
  - `html/` - Test HTML fixtures for different Bootstrap versions

## Testing Conventions

### TestID Strategy

When an input has `data-testid="my-spinner"`, TouchSpin automatically adds:
- `data-testid="my-spinner-wrapper"` - Container element
- `data-testid="my-spinner-up"` - Up/increment button
- `data-testid="my-spinner-down"` - Down/decrement button
- `data-testid="my-spinner-prefix"` - Prefix element (if exists)
- `data-testid="my-spinner-postfix"` - Postfix element (if exists)

This ensures unique, predictable selectors for testing without DOM navigation.

### Usage in Tests
```javascript
// Direct selection, no DOM traversal needed:
await page.locator('[data-testid="my-spinner-up"]').click();
await page.locator('[data-testid="my-spinner-prefix"]').textContent();
```

## Key Development Notes

### Core Event Handling
- **Core handles ALL DOM events** (up/down buttons, input events, etc.) via data attributes
- Core attaches event listeners to elements with `data-touchspin-injected` attributes
- Event targeting uses **data attributes only** - NO class name dependencies
- Required data attributes: `data-touchspin-injected="up"`, `data-touchspin-injected="down"`, `data-touchspin-injected="wrapper"`

### jQuery Wrapper Responsibilities
- **Only forwards callable events to core API** - contains NO DOM event logic
- Uses `getTouchSpin()` to retrieve core instances instead of jQuery data storage
- Simplified destroy logic - core `destroy()` handles everything including element cleanup

### Renderer Requirements
- **Must add data attributes to markup** for core event targeting
- All renderer implementations include `data-touchspin-injected` attributes with role values
- Renderers handle presentation only - NO event logic

### Build Requirements
- Source changes must be made in `src/`, never in `dist/`
- The build process includes ES5 transpilation via Babel for broad browser compatibility
- Build outputs are deterministic and checked for integrity via MD5 checksums

### Code Standards
- Follows jQuery Core Style Guide
- ES6+ code is transpiled via Babel for ES5 compatibility
- Development workflow uses a static server for local testing

### Refactoring Guidelines
- When refactoring involves renaming classes, methods, or files, ALWAYS ask the user to decide on the new name
- Present 3-5 naming options with clear rationale for each
- Wait for user approval before proceeding with any renames

### Documentation Language Guidelines
- **Avoid self-promotional language** in README and documentation files
- **Use factual, neutral tone** instead of marketing language
- **Prohibited terms**: "comprehensive", "extensive", "perfect", "optimal", "amazing", "excellent", "superior", "cutting-edge"
- **Avoid superlatives**: Don't use "best", "fastest", "most advanced", etc.
- **Be precise**: Use "designed for" instead of "optimized for", "supports" instead of "expertly handles"
- **No emotional appeals**: Avoid "Made with ❤️" or similar promotional footers
- **Technical accuracy**: Ensure descriptions accurately reflect functionality
- **Professional tone**: Documentation should inform, not convince or impress

## Important Instructions

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
ALWAYS update existing documentation files when code changes affect the documented behavior, architecture, or usage patterns.
