# AGENT.md

## Build/Test Commands
- `npm test` - Run Jest + Puppeteer tests (runs in band for stability)
- `npm run build` - Primary Vite build (use this, not legacy)
- `npm run check-build-integrity` - CRITICAL: Run before commits to verify dist sync
- `npm run dev` - Development server with hot reload
- Run single test: `npx jest __tests__/specificTest.test.ts --runInBand`
- Debug tests: `PUPPETEER_DEBUG=1 npx jest __tests__/specificTest.test.ts --runInBand`

## Architecture
- **jQuery plugin** for Bootstrap 3/4/5 input spinners with UMD pattern
- **Source**: `src/` (edit here) → **Built**: `dist/` (never edit directly)
- **Tests**: `__tests__/` with Jest + Puppeteer, helpers in `__tests__/helpers/`
- **Build**: Vite → Babel ES5 transpilation → Terser minification
- **Renderers**: `src/renderers/` - Bootstrap version-specific HTML generation

## Code Style
- Follow jQuery Core Style Guide and existing patterns
- TypeScript for tests, ES6+ in source (transpiled to ES5)
- Import style: `import helpers from './helpers/touchspinHelpers'` (default export)
- Async/await for Puppeteer test helpers
- **Never edit dist/**, always run integrity check before commits
- Test helpers use multiple selector fallbacks for different Bootstrap configurations

## Critical Notes
- Build integrity is enforced - dist files must match source via MD5 checksums
- Tests timeout at 60s, run sequentially with `maxWorkers: 1` to avoid browser conflicts
- Plugin maintains internal spinner ID counter for multiple instances
- **Puppeteer Issues**: Tests create fresh page instances per test to avoid "Connection closed" errors
- Each renderer (Bootstrap3/4/5) is independent and self-contained
- **File Lock Issues**: If build fails with EPERM/permission errors, STOP and ask user to manually remove locked files - don't keep trying

## Common Test Issues
- "Protocol error: Connection closed" → Page lifecycle conflict (fixed in setup)
- "Jest did not exit" → Async resource leaks (use `--detectOpenHandles` to debug)
- Timeout errors → Run single test files with `--runInBand` flag
