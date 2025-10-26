---
'@touchspin/jquery': patch
'@touchspin/standalone': patch
'@touchspin/webcomponent': patch
---

fix: correct UMD build filenames and remove magic behavior from rename-umd.mjs

- Fixed rename-umd.mjs script to require explicit target filenames with .js extension
- Updated jQuery adapter package.json to explicitly specify .umd.js suffix (10 build scripts)
- Updated Webcomponent adapter package.json to explicitly specify .umd.js suffix (10 build scripts)
- Standalone adapter was already correct and required no changes
- All 15 HTML test files now use jsdelivr CDN URLs with correct @5 version pinning
- Verified all UMD files build correctly with .umd.js suffix (no more double .umd.umd.js)

This change ensures consistent UMD filename conventions across all adapters and makes the build process explicit rather than relying on implicit "magic" behavior.
