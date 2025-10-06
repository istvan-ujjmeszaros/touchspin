# TouchSpin v5 Packaging & Publishing Audit

_Last updated: 2025-10-06_
_Superseded by: `tmp/RELEASE_AUDIT_2025.md` (comprehensive audit with fixes applied)_

> **Note:** A fresh comprehensive audit was performed on 2025-10-06 with all identified gaps fixed. See `tmp/RELEASE_AUDIT_2025.md` for the complete report and `tmp/FIXES_APPLIED.md` for implementation details.

This audit focuses exclusively on packaging readiness for the TouchSpin v5 workspace packages. Testing is intentionally out of scope. Findings reflect the repository **after** the release-engineering fixes implemented in this branch.

## Package Inventory

### @touchspin/core
- **Purpose:** Framework-agnostic logic & renderer contracts.
- **Entries:** `dist/index.js` (ESM), `dist/renderer.js` (ESM subpath).
- **Exports:** `.`, `./renderer`, `./package.json`.
- **Types:** `dist/index.d.ts`, `dist/renderer.d.ts`.
- **Files:** `dist/`, `README.md`, `LICENSE`, `package.json`.
- **Peer deps:** none.
- **Engines:** `node >=22.0.0`.
- **Side effects:** `false`.

### @touchspin/jquery-plugin
- **Purpose:** Drop-in jQuery bridge over the core.
- **Entries:** `dist/index.js` (ESM).
- **Exports:** `.`, `./package.json`.
- **Types:** `dist/index.d.ts`.
- **Files:** `dist/`, `README.md`, `LICENSE`, `package.json`.
- **Peer deps:** `jquery >=1.7`.
- **Engines:** `node >=22.0.0`.
- **Side effects:** `./dist/**/*.js` to keep UMD bundles.
- **Bundles:** `dist/umd/touchspin-bootstrap{3,4,5}.umd.js` plus legacy aliases `dist/jquery-touchspin-bs*.js` for backward compatibility.

### Bootstrap renderers (`@touchspin/renderer-bootstrap3/4/5`)
- **Purpose:** DOM + styling for each Bootstrap major.
- **Entries:** `dist/index.js` (ESM), CSS shortcut via `exports['./css']`.
- **UMD:** `dist/umd/touchspin-bootstrapX.umd.js` with sourcemaps.
- **Files:** `dist/`, `dist/umd/`, `README.md`, `LICENSE`, `package.json`.
- **Peer deps:**
  - B3: `bootstrap >=3.4.0 <4`, optional `jquery >=1.9.0`.
  - B4: `bootstrap >=4.6.0 <5`, optional `jquery >=3.5.0`, optional `popper.js >=1.16.1`.
  - B5: `bootstrap >=5.3.0 <6`, optional `@popperjs/core >=2.11.8`.
- **Engines:** `node >=22.0.0`.
- **Side effects:** CSS/SCSS globs only.

### @touchspin/renderer-tailwind
- **Entries:** `dist/index.js` (ESM), CSS via `exports['./css']`.
- **UMD:** `dist/umd/touchspin-tailwind.umd.js`.
- **Files:** `dist/`, `dist/umd/`, `README.md`, `LICENSE`, `package.json`.
- **Peer deps:** optional `tailwindcss >=3.0.0`.
- **Engines:** `node >=22.0.0`.

### @touchspin/renderer-vanilla
- **Entries:** `dist/index.js` (ESM), CSS via `exports['./css']`, theme via `exports['./themes/vanilla']` → `dist/themes/vanilla.css`.
- **UMD:** `dist/umd/touchspin-vanilla.umd.js`.
- **Files:** `dist/`, `dist/themes/`, `dist/umd/`, `README.md`, `LICENSE`, `package.json`.
- **Engines:** `node >=22.0.0`.

### @touchspin/web-component
- **Purpose:** `<touchspin-input>` custom element.
- **Entries:** `dist/index.js` (ESM).
- **Exports:** `.`, `./package.json`.
- **Files:** `dist/`, `README.md`, `LICENSE`, `package.json`.
- **Dependencies:** `@touchspin/core`, `@touchspin/renderer-vanilla`.
- **Engines:** `node >=22.0.0`.

## Current Gaps

1. **Peer warnings during installs:** Bootstrap’s own optional peers (`jquery`, `popper.js`, `@popperjs/core`) still surface Yarn PnP warnings unless projects install them explicitly. Documented in package READMEs; no packaging change required.
2. **Dist-tag governance:** Release workflow publishes with the `next` tag; maintainers must promote packages to `beta`/`latest` manually using `npm dist-tag add` once verification is complete.
3. **Legacy root package:** The historical `bootstrap-touchspin` root package remains untouched in this audit. Decide later whether to deprecate or repoint it to v5 packages.

## Alpha vs. Beta Rubric (0–2 per criterion)

| Package | API Docs & Surface | Packaging Correctness | CDN Readiness | Docs & Migration | CI/CD Automation | Total | Recommendation |
|---------|--------------------|-----------------------|---------------|------------------|------------------|-------|----------------|
| @touchspin/core | 2 | 2 | 1 | 2 | 2 | **9** | Stable |
| @touchspin/jquery-plugin | 2 | 2 | 2 | 2 | 2 | **10** | Stable |
| Renderers (b3/b4/b5) | 2 | 2 | 2 | 2 | 2 | **10** | Stable |
| @touchspin/renderer-tailwind | 2 | 2 | 2 | 2 | 2 | **10** | Stable |
| @touchspin/renderer-vanilla | 2 | 2 | 2 | 2 | 2 | **10** | Stable |
| @touchspin/web-component | 2 | 2 | 1 | 2 | 2 | **9** | Stable |

> All packages now meet the criteria for a stable release. Remaining tasks are procedural (dist-tag promotion, root-package strategy) rather than packaging fixes.

## Versioning & Dist-Tags

- Continue per-package SemVer with Changesets.
- Default publish tag: `next` (handled by CI).
- Promote to `beta` when a package’s documentation and CDNs are verified in production projects.
- Promote to `latest` only once the core, jquery plugin, vanilla renderer, and Bootstrap renderers share a stable score ≥9 and downstream integrations sign off.
- Maintain `alpha` tag for experimental branches if needed (`changeset publish --tag alpha`).

## Publishing Automation

- `.github/workflows/release.yml` runs lint → typecheck → build → `npm pack --dry-run` across all workspaces.
- `changesets/action` handles release PRs and provenance-enabled publish (`npm publish --provenance` via GitHub OIDC).
- Local release checklist:
  1. `yarn workspaces foreach -A exec npm pack --dry-run`
  2. Inspect tarballs (`tar -tf <pkg>`)
  3. Validate CDN links (jsDelivr & unpkg)
  4. Run `yarn changeset publish --tag next`

## CDN Notes

- UMD assets reside in `dist/umd/` with deterministic names: `touchspin-<flavor>.umd.js`.
- Legacy aliases (`dist/jquery-touchspin-bs*.js`) remain for the jQuery plugin.
- Example URLs:
  - jsDelivr: `https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5.0.0/dist/umd/touchspin-bootstrap5.umd.js`
  - unpkg: `https://unpkg.com/@touchspin/jquery-plugin@5.0.0/dist/umd/touchspin-bootstrap5.umd.js`
- Provide optional SRI hashes via jsDelivr’s API when documenting releases.
- Import-map example:
  ```html
  <script type="importmap">
    {
      "imports": {
        "@touchspin/core": "https://cdn.jsdelivr.net/npm/@touchspin/core@5.0.0/dist/index.js",
        "@touchspin/renderer-bootstrap5": "https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5.0.0/dist/index.js"
      }
    }
  </script>
  ```

## Documentation Plan

- Streamlined top-level `README.md` with package matrix, install recipes, CDN snippets, and dist-tag policy.
- New `MIGRATION.md` summarises v4 → v5 steps with links to deeper docs.
- Per-package READMEs now provide installation, ESM usage, CDN paths, and peer dependency notes.
- Release playbook captured in `docs/releasing.md` (Changesets workflow, manual verification, dist-tag promotion).
- `SECURITY.md` documents disclosure and supported platforms.

## Next Steps

1. Monitor npm dist-tags after first `next` publish; promote to `beta` once downstream smoke tests complete.
2. Decide whether to repoint or deprecate the legacy root `bootstrap-touchspin` package.
3. Capture SRI hash generation in release checklist (optional hardening).
