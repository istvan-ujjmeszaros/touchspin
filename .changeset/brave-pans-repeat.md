---
"@touchspin/jquery": patch
"@touchspin/webcomponent": patch
---

Generate minified release assets without source maps

- Added `build:umd-release-*` scripts that generate minified UMD bundles
- Updated `create-release-assets.mjs` to build and include only minified assets
- Removed source map files from release assets (broken references after renaming)
- Updated release notes to clarify assets are minified
- Release consumers get production-ready files without source map issues
