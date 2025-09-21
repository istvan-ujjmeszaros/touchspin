# Bootstrap 5 Renderer — Minimal Test Plan for 100% Coverage

Goal: Achieve full line/branch coverage of `Bootstrap5Renderer` with a minimal number of Playwright tests using existing helpers only.

Helpers used:
- `initializeTouchspinWithBootstrap5(page, id, options)`
- `updateSettingsViaAPI(page, id, newSettings)`
- `destroyCore(page, id)`
- Interactions/assertions via `data-touchspin-injected` selectors
- Coverage hooks: `startCoverage(page)`, `collectCoverage(page, title)`

Notes:
- Navigate to `packages/core/tests/__shared__/fixtures/test-fixture.html` for a ready input with `data-testid="test-input"`.
- Prefer renderer-agnostic selectors (`[data-touchspin-injected]`); only assert essential Bootstrap classes.

---

- [ ] renderer-b5: basic horizontal init and updates
  - Purpose: Cover init(), buildBasicInputGroup(), _detectInputGroupSize(), updateButtonText(), updateButtonClass(), updatePrefix/Postfix(+Classes), updateButtonFocusability(), rebuildDOM(), teardown() removal of `form-control`.
  - Pseudocode:
    1) page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html')
    2) page.evaluate: remove `form-control` from input; add `form-control-sm`
    3) initializeTouchspinWithBootstrap5('test-input', { prefix:'$', prefix_extraclass:'fx-p', postfix:'kg', postfix_extraclass:'fx-s', buttonup_txt:'UP', buttondown_txt:'DOWN', buttonup_class:'btn btn-success', buttondown_class:'btn btn-warning', focusablebuttons:true })
    4) Assert wrapper has `input-group-sm`; up/down buttons exist with texts/classes; prefix/postfix texts/classes; buttons tabindex='0'
    5) updateSettingsViaAPI: { focusablebuttons:false } → assert tabindex='-1'; then true → '0'
    6) updateSettingsViaAPI: { buttonup_class:'btn btn-primary', buttondown_class:'btn btn-danger' } → assert class names updated
    7) updateSettingsViaAPI: { buttonup_txt: undefined, buttondown_txt: undefined } → assert text falls back to '+'/'−'
    8) updateSettingsViaAPI: { prefix_extraclass:'fx-p2', postfix_extraclass:'fx-s2' } → assert class updates
    9) updateSettingsViaAPI: { prefix:'' } → assert rebuild (prefix removed)
    10) page.evaluate: switch input class to `form-control-lg`; updateSettingsViaAPI: { verticalbuttons:true } → assert vertical wrapper exists (forces rebuild and size re-eval)
    11) destroyCore → assert input no longer has `form-control` (renderer-added class removed)

- [ ] renderer-b5: vertical layout and vertical-specific updates
  - Purpose: Cover buildVerticalButtons(), updateVerticalButtonClass() for both buttons with base + override, updateVerticalButtonText(), updateButtonFocusability() in vertical mode.
  - Pseudocode:
    1) page.goto(fixture)
    2) initializeTouchspinWithBootstrap5('test-input', { verticalbuttons:true, verticalup:'▲', verticaldown:'▼', buttonup_class:'btn btn-success', buttondown_class:'btn btn-warning', verticalupclass:'v-up', verticaldownclass:'v-down', focusablebuttons:true })
    3) Assert vertical wrapper present; up/down texts; classes contain base and vertical overrides
    4) updateSettingsViaAPI: { verticalupclass:'v-up-2', verticaldownclass:'v-down-2' } → assert recomputed className preserves respective base and applies new overrides
    5) updateSettingsViaAPI: { verticalup: undefined, verticaldown: undefined } → assert default text '+'/'−'
    6) updateSettingsViaAPI: { buttonup_class:'btn btn-primary', buttondown_class:'btn btn-danger' } → assert recomputed classes include new bases
    7) updateSettingsViaAPI: { focusablebuttons:false } → assert tabindex='-1' on both; then true → '0'

- [ ] renderer-b5: advanced input-group path and rebuilds
  - Purpose: Cover buildAdvancedInputGroup() horizontal/vertical branches, insertion order, internal references, and updatePrefix/Postfix rebuild paths from empty→value and value→empty.
  - Pseudocode:
    1) page.goto(fixture)
    2) page.evaluate: wrap input in `<div class="input-group"></div>`
    3) initializeTouchspinWithBootstrap5('test-input', { prefix:'', postfix:'', verticalbuttons:false, buttonup_txt:'+', buttondown_txt:'−' })
    4) Assert order: down → input → up (no prefix/postfix yet)
    5) updateSettingsViaAPI: { prefix:'$', prefix_extraclass:'x1' } → assert prefix inserted before input; classes applied
    6) updateSettingsViaAPI: { postfix:'kg', postfix_extraclass:'x2' } → assert postfix inserted after input; classes applied
    7) updateSettingsViaAPI: { prefix:'', postfix:'' } → assert both removed (rebuild path)
    8) updateSettingsViaAPI: { verticalbuttons:true } → assert vertical branch taken in advanced group (vertical wrapper present)

Coverage checklist by feature (for review while implementing):
- [ ] init() form-control add/remove path hit
- [ ] buildInputGroup() advanced vs basic
- [ ] buildBasicInputGroup() vertical/horizontal; prefix/postfix present/absent; input-group sm/lg
- [ ] buildAdvancedInputGroup() vertical/horizontal; insertion order
- [ ] buildAndAttachDOM() event attachment executed
- [ ] updatePrefix/Postfix: element exists update; missing triggers rebuild; empty triggers rebuild
- [ ] updateButtonClass: up/down
- [ ] buildVerticalButtons: base + vertical overrides and defaults
- [ ] updateVerticalButtonClass: up/down with base preservation
- [ ] updateVerticalButtonText / updateButtonText defaults
- [ ] updatePrefixClasses / updatePostfixClasses
- [ ] handleVerticalButtonsChange → rebuildDOM
- [ ] rebuildDOM → removeInjectedElements and rebuild
- [ ] updateButtonFocusability tabindex toggle
