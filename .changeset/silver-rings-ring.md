---
"@touchspin/core": patch
"@touchspin/jquery": patch
"@touchspin/standalone": patch
"@touchspin/webcomponent": patch
"@touchspin/renderer-bootstrap3": patch
"@touchspin/renderer-bootstrap4": patch
"@touchspin/renderer-bootstrap5": patch
"@touchspin/renderer-tailwind": patch
"@touchspin/renderer-vanilla": patch
---

Fix release assets script to include all packages and provide proper naming

- Previously only jQuery adapter assets were included in releases
- Now includes standalone ESM bundles, web component UMD bundles, and CSS stylesheets
- Renamed assets with consistent, unique naming scheme for better CDN compatibility
- Added comprehensive release notes explaining each asset type
