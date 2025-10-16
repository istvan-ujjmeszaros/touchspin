---
"@touchspin/core": patch
---

Fix: Programmatic `setValue` now triggers a `change` event to ensure framework compatibility. This aligns the behavior with the original jQuery plugin and user expectations, fixing integrations with frameworks like Angular, React, and Vue.