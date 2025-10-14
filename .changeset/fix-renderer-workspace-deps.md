---
"@touchspin/renderer-bootstrap3": patch
"@touchspin/renderer-bootstrap4": patch
"@touchspin/renderer-bootstrap5": patch
"@touchspin/renderer-tailwind": patch
"@touchspin/renderer-vanilla": patch
---

fix: replace workspace:* with 5.0.1-alpha.0 in renderer dependencies

Published renderer packages contained invalid workspace:* references for @touchspin/core dependency, preventing external consumers from installing them. This fixes the dependency to reference the published version 5.0.1-alpha.0 instead.
