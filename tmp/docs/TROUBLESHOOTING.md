# Troubleshooting

## TS7016: Could not find a declaration file for module '@touchspin/core'
Cause: consumer built d.ts before `@touchspin/core` types existed or moduleResolution not "Bundler".
Fix:
1) Run builds topologically: `yarn build:types:all && yarn build:js:all`.
2) Ensure consumer tsconfig.build.json has `"moduleResolution": "Bundler", "module": "ESNext"`.
3) Core must export `{ types, import }` for "." and "./renderer" and actually emit `dist/renderer.d.ts`.

## Failed to fetch dynamically imported module /dist/*Renderer.js (coverage)
Cause: coverage imported prod `dist` class files (tsup) that don't exist.
Fix: coverage uses `devdist`; ensure `paths.ts` prefers `devdist` when `TS_BUILD_TARGET=dev` or `PW_COVERAGE=1`.