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