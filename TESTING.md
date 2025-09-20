# Testing

- Deterministic tests from root:
```bash
yarn build:test
PLAYWRIGHT_TSCONFIG=tsconfig.playwright.json TS_BUILD_TARGET=dev yarn test
```

- Coverage:
```bash
yarn coverage   # run → merge → report → open
```

Notes:
- Tests resolve modules via import maps (e.g. `@touchspin/core/*` → `/packages/core/devdist/*`) in Playwright fixtures; no post-processing step is required.
