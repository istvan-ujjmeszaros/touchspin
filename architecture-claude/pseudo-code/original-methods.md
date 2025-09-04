# Original TouchSpin Implementation - Pseudo Code Analysis

## File: `src/jquery.bootstrap-touchspin.js`

This is the original monolithic jQuery plugin implementation. All functionality is contained within a single file with a jQuery plugin structure.

## Main Plugin Structure

```pseudocode
FUNCTION $.fn.TouchSpin(options, arg):
    // Command API handling
    IF typeof options === 'string':
        cmd = options.toLowerCase()
        FOR each selected element:
            api = element.data('touchspinInternal')
            SWITCH cmd:
                CASE 'destroy': api.destroy()
                CASE 'uponce': api.upOnce()  
                CASE 'downonce': api.downOnce()
                CASE 'startupspin': api.startUpSpin()
                CASE 'startdownspin': api.startDownSpin()
                CASE 'stopspin': api.stopSpin()
                CASE 'updatesettings': api.updateSettings(arg)
                CASE 'getvalue'/'get': return api.getValue()
                CASE 'setvalue'/'set': api.setValue(arg)
    
    // Initialization
    FOR each selected input element:
        initialize TouchSpin instance
```

## Core Internal Methods

### Initialization Methods

```pseudocode
FUNCTION init():
    IF already initialized:
        destroy current instance
    
    SET alreadyinitialized flag
    VALIDATE input element
    CALL _initSettings()
    CALL _initRenderer()  
    CALL _setInitval()
    CALL _checkValue()
    CALL _buildHtml()
    CALL _initElements()
    CALL _initAriaAttributes()
    CALL _updateButtonDisabledState()
    CALL _hideEmptyPrefixPostfix()
    CALL _syncNativeAttributes()
    CALL _setupMutationObservers()
    CALL _bindEvents()
    CALL _bindEventsInterface()
    
    // Expose internal API
    SET element.data('touchspinInternal') = {
        upOnce, downOnce, startUpSpin, startDownSpin,
        stopSpin, updateSettings, destroy, getValue, setValue
    }
```

```pseudocode
FUNCTION _initSettings():
    MERGE defaults + data attributes + options
    NORMALIZE step (guard against invalid values)
    NORMALIZE min/max to numbers or null
    NORMALIZE decimals to non-negative integer  
    NORMALIZE timing options
    ALIGN min/max to step boundaries IF step != 1
```

```pseudocode
FUNCTION _initRenderer():
    IF custom renderer provided:
        USE settings.renderer
    ELSE:
        GET global RendererFactory
        CREATE temp renderer for framework defaults
        MERGE renderer defaults with settings
        CREATE final renderer instance
```

### Value Management Methods

```pseudocode
FUNCTION getValue():
    raw = input.value OR ''
    IF raw === '': return NaN
    num = parseFloat(callback_before_calculation(raw))
    RETURN isFinite(num) ? num : NaN
```

```pseudocode
FUNCTION setValue(value):
    IF disabled OR readonly: return
    CALL stopSpin()
    parsed = Number(value)
    IF not finite: return
    
    adjusted = _forcestepdivisibility(parsed)
    CLAMP adjusted to min/max bounds
    prev = current input value
    next = _setDisplay(adjusted)
    IF prev !== next: trigger 'change' event
```

```pseudocode
FUNCTION _checkValue(mayTriggerChange):
    prevDisplay = input.value
    val = callback_before_calculation(input.value)
    
    IF val === '':
        IF replacementval !== '':
            SET input.value = replacementval
        UPDATE aria attributes
        IF mayTriggerChange AND display changed:
            TRIGGER change event
        return
    
    IF decimals > 0 AND val === '.': return
    
    parsedval = parseFloat(val)
    IF isNaN(parsedval):
        parsedval = parseFloat(replacementval) OR 0
    
    returnval = _forcestepdivisibility(parsedval)
    CLAMP returnval to min/max bounds
    
    newValue = _setDisplay(parseFloat(returnval))
    IF mayTriggerChange AND display changed:
        TRIGGER change event
```

### Spin Operation Methods

```pseudocode
FUNCTION upOnce():
    IF disabled OR readonly: return
    
    CALL _checkValue()
    prevDisplay = input.value
    value = parseFloat(callback_before_calculation(input.value))
    value = _nextValue('up', value)
    
    IF max !== null AND value === max:
        TRIGGER 'touchspin.on.max'
        CALL stopSpin()
    
    nextDisplay = _setDisplay(value)
    IF prevDisplay !== nextDisplay:
        TRIGGER 'change'
```

```pseudocode
FUNCTION downOnce():
    IF disabled OR readonly: return
    
    CALL _checkValue()
    prevDisplay = input.value  
    value = parseFloat(callback_before_calculation(input.value))
    value = _nextValue('down', value)
    
    IF min !== null AND value === min:
        TRIGGER 'touchspin.on.min'
        CALL stopSpin()
    
    nextDisplay = _setDisplay(value)
    IF prevDisplay !== nextDisplay:
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
    initval = input.value
    parentelement = input parent
    
    IF initval !== '':
        raw = callback_before_calculation(initval)
        num = parseFloat(raw)
        IF finite: initval = callback_after_calculation(formatted)
        ELSE: initval = callback_after_calculation(raw)
    
    SET input data 'initvalue' = initval
    SET input value = initval
    ADD 'form-control' class to input
    
    IF parent has 'input-group' class:
        container = renderer.buildAdvancedInputGroup(parent)
    ELSE:
        container = renderer.buildInputGroup()
```

```pseudocode
FUNCTION _initElements():
    elements = renderer.initElements(container)
    CACHE element handles (containerEl, _upEl, _downEl)
```

### Event Handling Methods

```pseudocode
FUNCTION _bindEvents():
    CACHE DOM element references
    
    // Input keyboard events
    BIND input 'keydown': handle arrow up/down, enter
    BIND input 'keyup': stop spin on arrow up/down release
    BIND input 'blur': sanitize value
    
    // Container focusout handling  
    BIND container 'focusout': stop spin and sanitize when leaving widget
    
    // Button events (jQuery bindings)
    BIND up/down buttons:
        - keydown/keyup: space/enter handling
        - mousedown/touchstart: start spin
        - mouseup/mouseout/touchend: stop spin
        - mousemove/touchmove: prevent default during spin
    
    // Mouse wheel on input
    BIND input 'wheel': increment/decrement on wheel
```

```pseudocode
FUNCTION _bindEventsInterface():
    BIND input 'touchspin.destroy': _destroy()
    BIND input 'touchspin.uponce': stopSpin() + upOnce()  
    BIND input 'touchspin.downonce': stopSpin() + downOnce()
    BIND input 'touchspin.startupspin': startUpSpin()
    BIND input 'touchspin.startdownspin': startDownSpin()
    BIND input 'touchspin.stopspin': stopSpin()
    BIND input 'touchspin.updatesettings': changeSettings()
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
FUNCTION _destroy():
    parent = input.parent()
    CALL stopSpin()
    
    // Remove jQuery event handlers
    OFF input events: keydown, keyup, mousewheel, etc.
    OFF container events
    
    // Remove native listeners  
    CALL _offAllNative()
    
    // Disconnect MutationObserver
    IF mutationObserver: disconnect()
    
    // Teardown DOM based on injection type
    injectedMarker = parent.attr('data-touchspin-injected')
    IF injectedMarker === 'wrapper':
        REMOVE plugin-injected siblings
        UNWRAP input
    ELSE:
        REMOVE injected elements from parent
        REMOVE bootstrap-touchspin class and attributes
    
    // Cleanup data
    SET alreadyinitialized = false
    REMOVE touchspinInternal data
    REMOVE from WeakMap store
```

## Key Architectural Characteristics

1. **Monolithic Structure**: All functionality in single file (~1500 lines)
2. **jQuery Plugin Pattern**: Uses `$.fn.TouchSpin` with closure-based instance storage
3. **Renderer System**: Delegates UI construction to external renderer classes
4. **Event-Driven**: Heavy use of jQuery events for internal communication
5. **Closure-Based State**: Instance variables stored in function closure
6. **WeakMap Support**: Fallback instance storage using WeakMap
7. **Mutation Observer**: Watches for attribute changes on input element
8. **Complex DOM Management**: Handles both injected wrappers and existing containers