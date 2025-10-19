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

Add cancelable events and speed change events, fix release assets

### Features
- Add cancelable change events (`change:start`, `change:end`) that can be prevented by calling `event.preventDefault()`
- Add speed change events (`speedchange`) that fire when the spin speed changes between normal/fast modes
- Add `cancelable` option to enable/disable cancelable events (default: false)

### Documentation
- Update event matrix documentation with comprehensive event reference
- Add examples of new cancelable and speed change events in README and package docs
- Document event payloads, timing, and cancelable event usage patterns

### Bug Fixes
- Fix release assets script to include all packages and provide proper naming
- Previously only jQuery adapter assets were included in releases
- Now includes standalone ESM bundles, web component UMD bundles, and CSS stylesheets
- Renamed assets with consistent, unique naming scheme for better CDN compatibility
- Added comprehensive release notes explaining each asset type
