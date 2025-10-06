# TouchSpin v5 Release Readiness Audit & Action Plan
_Generated: 2025-10-06_

## Executive Summary

TouchSpin v5 is a complete ESM-first rewrite of the legacy `bootstrap-touchspin@4.x` jQuery plugin. The monorepo ships 8 publishable packages with strong packaging foundations. **Most infrastructure is already in place**, but several gaps remain before production release.

**Recommendation:** Fix identified gaps (detailed below), then graduate packages to **beta** dist-tag. Reserve **latest** promotion until downstream integrations validate CDN usage and import patterns.

---

## Package Inventory & Current State

| Package | Purpose | Entry Points | UMD | Status |
|---------|---------|--------------|-----|--------|
| **@touchspin/core** | Framework-agnostic engine + renderer contracts | `dist/index.js` (ESM)<br>`dist/renderer.js` (ESM) | ❌ | ✅ Clean |
| **@touchspin/jquery-plugin** | jQuery wrapper preserving v4 API | `dist/index.js` (ESM)<br>`dist/umd/*.umd.js` (UMD) | ✅ | ⚠️ Needs CJS |
| **@touchspin/renderer-bootstrap3** | Bootstrap 3 renderer | `dist/index.js` (ESM)<br>`dist/umd/*.umd.js` (UMD)<br>`dist/*.css` | ✅ | ✅ Clean |
| **@touchspin/renderer-bootstrap4** | Bootstrap 4 renderer | `dist/index.js` (ESM)<br>`dist/umd/*.umd.js` (UMD)<br>`dist/*.css` | ✅ | ✅ Clean |
| **@touchspin/renderer-bootstrap5** | Bootstrap 5 renderer | `dist/index.js` (ESM)<br>`dist/umd/*.umd.js` (UMD)<br>`dist/*.css` | ✅ | ✅ Clean |
| **@touchspin/renderer-tailwind** | Tailwind renderer | `dist/index.js` (ESM)<br>`dist/umd/*.umd.js` (UMD)<br>`dist/*.css` | ✅ | ✅ Clean |
| **@touchspin/renderer-vanilla** | Framework-free renderer | `dist/index.js` (ESM)<br>`dist/umd/*.umd.js` (UMD)<br>`dist/*.css` | ✅ | ✅ Clean |
| **@touchspin/web-component** | `<touchspin-input>` custom element | `dist/index.js` (ESM) | ❌ | ✅ Clean |

---

## Alpha vs. Beta Rubric (No-Tests Edition)

Each criterion scores **0–2**:
- **0**: Missing or broken
- **1**: Partial or has known issues
- **2**: Complete and correct

### Scoring Matrix

| Package | API Surface & Docs | Packaging Correctness | CDN Readiness | Docs & Migration | CI/CD Automation | **Total** | **Recommendation** |
|---------|-------------------|----------------------|---------------|------------------|------------------|-----------|-------------------|
| **@touchspin/core** | 2 | 1 ⚠️ | 1 | 2 | 2 | **8** | **Beta** (after fixes) |
| **@touchspin/jquery-plugin** | 2 | 1 ⚠️ | 2 | 2 | 2 | **9** | **Beta** (after fixes) |
| **renderer-bootstrap3** | 2 | 1 ⚠️ | 2 | 2 | 2 | **9** | **Beta** (after fixes) |
| **renderer-bootstrap4** | 2 | 1 ⚠️ | 2 | 2 | 2 | **9** | **Beta** (after fixes) |
| **renderer-bootstrap5** | 2 | 1 ⚠️ | 2 | 2 | 2 | **9** | **Beta** (after fixes) |
| **renderer-tailwind** | 2 | 1 ⚠️ | 2 | 2 | 2 | **9** | **Beta** (after fixes) |
| **renderer-vanilla** | 2 | 1 ⚠️ | 2 | 2 | 2 | **9** | **Beta** (after fixes) |
| **@touchspin/web-component** | 2 | 1 ⚠️ | 1 | 2 | 2 | **8** | **Beta** (after fixes) |

**Decision Guide:**
- **<6**: Alpha (significant gaps)
- **6–8**: Beta (minor polish needed)
- **9–10**: Stable/Latest (production-ready)

---

## Critical Gaps Found

### 🔴 High Priority (Blocks Beta)

#### 1. Node Engines Too Restrictive
**Issue:** All packages declare `"engines": { "node": ">=22.0.0" }` but per user spec, packages should target **Node 18, 20, 22 LTS**.

**Impact:** Prevents installation on Node 18/20, blocking broad adoption.

**Fix:**
```json
"engines": {
  "node": ">=18.17.0"
}
```

**Packages affected:** All 8 packages

---

#### 2. Changeset baseBranch Mismatch
**Issue:** `.changeset/config.json` references `"baseBranch": "main"` but git default branch is **master**.

**Impact:** Changesets will fail to detect base branch, breaking release automation.

**Fix:**
```json
{
  "baseBranch": "master"
}
```

---

#### 3. Inconsistent jQuery peerDependency
**Issue:**
- `@touchspin/jquery-plugin` declares `jquery >=1.7`
- `@touchspin/renderer-bootstrap3` declares `jquery >=1.9.0`

**Impact:** Confusing peer warnings; Bootstrap 3 actually works with jQuery 1.7+.

**Fix:** Align to `jquery >=1.9.0` (Bootstrap 3's documented minimum) across both packages.

---

#### 4. Core README vs package.json Mismatch
**Issue:**
- `packages/core/README.md` says "Node 18.17+"
- `packages/core/package.json` says "Node 22+"

**Impact:** Documentation contradicts package manifest.

**Fix:** Update README to match corrected engines field.

---

### 🟡 Medium Priority (Polish for Stable)

#### 5. Missing CJS for jQuery Plugin
**Issue:** jQuery plugin targets legacy users but only ships ESM. Many older build systems expect CJS.

**Impact:** Legacy bundlers (webpack 4, Rollup without plugins) may struggle.

**Recommendation:** Add optional CJS build:
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js"
}
```

Build script addition:
```bash
tsup src/index.ts --format esm,cjs --sourcemap --target es2018
```

**Optional but recommended** given the legacy jQuery audience.

---

#### 6. Root package.json Cleanup
**Issue:** Root `package.json` still references legacy v4 structure:
- `"main": "dist/jquery.bootstrap-touchspin-bs5.js"` (incorrect path)
- `"style": "dist/jquery.bootstrap-touchspin.css"` (empty placeholder)
- `"files": ["dist/"]` (root dist is synthetic, not the real packages)

**Impact:** If someone accidentally installs root package from npm, they get broken imports.

**Recommendation:** Either:
1. **Mark private**: Add `"private": true` to prevent accidental publish
2. **Create redirect package**: Make root a metapackage that re-exports from `@touchspin/jquery-plugin`

**Preferred:** Mark private (safest).

---

### 🟢 Low Priority (Nice to Have)

#### 7. SRI Hash Documentation
**Issue:** CDN examples in READMEs don't include SRI hashes.

**Impact:** Users miss out on integrity verification for CDN scripts.

**Recommendation:** Add to release checklist:
```bash
# Generate SRI for a published package
curl -s https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5.0.0/dist/umd/touchspin-bootstrap5.umd.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

Then document in release notes:
```html
<script
  src="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5.0.0/dist/umd/touchspin-bootstrap5.umd.js"
  integrity="sha384-HASH_HERE"
  crossorigin="anonymous">
</script>
```

---

#### 8. Custom Elements Manifest (Web Component)
**Issue:** Web component package doesn't ship `custom-elements.json` for IDE tooling.

**Impact:** VS Code and other editors won't autocomplete custom element attributes.

**Recommendation:** Add `@custom-elements-manifest/analyzer` to generate manifest during build:
```bash
npx @custom-elements-manifest/analyzer analyze
```

Only implement if trivial (< 30 min effort).

---

## Versioning & Dist-Tag Strategy

### Current State
- All packages at `5.0.0`
- Release workflow publishes to `next` dist-tag
- No published versions yet (pre-release)

### Recommended Flow

```
alpha (current)
  ↓
  [Fix critical gaps]
  ↓
beta ← Start here after fixes
  ↓
  [Community validation]
  ↓
latest ← Promote after 2+ downstream projects validate
```

### Per-Package Promotion Plan

| Package | Next Tag | Criteria |
|---------|----------|----------|
| All packages | **beta** | After critical fixes (gaps 1–4) |
| Core + renderers | **latest** | After 2+ real-world integrations validate |
| jQuery plugin | **latest** | After CMS/legacy project validates |
| Web component | **latest** | After Vanilla/Core are stable |

---

## Publishing Automation Status

### ✅ Already Configured
- **Changesets CLI**: Installed and configured
- **GitHub Actions**: `.github/workflows/release.yml` exists
  - Runs: lint → typecheck → build → npm pack --dry-run
  - Uses `changesets/action` with provenance
  - Publishes to `next` tag by default
- **Provenance**: Enabled via `NPM_CONFIG_PROVENANCE=true`

### ⚠️ Needs Adjustment
- **baseBranch**: Must be `master` not `main`
- **Dist-tag promotion**: Add manual step to docs/releasing.md

---

## CDN Readiness

### ✅ What's Good
- UMD bundles exist in predictable paths: `dist/umd/touchspin-<flavor>.umd.js`
- Legacy aliases for jQuery plugin: `dist/jquery-touchspin-bs*.js`
- All renderer packages include CSS in `files` array
- Global exports documented: `TouchSpinBootstrap3`, `TouchSpinBootstrap5`, etc.

### 📦 File Structure Validated

**jQuery Plugin:**
```
dist/
├── umd/
│   ├── touchspin-bootstrap3.umd.js
│   ├── touchspin-bootstrap4.umd.js
│   └── touchspin-bootstrap5.umd.js
├── jquery-touchspin-bs3.js (alias)
├── jquery-touchspin-bs4.js (alias)
└── jquery-touchspin-bs5.js (alias)
```

**Renderers:**
```
dist/
├── umd/
│   └── touchspin-bootstrap5.umd.js
├── touchspin-bootstrap5.css
└── index.js (ESM)
```

### 📋 CDN Example URLs

**jsDelivr (pinned):**
```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5.0.0/dist/touchspin-bootstrap5.css">

<!-- UMD Bundle -->
<script src="https://cdn.jsdelivr.net/npm/@touchspin/renderer-bootstrap5@5.0.0/dist/umd/touchspin-bootstrap5.umd.js"></script>
```

**unpkg (latest):**
```html
<script src="https://unpkg.com/@touchspin/jquery-plugin@latest/dist/jquery-touchspin-bs5.js"></script>
```

**ESM via import map:**
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

---

## Documentation Audit

### ✅ Excellent Coverage

| Document | Status | Notes |
|----------|--------|-------|
| **README.md** (root) | ✅ Complete | Package matrix, install paths, CDN snippets, dist-tag policy |
| **MIGRATION.md** | ✅ Complete | v4→v5 guide with drop-in and modern paths |
| **CONTRIBUTING.md** | ✅ Complete | Workspace setup, Changeset usage, renderer authoring |
| **SECURITY.md** | ✅ Complete | Disclosure process, supported platforms |
| **docs/releasing.md** | ✅ Complete | Full release playbook |
| **docs/release-readiness.md** | ✅ Comprehensive | Previous audit (this supersedes it) |
| **Per-package READMEs** | ✅ Good | Install, ESM usage, CDN, peer deps |

### ⚠️ Minor Improvements Needed

1. **Add dist-tag promotion commands** to `docs/releasing.md`:
   ```bash
   # Promote from next → beta
   npm dist-tag add @touchspin/core@5.0.0 beta

   # Promote from beta → latest
   npm dist-tag add @touchspin/core@5.0.0 latest
   ```

2. **Document SRI generation** in release checklist (optional)

3. **Update core README** to match corrected Node engines

---

## Browser Support Policy

### As Specified

| Package Group | Browser Support |
|---------------|-----------------|
| **Bootstrap renderers (3/4/5)** | Inherits from Bootstrap major version |
| **Core, Tailwind, Vanilla, Web Component** | Modern evergreen browsers only |

### Documented Coverage

- **Bootstrap 3**: IE 8+ (as per Bootstrap 3 docs)
- **Bootstrap 4**: IE 10+ (as per Bootstrap 4 docs)
- **Bootstrap 5**: No IE support (as per Bootstrap 5 docs)
- **Everything else**: Last 2 versions of Chrome, Firefox, Safari, Edge

**No changes needed** — policy is clear and documented.

---

## Pre-Release Smoke Test Checklist

Before promoting to beta:

### Local Validation
- [ ] `yarn install` on clean checkout
- [ ] `yarn lint` passes
- [ ] `yarn typecheck` passes
- [ ] `yarn build` completes without errors
- [ ] `yarn workspaces foreach -A exec npm pack --dry-run` succeeds

### Tarball Inspection
For each package:
- [ ] `npm pack` (generates tarball)
- [ ] `tar -tzf <package>.tgz | grep -E '(dist/|LICENSE|README)'`
- [ ] Verify `dist/umd/` exists (where applicable)
- [ ] Verify CSS files present (renderers)
- [ ] Verify `LICENSE` included

### CDN Validation (Post-Publish to `next`)
- [ ] Load UMD from jsDelivr in sandbox page
- [ ] Verify global exports (`window.TouchSpinBootstrap5`)
- [ ] Test ESM import map in browser
- [ ] Verify CSS loads without 404s

### Integration Tests (Optional but Recommended)
- [ ] Create test project with webpack 5 + ESM
- [ ] Create test project with Vite + ESM
- [ ] Create legacy project with webpack 4 + CJS (jQuery plugin)
- [ ] Create vanilla HTML + CDN project

---

## Release Workflow Steps

### Phase 1: Fix Critical Gaps (This PR)
1. ✅ Update all `engines` to `node >=18.17.0`
2. ✅ Fix `.changeset/config.json` baseBranch to `master`
3. ✅ Align jQuery peerDependencies
4. ✅ Update core README Node requirement
5. ✅ Mark root package as private
6. ✅ Add CJS build for jQuery plugin (optional but recommended)

### Phase 2: Publish to `next` (Automated)
1. Merge fixes PR
2. Create changeset: `yarn changeset` → select all packages → patch bump → "Release readiness fixes"
3. GitHub Actions opens Release PR
4. Review generated CHANGELOG
5. Merge Release PR
6. GitHub Actions publishes to `next` with provenance

### Phase 3: Manual Beta Promotion
```bash
# After smoke tests pass
npm dist-tag add @touchspin/core@5.0.0 beta
npm dist-tag add @touchspin/jquery-plugin@5.0.0 beta
npm dist-tag add @touchspin/renderer-bootstrap3@5.0.0 beta
npm dist-tag add @touchspin/renderer-bootstrap4@5.0.0 beta
npm dist-tag add @touchspin/renderer-bootstrap5@5.0.0 beta
npm dist-tag add @touchspin/renderer-tailwind@5.0.0 beta
npm dist-tag add @touchspin/renderer-vanilla@5.0.0 beta
npm dist-tag add @touchspin/web-component@5.0.0 beta
```

### Phase 4: Community Validation (2–4 weeks)
- Recruit 2–3 downstream projects to test beta
- Monitor GitHub issues
- Iterate on bug reports

### Phase 5: Stable Promotion
```bash
# After validation period
npm dist-tag add @touchspin/core@5.0.0 latest
# ... repeat for all packages
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking API changes discovered post-release | Medium | High | Use `beta` tag for ≥2 weeks with community testing |
| CDN caching issues | Low | Medium | Pin versions in docs, provide cache-bust query params |
| Node 18 compatibility issues | Low | Medium | Run CI matrix on Node 18/20/22 |
| Legacy bundler incompatibility | Medium | Low | Provide CJS for jQuery plugin; document bundler config |
| Peer dependency version conflicts | Medium | Low | Document peer ranges clearly; use `peerDependenciesMeta.optional` |

---

## Success Criteria for Stable Release

### Quantitative
- ✅ All packages score ≥9 in rubric
- ✅ No critical packaging bugs in GitHub issues
- ✅ ≥2 downstream projects successfully integrate
- ✅ CDN smoke tests pass for all UMD bundles
- ✅ npm pack size reasonable (<200KB per package uncompressed)

### Qualitative
- ✅ Migration guide validated by v4 users
- ✅ DX feedback positive (install, import, usage)
- ✅ No unresolved peer dependency warnings in common setups

---

## Recommended Next Actions

### Immediate (This Session)
1. ✅ Fix Node engines across all packages
2. ✅ Fix Changeset baseBranch
3. ✅ Align jQuery peerDependency
4. ✅ Mark root package private
5. ✅ Add CJS build for jQuery plugin
6. ✅ Update docs/releasing.md with dist-tag commands

### Short Term (Next 1–2 Days)
1. Create changeset for release-readiness fixes
2. Open PR with all fixes
3. Review and merge
4. Publish to `next` tag
5. Run full smoke test checklist

### Medium Term (Next 2–4 Weeks)
1. Promote to `beta`
2. Recruit community testers
3. Monitor issues
4. Iterate on bug reports

### Long Term (Post-Stable)
1. Promote to `latest`
2. Announce v5 stable release
3. Deprecate legacy v4 package (optional)
4. Create migration bounty program (optional)

---

## Appendix: Package Metadata Summary

### @touchspin/core
```json
{
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./renderer": { "types": "./dist/renderer.d.ts", "import": "./dist/renderer.js" }
  },
  "engines": { "node": ">=18.17.0" }
}
```

### @touchspin/jquery-plugin
```json
{
  "type": "module",
  "sideEffects": ["./dist/**/*.js"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "peerDependencies": { "jquery": ">=1.7" },
  "engines": { "node": ">=18.17.0" }
}
```

### Renderer packages (bootstrap3/4/5, tailwind, vanilla)
```json
{
  "type": "module",
  "sideEffects": ["**/*.css", "**/*.scss"],
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./css": "./dist/touchspin-<flavor>.css"
  },
  "style": "dist/touchspin-<flavor>.css",
  "engines": { "node": ">=18.17.0" }
}
```

---

## Conclusion

TouchSpin v5 has **excellent packaging foundations** with comprehensive documentation and automation in place. The identified gaps are **tactical fixes** rather than architectural problems.

**After implementing the 6 critical/medium fixes**, all packages will be ready for **beta** promotion. Following a 2–4 week community validation period, the project can confidently graduate to **stable/latest**.

**Estimated effort to beta-ready:** 2–4 hours
**Estimated time to stable:** 3–6 weeks (mostly validation time)

---

_End of Release Readiness Audit_
