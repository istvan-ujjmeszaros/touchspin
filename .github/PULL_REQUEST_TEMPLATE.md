## Summary
<!-- What does this change do? One or two sentences. -->

## Checklist
- [ ] No new `any` — dynamic props go through a typed seam (`getCoreFromInput` or equivalent).
- [ ] Renderer-agnostic selectors only (`data-touchspin-injected="up|down|prefix|postfix"`).
- [ ] No test-level listeners — rely on centralized logging.
- [ ] Deterministic waits/expectations; no raw `waitForTimeout` in tests.
- [ ] Cheatsheet/handbook still match helper behavior (update if needed).
- [ ] (If touching Core API) Minimal interfaces only; avoid heavyweight deps.

## Screenshots / Notes (optional)

