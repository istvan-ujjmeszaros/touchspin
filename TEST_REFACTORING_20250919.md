# Test Refactoring Plan - September 19, 2025

## Overview
Complete test refactoring to centralize all TouchSpin interactions through two helper modules:
- `touchspinApiHelpers.ts` - Main helper functions
- `touchspinJqueryHelpers.ts` - jQuery-specific helpers

## Issues to Fix from Previous Refactoring

### 1. Incorrect `await` Usage with `getElement()`
- **Problem**: `getElement()` returns a Locator synchronously, not a Promise
- **Pattern**: `await apiHelpers.getElement(page, 'testid')` → `apiHelpers.getElement(page, 'testid')`
- **Occurrences**: ~191 instances across 20 files

### 2. Should Use `getWrapperInstanceWhenReady()`
- **Problem**: Using generic `getElement()` for wrapper operations
- **Pattern**: `apiHelpers.getElement(page, 'container').locator('[data-touchspin-injected="wrapper"]')`
- **Fix**: Use `apiHelpers.getWrapperInstanceWhenReady(page, 'container')`
- **Files**: All renderer test files (bs5Renderer, bs4Renderer, bs3Renderer, tailwindRenderer)

### 3. Redundant Focus Operations
- **Problem**: Manual focus before keyboard helpers that auto-focus
- **Pattern to remove**:
  ```typescript
  const input = apiHelpers.getElement(page, testid);
  await input.focus();
  await apiHelpers.pressDownArrowKeyOnInput(page, testid);
  ```
- **Files**: callbackTests.spec.ts, browserNativeSpinners.spec.ts, basicOperations.spec.ts, etc.

### 4. Remaining `waitForTimeout` Patterns
- **Count**: 169 occurrences
- **Replace with**:
  - Polled expectations: `await expect.poll(() => ...).toBe(...)`
  - Hold helpers: `holdUpButton()`, `holdDownButton()`
  - Event waiting: `waitForEventInLog()`

## Execution Plan

### Phase 1: Fix `await` with `getElement()` ✅ COMPLETED
- Remove unnecessary `await` keywords
- Keep `await` only for async operations (.focus(), .fill(), etc.)

### Phase 2: Replace with Proper Helpers 🚧 IN PROGRESS
- Use `getWrapperInstanceWhenReady()` for wrapper operations
- Remove redundant focus operations

### Phase 3: Complete waitForTimeout Replacement
- Convert to polled expectations
- Use hold helpers for spin operations

### Phase 4: Cleanup
- Verify all tests pass
- Commit changes

## Progress Log

### [2025-09-19 04:00] Phase 1: Fixed `await` with `getElement()` ✅ COMPLETED
- ✅ Removed unnecessary `await` from `const input = await apiHelpers.getElement()` patterns
- Fixed ~100+ instances across 20 files
- This resolves TypeError: apiHelpers.getElement(...).locator is not a function

### [2025-09-19 04:01] Phase 2: Replacing with Proper Helpers ✅ MOSTLY COMPLETED
- ✅ Started replacing wrapper operations with getWrapperInstanceWhenReady()
- ✅ Fixed bs5Renderer.spec.ts line 18 (the failing test)
- ✅ Applied batch replacement for wrapper patterns in renderer files
- ✅ Fixed double `await await` patterns that got created
- ✅ Removed redundant focus operations in callbackTests.spec.ts and basicOperations.spec.ts

### [2025-09-19 04:05] Starting Phase 3: waitForTimeout Replacement
- Ready to replace remaining 169 waitForTimeout calls
- Focus on polled expectations for event counters
- Use hold helpers for spin operations

### Current Status
- Fixed the main TypeError that was causing test failures ✅
- Completed most proper helper usage patterns ✅
- Next: Replace waitForTimeout patterns with proper polling/hold helpers