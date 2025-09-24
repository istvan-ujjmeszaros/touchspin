# Renderer Dynamic Update Issues

## Overview
Several renderer tests are failing due to issues with dynamic DOM updates after `updateSettings()` calls. This appears to be a limitation in the current renderer implementation rather than a test initialization problem.

## Affected Tests

### Universal Renderer Suite (`universal-renderer.suite.ts`)
The following tests fail across ALL renderer packages (Bootstrap3, Bootstrap4, Bootstrap5, Tailwind, Vanilla):

1. **`handles prefix and postfix dynamic changes`** (Line 174)
   - **Issue**: When `updateSettings({ prefix: '$', postfix: 'USD' })` is called, the DOM is not rebuilt to add prefix/postfix elements
   - **Expected**: Prefix/postfix elements should be created and visible
   - **Actual**: Elements are never created, selectors find nothing
   - **Root Cause**: Renderers don't rebuild DOM structure when prefix/postfix settings change

2. **`switches between horizontal and vertical layouts`** (Line 213)
   - **Issue**: When `updateSettings({ verticalbuttons: true/false })` is called, layout doesn't switch
   - **Expected**: DOM structure should change between horizontal and vertical layouts
   - **Actual**: Layout remains in initial state
   - **Root Cause**: Renderers don't rebuild DOM structure for layout changes

3. **`preserves input value during DOM updates`** (Line 249)
   - **Issue**: Test expects DOM rebuilds that don't happen
   - **Expected**: Value preserved through DOM rebuilds
   - **Actual**: No DOM rebuild occurs, so preservation can't be tested
   - **Root Cause**: Same as above - no DOM rebuilds on settings changes

4. **`maintains button functionality after updates`** (Line 281)
   - **Issue**: Depends on DOM rebuilds that don't occur
   - **Expected**: Buttons work after DOM updates
   - **Actual**: No updates happen to test
   - **Root Cause**: Same as above

5. **`preserves testid attributes during dynamic updates`** (Line 311)
   - **Issue**: Expects DOM rebuilds to preserve testid attributes
   - **Expected**: testid attributes maintained through rebuilds
   - **Actual**: No rebuilds occur
   - **Root Cause**: Same as above

## Technical Details

### Current Behavior
When `updateSettings()` is called with certain properties (prefix, postfix, verticalbuttons), the Core updates its internal state but does NOT trigger a DOM rebuild in the renderer. The renderer continues to display the initial DOM structure.

### Expected Behavior
Renderers should detect when settings that affect DOM structure change and rebuild the affected parts of the DOM while preserving state (input value, focus, etc.).

### Properties That Should Trigger Rebuilds
- `prefix` - Requires adding/removing prefix element
- `postfix` - Requires adding/removing postfix element
- `verticalbuttons` - Requires complete layout restructure
- `verticalup` / `verticaldown` - May require button updates
- Various class properties - May require class list updates

## Workarounds Applied

For tests checking element visibility when elements don't exist:
- Changed `await expect(element).toBeHidden()` to `await expect(element).not.toBeAttached()`
- This makes tests more accurate - elements don't exist rather than being hidden

## Recommendation

The renderer implementation needs to be updated to handle dynamic updates properly. This likely requires:

1. Renderers listening for specific setting changes
2. Implementing partial or full DOM rebuilds when structure-affecting settings change
3. Preserving important state (value, focus) during rebuilds
4. Ensuring event handlers are re-attached after rebuilds

Until this is implemented, these tests will continue to fail as they're testing functionality that doesn't exist.

## Impact

- **5 tests fail per renderer package**
- **Total: ~25 failing tests** across all renderer packages
- These are not initialization issues but implementation gaps