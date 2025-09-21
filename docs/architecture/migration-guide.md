# TouchSpin Migration Guide: From Legacy to Modern

This guide provides practical guidance for migrating from any previous version of TouchSpin to the modern modular architecture, with specific attention to potential pitfalls and behavioral changes.

## Quick Migration Path Identification

### Identify Your Starting Version

| If your code looks like... | You're using... | Migration complexity |
|----------------------------|-----------------|---------------------|
| `$('#spinner').trigger('touchspin.uponce')` | TRUE Legacy (v3.x) | 🔴 High - Major API changes |
| `$('#spinner').TouchSpin('uponce')` | In-Between (v4.x) | 🟡 Medium - API compatible but behavioral changes |
| `const api = TouchSpin(inputEl); api.upOnce()` | New Modular (v5.x) | ✅ Already modern |

## Migration Strategies

### Strategy 1: Gradual Migration (Recommended)

Use the jQuery wrapper for backward compatibility while gradually adopting modern patterns:

```ts
// Phase 1: Keep existing code working
$('#spinner').TouchSpin({min: 0, max: 100});
$('#spinner').TouchSpin('setValue', 50);

// Phase 2: Start using modern API alongside
const input = document.querySelector('#spinner') as HTMLInputElement;
const api = getTouchSpin(input);
console.log('Current value:', api.getValue());

// Phase 3: Full modern migration
const input = document.querySelector('#spinner') as HTMLInputElement;
const api = TouchSpin(input, { min: 0, max: 100 });
api.setValue(50);
```

### Strategy 2: Direct Migration

Completely rewrite to use the modern API:

```ts
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
const input = document.querySelector('#spinner') as HTMLInputElement;
const api = TouchSpin(input, {
  min: 0,
  max: 100,
  step: 1,
  decimals: 0,
  verticalbuttons: true,
});

api.on('min', function() {
    console.log('At minimum value');
});
```

## Critical Migration Pitfalls

### 1. Instance Storage Changes

**Problem:** Code that directly accesses instance data will break.

```ts
// ❌ Legacy/In-Between - Will break
const internalApi = $('#spinner').data('touchspinInternal');

// ✅ Modern - Correct approach
const input = document.querySelector('#spinner') as HTMLInputElement;
const api = getTouchSpin(input);
```

**Migration:** Replace all direct data access with the public API.

### 2. Boundary Logic Behavioral Change

**Problem:** Boundary checking logic has changed from reactive to proactive.

**Legacy Behavior:** Operations calculated, then boundaries enforced
```ts
// Legacy: Always increments, then clamps
function upOnce() {
    value += step;
    if (value >= max) value = max; // After calculation
}
```

**Modern Behavior:** Operations prevented at boundaries
```ts  
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

```ts
// ❌ Legacy - Direct jQuery events only
$('#spinner').on('touchspin.on.max', handler);

// ✅ Modern - Use wrapper for compatibility OR modern events
$('#spinner').on('touchspin.on.max', handler); // Still works via wrapper
// OR
const input = document.querySelector('#spinner') as HTMLInputElement;
const api = getTouchSpin(input);
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

```ts
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

```ts
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

```ts
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

```ts
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

```ts
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

1. **Install the modular packages:**
   ```bash
   yarn add @touchspin/core @touchspin/jquery-plugin @touchspin/renderer-bootstrap5
   ```

2. **Wire up imports (choose modern or jQuery API):**
   ```ts
   // Modern API
   import { TouchSpin } from '@touchspin/core';
   import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';

   // jQuery wrapper when you need backward compatibility
   import { installJqueryTouchSpin } from '@touchspin/jquery-plugin';
   installJqueryTouchSpin(window.jQuery);
   ```

3. **Load the matching CSS bundle:**
   ```css
   @import '@touchspin/renderer-bootstrap5/dist/touchspin-bootstrap5.css';
   ```

### Step 3: Migration Implementation

#### Option A: jQuery Wrapper Migration (Low Risk)

Keep existing code mostly unchanged:

```ts
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

```ts
// Before
$('#spinner').TouchSpin({min: 0, max: 100});
const value = $('#spinner').TouchSpin('getValue');
$('#spinner').TouchSpin('setValue', 42);

// After
const input = document.querySelector('#spinner') as HTMLInputElement;
const api = TouchSpin(input, { min: 0, max: 100 });
const value = api.getValue();
api.setValue(42);
```

### Step 4: Testing Strategy

1. **Verify basic functionality:**
   ```ts
   // Test all core operations
   api.upOnce();
   api.downOnce();
   api.startUpSpin();
   api.stopSpin();
   ```

2. **Test boundary conditions:**
   ```ts
   const maxValue = 100;
   api.updateSettings({ max: maxValue });
   api.setValue(maxValue);
   api.upOnce(); // Should emit 'max' event, not change value
   ```

3. **Test event handling:**
   ```ts
  const maxValue = 100;
  api.updateSettings({ max: maxValue });

  let maxHit = false;
  api.on('max', () => { maxHit = true; });
  api.setValue(maxValue);
  api.upOnce();
  console.assert(maxHit, 'Max event should fire');
   ```

4. **Test settings updates:**
   ```ts
  let observedMax = 0;
  const stop = api.observeSetting('max', (value) => { observedMax = value; });
  api.updateSettings({ max: 200 });
  stop();
  console.assert(observedMax === 200, 'Settings observer should fire');
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

```ts
import { TouchSpin } from '@touchspin/core';
import Bootstrap5Renderer from '@touchspin/renderer-bootstrap5';

const input = document.querySelector('#spinner') as HTMLInputElement;
const api = TouchSpin(input, {
  renderer: Bootstrap5Renderer,
  min: 0,
  max: 100,
});
```

### Custom Renderer Migration

If you have custom renderers, follow the new contract:

```ts
import { AbstractRenderer } from '@touchspin/core/renderer';

export default class CustomRenderer extends AbstractRenderer {
  init(): void {
    this.wrapper = this.buildInputGroup();

    const upButton = this.wrapper.querySelector('[data-touchspin-injected="up"]');
    const downButton = this.wrapper.querySelector('[data-touchspin-injected="down"]');

    this.core.attachUpEvents(upButton);
    this.core.attachDownEvents(downButton);

    this.core.observeSetting('prefix', (value) => {
      this.updatePrefix(value ?? '');
    });
  }
}
```

## Testing Your Migration

### Unit Test Examples

```ts
describe('TouchSpin Migration', () => {
  test('basic functionality works', () => {
    const spinner = document.createElement('input');
    document.body.appendChild(spinner);
    const api = TouchSpin(spinner, { min: 0, max: 10 })!;

    api.setValue(5);
    expect(api.getValue()).toBe(5);

    api.upOnce();
    expect(api.getValue()).toBe(6);
  });

  test('boundary behavior is correct', () => {
    const spinner = document.createElement('input');
    document.body.appendChild(spinner);
    const api = TouchSpin(spinner, { min: 0, max: 10 })!;
    const maxSpy = jest.fn();

    api.on('max', maxSpy);
    api.setValue(10);
    api.upOnce(); // Should not change value

    expect(api.getValue()).toBe(10);
    expect(maxSpy).toHaveBeenCalled();
  });

  test('settings updates work', () => {
    const spinner = document.createElement('input');
    document.body.appendChild(spinner);
    const api = TouchSpin(spinner, { max: 10 })!;

    api.updateSettings({ max: 20 });
    api.setValue(15); // Should now be valid
    expect(api.getValue()).toBe(15);
  });
});
```

### Integration Test Examples

```ts
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

1. **Keep the wrapper installed:**
   ```ts
   import { installJqueryTouchSpin } from '@touchspin/jquery-plugin';

   if (featureFlags.useLegacyJqueryApi) {
     installJqueryTouchSpin(window.jQuery);
   }
   ```

2. **Gate modern usage behind a flag:**
   ```ts
   const input = document.querySelector('#spinner') as HTMLInputElement;

   if (featureFlags.useModernTouchSpin) {
     TouchSpin(input, options);
   } else {
     installJqueryTouchSpin(window.jQuery);
     $(input).TouchSpin(options);
   }
   ```

3. **Fall back gracefully:**
   ```ts
   try {
     const input = document.querySelector('#spinner') as HTMLInputElement;
     TouchSpin(input, options);
   } catch (error) {
     console.warn('Falling back to jQuery TouchSpin', error);
     installJqueryTouchSpin(window.jQuery);
     $('#spinner').TouchSpin(options);
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
