# TouchSpin v5 – Release Readiness Checklist

Use this list to confirm the core monorepo is ready to publish (alpha or stable).

## Tooling & Environment
- [ ] `yarn install` completes with only the expected peer warnings for Bootstrap/jQuery/Popper.
- [ ] `yarn build` finishes within ~3 minutes, regenerating `dist/` and `devdist/` artifacts.
- [ ] `yarn lint` reports no *new* diagnostics (existing `any` usage warnings under investigation).
- [ ] `yarn typecheck` succeeds or has a tracked follow-up to address `test-helpers` re-export collisions.
- [ ] `yarn guard:all` passes (Playwright guardrails).
- [ ] `yarn test` passes all suites (≈1020 specs, ~5 minutes).

## Package Metadata
- [ ] All workspace versions align (currently `5.0.1-alpha.1`).
- [ ] `publishConfig`, `files`, and `exports` blocks include only intentional artifacts.
- [ ] Changefiles created with `yarn changeset` for every package that will bump.
- [ ] README badges, feature lists, and install instructions match current behavior.

## Artifacts & QA
- [ ] `yarn workspaces foreach -A exec npm pack --dry-run` produces tarballs without unwanted files.
- [ ] `reports/` and `devdist/` cleaned or regenerated as part of CI workflow.
- [ ] Example HTML under `examples/` loads via `yarn dev` with no console errors.
- [ ] Security and migration docs updated if renderers/core behavior changed.

## Communication
- [ ] Draft release notes summarizing core changes, renderer updates, and adapter expectations.
- [ ] Coordinate with Angular/React repositories for dependency bumps (`@touchspin/core@5.0.1-alpha.1`).
- [ ] Verify sponsor acknowledgements and external links remain valid.

> **Note:** As of 2025-10-15, `yarn typecheck` fails due to duplicate exports in `packages/core/test-helpers/index.ts` and missing DOM globals in Playwright helpers. Track this before GA release or suppress via explicit type-only barrel modules.
