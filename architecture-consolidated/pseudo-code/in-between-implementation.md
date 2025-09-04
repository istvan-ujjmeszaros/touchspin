# In-Between TouchSpin Implementation (v4.x, 1,502 lines)

This document provides pseudo-code representation of the In-Between TouchSpin implementation - the enhanced monolithic version that bridges the gap between the simple legacy and the modern modular architecture.

## Overview

The In-Between version represents a significant evolution from TRUE Legacy while maintaining the monolithic structure. Key additions include:

- Command API alongside callable events
- RendererFactory system for multi-Bootstrap support
- Enhanced validation and sanitization
- ARIA accessibility features
- Mutation observer for attribute synchronization
- WeakMap-based instance storage

## Entry Point and Initialization

### Plugin Entry Point

```pseudo
function $.fn.TouchSpin(options, commandArg)
    each input in $(this)
        // Check for existing instance
        internalApi = input.data('touchspinInternal')
        
        if internalApi exists
            // Command API handling
            if typeof options === 'string'
                command = options
                switch command
                    case 'destroy':
                        return destroyInstance(input, internalApi)
                    case 'getValue':
                        return internalApi.getValue()
                    case 'setValue': 
                        return internalApi.setValue(commandArg)
                    case 'updateSettings':
                        return internalApi.updateSettings(commandArg)
                    case 'uponce':
                        return internalApi.upOnce()
                    case 'downonce':
                        return internalApi.downOnce()
                    case 'startUpSpin':
                        return internalApi.startUpSpin()
                    case 'startDownSpin':
                        return internalApi.startDownSpin()
                    case 'stopSpin':
                        return internalApi.stopSpin()
                    default:
                        warn('Unknown TouchSpin command: ' + command)
                        return this
            else
                // Return existing instance for chaining
                return this
        
        // New initialization
        if typeof options !== 'string'
            initializeInstance(input, options)
    
    return this // jQuery chaining
```

### Instance Initialization

```pseudo
function initializeInstance(input, options)
    originalInput = $(input)
    
    // 1. Parse settings from multiple sources
    dataOptions = parseDataAttributes(input)
    nativeOptions = parseNativeAttributes(input) // min, max, step
    settings = Object.assign({}, defaults, dataOptions, nativeOptions, options)
    
    // 2. Basic settings validation
    if settings.step <= 0
        warn('step should be positive, using 1')
        settings.step = 1
    
    if settings.decimals < 0
        settings.decimals = 0
    
    // 3. Select renderer based on settings and Bootstrap version
    renderer = RendererFactory.getRenderer(settings)
    
    // 4. Build DOM structure via renderer
    if settings.verticalbuttons
        elements = renderer.buildAdvancedInputGroup(originalInput, settings)
    else
        elements = renderer.buildInputGroup(originalInput, settings)
    
    // 5. Store element references
    inputElement = elements.input
    wrapper = elements.wrapper  
    upButton = elements.upButton
    downButton = elements.downButton
    prefixElement = elements.prefix
    postfixElement = elements.postfix
    
    // 6. Initialize internal state
    spinning = false
    direction = null
    spinCount = 0
    
    // 7. Set initial value
    initValue = getInitialValue(inputElement, settings)
    if initValue !== null
        inputElement.val(initValue)
    
    // 8. Create internal API
    internalApi = createInternalAPI(inputElement, settings, elements)
    
    // 9. Store instance data
    originalInput.data('touchspinInternal', internalApi)
    instanceWeakMap.set(inputElement[0], internalApi)
    
    // 10. Initialize DOM event handling
    initializeDOMEventHandling(internalApi, elements)
    
    // 11. Initialize ARIA attributes
    initializeAriaAttributes(inputElement, settings)
    
    // 12. Set up mutation observer
    initializeMutationObserver(inputElement, internalApi)
    
    // 13. Initialize value validation
    checkValue(inputElement, settings, false) // Don't trigger change initially
    
    // 14. Sync native attributes
    syncNativeAttributes(inputElement, settings)
    
    // 15. Hide empty prefix/postfix
    updatePrefixPostfixVisibility(prefixElement, postfixElement, settings)
```

## Core Value Management

### Value Getting and Setting

```pseudo
function getValue(inputElement, settings)
    rawValue = inputElement.val()
    
    if rawValue === '' or rawValue === null
        return 0 // Or settings.replacementval
    
    // Apply callback_before_calculation if defined
    if settings.callback_before_calculation
        rawValue = settings.callback_before_calculation(rawValue)
    
    numericValue = parseFloat(rawValue)
    if isNaN(numericValue)
        return 0
    
    return numericValue

function setValue(internalApi, newValue, triggerChange = true)
    inputElement = internalApi.inputElement
    settings = internalApi.settings
    
    // Apply constraints
    constrainedValue = applyConstraints(newValue, settings)
    
    // Apply step divisibility
    alignedValue = applyStepDivisibility(constrainedValue, settings)
    
    // Format for display
    displayValue = formatValueForDisplay(alignedValue, settings)
    
    // Update input
    oldValue = getValue(inputElement, settings)
    inputElement.val(displayValue)
    
    // Update ARIA
    updateAriaAttributes(inputElement, alignedValue, settings)
    
    // Trigger change event if value actually changed
    if triggerChange and oldValue !== alignedValue
        inputElement.trigger('change', [oldValue, alignedValue])
```

### Value Validation and Sanitization

```pseudo  
function checkValue(inputElement, settings, triggerChange)
    rawValue = inputElement.val()
    
    // Handle empty value
    if rawValue === ''
        if settings.replacementval !== ''
            inputElement.val(settings.replacementval)
            updateAriaAttributes(inputElement, parseFloat(settings.replacementval), settings)
        else
            // Clear ARIA for empty value
            inputElement.attr('aria-valuenow', '')
            inputElement.attr('aria-valuetext', '')
        
        if triggerChange
            inputElement.trigger('change')
        return
    
    // Handle decimal point input
    if settings.decimals > 0 and rawValue === '.'
        return // Allow temporary decimal point
    
    // Parse and validate
    numericValue = getValue(inputElement, settings)
    
    // Apply constraints and formatting
    constrainedValue = applyConstraints(numericValue, settings)
    finalValue = applyStepDivisibility(constrainedValue, settings)
    
    // Check if we need to update display
    if rawValue !== finalValue.toString()
        setValue(internalApi, finalValue, triggerChange)
    else if triggerChange
        inputElement.trigger('change')
```

## Step Operations

### Single Step Operations

```pseudo
function upOnce(internalApi)
    inputElement = internalApi.inputElement
    settings = internalApi.settings
    
    currentValue = getValue(inputElement, settings)
    stepSize = getBoostedStep(internalApi)
    nextValue = currentValue + stepSize
    
    // Apply constraints
    constrainedValue = applyConstraints(nextValue, settings)
    
    // Check if we hit max boundary (exact match)
    if settings.max !== null and constrainedValue === settings.max
        inputElement.trigger('touchspin.on.max')
        if internalApi.spinning
            stopSpin(internalApi)
    
    // Update display
    setValue(internalApi, constrainedValue, true)

function downOnce(internalApi)
    inputElement = internalApi.inputElement
    settings = internalApi.settings
    
    currentValue = getValue(inputElement, settings)
    stepSize = getBoostedStep(internalApi)
    nextValue = currentValue - stepSize
    
    // Apply constraints  
    constrainedValue = applyConstraints(nextValue, settings)
    
    // Check if we hit min boundary (exact match)
    if settings.min !== null and constrainedValue === settings.min
        inputElement.trigger('touchspin.on.min')
        if internalApi.spinning
            stopSpin(internalApi)
    
    // Update display
    setValue(internalApi, constrainedValue, true)
```

### Continuous Spinning

```pseudo
function startUpSpin(internalApi)
    if internalApi.spinning
        return
    
    internalApi.spinning = true
    internalApi.direction = 'up'
    internalApi.spinCount = 0
    
    inputElement = internalApi.inputElement
    inputElement.trigger('touchspin.on.startspin')
    inputElement.trigger('touchspin.on.startupspin')
    
    // Initial delay before rapid spinning
    setTimeout(function()
        if internalApi.spinning and internalApi.direction === 'up'
            continuousSpinning(internalApi)
    end, settings.stepintervaldelay)

function continuousSpinning(internalApi)
    if not internalApi.spinning
        return
        
    // Perform one step
    if internalApi.direction === 'up'
        upOnce(internalApi)
    else
        downOnce(internalApi)
    
    // Increment boost counter
    internalApi.spinCount++
    
    // Check if still spinning (step might have stopped us)
    if internalApi.spinning
        setTimeout(function()
            continuousSpinning(internalApi)
        end, settings.stepinterval)

function stopSpin(internalApi)
    if not internalApi.spinning
        return
    
    direction = internalApi.direction
    internalApi.spinning = false
    internalApi.direction = null
    internalApi.spinCount = 0
    
    inputElement = internalApi.inputElement
    
    // Emit direction-specific stop event first
    if direction === 'up'
        inputElement.trigger('touchspin.on.stopupspin')
    else
        inputElement.trigger('touchspin.on.stopdownspin')
    
    // Then general stop event
    inputElement.trigger('touchspin.on.stopspin')
```

### Booster Logic

```pseudo  
function getBoostedStep(internalApi)
    settings = internalApi.settings
    
    if not settings.booster
        return settings.step
    
    if internalApi.spinCount < settings.boostat
        return settings.step
    
    // Calculate boost level
    boostLevel = Math.floor(internalApi.spinCount / settings.boostat)
    boostedStep = settings.step * Math.pow(2, boostLevel)
    
    // Apply cap if specified
    if settings.maxboostedstep > 0 and boostedStep > settings.maxboostedstep
        boostedStep = settings.maxboostedstep
    
    return Math.max(settings.step, boostedStep)
```

## Settings Management

### Settings Updates

```pseudo
function updateSettings(internalApi, newSettings)
    oldSettings = internalApi.settings
    
    // Merge settings
    mergedSettings = Object.assign({}, oldSettings, newSettings)
    
    // Basic validation
    if mergedSettings.step <= 0
        warn('step should be positive')
        mergedSettings.step = oldSettings.step
    
    if mergedSettings.decimals < 0
        mergedSettings.decimals = 0
    
    // Update stored settings
    internalApi.settings = mergedSettings
    
    // Update renderer elements
    updateRendererElements(internalApi, newSettings)
    
    // Realign bounds to step if step changed
    if 'step' in newSettings
        realignBoundsToStep(internalApi)
    
    // Update ARIA attributes
    updateAriaAttributes(internalApi.inputElement, getValue(internalApi.inputElement, mergedSettings), mergedSettings)
    
    // Sync native attributes
    syncNativeAttributes(internalApi.inputElement, mergedSettings)
    
    // Re-validate current value with new settings
    checkValue(internalApi.inputElement, mergedSettings, false)

function updateRendererElements(internalApi, changedSettings)
    elements = internalApi.elements
    settings = internalApi.settings
    
    // Update prefix/postfix
    if 'prefix' in changedSettings
        elements.prefix.html(settings.prefix)
        elements.prefix.toggle(settings.prefix !== '')
    
    if 'postfix' in changedSettings  
        elements.postfix.html(settings.postfix)
        elements.postfix.toggle(settings.postfix !== '')
    
    // Update button classes if changed
    if 'verticalupclass' in changedSettings
        elements.upButton.removeClass().addClass(getButtonClasses('up', settings))
    
    if 'verticaldownclass' in changedSettings
        elements.downButton.removeClass().addClass(getButtonClasses('down', settings))
```

## DOM Event Handling

### Button Event Handling

```pseudo
function initializeButtonEvents(internalApi, elements)
    upButton = elements.upButton
    downButton = elements.downButton
    
    // Up button events
    upButton.on('mousedown touchstart', function(event)
        event.preventDefault()
        startButtonHold(internalApi, 'up')
    end)
    
    upButton.on('mouseup touchend mouseleave touchcancel', function(event)
        event.preventDefault()  
        endButtonHold(internalApi)
    end)
    
    // Down button events
    downButton.on('mousedown touchstart', function(event)
        event.preventDefault()
        startButtonHold(internalApi, 'down')  
    end)
    
    downButton.on('mouseup touchend mouseleave touchcancel', function(event)
        event.preventDefault()
        endButtonHold(internalApi)
    end)

function startButtonHold(internalApi, direction)
    // Perform immediate step
    if direction === 'up'
        upOnce(internalApi)
    else
        downOnce(internalApi)
    
    // Start continuous spinning after delay
    if direction === 'up'
        startUpSpin(internalApi)
    else  
        startDownSpin(internalApi)

function endButtonHold(internalApi)
    stopSpin(internalApi)
```

### Input Event Handling

```pseudo
function initializeInputEvents(internalApi, inputElement)
    // Input validation during typing
    inputElement.on('input', function(event)
        rawValue = inputElement.val()
        
        // Allow temporary states during typing
        if settings.decimals > 0 and rawValue === '.'
            return // Allow decimal point
        
        // Basic validation to prevent obviously invalid input
        if not isValidInputState(rawValue, internalApi.settings)
            // Could prevent or warn here
        end
    end)
    
    // Validation on blur (leaving field)
    inputElement.on('blur', function(event)
        checkValue(inputElement, internalApi.settings, true)
    end)
    
    // Container focus out (leaving entire spinner)
    internalApi.elements.wrapper.on('focusout', function(event)
        if not wrapper.contains(event.relatedTarget)
            stopSpin(internalApi)
            checkValue(inputElement, internalApi.settings, true)
        end
    end)
    
    // Keyboard handling
    inputElement.on('keydown', function(event)
        switch event.which
            case 13: // Enter
                checkValue(inputElement, internalApi.settings, true)
                break
            case 38: // Up arrow
                event.preventDefault()
                upOnce(internalApi)
                break
            case 40: // Down arrow
                event.preventDefault()
                downOnce(internalApi)  
                break
        end
    end)
    
    // Mouse wheel support
    if settings.mousewheel
        inputElement.on('wheel', function(event)
            if inputElement.is(':focus')
                event.preventDefault()
                if event.originalEvent.deltaY < 0
                    upOnce(internalApi)
                else
                    downOnce(internalApi)
            end
        end)
    end
```

## Renderer System

### RendererFactory

```pseudo
RendererFactory = {
    getRenderer: function(settings)
        // Detect Bootstrap version
        if hasBootstrap5()
            return new Bootstrap5Renderer()
        else if hasBootstrap4()  
            return new Bootstrap4Renderer()
        else if hasBootstrap3()
            return new Bootstrap3Renderer()
        else
            // Fallback to Bootstrap 4 structure
            return new Bootstrap4Renderer()
    end
}
```

### Bootstrap Renderer Implementation

```pseudo  
function Bootstrap4Renderer()
    this.buildInputGroup = function(originalInput, settings)
        wrapper = $('<div class="input-group bootstrap-touchspin bootstrap-touchspin-injected">')
        
        if settings.prefix
            prefixAddon = $('<div class="input-group-prepend">')
            prefixSpan = $('<span class="input-group-text">').html(settings.prefix)
            if settings.prefix_extraclass
                prefixSpan.addClass(settings.prefix_extraclass)
            prefixAddon.append(prefixSpan)
            wrapper.append(prefixAddon)
        
        // Move original input into wrapper
        originalInput.addClass('form-control').detach()
        wrapper.append(originalInput)
        
        if settings.postfix
            postfixAddon = $('<div class="input-group-append">')
            postfixSpan = $('<span class="input-group-text">').html(settings.postfix)
            if settings.postfix_extraclass
                postfixSpan.addClass(settings.postfix_extraclass)
            postfixAddon.append(postfixSpan)
            wrapper.append(postfixAddon)
        
        // Add buttons
        buttonGroup = $('<div class="input-group-append">')
        upButton = $('<button type="button" class="btn btn-outline-secondary bootstrap-touchspin-up">')
        upButton.html('<i class="fa fa-plus" aria-hidden="true"></i>')
        downButton = $('<button type="button" class="btn btn-outline-secondary bootstrap-touchspin-down">')  
        downButton.html('<i class="fa fa-minus" aria-hidden="true"></i>')
        
        buttonGroup.append(upButton).append(downButton)
        wrapper.append(buttonGroup)
        
        // Insert into DOM
        originalInput.parent().append(wrapper)
        
        return {
            wrapper: wrapper,
            input: originalInput,
            upButton: upButton,
            downButton: downButton,
            prefix: prefixSpan,
            postfix: postfixSpan
        }
    end
    
    this.buildAdvancedInputGroup = function(originalInput, settings)
        // Vertical button layout
        wrapper = $('<div class="input-group bootstrap-touchspin bootstrap-touchspin-injected">')
        
        // Build vertical button structure
        // ... (more complex vertical layout)
        
        return elements
    end
}
```

## ARIA and Accessibility

### ARIA Attribute Management

```pseudo
function initializeAriaAttributes(inputElement, settings)
    // Set ARIA role
    inputElement.attr('role', 'spinbutton')
    
    // Set value bounds
    if settings.min !== null
        inputElement.attr('aria-valuemin', settings.min)
    
    if settings.max !== null
        inputElement.attr('aria-valuemax', settings.max)
    
    // Set current value
    currentValue = getValue(inputElement, settings)
    updateAriaAttributes(inputElement, currentValue, settings)

function updateAriaAttributes(inputElement, value, settings)  
    inputElement.attr('aria-valuenow', value)
    
    // Create human-readable value text
    valueText = value.toString()
    if settings.prefix
        valueText = settings.prefix + valueText
    if settings.postfix
        valueText = valueText + settings.postfix
    
    inputElement.attr('aria-valuetext', valueText)
```

### Native Attribute Synchronization

```pseudo
function syncNativeAttributes(inputElement, settings)
    // Always sync min/max/step to native attributes
    if settings.min !== null
        inputElement.attr('min', settings.min)
    else
        inputElement.removeAttr('min')
    
    if settings.max !== null
        inputElement.attr('max', settings.max)  
    else
        inputElement.removeAttr('max')
    
    inputElement.attr('step', settings.step)

function initializeMutationObserver(inputElement, internalApi)
    if not window.MutationObserver
        return // Not supported
    
    observer = new MutationObserver(function(mutations)
        mutations.forEach(function(mutation)
            if mutation.type === 'attributes'
                attrName = mutation.attributeName
                
                if attrName in ['disabled', 'readonly']
                    updateButtonStates(internalApi)
                else if attrName in ['min', 'max', 'step'] 
                    syncSettingsFromNativeAttributes(internalApi)
                end
            end
        end)
    end)
    
    observer.observe(inputElement[0], {
        attributes: true,
        attributeFilter: ['disabled', 'readonly', 'min', 'max', 'step']
    })
    
    // Store observer for cleanup
    internalApi.mutationObserver = observer
```

## Cleanup and Destruction

### Instance Destruction

```pseudo
function destroyInstance(inputElement, internalApi)
    // Stop any active spinning
    if internalApi.spinning
        stopSpin(internalApi)
    
    // Disconnect mutation observer
    if internalApi.mutationObserver
        internalApi.mutationObserver.disconnect()
    
    // Remove all event listeners
    elements = internalApi.elements
    elements.upButton.off()
    elements.downButton.off()
    inputElement.off('.touchspin') // Remove namespaced events
    elements.wrapper.off('.touchspin')
    
    // Restore original input
    originalInput = inputElement.clone()
    originalInput.removeClass('bootstrap-touchspin-applied')
    originalInput.removeAttr('aria-valuenow aria-valuetext aria-valuemin aria-valuemax role')
    
    // Remove injected DOM
    if elements.wrapper.hasClass('bootstrap-touchspin-injected')
        elements.wrapper.before(originalInput).remove()
    
    // Clear instance data
    inputElement.removeData('touchspinInternal')
    instanceWeakMap.delete(inputElement[0])
    
    return originalInput
```

## Key Differences from Legacy and Modern

### Compared to TRUE Legacy (v3.x)

**Additions:**
- Command API (`TouchSpin('uponce')` vs just events)
- RendererFactory system vs hardcoded HTML
- Enhanced validation and sanitization  
- ARIA accessibility attributes
- MutationObserver for attribute sync
- WeakMap instance storage
- Support for multiple Bootstrap versions

**Still Similar:**
- Monolithic structure (single large plugin)
- jQuery-dependent throughout
- Closure-based state management

### Compared to Modern (v5.x)

**Still Missing:**
- Framework-agnostic core
- Proper separation of concerns
- Unit testability
- Modern JavaScript patterns (classes, modules)
- Proactive boundary checking
- Comprehensive sanitization pipeline

**Already Present:**
- Multi-framework support (via renderers)
- Enhanced event system
- Accessibility features
- Setting validation

This In-Between version serves as a crucial bridge, providing enhanced capabilities while maintaining the familiar monolithic jQuery plugin structure. It demonstrates the evolution toward the modern architecture while preserving backward compatibility.