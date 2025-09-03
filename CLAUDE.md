# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

### Systematic Debugging Process

For deeper investigation of test failures:

#### Step 1: Identify What's Different
- Check test expectations vs actual results
- Categorize the type of issue (functionality, timing, state management, etc.)

#### Step 2: Investigation
- Use grep commands to search codebase for relevant patterns
- Compare implementations if needed
- Focus on the specific area where the issue occurs

#### Step 3: Apply and Verify Fix
- Make targeted changes
- Run specific tests to verify the fix
- Ensure no regressions in related functionality

### Key Investigation Commands

Use these grep patterns for searching the codebase:

```bash
# Search for specific patterns in files
grep -n "pattern" [file]

# Find function definitions
grep -n "function.*(" [file]

# Find specific method calls or properties
grep -n "methodName\|propertyName" [file]

# Search across multiple files in a directory
grep -r "pattern" [directory]
```

### Documentation Requirements for Fixes

When documenting a fix, include:

1. **Problem description**: What was failing and the symptoms observed
2. **Investigation findings**: What analysis revealed about the issue
3. **Root cause**: The specific code or logic causing the problem
4. **Solution applied**: Exact changes made to resolve the issue
5. **Verification method**: How the fix was confirmed to work (tests, manual testing, etc.)

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

### Test Execution Checklist Maintenance (TEST_EXECUTION_CHECKLIST.md)

The `TEST_EXECUTION_CHECKLIST.md` file contains a comprehensive checklist of all tests in the project:

**File Purpose:**
- Tracks execution status of all test files (42 files) and individual tests (375 tests)
- Hierarchical structure: test files → individual tests
- Pass/fail tracking for systematic test validation

**How to Update Test Results:**
1. **Run tests with JSON reporter**: `npx playwright test --reporter=json > tmp/test-results.json`
2. **Use the parsing script**: `node scripts/parse-test-results.js tmp/test-results.json`
3. **Update checkboxes manually** based on the parsed output (`[x]` pass, `[-]` fail, `[~]` flaky)
4. **Update overview counters** to reflect current test status
5. **Add history log entry** to track progress over time

**Automated Result Parsing:**
```bash
# Method 1: Save results to file, then parse
npx playwright test --reporter=json > tmp/test-results.json
node scripts/parse-test-results.js tmp/test-results.json

# Method 2: Pipe results directly (faster)
npx playwright test --reporter=json | node scripts/parse-test-results.js

# Method 3: Single file testing (recommended for development)
npx playwright test __tests__/basicOperations.test.ts --reporter=json | node scripts/parse-test-results.js
```

**Script Output Includes:**
- Overview counters for the summary section
- File status markers with pass/fail/flaky counts
- Individual test checkboxes with proper status notation
- **Ready-to-paste history log entry** with timestamp and statistics

**Maintenance Rules:**
1. **When adding new tests**: Add the test name to the appropriate test file section
2. **When removing tests**: Remove the test entry from the checklist
3. **When renaming tests**: Update the test name in the checklist
4. **When adding new test files**: Add a new section with all tests in that file
5. **File status**: Mark test file as `[x]` only when ALL individual tests pass (no failures)
6. **Individual test status**: Mark `[x]` for passing, `[-]` for failing, `[~]` for flaky tests
7. **Counter updates**: Update the overview counters when file/test status changes
8. **History tracking**: Add new entries to the Test Execution History section

**Structure Pattern:**
```markdown
### __tests__/filename.test.ts
- [ ] test name 1
- [ ] test name 2
```

**Quick Commands:**
- `npx playwright test --reporter=list` - Run all tests with detailed output
- `npx playwright test <test-file>` - Run specific test file
- `npx playwright test --reporter=json > tmp/test-results.json` - Export results for parsing
- `node scripts/parse-test-results.js tmp/test-results.json` - Parse and format test results
- `npx playwright test <test-file> --reporter=json | node scripts/parse-test-results.js` - Single file test and parse

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
