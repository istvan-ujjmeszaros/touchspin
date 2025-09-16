# New TouchSpin Implementation - Pseudo Code Analysis

## Modular Architecture Overview

The new implementation splits functionality across multiple packages:
- **`packages/core/`** - Framework-agnostic core logic 
- **`packages/jquery-plugin/`** - Minimal jQuery wrapper
- **`packages/renderers/`** - Framework-specific UI implementations

## Core Package (`packages/core/src/index.js`)

### TouchSpinCore Class Structure

```pseudocode
CLASS TouchSpinCore:
    PROPERTIES:
        - input: HTMLInputElement
        - settings: TouchSpinCoreOptions
        - renderer: renderer instance
        - spinning: boolean
        - spincount: number
        - direction: false|'up'|'down'
        - _events: Map<string, Set<Function>>
        - _teardownCallbacks: Array<Function>
        - _settingObservers: Map<string, Set<Function>>
        - DOM element references (_upButton, _downButton, _wrapper)
        - bound event handler methods
        - timer references (_spinDelayTimeout, _spinIntervalTimer)
        - _mutationObserver: MutationObserver
```

### Core Constructor

```pseudocode
CONSTRUCTOR(inputEl, opts):
    VALIDATE inputEl is INPUT element
    SET this.input = inputEl
    
    dataAttrs = _parseDataAttributes(inputEl)
    MERGE settings = defaults + dataAttrs + opts
    CALL _sanitizeSettings()
    
    // Renderer handling
    IF no renderer specified:
        CHECK for global TouchSpinDefaultRenderer
        WARN if no renderer (keyboard/wheel only mode)
    
    INITIALIZE instance properties (spinning, spincount, etc.)
    INITIALIZE event maps and callback arrays
    INITIALIZE timer references
    
    BIND all event handler methods to 'this'
    
    CALL _initializeInput()
    
    IF renderer exists:
        CREATE renderer instance with (inputEl, settings, this)
        CALL renderer.init()
    
    CALL _setupMutationObserver()
```

### Core Public API Methods

```pseudocode
FUNCTION upOnce():
    IF disabled OR readonly: return
    
    currentValue = getValue()
    nextValue = _nextValue('up', currentValue)
    
    // Check boundary conditions BEFORE incrementing
    IF max !== null AND currentValue === max:
        EMIT 'max' event
        IF spinning up: stopSpin()
        return
    
    // Check if we're reaching max with this step
    IF max !== null AND nextValue === max:
        EMIT 'max' event
        IF spinning up: stopSpin()
    
    CALL _setDisplay(nextValue, true)
```

```pseudocode
FUNCTION downOnce():
    IF disabled OR readonly: return
    
    currentValue = getValue()
    nextValue = _nextValue('down', currentValue)
    
    // Check boundary conditions BEFORE decrementing  
    IF min !== null AND currentValue === min:
        EMIT 'min' event
        IF spinning down: stopSpin()
        return
    
    // Check if we're reaching min with this step
    IF min !== null AND nextValue === min:
        EMIT 'min' event
        IF spinning down: stopSpin()
    
    CALL _setDisplay(nextValue, true)
```

```pseudocode
FUNCTION startUpSpin():
    CALL _startSpin('up')

FUNCTION startDownSpin():
    CALL _startSpin('down')

FUNCTION stopSpin():
    CALL _clearSpinTimers()
    
    IF spinning:
        IF direction === 'up':
            EMIT 'stopupspin' 
            EMIT 'stopspin'
        ELSE IF direction === 'down':
            EMIT 'stopdownspin'
            EMIT 'stopspin'
    
    SET spinning = false
    SET direction = false  
    SET spincount = 0
```

```pseudocode
FUNCTION updateSettings(opts):
    oldSettings = copy of current settings
    newSettings = opts || {}
    
    sanitizedPartial = TouchSpinCore.sanitizePartialSettings(newSettings, oldSettings)
    MERGE settings with sanitizedPartial
    CALL _sanitizeSettings()
    
    // Re-align bounds if step/min/max changed
    IF step/min/max changed AND step !== 1:
        ALIGN max to step boundary (down)
        ALIGN min to step boundary (up)
    
    // Notify setting observers of effective changes
    FOR each changed setting:
        NOTIFY setting observers(newValue, oldValue)
    
    // Core handles its own updates
    CALL _updateAriaAttributes()
    CALL _syncNativeAttributes()  
    CALL _checkValue(false)
```

```pseudocode
FUNCTION getValue():
    raw = input.value
    IF raw === '' AND replacementval !== '':
        raw = replacementval
    IF raw === '': return NaN
    
    beforeCallback = callback_before_calculation || identity
    num = parseFloat(beforeCallback(String(raw)))
    RETURN isNaN(num) ? NaN : num
```

```pseudocode
FUNCTION setValue(value):
    IF disabled OR readonly: return
    parsed = Number(value)
    IF not finite: return
    
    adjusted = _applyConstraints(parsed)
    CALL _setDisplay(adjusted, true)
```

### Core Instance Management

```pseudocode
FUNCTION destroy():
    CALL stopSpin()
    
    // Renderer cleanup
    IF renderer AND renderer.teardown:
        CALL renderer.teardown()
    
    // Core cleanup
    CALL _detachDOMEventListeners()
    
    // Execute registered teardown callbacks
    FOR each teardown callback:
        TRY: callback()
        CATCH: log error
    
    CLEAR teardown callbacks array
    CLEAR setting observers
    
    // Cleanup mutation observer
    IF _mutationObserver:
        DISCONNECT _mutationObserver
        SET _mutationObserver = null
    
    // Clear button references
    SET _upButton = null
    SET _downButton = null
    
    // Remove instance from element
    IF input[INSTANCE_KEY] === this:
        DELETE input[INSTANCE_KEY]
```

### Core Event System

```pseudocode
FUNCTION on(event, handler):
    eventSet = _events.get(event) || new Set()
    ADD handler to eventSet
    SET _events[event] = eventSet
    RETURN unsubscribe function

FUNCTION off(event, handler):
    eventSet = _events.get(event)
    IF no eventSet: return
    IF no handler: DELETE _events[event]
    ELSE: REMOVE handler from eventSet

FUNCTION emit(event, detail):
    eventSet = _events.get(event)
    IF no eventSet: return
    FOR each handler in eventSet:
        TRY: handler(detail)
        CATCH: ignore (silently handle callback errors)
```

### Core Helper Methods

```pseudocode
FUNCTION _startSpin(direction):
    IF disabled OR readonly: return
    
    CALL stopSpin()
    
    // Check boundary conditions - don't start if already at limit
    currentValue = getValue()
    IF direction === 'up' AND max !== null AND currentValue === max: return
    IF direction === 'down' AND min !== null AND currentValue === min: return
    
    // Set spinning state
    SET spinning = true
    SET direction = direction  
    SET spincount = 0
    
    // Emit events (core events, not jQuery events)
    EMIT 'startspin'
    IF direction === 'up': EMIT 'startupspin'
    ELSE: EMIT 'startdownspin'
    
    // Clear previous timers
    CALL _clearSpinTimers()
    
    // Schedule repeat spin
    delay = stepintervaldelay || 500
    interval = stepinterval || 100
    SET _spinDelayTimeout = setTimeout(() => {
        SET _spinIntervalTimer = setInterval(() => {
            IF not spinning OR direction changed: return
            CALL _spinStep(direction)
        }, interval)
    }, delay)
```

```pseudocode
FUNCTION _nextValue(direction, current):
    v = current
    IF isNaN(v): v = _valueIfIsNaN()
    ELSE:
        baseStep = step || 1
        boostat = max(1, parseInt(boostat || 10))
        stepUnclamped = pow(2, floor(spincount / boostat)) * baseStep
        actualStep = stepUnclamped
        
        IF maxboostedstep AND stepUnclamped > maxboostedstep:
            actualStep = maxboostedstep
            // Align to boosted step grid when clamped
            v = round(v / actualStep) * actualStep
        
        actualStep = max(baseStep, actualStep)
        v = direction === 'up' ? v + actualStep : v - actualStep
    
    RETURN _applyConstraints(v)
```

```pseudocode
FUNCTION _applyConstraints(value):
    aligned = _forcestepdivisibility(value)
    clamped = aligned
    IF min !== null AND clamped < min: clamped = min  
    IF max !== null AND clamped > max: clamped = max
    RETURN clamped
```

### Renderer Integration Methods

```pseudocode
FUNCTION initDOMEventHandling():
    CALL _findDOMElements()
    CALL _attachDOMEventListeners()

FUNCTION attachUpEvents(element):
    IF no element: warn and return
    SET _upButton = element
    BIND element 'mousedown': _handleUpMouseDown
    BIND element 'touchstart': _handleUpMouseDown
    
    IF focusablebuttons enabled:
        BIND element 'keydown': _handleUpKeyDown
        BIND element 'keyup': _handleUpKeyUp
    
    CALL _updateButtonDisabledState()

FUNCTION attachDownEvents(element):
    IF no element: warn and return
    SET _downButton = element  
    BIND element 'mousedown': _handleDownMouseDown
    BIND element 'touchstart': _handleDownMouseDown
    
    IF focusablebuttons enabled:
        BIND element 'keydown': _handleDownKeyDown
        BIND element 'keyup': _handleDownKeyUp
    
    CALL _updateButtonDisabledState()
```

### Observer Pattern for Settings

```pseudocode
FUNCTION observeSetting(settingName, callback):
    IF not _settingObservers.has(settingName):
        SET _settingObservers[settingName] = new Set()
    
    observers = _settingObservers.get(settingName)
    ADD callback to observers
    
    RETURN unsubscribe function
```

## jQuery Plugin Wrapper (`packages/jquery-plugin/src/index.js`)

### Minimal Wrapper Structure

```pseudocode
FUNCTION installJqueryTouchSpin($):
    $.fn.TouchSpin = FUNCTION(options, arg):
        // Command API - forward to core
        IF typeof options === 'string':
            cmd = options.toLowerCase()
            ret = undefined
            
            FOR each element:
                inputEl = this element
                api = getTouchSpin(inputEl)  // Get from core
                
                // Special handling for get/getvalue
                IF (cmd === 'getvalue' OR cmd === 'get') AND ret === undefined:
                    IF api: ret = api.getValue()
                    ELSE: ret = inputEl.value  // Fallback to raw value
                    continue
                
                IF no api: continue  // No instance - ignore other commands
                
                SWITCH cmd:
                    CASE 'destroy': api.destroy()  // Core removes itself
                    CASE 'uponce': api.upOnce() 
                    CASE 'downonce': api.downOnce()
                    // ... other commands forward to core
            
            RETURN ret OR this (for chaining)
        
        // Initialization - forward to core
        FOR each element:
            inputEl = this element
            inst = TouchSpin(inputEl, options)  // Core factory
            
            IF no inst: continue  // Core handled non-input validation
            
            // Bridge core events to jQuery events
            eventMap = {
                'min' -> 'touchspin.on.min',
                'max' -> 'touchspin.on.max', 
                // ... other event mappings
            }
            
            unsubs = []
            FOR each core event:
                unsub = inst.on(coreEvent, () => $input.trigger(jqueryEvent))
                ADD unsub to unsubs array
            
            // Register jQuery-specific teardown
            jqueryTeardown = () => {
                FOR each unsub: unsub()  // Clean up core event bridges
                OFF specific jQuery events added by this plugin
            }
            inst.registerTeardown(jqueryTeardown)
            
            // Callable events - forward to core
            BIND $input 'touchspin.uponce': () => api.upOnce()
            BIND $input 'touchspin.downonce': () => api.downOnce()
            // ... other callable events
            
            // jQuery-specific backward compatibility  
            BIND $input 'blur.touchspin': handle jQuery-triggered blur
```

## Key Architectural Differences

### Structure
- **Original**: Monolithic closure with 1500+ lines in single file
- **New**: Modular class-based design across multiple packages

### Instance Management
- **Original**: jQuery `.data()` + WeakMap fallback
- **New**: Direct element property attachment with public API objects

### Event System
- **Original**: jQuery events with `.trigger()` and `.on()`  
- **New**: Native event emitter pattern with Map-based storage

### DOM Event Handling  
- **Original**: Mixed jQuery + native listeners with complex binding
- **New**: Renderer-managed button events + core-managed input events

### Renderer Integration
- **Original**: Tight coupling with renderer system
- **New**: Loose coupling via observer pattern and callback registration

### Lifecycle Management
- **Original**: Complex teardown with DOM injection marker logic
- **New**: Clean separation with registered teardown callbacks

### Error Handling
- **Original**: Minimal error handling, exceptions can break flow
- **New**: Defensive programming with try/catch around callbacks

### Settings Management
- **Original**: Direct object mutation with validation
- **New**: Immutable updates with sanitization and observer notifications

### Boundary Conditions
- **Original**: Reactive boundary checks after value changes
- **New**: Proactive boundary checks before operations