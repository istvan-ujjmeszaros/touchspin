# Bootstrap TouchSpin - Development Plan

## Current Status
✅ **Framework-Agnostic Renderer System**: Successfully implemented with null-based defaults allowing Bootstrap renderers to maintain existing class names while other renderers (like Tailwind) use framework-appropriate names.

✅ **Settings Precedence System**: Complete with comprehensive test infrastructure validating user settings take priority over renderer defaults.

✅ **Destroy/Reinitialize Functionality**: Validated and working correctly with destroy + reinitialize architectural pattern for settings updates.

✅ **Dynamic Settings Updates**: Added support for button text updates via `touchspin.updatesettings` event.

## Phase 2: Class Name Refactoring - COMPLETED ✅

### Goal 
Remove hard-coded `bootstrap-touchspin` and `bootstrap-touchspin-injected` class names from core plugin code and make them renderer-specific while maintaining backward compatibility.

### Status: COMPLETED
Successfully implemented data attribute-based element identification while preserving full backward compatibility with CSS class selectors.

### Approach
1. **Data Attributes for Internal Targeting**
   - Use `data-touchspin="active"` for main container identification
   - Use `data-touchspin="injected"` for elements added by TouchSpin
   - Core destroy logic uses data attributes, not CSS classes

2. **Renderer-Specific CSS Classes**
   - Bootstrap renderers: Keep existing `bootstrap-touchspin` classes for backward compatibility
   - Tailwind renderer: Use `tailwind-touchspin` or framework-appropriate classes
   - Other renderers: Use framework-appropriate class naming

3. **Implementation Steps**
   - Update destroy method to use data attributes for element detection
   - Update renderers to add both CSS classes AND data attributes to generated HTML
   - Update AbstractRenderer element selection to use data attributes
   - Maintain CSS class generation for styling purposes
   - Test all renderers maintain functionality and styling

### Files to Modify
- `src/jquery.bootstrap-touchspin.js` (destroy method, element detection)
- `src/renderers/AbstractRenderer.js` (initElements method)
- All renderer files (add data attributes to generated HTML)
- Update documentation for new data attribute approach

## Testing Strategy

### Manual Testing (Browser)
1. Open `/apps/bootstrap-touchspin/__tests__/html/destroy-test.html`
2. Test each scenario:
   - Initialize → verify UI appears correctly
   - Use spinner buttons → verify functionality works
   - Destroy → verify UI is cleaned up properly
   - Reinitialize → verify it works again with new settings
3. Document any issues found

### Automated Testing
- Tests should click the manual test buttons (not programmatically call TouchSpin)
- This ensures manual and automated testing use identical code paths
- Tests validate functional behavior, not perfect DOM restoration
- Add specific tests for any destroy bugs found during manual testing

## Current Status Summary
All core functionality has been validated and enhanced:
- Framework-agnostic renderer system working correctly
- Settings precedence system with comprehensive tests
- Destroy/reinitialize functionality validated
- Dynamic settings updates implemented  
- All 224 tests passing with no flaky tests

## Next Steps
The project is in a stable state with all major functionality working correctly. Phase 2 (class name refactoring) is optional and can be pursued based on project priorities.