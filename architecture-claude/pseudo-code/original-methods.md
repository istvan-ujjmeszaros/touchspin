# Original TouchSpin Implementation - Pseudo Code Analysis

## File: `tmp/jquery.bootstrap-touchspin.legacy.js`

This is the true original TouchSpin implementation (873 lines) - a simple jQuery plugin with hardcoded Bootstrap markup and no renderer system. This is the version that existed before the architectural modernization.

## Main Plugin Structure

```pseudocode
FUNCTION $.fn.TouchSpin(options):
    // Legacy version has NO command API - only initialization
    // Control is achieved through callable events like:
    // $('#input').trigger('touchspin.uponce')
    
    FOR each selected input element:
        IF already initialized: return (skip)
        INCREMENT _currentSpinnerId (global counter)
        SET spinnerid data attribute
        INITIALIZE TouchSpin instance with hardcoded Bootstrap markup
        RETURN jQuery collection (chainable)
```

## Core Internal Methods

### Initialization Methods

```pseudocode
FUNCTION init():
    IF already initialized: return (skip duplicate init)
    
    SET alreadyinitialized flag = true
    INCREMENT _currentSpinnerId (global counter) 
    SET spinnerid data attribute
    VALIDATE input element (must be <input>)
    CALL _initSettings()
    CALL _setInitval() 
    CALL _checkValue()
    CALL _buildHtml() // Direct Bootstrap HTML construction
    CALL _initElements()
    CALL _updateButtonDisabledState()
    CALL _hideEmptyPrefixPostfix()
    CALL _bindEvents()
    CALL _bindEventsInterface() // Callable events only
    
    // NO internal API exposure - control via callable events only
```

```pseudocode
FUNCTION _initSettings():
    MERGE defaults + data attributes + options via $.extend()
    // Legacy: Basic assignment with hardcoded Bootstrap classes
    // Button classes: 'btn btn-primary' (hardcoded defaults)
    // No complex validation or renderer integration
    // Simple object merging without sanitization
```

### Value Management Methods

```pseudocode
FUNCTION _checkValue():
    // Legacy: Much simpler than later versions (20 lines vs 60+ lines)
    val = callback_before_calculation(input.val())
    
    IF val === '':
        IF replacementval !== '':
            SET input.val(replacementval)
            TRIGGER 'change'
        return
        
    IF decimals > 0 AND val === '.': return
    
    parsedval = parseFloat(val)
    IF isNaN(parsedval):
        parsedval = replacementval OR 0
    
    returnval = _forcestepdivisibility(parsedval)  
    CLAMP returnval to min/max bounds
    
    SET input.val(callback_after_calculation(formatted))
```

### Spin Operation Methods

```pseudocode
FUNCTION upOnce():
    // Legacy: Direct disabled check with jQuery selector
    IF input is ':disabled,[readonly]': return
    
    CALL _checkValue()
    value = parseFloat(callback_before_calculation(elements.input.val()))
    initvalue = value // Store for change detection
    
    IF isNaN(value):
        value = valueIfIsNaN()
    ELSE:
        boostedstep = _getBoostedStep() // Inline calculation, no _nextValue helper
        value = value + boostedstep
    
    // Legacy: Uses >= instead of === for boundary check
    IF max !== null AND value >= max:
        value = max
        TRIGGER 'touchspin.on.max'
        CALL stopSpin()
    
    // Legacy: Direct DOM manipulation, no _setDisplay helper
    SET elements.input.val(callback_after_calculation(formatted))
    IF initvalue !== value:
        TRIGGER 'change'
```

```pseudocode
FUNCTION downOnce():
    IF input is ':disabled,[readonly]': return
    
    CALL _checkValue()
    value = parseFloat(callback_before_calculation(elements.input.val()))
    initvalue = value
    
    IF isNaN(value):
        value = valueIfIsNaN()
    ELSE:
        boostedstep = _getBoostedStep()
        value = value - boostedstep // Inline calculation
    
    IF min !== null AND value <= min:
        value = min
        TRIGGER 'touchspin.on.min'
        CALL stopSpin()
    
    SET elements.input.val(callback_after_calculation(formatted))
    IF initvalue !== value:
        TRIGGER 'change'
```

```pseudocode
FUNCTION _startSpin(direction):
    IF disabled OR readonly: return
    
    CLEAR previous spin timers
    SET spincount = 0
    SET spinning = direction
    
    TRIGGER 'touchspin.on.startspin'
    IF direction === 'up':
        TRIGGER 'touchspin.on.startupspin'  
        SET upDelayTimeout = setTimeout(() => {
            SET upSpinTimer = setInterval(() => {
                INCREMENT spincount
                CALL upOnce()
            }, stepinterval)
        }, stepintervaldelay)
    ELSE:
        TRIGGER 'touchspin.on.startdownspin'
        SET downDelayTimeout = setTimeout(() => {
            SET downSpinTimer = setInterval(() => {
                INCREMENT spincount  
                CALL downOnce()
            }, stepinterval)
        }, stepintervaldelay)
```

```pseudocode
FUNCTION stopSpin():
    CALL _clearSpinTimers()
    
    SWITCH spinning:
        CASE 'up':
            TRIGGER 'touchspin.on.stopupspin'
            TRIGGER 'touchspin.on.stopspin'
        CASE 'down':
            TRIGGER 'touchspin.on.stopdownspin' 
            TRIGGER 'touchspin.on.stopspin'
    
    SET spincount = 0
    SET spinning = false
```

### DOM Construction Methods

```pseudocode
FUNCTION _buildHtml():
    // Legacy: Direct HTML template string construction
    initval = input.val()
    parentelement = input.parent()
    
    IF initval !== '':
        initval = callback_before_calculation(initval)
        initval = callback_after_calculation(formatted)
    
    SET input data 'initvalue' = initval
    SET input value = initval  
    ADD 'form-control' class to input
    
    // Legacy: Hardcoded HTML template strings
    verticalbuttons_html = `<span class="input-group-addon bootstrap-touchspin-vertical-button-wrapper">
        <span class="input-group-btn-vertical">
            <button class="${settings.buttondown_class} bootstrap-touchspin-up">${settings.verticalup}</button>
            <button class="${settings.buttonup_class} bootstrap-touchspin-down">${settings.verticaldown}</button>
        </span>
    </span>`
    
    IF parent has 'input-group' class:
        CALL _advanceInputGroup(parent) // Inject buttons/prefix/postfix into existing group
    ELSE:
        CALL _buildInputGroup() // Create new input-group wrapper
```

```pseudocode
FUNCTION _advanceInputGroup(parentelement):
    // Legacy: Complex template-based DOM manipulation
    ADD 'bootstrap-touchspin' class to parent
    
    prefixhtml = `<span class="input-group-addon bootstrap-touchspin-prefix">
        <span class="input-group-text">${settings.prefix}</span>
    </span>`
    
    downhtml = `<span class="input-group-btn">
        <button class="${settings.buttondown_class} bootstrap-touchspin-down">${settings.buttondown_txt}</button>
    </span>`
    
    uphtml = `<span class="input-group-btn">  
        <button class="${settings.buttonup_class} bootstrap-touchspin-up">${settings.buttonup_txt}</button>
    </span>`
    
    // Insert HTML strings using jQuery DOM manipulation
    INSERT prefixhtml before input
    INSERT downhtml before input  
    INSERT uphtml after input
    INSERT postfixhtml after input
```

```pseudocode
FUNCTION _buildInputGroup():
    // Legacy: Create complete input-group wrapper with hardcoded Bootstrap classes
    html = `<div class="input-group bootstrap-touchspin bootstrap-touchspin-injected">
        <span class="input-group-addon bootstrap-touchspin-prefix">
            <span class="input-group-text">${settings.prefix}</span>
        </span>
        // ... buttons and postfix with hardcoded class names
    </div>`
    
    WRAP input with generated HTML
    container = new wrapper element
```

### Event Handling Methods

```pseudocode
FUNCTION _bindEvents():
    // Legacy: Simple jQuery event binding on buttons and input
    
    // Button click events
    BIND up button 'mousedown touchstart': upOnce() + startUpSpin()
    BIND down button 'mousedown touchstart': downOnce() + startDownSpin()
    BIND buttons 'mouseup mouseout touchend': stopSpin()
    
    // Input events
    BIND input 'keydown': handle arrow up/down keys
    BIND input 'keyup': stop spin on arrow key release  
    BIND input 'mousewheel DOMMouseScroll': handle wheel events
    
    // Focus/blur events
    BIND input 'focus': select all text
    BIND input 'blur': validate and sanitize value
```

```pseudocode  
FUNCTION _bindEventsInterface():
    // Legacy: ONLY callable events for external control (no command API)
    BIND input 'touchspin.destroy': destroy()
    BIND input 'touchspin.uponce': upOnce()
    BIND input 'touchspin.downonce': downOnce()  
    BIND input 'touchspin.startupspin': startUpSpin()
    BIND input 'touchspin.startdownspin': startDownSpin()
    BIND input 'touchspin.stopspin': stopSpin()
    BIND input 'touchspin.updatesettings': _updateSettings()
    
    // Usage: $('#input').trigger('touchspin.uponce')
    // NO command API like $('#input').TouchSpin('uponce')
```

### Helper Methods

```pseudocode
FUNCTION _nextValue(direction, current):
    v = current
    IF isNaN(v): v = valueIfIsNaN()
    ELSE: v = v +/- _getBoostedStep()
    
    CLAMP v to max boundary
    CLAMP v to min boundary  
    RETURN v
```

```pseudocode
FUNCTION _getBoostedStep():
    IF not booster: return step
    
    boosted = pow(2, floor(spincount / boostat)) * step
    IF maxboostedstep AND boosted > maxboostedstep:
        boosted = maxboostedstep
        ALIGN value to boosted step grid
    
    RETURN max(step, boosted)
```

```pseudocode
FUNCTION _forcestepdivisibility(value):
    SWITCH forcestepdivisibility:
        CASE 'round': return round(value/step) * step
        CASE 'floor': return floor(value/step) * step  
        CASE 'ceil': return ceil(value/step) * step
        DEFAULT: return value
    FORMAT to decimals precision
```

```pseudocode
FUNCTION _setDisplay(num):
    next = _formatDisplay(num)
    SET input.value = next
    CALL _updateAriaAttributes()
    RETURN next
```

### Cleanup Methods

```pseudocode
FUNCTION destroy():
    // Legacy: Simple cleanup without complex DOM detection
    parent = input.parent()
    CALL stopSpin()
    
    // Remove all jQuery event handlers
    OFF input '.touchspin' events
    
    // Simple DOM cleanup
    IF parent has 'bootstrap-touchspin-injected' class:
        REMOVE all siblings with injected classes
        UNWRAP input from parent container
    ELSE:
        REMOVE all '.bootstrap-touchspin-injected' elements from parent
        REMOVE 'bootstrap-touchspin' class from parent
    
    // Cleanup flags
    SET alreadyinitialized = false
    // NO internal API cleanup (didn't exist)
    // NO WeakMap cleanup (didn't exist)
    // NO mutation observer cleanup (didn't exist)
```

## Key Architectural Characteristics

1. **Monolithic Structure**: All functionality in single file (873 lines)
2. **jQuery Plugin Pattern**: Simple `$.fn.TouchSpin` initialization only (no command API)
3. **Hardcoded Bootstrap**: Direct HTML template strings with Bootstrap 3/4 classes
4. **Callable Events Only**: Control via `$('#input').trigger('touchspin.uponce')` 
5. **Closure-Based State**: Instance variables stored in function closure
6. **Global ID Counter**: `_currentSpinnerId` for unique identification
7. **Simple DOM Management**: Basic jQuery DOM manipulation without complex detection
8. **No Framework Abstraction**: Bootstrap classes and structure hardcoded throughout
9. **Basic Event Handling**: Simple jQuery event binding without namespacing
10. **Limited Validation**: Basic settings merging without sanitization