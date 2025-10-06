# TouchSpin Release Guide

This guide covers the packaging-only release flow for the TouchSpin v5 workspaces. Tests are intentionally out of scope—treat the existing Playwright suite as green.

## Prerequisites

- Node 22 (maintainer runtime) and Yarn 4 (Berry) with PnP enabled.
- Valid npm token with 2FA enabled and provenance support (`npm config set provenance true`).
- Maintainers must run `yarn install` before packaging to ensure the PnP virtual filesystem is up to date.

## Day-to-Day Flow

1. **Author changes**
   - Update only the relevant packages under `packages/`.
   - Run `yarn build` (no tests) to refresh `dist/` outputs.
   - Create a Changeset with `yarn changeset` describing the change and referencing affected packages.

2. **Open a PR**
   - Ensure the PR includes updated `dist/` artifacts when packaging changes are involved.
   - CI will run lint, typecheck, build and `npm pack --dry-run` per workspace via the release workflow’s `quality` job.

3. **Release PR automation**
   - When `main` contains unpublished changesets, `.github/workflows/release.yml` opens/updates a “Changeset Release” PR. It aggregates version bumps and changelog entries.
   - Review the generated changelog, adjust metadata if needed, and merge when ready.

4. **Publishing**
   - Merging the release PR triggers the `release` job which:
     - Installs dependencies with Corepack.
     - Rebuilds all workspaces.
     - Runs `yarn workspaces foreach -A exec npm pack --dry-run` for a final integrity check.
     - Executes `changesets/action` with `publish: yarn changeset publish --tag next` and provenance enabled (`NPM_CONFIG_PROVENANCE=true`).
   - npm publishes each package with the `next` dist-tag. Promote to `beta`/`latest` via `npm dist-tag add` once verification is complete.

5. **Dist-tag promotion**
   - `alpha`: default tag while packaging stabilizes.
   - `beta`: set once documentation & metadata gaps resolve (`npm dist-tag add @touchspin/core@x.y.z beta`).
   - `latest`: promote only after core + primary renderers + jquery wrapper share a green audit (score ≥9 in the release readiness rubric).

## Manual Verification Checklist

Before promoting beyond `alpha`:

- [ ] Run `yarn workspaces foreach -A exec npm pack --dry-run` locally.
- [ ] Inspect `npm pack` tarball contents (`tar -tf <tarball>`). Confirm `dist/umd/` assets, CSS files, and `LICENSE` exist.
- [ ] Load `dist/umd` bundles from jsDelivr/unpkg in a sandbox page to verify globals (`TouchSpinBootstrapX`, `TouchSpinTailwind`, `TouchSpinVanilla`).
- [ ] Confirm README badges and CDN snippets reference the final version number.

## Canary Builds

For pre-release testing, publish a canary tagged `next` directly from the branch:

```bash
yarn workspaces foreach -A exec npm pack --dry-run
NPM_CONFIG_PROVENANCE=true yarn changeset publish --tag next
```

Document the canary version in the PR description and ping downstream integrators.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `command not found: sass` during `build` | Ensure `yarn install` has run; renderer packages declare `sass` in `devDependencies` and rely on PnP-provided binaries. |
| Bundled artifacts missing from npm tarball | Verify the package `files` array includes `dist/`, `dist/umd/`, CSS files, `LICENSE`, and `package.json`. |
| `changesets/action` fails with missing token | Add `NPM_TOKEN` and `GITHUB_TOKEN` secrets in repository settings; the workflow requires `id-token: write` for provenance. |
