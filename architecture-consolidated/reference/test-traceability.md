# Test Traceability (High-level)

- __tests__/renderers.test.ts
  - Cross-version structure and behavior parity (BS3/4/5/Tailwind)
  - Validates wrapper testids, up/down visibility, prefix/postfix presence

- __tests__/tailwindRenderer.test.ts
  - Tailwind renderer features and reactive updates; no Bootstrap dependency

- __tests__/apiMethods.test.ts
  - Command API parity via jQuery wrapper: uponce/downonce/start/stop/updateSettings/get/set

- __tests__/events.test.ts
  - Event ordering: start→stop, min/max before change, native change semantics

- __tests__/abCompare.test.ts / __tests__/abParitySequences.test.ts
  - A/B parity with legacy plugin; lifecycle, boundary stops, disabled behavior

- __tests__/spinBoundariesWrapper.test.ts
  - Boundary min/max clamping and stop behavior across wrappers

- __tests__/keyboardAccessibility.test.ts / __tests__/wrapperKeyboardWheel.test.ts
  - Keyboard and wheel behavior; stop on keyup; wheel only when focused

- __tests__/nativeAttributeSync.test.ts
  - Sync/observe native min/max/step; attribute changes propagate to settings

- __tests__/destroyAndReinitialize.test.ts
  - Destroy semantics and reinit ordering

- __tests__/callbackTests.test.ts
  - before/after calculation callbacks and formatting consistency

- __tests__/buildValidation.test.ts
  - Dist build outputs present and viable

Notes
- For deeper coverage mapping, consider tagging tests with @covers and producing a matrix, or export a runtime event log per feature.
