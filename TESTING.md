# Testing

## Running Tests

### Standard Test Run
```bash
yarn build:test  # Build for testing first
PLAYWRIGHT_TSCONFIG=tsconfig.playwright.json TS_BUILD_TARGET=dev yarn test
```

### Interactive Testing
```bash
yarn test:ui      # Playwright UI mode (recommended for development)
yarn test:headed  # Run tests in visible browser windows
yarn test:debug   # Debug mode with PWDEBUG=1
```

### Development Workflow
```bash
yarn test:dev     # Watch mode: auto-rebuild + serve + interactive UI
```

## Coverage Testing
```bash
yarn coverage     # run → merge → report → open
yarn coverage:all # Coverage for all packages
```

## PHPStorm Debugging

PHPStorm is configured to debug via port 8866. To debug tests:
1. Start development server: `yarn dev`
2. Set breakpoints in TypeScript source files
3. Use PHPStorm's "Debug" option on HTML files

## Notes

- Tests resolve modules via import maps (e.g. `@touchspin/core/*` → `/packages/core/devdist/*`) in Playwright fixtures; no post-processing step is required
- Always run `yarn build:test` after source changes before testing
- For detailed testing workflow, see [DEVELOPER_QUICK_DOCS.md](DEVELOPER_QUICK_DOCS.md)
