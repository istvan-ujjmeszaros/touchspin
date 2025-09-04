```mermaid
sequenceDiagram
    participant User
    participant jQueryWrapper
    participant TouchSpinCore
    participant Renderer
    participant DOM
    participant Browser

    %% Initialization Flow
    note over User, Browser: TouchSpin Initialization
    User->>jQueryWrapper: $('#input').TouchSpin({options})
    jQueryWrapper->>TouchSpinCore: TouchSpin(inputEl, options)
    TouchSpinCore->>TouchSpinCore: constructor(inputEl, opts)
    TouchSpinCore->>TouchSpinCore: _parseDataAttributes()
    TouchSpinCore->>TouchSpinCore: _sanitizeSettings()
    TouchSpinCore->>Renderer: new Renderer(inputEl, settings, core)
    TouchSpinCore->>TouchSpinCore: _initializeInput()
    TouchSpinCore->>TouchSpinCore: _setupMutationObserver()
    TouchSpinCore->>Renderer: init()
    Renderer->>DOM: Build wrapper, buttons, prefix/postfix
    Renderer->>TouchSpinCore: attachUpEvents(upButton)
    Renderer->>TouchSpinCore: attachDownEvents(downButton)
    TouchSpinCore->>TouchSpinCore: initDOMEventHandling()
    TouchSpinCore->>jQueryWrapper: return publicAPI
    jQueryWrapper->>jQueryWrapper: bridgeEvents(core, $element)
    jQueryWrapper->>User: return jQuery collection

    %% User Interaction Flow - Up Button Click
    note over User, Browser: User Clicks Up Button
    User->>DOM: Click up button
    Browser->>TouchSpinCore: _handleUpMouseDown(event)
    TouchSpinCore->>TouchSpinCore: upOnce()
    TouchSpinCore->>TouchSpinCore: getValue()
    TouchSpinCore->>TouchSpinCore: _nextValue('up', currentValue)
    
    alt At Max Boundary
        TouchSpinCore->>TouchSpinCore: emit('max')
        TouchSpinCore->>jQueryWrapper: core event 'max'
        jQueryWrapper->>User: trigger('touchspin.on.max')
        TouchSpinCore->>TouchSpinCore: stopSpin() (if spinning)
    else Normal Increment
        TouchSpinCore->>TouchSpinCore: _setDisplay(newValue, true)
        TouchSpinCore->>DOM: input.value = newValue
        TouchSpinCore->>TouchSpinCore: _updateAriaAttributes()
        TouchSpinCore->>DOM: setAttribute('aria-valuenow', newValue)
        TouchSpinCore->>Browser: dispatchEvent('change')
        Browser->>User: change event
    end
    
    TouchSpinCore->>TouchSpinCore: startUpSpin()
    TouchSpinCore->>TouchSpinCore: emit('startspin')
    TouchSpinCore->>TouchSpinCore: emit('startupspin')
    jQueryWrapper->>User: trigger('touchspin.on.startspin')
    jQueryWrapper->>User: trigger('touchspin.on.startupspin')

    %% Continuous Spinning Flow
    note over User, Browser: Continuous Spinning (Timer-based)
    loop Every stepinterval ms
        TouchSpinCore->>TouchSpinCore: _spinStep('up')
        TouchSpinCore->>TouchSpinCore: upOnce()
        alt Reaches Boundary
            TouchSpinCore->>TouchSpinCore: emit('max')
            TouchSpinCore->>TouchSpinCore: stopSpin()
            break
        end
    end

    %% Stop Spinning Flow
    note over User, Browser: User Releases Button
    User->>DOM: Mouse up on button
    Browser->>TouchSpinCore: _handleMouseUp(event)
    TouchSpinCore->>TouchSpinCore: stopSpin()
    TouchSpinCore->>TouchSpinCore: emit('stopupspin')
    TouchSpinCore->>TouchSpinCore: emit('stopspin')
    TouchSpinCore->>TouchSpinCore: _clearSpinTimers()
    jQueryWrapper->>User: trigger('touchspin.on.stopupspin')
    jQueryWrapper->>User: trigger('touchspin.on.stopspin')

    %% Settings Update Flow
    note over User, Browser: Dynamic Settings Update
    User->>jQueryWrapper: $('#input').TouchSpin('updatesettings', newSettings)
    jQueryWrapper->>TouchSpinCore: api.updateSettings(newSettings)
    TouchSpinCore->>TouchSpinCore: sanitizePartialSettings(newSettings)
    TouchSpinCore->>TouchSpinCore: _sanitizeSettings()
    
    loop For each changed setting
        TouchSpinCore->>TouchSpinCore: notify setting observers
        TouchSpinCore->>Renderer: observer callback(newValue, oldValue)
        Renderer->>DOM: Update UI based on setting change
    end
    
    TouchSpinCore->>TouchSpinCore: _updateAriaAttributes()
    TouchSpinCore->>TouchSpinCore: _syncNativeAttributes()
    TouchSpinCore->>TouchSpinCore: _checkValue(false)

    %% Input Validation Flow  
    note over User, Browser: User Types Invalid Value
    User->>DOM: Type "abc" in input
    Browser->>TouchSpinCore: _handleInputChange(event)
    TouchSpinCore->>TouchSpinCore: getValue() returns NaN
    TouchSpinCore->>TouchSpinCore: _applyConstraints(NaN)
    TouchSpinCore->>TouchSpinCore: currentValue !== constrainedValue
    TouchSpinCore->>Browser: e.stopImmediatePropagation()
    note right of TouchSpinCore: Prevents invalid change event
    
    User->>DOM: Blur input
    Browser->>TouchSpinCore: _handleInputBlur(event)
    TouchSpinCore->>TouchSpinCore: _checkValue(true)
    TouchSpinCore->>TouchSpinCore: _applyConstraints(getValue())
    TouchSpinCore->>TouchSpinCore: _setDisplay(validValue, true)
    TouchSpinCore->>Browser: dispatchEvent('change')
    Browser->>User: change event with valid value

    %% Cleanup Flow
    note over User, Browser: Component Destruction
    User->>jQueryWrapper: $('#input').TouchSpin('destroy')
    jQueryWrapper->>TouchSpinCore: api.destroy()
    TouchSpinCore->>TouchSpinCore: stopSpin()
    
    loop For each teardown callback
        TouchSpinCore->>jQueryWrapper: execute teardown callback
        jQueryWrapper->>jQueryWrapper: cleanup jQuery events
        jQueryWrapper->>jQueryWrapper: unsubscribe from core events
    end
    
    TouchSpinCore->>Renderer: teardown()
    Renderer->>DOM: Remove injected elements
    Renderer->>TouchSpinCore: cleanup renderer-specific resources
    
    TouchSpinCore->>TouchSpinCore: _detachDOMEventListeners()
    TouchSpinCore->>Browser: removeEventListener()
    TouchSpinCore->>TouchSpinCore: _mutationObserver.disconnect()
    TouchSpinCore->>DOM: delete inputEl[INSTANCE_KEY]
    
    note over TouchSpinCore: All resources cleaned up
    note over jQueryWrapper: jQuery-specific cleanup complete
```

