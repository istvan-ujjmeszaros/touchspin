# TouchSpin Migration Guide: From Legacy to Modern

This guide provides practical guidance for migrating from any previous version of TouchSpin to the modern modular architecture, with specific attention to potential pitfalls and behavioral changes.

## Quick Migration Path Identification

### Identify Your Starting Version

| If your code looks like... | You're using... | Migration complexity |
|----------------------------|-----------------|---------------------|
| `$('#spinner').trigger('touchspin.uponce')` | TRUE Legacy (v3.x) | 🔴 High - Major API changes |
| `$('#spinner').TouchSpin('uponce')` | In-Between (v4.x) | 🟡 Medium - API compatible but behavioral changes |
| `const api = TouchSpin('#spinner'); api.upOnce()` | New Modular (v5.x) | ✅ Already modern |

## Migration Strategies

### Strategy 1: Gradual Migration (Recommended)

Use the jQuery wrapper for backward compatibility while gradually adopting modern patterns:

```javascript
// Phase 1: Keep existing code working
$('#spinner').TouchSpin({min: 0, max: 100});
$('#spinner').TouchSpin('setValue', 50);

// Phase 2: Start using modern API alongside
const api = getTouchSpin('#spinner');
console.log('Current value:', api.getValue());

// Phase 3: Full modern migration
const api = TouchSpin('#spinner', {min: 0, max: 100});
api.setValue(50);
```

### Strategy 2: Direct Migration

Completely rewrite to use the modern API:

```javascript
// Before (Legacy/In-Between)
$('#spinner').TouchSpin({
    min: 0,
    max: 100,
    step: 1,
    decimals: 0,
    verticalbuttons: true
});

$('#spinner').on('touchspin.on.min', function() {
    console.log('At minimum value');
});

// After (Modern)
const api = TouchSpin('#spinner', {
    min: 0,
    max: 100,
    step: 1,
    decimals: 0,
    verticalbuttons: true
});

api.on('min', function() {
    console.log('At minimum value');
});
```

## Critical Migration Pitfalls

### 1. Instance Storage Changes

**Problem:** Code that directly accesses instance data will break.

```javascript
// ❌ Legacy/In-Between - Will break
const internalApi = $('#spinner').data('touchspinInternal');

// ✅ Modern - Correct approach
const api = getTouchSpin('#spinner');
```

**Migration:** Replace all direct data access with the public API.

### 2. Boundary Logic Behavioral Change

**Problem:** Boundary checking logic has changed from reactive to proactive.

**Legacy Behavior:** Operations calculated, then boundaries enforced
```javascript
// Legacy: Always increments, then clamps
function upOnce() {
    value += step;
    if (value >= max) value = max; // After calculation
}
```

**Modern Behavior:** Operations prevented at boundaries
```javascript  
// Modern: Prevents operation entirely at boundary
upOnce() {
    if (currentValue === max) {
        this.emit('max');
        return; // No operation performed
    }
    // ... increment logic
}
```

**Impact:** 
- Fewer unnecessary calculations
- More predictable event timing
- Consistent behavior across all operations

**Migration:** Update any code that depends on values being clamped after exceeding boundaries.

### 3. Event System Changes

**Problem:** Event plumbing and timing has changed.

```javascript
// ❌ Legacy - Direct jQuery events only
$('#spinner').on('touchspin.on.max', handler);

// ✅ Modern - Use wrapper for compatibility OR modern events
$('#spinner').on('touchspin.on.max', handler); // Still works via wrapper
// OR
const api = getTouchSpin('#spinner');
api.on('max', handler); // Modern approach
```

**Timing Changes:**
- Min/max events now fire BEFORE display changes at boundaries
- Fewer intermediate change events during typing
- Event sequence is more predictable

### 4. Native Attribute Synchronization

**Problem:** Min/max/step attribute syncing behavior has changed.

**Legacy/In-Between:** Always syncs attributes to input element
**Modern:** Only syncs for `type="number"` inputs

```javascript
// Modern behavior
if (inputElement.type === 'number') {
    inputElement.min = settings.min;
    inputElement.max = settings.max;
    inputElement.step = settings.step;
}
// For text inputs, avoids setting native attributes
```

**Impact:** Prevents browser precision quirks and formatting conflicts.

**Migration:** Review custom styling or behavior that depends on these attributes.

### 5. Change Event Handling

**Problem:** Change event emission has been refined.

**Legacy/In-Between:** 
- Change events fire during typing
- Blur/focusout triggers sanitization and change

**Modern:**
- Intercepts native change in capture phase
- Prevents intermediate invalid values from propagating
- Final change event after sanitization is cleaner

```javascript
// Modern approach prevents intermediate invalid values
_handleInputChange(e) {
    const current = this.inputEl.value;
    const sanitized = this._sanitizeInputValue(current);
    if (current !== sanitized) {
        e.stopImmediatePropagation(); // Block invalid value
    }
}
```

**Migration:** Update code that depends on change events during typing.

### 6. Settings Sanitization

**Problem:** Settings validation is now much more strict.

```javascript
// ❌ Legacy - Silent failures
TouchSpin({step: 0}); // Silently broken

// ✅ Modern - Defensive programming
TouchSpin({step: 0}); // Automatically corrected to minimum valid step
```

**Modern sanitization:**
- `step`: Must be > 0, defaults to 1 if invalid
- `decimals`: Must be >= 0, rounds to integer
- `min`/`max`: Must be null or finite numbers
- `intervals`: Must be non-negative

**Migration:** Review settings that might have been invalid but silently accepted.

### 7. Renderer Responsibilities

**Problem:** Custom renderers need to follow new contracts.

**Legacy/In-Between:** Plugin binds events to renderer-returned elements
**Modern:** Renderer must call `attachUpEvents`/`attachDownEvents`

```javascript
// ❌ Legacy renderer pattern
return {
    wrapper: $wrapper,
    up: $upButton,
    down: $downButton
};

// ✅ Modern renderer pattern
init() {
    this.buildDOM();
    this.core.attachUpEvents(this.upButton, this.upBehavior);
    this.core.attachDownEvents(this.downButton, this.downBehavior);
    return this.wrapper;
}
```

### 8. Prefix/Postfix Handling

**Modern Requirement:** Renderers should render prefix/postfix elements even if empty - core will hide them.

```javascript
// Modern approach - always render, let core control visibility
buildPrefix() {
    const prefix = document.createElement('span');
    prefix.className = 'input-group-text';
    prefix.textContent = this.settings.prefix || '';
    return prefix; // Core will hide if empty
}
```

## Step-by-Step Migration Process

### Step 1: Audit Current Usage

1. **Identify TouchSpin version:**
   ```bash
   grep -r "TouchSpin" your-project/
   grep -r "touchspin.uponce" your-project/ # TRUE Legacy
   grep -r "TouchSpin('uponce')" your-project/ # In-Between
   ```

2. **List all TouchSpin instances:**
   - Find all initialization calls
   - Find all command/method calls  
   - Find all event handlers

3. **Identify custom renderers or themes:**
   - Look for custom CSS or HTML modifications
   - Check for renderer-specific code

### Step 2: Prepare Dependencies

1. **Update TouchSpin:**
   ```bash
   npm install bootstrap-touchspin@latest
   ```

2. **Include appropriate packages:**
   ```javascript
   // For jQuery compatibility
   import 'bootstrap-touchspin/dist/jquery-plugin.js';
   
   // For modern usage
   import TouchSpin from 'bootstrap-touchspin';
   ```

3. **Update CSS if needed:**
   ```css
   /* Modern CSS classes may differ from legacy */
   @import 'bootstrap-touchspin/dist/bootstrap-touchspin.css';
   ```

### Step 3: Migration Implementation

#### Option A: jQuery Wrapper Migration (Low Risk)

Keep existing code mostly unchanged:

```javascript
// Before
$('#spinner').TouchSpin(options);
$('#spinner').TouchSpin('setValue', 42);
$('#spinner').on('touchspin.on.max', handler);

// After - no changes needed, works via wrapper
$('#spinner').TouchSpin(options);
$('#spinner').TouchSpin('setValue', 42); 
$('#spinner').on('touchspin.on.max', handler);
```

#### Option B: Modern API Migration (Full Benefits)

Update to use modern patterns:

```javascript
// Before
$('#spinner').TouchSpin({min: 0, max: 100});
const value = $('#spinner').TouchSpin('getValue');
$('#spinner').TouchSpin('setValue', 42);

// After
const api = TouchSpin('#spinner', {min: 0, max: 100});
const value = api.getValue();
api.setValue(42);
```

### Step 4: Testing Strategy

1. **Verify basic functionality:**
   ```javascript
   // Test all core operations
   api.upOnce();
   api.downOnce();
   api.startUpSpin();
   api.stopSpin();
   ```

2. **Test boundary conditions:**
   ```javascript
   api.setValue(api.settings.max);
   api.upOnce(); // Should emit 'max' event, not change value
   ```

3. **Test event handling:**
   ```javascript
   let maxHit = false;
   api.on('max', () => { maxHit = true; });
   api.setValue(api.settings.max);
   api.upOnce();
   console.assert(maxHit, 'Max event should fire');
   ```

4. **Test settings updates:**
   ```javascript
   api.updateSettings({max: 200});
   console.assert(api.settings.max === 200, 'Settings should update');
   ```

### Step 5: Performance Verification

1. **Check initialization speed:**
   - Modern version should initialize faster
   - Memory usage should be lower

2. **Verify event performance:**
   - Events should fire more efficiently
   - No jQuery overhead in core events

3. **Test cleanup:**
   - Ensure proper cleanup when destroying instances
   - No memory leaks in repeated init/destroy cycles

## Framework-Specific Considerations

### Bootstrap Version Migration

**Bootstrap 3 → 4 → 5:** Renderers handle framework differences automatically.

```javascript
// Works with any Bootstrap version
const api = TouchSpin('#spinner', {
    // Renderer automatically selected based on detected Bootstrap version
});
```

### Custom Renderer Migration

If you have custom renderers, follow the new contract:

```javascript
class CustomRenderer {
    constructor(inputEl, settings, core) {
        this.inputEl = inputEl;
        this.settings = settings;
        this.core = core;
    }
    
    init() {
        this.buildDOM();
        
        // REQUIRED: Attach events via core
        this.core.attachUpEvents(this.upButton, this.upBehavior);
        this.core.attachDownEvents(this.downButton, this.downBehavior);
        
        // REQUIRED: Set data attributes for core event targeting
        this.upButton.dataset.touchspinInjected = 'up';
        this.downButton.dataset.touchspinInjected = 'down';
        this.wrapper.dataset.touchspinInjected = 'wrapper';
        
        return this.wrapper;
    }
    
    // Optional: React to setting changes
    observeSetting(key, value) {
        if (key === 'prefix') {
            this.prefixElement.textContent = value;
        }
    }
}
```

## Testing Your Migration

### Unit Test Examples

```javascript
describe('TouchSpin Migration', () => {
    test('basic functionality works', () => {
        const api = TouchSpin('#spinner', {min: 0, max: 10});
        
        api.setValue(5);
        expect(api.getValue()).toBe(5);
        
        api.upOnce();
        expect(api.getValue()).toBe(6);
    });
    
    test('boundary behavior is correct', () => {
        const api = TouchSpin('#spinner', {min: 0, max: 10});
        const maxSpy = jest.fn();
        
        api.on('max', maxSpy);
        api.setValue(10);
        api.upOnce(); // Should not change value
        
        expect(api.getValue()).toBe(10);
        expect(maxSpy).toHaveBeenCalled();
    });
    
    test('settings updates work', () => {
        const api = TouchSpin('#spinner', {max: 10});
        
        api.updateSettings({max: 20});
        expect(api.settings.max).toBe(20);
        
        api.setValue(15); // Should now be valid
        expect(api.getValue()).toBe(15);
    });
});
```

### Integration Test Examples

```javascript
describe('TouchSpin jQuery Compatibility', () => {
    test('wrapper maintains compatibility', () => {
        $('#spinner').TouchSpin({min: 0, max: 10});
        
        $('#spinner').TouchSpin('setValue', 5);
        expect($('#spinner').TouchSpin('getValue')).toBe(5);
        
        const eventSpy = jest.fn();
        $('#spinner').on('touchspin.on.max', eventSpy);
        
        $('#spinner').TouchSpin('setValue', 10);
        $('#spinner').TouchSpin('uponce');
        
        expect(eventSpy).toHaveBeenCalled();
    });
});
```

## Common Migration Issues and Solutions

### Issue: Custom CSS not working
**Cause:** CSS selectors may have changed
**Solution:** Update selectors to use modern class names or data attributes

### Issue: Events firing at wrong times
**Cause:** Event timing improvements in modern version
**Solution:** Update event handlers to expect new timing

### Issue: Value sanitization too strict
**Cause:** Modern version has comprehensive validation
**Solution:** Review settings for invalid values, fix at source

### Issue: Performance regression
**Cause:** Incorrect migration or compatibility layer overhead
**Solution:** Use modern API directly instead of jQuery wrapper

### Issue: Custom renderer not working  
**Cause:** Renderer contract has changed
**Solution:** Update renderer to follow new contract with `attachUpEvents`/`attachDownEvents`

## Rollback Plan

If migration issues occur:

1. **Keep old version available:**
   ```javascript
   // Conditional loading during migration
   if (USE_LEGACY_TOUCHSPIN) {
       import 'bootstrap-touchspin-legacy';
   } else {
       import 'bootstrap-touchspin';
   }
   ```

2. **Feature flags for gradual rollout:**
   ```javascript
   const useLegacy = featureFlags.legacyTouchSpin;
   const api = useLegacy 
       ? LegacyTouchSpin('#spinner', options)
       : TouchSpin('#spinner', options);
   ```

3. **Fallback detection:**
   ```javascript
   try {
       const api = TouchSpin('#spinner', options);
       // Use modern API
   } catch (error) {
       console.warn('Falling back to legacy TouchSpin', error);
       $('#spinner').TouchSpin(options); // Legacy fallback
   }
   ```

## Post-Migration Benefits

After successful migration, you'll have:

- ✅ **Better Performance** - Faster initialization and event handling
- ✅ **Framework Independence** - Use with any CSS framework
- ✅ **Better Testing** - Unit test individual components
- ✅ **Modern Architecture** - Clean, maintainable code structure
- ✅ **Enhanced Accessibility** - Comprehensive ARIA support
- ✅ **Predictable Behavior** - Proactive boundary logic prevents edge cases
- ✅ **Better Error Handling** - Defensive programming with graceful fallbacks

## Getting Help

- Review the [method comparison](method-comparison.md) for detailed behavioral differences
- Check the [three-stage evolution](../three-stage-evolution.md) to understand your migration path
- Use the [API quick reference](../reference/api-quick-reference.md) for modern usage patterns
- Consult [test traceability](../reference/test-traceability.md) for testing guidance