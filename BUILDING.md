# Building

- Development build for tests: `yarn build:test` (topological tsc → devdist).
- Production build: `yarn build:prod` (topological types then js).
- Monorepo scripts intentionally use `-t` (topological) to guarantee cross-package d.ts availability.