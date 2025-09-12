# Ready-to-Publish Roadmap

This document tracks the final steps needed before publishing the `@touchspin/*` packages to npm.
It builds on the current monorepo state (Yarn 4 PnP, Vite builds per package, SCSS/CSS HMR, DTS fixes, examples hub, Playwright tests).

## Build

* [ ] Add `"publishConfig": { "access": "public" }` to every publishable package
  (`@touchspin/core`, `@touchspin/vanilla-renderer`, `@touchspin/web-component`, `@touchspin/renderer-*`, `@touchspin/jquery-plugin`).
* [ ] Add `"prepack": "yarn build"` to each package (or a centralized release pipeline step).
* [ ] Add `"sideEffects": false` to renderer and vanilla/web-component packages if safe for tree-shaking.

## Testing

* [ ] Add Playwright smoke tests for `@touchspin/vanilla-renderer` and `@touchspin/web-component`
  (basic init, vertical buttons, prefix/postfix, disabled/readonly).
* [ ] Ensure CI runs `yarn install`, `yarn build`, `yarn test` across all packages.

## Documentation

* [ ] Update package READMEs with:

  * Install instructions (npm/yarn/pnpm).
  * ESM/CJS usage snippet.
  * CDN example (UMD + CSS).
  * Notes on renderer CSS (`dist/touchspin-*.css`) and `data-touchspin-injected` attributes.
  * Link to repo, issues, and examples hub.
* [ ] Fix placeholder `repository`, `bugs`, and `homepage` fields in `@touchspin/vanilla-renderer`.

## Developer Experience

* [ ] Replace `packages/jquery-plugin/types/index.d.ts` stub with proper type definitions
  (ambient module or generated types).

## Package Metadata

* [ ] Ensure all packages include:

  * `"repository": { "type": "git", "url": "https://github.com/<org>/bootstrap-touchspin.git", "directory": "packages/<name>" }`
  * `"bugs": { "url": "https://github.com/<org>/bootstrap-touchspin/issues" }`
  * `"homepage": "https://github.com/<org>/bootstrap-touchspin/tree/main/packages/<name>#readme"`
  * `"keywords"` and `"author"` consistent across packages.

## Release Workflow

* [ ] Validate changesets flow:

  * Create changeset → version bump → `yarn build` → publish (`access: public`).
  * Changelogs update per package.
* [ ] Tag releases in git.
* [ ] Configure npm provenance if required.
