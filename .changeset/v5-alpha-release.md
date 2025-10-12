---
"@touchspin/core": patch
"@touchspin/standalone": patch
"@touchspin/jquery": patch
"@touchspin/react": patch
"@touchspin/webcomponent": patch
"@touchspin/renderer-bootstrap3": patch
"@touchspin/renderer-bootstrap4": patch
"@touchspin/renderer-bootstrap5": patch
"@touchspin/renderer-tailwind": patch
"@touchspin/renderer-vanilla": patch
---

TouchSpin v5.0.0 Alpha Release

This is the first alpha release of TouchSpin v5, featuring a completely rewritten architecture:

**New Features:**
- Modular renderer system (Bootstrap 3/4/5, Tailwind, Vanilla CSS)
- React adapter with per-renderer subpath exports
- Standalone, jQuery, and Web Component adapters
- Full TypeScript support with complete type definitions
- Comprehensive test coverage (1000+ tests)
- Modern ESM and UMD builds
- Enhanced accessibility (ARIA compliance)

**Breaking Changes:**
- Complete API redesign from v4.x
- New package structure with scoped @touchspin/* packages
- Renamed main package from `bootstrap-touchspin` to `@touchspin/core`

**Alpha Notice:**
This is an alpha release for early testing. API may change before stable release.
