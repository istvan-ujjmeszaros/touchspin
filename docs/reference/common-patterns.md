# Common Implementation Patterns

This document provides proven implementation patterns and examples for common TouchSpin use cases.

## Basic Patterns

### Simple Numeric Input

```javascript
// Basic numeric spinner with sensible defaults
const basicSpinner = TouchSpin('#basic', {
    min: 0,
    max: 100,
    step: 1,
    initval: 10
});

// Listen for changes
basicSpinner.on('change', (data) => {
    console.log(`Value changed to: ${data.newValue}`);
});
```

**Use cases:** Age inputs, quantity selectors, simple counters

### Decimal Precision Input

```javascript
// Decimal input with precise control
const decimalSpinner = TouchSpin('#decimal', {
    min: 0.00,
    max: 999.99,
    step: 0.01,
    decimals: 2,
    forcestepdivisibility: 'round'
});

// Validation for decimal precision
decimalSpinner.on('change', (data) => {
    const formatted = data.newValue.toFixed(2);
    updateDisplay(formatted);
});
```

**Use cases:** Prices, measurements, scientific values

### Large Range Navigation

```javascript
// Efficient navigation of large value ranges
const largeRangeSpinner = TouchSpin('#large-range', {
    min: 1,
    max: 1000000,
    step: 1,
    booster: true,
    boostat: 5,
    maxboostedstep: 1000,
    stepinterval: 50,
    stepintervaldelay: 300
});

// Show current boost level
largeRangeSpinner.on('boostchange', (data) => {
    document.getElementById('boost-indicator').textContent = 
        `Step: ${data.step} (Level ${data.level})`;
});
```

**Use cases:** Year selectors, large quantities, IDs

## UI Enhancement Patterns

### Currency Input

```javascript
const currencySpinner = TouchSpin('#currency', {
    min: 0,
    max: 999999.99,
    step: 0.01,
    decimals: 2,
    prefix: '$',
    postfix: ' USD',
    forcestepdivisibility: 'round',
    booster: true,
    boostat: 10,
    maxboostedstep: 1.00 // Conservative boost for currency
});

// Format for display
currencySpinner.on('change', (data) => {
    const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(data.newValue);
    
    updateRelatedField('total-display', formatted);
});
```

**Features:**
- Decimal precision for cents
- Visual currency symbols
- Conservative acceleration
- Internationalization ready

### Percentage Input with Visual Feedback

```javascript
const percentageSpinner = TouchSpin('#percentage', {
    min: 0,
    max: 100,
    step: 0.1,
    decimals: 1,
    postfix: '%',
    forcestepdivisibility: 'round',
    booster: false // Precise control for percentages
});

// Visual progress bar
percentageSpinner.on('change', (data) => {
    document.getElementById('progress-bar').style.width = `${data.newValue}%`;
    document.getElementById('progress-text').textContent = `${data.newValue}%`;
});

// Color coding based on value
percentageSpinner.on('change', (data) => {
    const progressBar = document.getElementById('progress-bar');
    progressBar.className = `progress-bar ${
        data.newValue < 25 ? 'bg-danger' :
        data.newValue < 75 ? 'bg-warning' : 'bg-success'
    }`;
});
```

**Features:**
- Visual progress representation
- Color-coded feedback
- Precise decimal control
- No acceleration for accuracy

### Time Duration Input

```javascript
// Hours input
const hoursSpinner = TouchSpin('#hours', {
    min: 0,
    max: 23,
    step: 1,
    initval: 0,
    postfix: 'h'
});

// Minutes input
const minutesSpinner = TouchSpin('#minutes', {
    min: 0,
    max: 59,
    step: 1,
    initval: 0,
    postfix: 'm'
});

// Coordinated time display
function updateTimeDisplay() {
    const hours = hoursSpinner.getValue();
    const minutes = minutesSpinner.getValue();
    const totalMinutes = hours * 60 + minutes;
    
    document.getElementById('total-time').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} (${totalMinutes} minutes)`;
}

hoursSpinner.on('change', updateTimeDisplay);
minutesSpinner.on('change', updateTimeDisplay);
```

**Features:**
- Coordinated inputs
- Time format validation
- Total calculation
- Leading zero formatting

### Quantity with Stock Validation

```javascript
const quantitySpinner = TouchSpin('#quantity', {
    min: 1,
    max: 100, // Will be updated based on stock
    step: 1,
    initval: 1,
    verticalbuttons: true
});

// Stock management
function updateStock(availableStock) {
    quantitySpinner.updateSettings({
        max: availableStock
    });
    
    // Reset quantity if it exceeds new stock
    if (quantitySpinner.getValue() > availableStock) {
        quantitySpinner.setValue(Math.min(1, availableStock));
    }
}

// Stock warnings
quantitySpinner.on('max', () => {
    showWarning('Maximum available quantity selected');
});

quantitySpinner.on('change', (data) => {
    const stock = quantitySpinner.settings.max;
    if (data.newValue > stock * 0.8) {
        showInfo('Low stock warning');
    }
});
```

**Features:**
- Dynamic stock limits
- Automatic quantity adjustment
- Stock level warnings
- Inventory integration

## Form Integration Patterns

### Form Validation Integration

```javascript
const validatedSpinner = TouchSpin('#validated-field', {
    min: 10,
    max: 100,
    step: 5
});

// Custom validation beyond min/max
validatedSpinner.on('change', (data) => {
    const value = data.newValue;
    const isValid = customValidation(value);
    
    // Visual feedback
    const field = document.getElementById('validated-field');
    field.classList.toggle('is-valid', isValid);
    field.classList.toggle('is-invalid', !isValid);
    
    // Error messages
    const feedback = document.getElementById('validation-feedback');
    feedback.textContent = isValid ? '' : getValidationError(value);
    feedback.className = isValid ? 'valid-feedback' : 'invalid-feedback';
});

function customValidation(value) {
    // Business logic validation
    return value % 10 === 0; // Must be multiple of 10
}

// Form submission validation
document.getElementById('form').addEventListener('submit', (e) => {
    const value = validatedSpinner.getValue();
    if (!customValidation(value)) {
        e.preventDefault();
        showError('Please correct the highlighted fields');
    }
});
```

**Features:**
- Visual validation feedback
- Custom business rules
- Form submission prevention
- User-friendly error messages

### Multi-Field Coordination

```javascript
// Width and height inputs that maintain aspect ratio
const widthSpinner = TouchSpin('#width', {
    min: 1,
    max: 1920,
    step: 1,
    initval: 800
});

const heightSpinner = TouchSpin('#height', {
    min: 1,
    max: 1080,
    step: 1,
    initval: 600
});

let aspectRatio = 800 / 600;
let maintainAspectRatio = true;

// Aspect ratio maintenance
widthSpinner.on('change', (data) => {
    if (maintainAspectRatio) {
        const newHeight = Math.round(data.newValue / aspectRatio);
        heightSpinner.setValue(newHeight);
    }
    updateAspectRatio();
});

heightSpinner.on('change', (data) => {
    if (maintainAspectRatio) {
        const newWidth = Math.round(data.newValue * aspectRatio);
        widthSpinner.setValue(newWidth);
    }
    updateAspectRatio();
});

function updateAspectRatio() {
    aspectRatio = widthSpinner.getValue() / heightSpinner.getValue();
}

// Toggle aspect ratio lock
document.getElementById('lock-aspect').addEventListener('change', (e) => {
    maintainAspectRatio = e.target.checked;
    if (maintainAspectRatio) {
        updateAspectRatio(); // Store current ratio
    }
});
```

**Features:**
- Coordinated value updates
- Aspect ratio maintenance
- Optional constraints
- Real-time recalculation

### Dynamic Configuration

```javascript
const dynamicSpinner = TouchSpin('#dynamic', {
    min: 0,
    max: 10,
    step: 1
});

// Configuration based on other form fields
document.getElementById('difficulty').addEventListener('change', (e) => {
    const difficulty = e.target.value;
    
    const configs = {
        'easy': { min: 1, max: 5, step: 1 },
        'medium': { min: 5, max: 20, step: 1 },
        'hard': { min: 10, max: 100, step: 5 }
    };
    
    dynamicSpinner.updateSettings(configs[difficulty]);
});

// Units conversion
document.getElementById('unit').addEventListener('change', (e) => {
    const unit = e.target.value;
    const currentValue = dynamicSpinner.getValue();
    
    if (unit === 'kg') {
        dynamicSpinner.updateSettings({
            step: 0.1,
            decimals: 1,
            postfix: ' kg'
        });
    } else if (unit === 'lbs') {
        // Convert kg to lbs
        const lbsValue = currentValue * 2.20462;
        dynamicSpinner.updateSettings({
            step: 0.1,
            decimals: 1,
            postfix: ' lbs'
        });
        dynamicSpinner.setValue(lbsValue);
    }
});
```

**Features:**
- Context-sensitive configuration
- Unit conversion
- Progressive difficulty
- Real-time updates

## Advanced Interaction Patterns

### Keyboard Shortcuts Integration

```javascript
const keyboardSpinner = TouchSpin('#keyboard', {
    min: 0,
    max: 100,
    step: 1
});

// Enhanced keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.target.id === 'keyboard') {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (e.shiftKey) {
                    // Large step
                    keyboardSpinner.setValue(
                        keyboardSpinner.getValue() + 10
                    );
                } else {
                    keyboardSpinner.upOnce();
                }
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                if (e.shiftKey) {
                    // Large step
                    keyboardSpinner.setValue(
                        keyboardSpinner.getValue() - 10
                    );
                } else {
                    keyboardSpinner.downOnce();
                }
                break;
                
            case 'Home':
                e.preventDefault();
                keyboardSpinner.setValue(keyboardSpinner.settings.min);
                break;
                
            case 'End':
                e.preventDefault();
                keyboardSpinner.setValue(keyboardSpinner.settings.max);
                break;
        }
    }
});
```

**Features:**
- Enhanced arrow key behavior
- Modifier key support (Shift for large steps)
- Home/End key navigation
- Accessible keyboard interface

### Touch Gesture Support

```javascript
const touchSpinner = TouchSpin('#touch', {
    min: 0,
    max: 100,
    step: 1,
    stepintervaldelay: 800 // Longer delay for touch
});

let touchStartY = 0;
let touchThreshold = 20;

// Touch gesture integration
document.getElementById('touch').addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

document.getElementById('touch').addEventListener('touchend', (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY - touchEndY;
    
    if (Math.abs(deltaY) > touchThreshold) {
        if (deltaY > 0) {
            touchSpinner.upOnce(); // Swipe up = increase
        } else {
            touchSpinner.downOnce(); // Swipe down = decrease
        }
    }
});
```

**Features:**
- Swipe gestures
- Touch-friendly timing
- Gesture threshold
- Mobile optimization

### Real-time Collaboration

```javascript
const collaborativeSpinner = TouchSpin('#collaborative', {
    min: 0,
    max: 100,
    step: 1
});

// WebSocket integration for real-time updates
const ws = new WebSocket('ws://localhost:8080');

collaborativeSpinner.on('change', (data) => {
    // Send updates to other users
    ws.send(JSON.stringify({
        type: 'spinner_update',
        field: 'collaborative',
        value: data.newValue,
        user: getCurrentUser()
    }));
});

// Receive updates from other users
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'spinner_update' && data.field === 'collaborative') {
        // Update without triggering our own change event
        collaborativeSpinner.setValue(data.value);
        showUserAction(data.user, data.value);
    }
};
```

**Features:**
- Real-time synchronization
- User action attribution
- Conflict prevention
- Multi-user awareness

## Performance Optimization Patterns

### Lazy Loading Pattern

```javascript
// Only initialize spinners when needed
class LazySpinner {
    constructor(selector, options) {
        this.selector = selector;
        this.options = options;
        this.instance = null;
        this.initialized = false;
    }
    
    init() {
        if (!this.initialized) {
            this.instance = TouchSpin(this.selector, this.options);
            this.initialized = true;
        }
        return this.instance;
    }
    
    getValue() {
        return this.initialized ? this.instance.getValue() : 0;
    }
    
    // Proxy other methods as needed
}

// Usage
const lazySpinners = {
    advanced: new LazySpinner('#advanced', { /* complex options */ }),
    premium: new LazySpinner('#premium', { /* premium features */ })
};

// Initialize only when tab becomes active
document.getElementById('advanced-tab').addEventListener('shown.bs.tab', () => {
    lazySpinners.advanced.init();
});
```

**Benefits:**
- Faster initial page load
- Reduced memory usage
- On-demand initialization
- Better user experience

### Debounced Updates Pattern

```javascript
const debouncedSpinner = TouchSpin('#debounced', {
    min: 0,
    max: 1000,
    step: 1
});

// Debounce expensive operations
let updateTimer;
debouncedSpinner.on('change', (data) => {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(() => {
        performExpensiveUpdate(data.newValue);
    }, 300);
});

function performExpensiveUpdate(value) {
    // Heavy operations like API calls, complex calculations
    console.log(`Performing update for value: ${value}`);
}
```

**Benefits:**
- Reduced API calls
- Better performance
- Smoother user experience
- Network efficiency

### Memory Management Pattern

```javascript
class SpinnerManager {
    constructor() {
        this.spinners = new Map();
    }
    
    create(id, options) {
        if (this.spinners.has(id)) {
            this.destroy(id); // Clean up existing
        }
        
        const spinner = TouchSpin(`#${id}`, options);
        this.spinners.set(id, spinner);
        return spinner;
    }
    
    destroy(id) {
        const spinner = this.spinners.get(id);
        if (spinner) {
            spinner.destroy();
            this.spinners.delete(id);
        }
    }
    
    destroyAll() {
        this.spinners.forEach(spinner => spinner.destroy());
        this.spinners.clear();
    }
    
    get(id) {
        return this.spinners.get(id);
    }
}

// Global spinner management
const spinnerManager = new SpinnerManager();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    spinnerManager.destroyAll();
});
```

**Benefits:**
- Centralized management
- Automatic cleanup
- Memory leak prevention
- Instance tracking

## Testing Patterns

### Unit Testing Pattern

```javascript
describe('Currency Spinner', () => {
    let spinner;
    
    beforeEach(() => {
        document.body.innerHTML = '<input id="test-spinner" />';
        spinner = TouchSpin('#test-spinner', {
            min: 0,
            max: 999.99,
            step: 0.01,
            decimals: 2,
            prefix: '$'
        });
    });
    
    afterEach(() => {
        spinner.destroy();
    });
    
    test('should format currency correctly', () => {
        spinner.setValue(123.456);
        expect(spinner.getValue()).toBe(123.46); // Rounded to 2 decimals
    });
    
    test('should respect currency constraints', () => {
        spinner.setValue(-10);
        expect(spinner.getValue()).toBe(0); // Clamped to min
    });
    
    test('should emit correct events', () => {
        const changeSpy = jest.fn();
        spinner.on('change', changeSpy);
        
        spinner.setValue(100);
        expect(changeSpy).toHaveBeenCalledWith({
            oldValue: 0,
            newValue: 100
        });
    });
});
```

### Integration Testing Pattern

```javascript
describe('Form Integration', () => {
    test('should integrate with form validation', async () => {
        // Setup form with spinner
        document.body.innerHTML = `
            <form id="test-form">
                <input id="quantity" />
                <button type="submit">Submit</button>
            </form>
        `;
        
        const spinner = TouchSpin('#quantity', {
            min: 1,
            max: 10
        });
        
        // Test form submission prevention
        const form = document.getElementById('test-form');
        const submitSpy = jest.fn();
        form.addEventListener('submit', submitSpy);
        
        spinner.setValue(0); // Invalid value
        
        // Trigger form submission
        form.dispatchEvent(new Event('submit'));
        
        // Should prevent submission
        expect(submitSpy).not.toHaveBeenCalled();
    });
});
```

## Error Handling Patterns

### Graceful Degradation

```javascript
function createRobustSpinner(selector, options) {
    try {
        return TouchSpin(selector, options);
    } catch (error) {
        console.warn('TouchSpin initialization failed:', error);
        
        // Fallback to basic input
        const input = document.querySelector(selector);
        if (input) {
            input.type = 'number';
            input.min = options.min || '';
            input.max = options.max || '';
            input.step = options.step || '';
            
            return {
                getValue: () => parseFloat(input.value) || 0,
                setValue: (value) => { input.value = value; },
                destroy: () => {}
            };
        }
        
        return null;
    }
}
```

### Error Recovery

```javascript
const recoveringSpinner = TouchSpin('#recovering', {
    min: 0,
    max: 100,
    step: 1
});

// Monitor for errors and recover
recoveringSpinner.on('error', (error) => {
    console.error('TouchSpin error:', error);
    
    // Attempt recovery
    setTimeout(() => {
        try {
            recoveringSpinner.setValue(recoveringSpinner.settings.min);
            showNotification('Input reset due to error');
        } catch (recoveryError) {
            console.error('Recovery failed:', recoveryError);
            showError('Please refresh the page');
        }
    }, 1000);
});
```

These patterns provide a foundation for implementing TouchSpin in various scenarios while maintaining good performance, user experience, and code quality.