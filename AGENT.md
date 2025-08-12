# AGENT.md

## Build/Test Commands
- `npm test` - Run Jest + Puppeteer tests (runs in band for stability)
- `npm run build` - Primary Vite build (use this, not legacy)
- `npm run check-build-integrity` - CRITICAL: Run before commits to verify dist sync
- `npm run dev` - Development server with hot reload
- Run single test: `npx jest __tests__/specificTest.test.ts`

## Architecture
- **jQuery plugin** for Bootstrap 3/4 input spinners with UMD pattern
- **Source**: `src/` (edit here) → **Built**: `dist/` (never edit directly)
- **Tests**: `__tests__/` with Jest + Puppeteer, helpers in `__tests__/helpers/`
- **Build**: Vite → Babel ES5 transpilation → Terser minification

## Code Style
- Follow jQuery Core Style Guide and existing patterns
- TypeScript for tests, ES6+ in source (transpiled to ES5)
- Import style: `import helpers from './helpers/touchspinHelpers'` (default export)
- Async/await for Puppeteer test helpers
- **Never edit dist/**, always run integrity check before commits
- Test helpers use multiple selector fallbacks for different Bootstrap configurations

## Critical Notes
- Build integrity is enforced - dist files must match source via MD5 checksums
- Tests timeout at 50s, use `--runInBand` to avoid race conditions
- Plugin maintains internal spinner ID counter for multiple instances
