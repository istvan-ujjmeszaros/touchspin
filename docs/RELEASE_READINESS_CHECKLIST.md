# TouchSpin v5 – Release Readiness Checklist

Use this list to confirm the core monorepo is ready to publish (alpha or stable).

## Tooling & Environment
- [x] `yarn install` completes with only the expected peer warnings for Bootstrap/jQuery/Popper.
- [x] `yarn build` finishes within ~3 minutes, regenerating `dist/` and `devdist/` artifacts.
- [x] `yarn lint` reports no *new* diagnostics (existing `any` usage warnings under investigation).
- [x] `yarn typecheck` succeeds (currently green after callback helper cleanup).
- [x] `yarn guard:all` passes (Playwright guardrails).
- [x] `yarn test` passes all suites (≈1020 specs, ~5 minutes).

## Package Metadata
- [x] All workspace versions align with the intended release tag (verify manually).
- [x] `publishConfig`, `files`, and `exports` blocks include only intentional artifacts.
- [x] Changefiles created with `yarn changeset` for every package that will bump.
- [ ] README badges, feature lists, and install instructions match current behavior.

## Artifacts & QA
- [x] `yarn workspaces foreach -A exec npm pack --dry-run` produces tarballs without unwanted files.
- [x] `reports/` and `devdist/` cleaned or regenerated as part of CI workflow.
- [ ] Example HTML under `examples/` loads via `yarn dev` with no console errors.
- [ ] Security and migration docs updated if renderers/core behavior changed.

## Communication
- [ ] Draft release notes summarizing core changes, renderer updates, and adapter expectations.
- [ ] Coordinate with Angular/React repositories for dependency bumps (`@touchspin/core@5.0.1-alpha.1`).
- [ ] Verify sponsor acknowledgements and external links remain valid.

> **Note:** Keep an eye on the recent callback helper changes from `fix(core-tests): rehydrate callbacks after init`; rerun `yarn typecheck` before publishing if the helper contract shifts again.
