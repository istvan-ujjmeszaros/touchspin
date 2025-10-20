---
"@touchspin/core": patch
---

**Features:**
- Enforce `type="text"` with `inputmode` for better mobile UX
- Automatically convert `type="number"` inputs to `type="text"` with appropriate virtual keyboard
- Set `inputmode="numeric"` for integer steps, `inputmode="decimal"` for decimal steps
- Add `pattern` attribute to guide input validation
- Preserve existing `type="text"` inputs with custom `inputmode` and `pattern`
- Restore all original attributes on destroy for complete transparency
