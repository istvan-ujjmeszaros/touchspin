# Options ↔ Feature Cross-Reference

This document provides a comprehensive mapping between configuration options and the features/behaviors they control.

## Core Value Options

### min/max - Boundary Control
**Purpose:** Define the valid range for values

**Effects:**
- Value clamping during increment/decrement operations  
- Boundary event emission when limits reached
- ARIA `valuemin`/`valuemax` attributes for accessibility
- Native attribute synchronization (type="number" inputs only)
- Prevents spinning operations at boundaries

**Usage Examples:**
```javascript
TouchSpin('#spinner', {
    min: 0,        // Cannot go below 0
    max: 100,      // Cannot exceed 100
});

// Boundary events
api.on('min', () => console.log('At minimum!'));
api.on('max', () => console.log('At maximum!'));
```

**Related Features:**
- Proactive boundary checking prevents operations at limits
- MutationObserver watches for external min/max changes
- Boundary events fire BEFORE display changes

### step - Increment Size
**Purpose:** Define the amount to increment/decrement per operation

**Effects:**
- Base increment size for `upOnce()`/`downOnce()` operations
- Foundation for booster acceleration calculations
- Used by `forcestepdivisibility` for value alignment
- Synchronized to native `step` attribute (type="number" only)

**Usage Examples:**
```javascript
TouchSpin('#currency', {
    step: 0.01,    // Penny increments
    decimals: 2    // Show two decimal places
});

TouchSpin('#quantity', {
    step: 1        // Whole number increments
});
```

**Related Features:**
- Booster multiplies this base step during acceleration
- Step divisibility alignment uses this as reference
- Boundary alignment ensures min/max are step-aligned

### decimals - Display Precision
**Purpose:** Control decimal place display and input validation

**Effects:**
- Display formatting via `.toFixed(decimals)`
- Input validation allows decimal point entry when `decimals > 0`
- ARIA `aria-valuetext` formatting includes decimal precision
- Visual formatting in prefix/postfix display

**Usage Examples:**
```javascript
TouchSpin('#price', {
    decimals: 2,   // Show $10.50, not $10.5
    prefix: '$'
});

TouchSpin('#percentage', {
    decimals: 1,   // Show 50.5%
    postfix: '%'
});
```

**Behavior Details:**
- When `decimals: 0`, input '.' is rejected
- When `decimals > 0`, input '.' is temporarily allowed during typing
- Final value is always rounded to specified decimal places

### forcestepdivisibility - Value Alignment
**Purpose:** Control how values are aligned to step boundaries

**Options:** `'round'` | `'floor'` | `'ceil'` | `'none'`

**Effects:**
- Formatting-only rule - does not affect arithmetic operations
- Applied during value display and input sanitization
- Ensures displayed values align with step grid

**Usage Examples:**
```javascript
TouchSpin('#aligned', {
    step: 5,
    forcestepdivisibility: 'round' // 7 becomes 5, 8 becomes 10
});

TouchSpin('#floor-only', {
    step: 10,
    forcestepdivisibility: 'floor' // 23 becomes 20
});
```

**Behavior Details:**
- `'round'`: Standard mathematical rounding to nearest step
- `'floor'`: Always round down to step boundary
- `'ceil'`: Always round up to step boundary  
- `'none'`: No step alignment applied

## Timing & Acceleration Options

### stepinterval - Spin Speed
**Purpose:** Control milliseconds between steps during continuous spinning

**Default:** `100` (100ms = 10 steps per second)

**Effects:**
- Faster values = more responsive spinning
- Slower values = more controlled spinning
- Combined with booster for acceleration curves

**Usage Examples:**
```javascript
TouchSpin('#fast', {
    stepinterval: 50   // Very fast spinning
});

TouchSpin('#slow', {
    stepinterval: 200  // Slow, controlled spinning
});
```

### stepintervaldelay - Acceleration Delay
**Purpose:** Delay before rapid spinning begins

**Default:** `500` (500ms delay)

**Effects:**
- Prevents accidental rapid spinning from brief holds
- Allows for precise single-step operations
- User experience consideration for touch vs desktop

**Usage Examples:**
```javascript
TouchSpin('#touch-friendly', {
    stepintervaldelay: 800  // Longer delay for touch interfaces
});

TouchSpin('#desktop', {
    stepintervaldelay: 300  // Quick acceleration for mouse users
});
```

### booster / boostat / maxboostedstep - Acceleration System
**Purpose:** Intelligent step size acceleration during continuous spinning

**Options:**
- `booster`: `boolean` - Enable/disable acceleration
- `boostat`: `number` - Steps before acceleration starts
- `maxboostedstep`: `number` - Maximum accelerated step size

**Effects:**
- Step size increases exponentially: `base × 2^(floor(count/boostat))`
- Capped at `maxboostedstep` to prevent runaway acceleration
- Emits `boostchange` events when step size changes
- Provides efficient navigation of large value ranges

**Usage Examples:**
```javascript
TouchSpin('#large-range', {
    min: 0,
    max: 10000,
    step: 1,
    booster: true,
    boostat: 5,           // Accelerate after 5 steps
    maxboostedstep: 100   // Max step size of 100
});

// Monitor acceleration
api.on('boostchange', (data) => {
    console.log(`Step size: ${data.step}, capped: ${data.isCapped}`);
});
```

**Acceleration Curve Example:**
- Steps 1-5: step = 1
- Steps 6-10: step = 2 
- Steps 11-15: step = 4
- Steps 16-20: step = 8
- Steps 21+: step = min(16, maxboostedstep)

## UI Customization Options

### prefix/postfix - Visual Enhancements
**Purpose:** Add text/HTML before or after the input field

**Related Options:**
- `prefix_extraclass`: Additional CSS class for prefix element
- `postfix_extraclass`: Additional CSS class for postfix element

**Effects:**
- Rendered by framework-specific renderers
- Core automatically hides empty prefix/postfix elements
- Supports HTML content for icons, formatting
- Responsive to setting updates via observer pattern

**Usage Examples:**
```javascript
TouchSpin('#currency', {
    prefix: '$',
    postfix: ' USD',
    prefix_extraclass: 'text-success',
    postfix_extraclass: 'text-muted'
});

TouchSpin('#percentage', {
    postfix: '%',
    postfix_extraclass: 'fw-bold text-primary'
});

// Dynamic updates
api.updateSettings({
    prefix: '€',
    postfix: ' EUR'
});
```

### verticalbuttons - Layout Control
**Purpose:** Switch between horizontal and vertical button layouts

**Related Options:**
- `verticalup`: Text/HTML for up button (default: '+')
- `verticaldown`: Text/HTML for down button (default: '-')
- `verticalupclass`: CSS class for up button
- `verticaldownclass`: CSS class for down button

**Effects:**
- Renderer creates different DOM structure
- Core event attachment remains the same
- CSS framework classes applied appropriately

**Usage Examples:**
```javascript
TouchSpin('#vertical', {
    verticalbuttons: true,
    verticalup: '▲',
    verticaldown: '▼',
    verticalupclass: 'btn-success',
    verticaldownclass: 'btn-danger'
});
```

## Initialization Options

### initval - Initial Value
**Purpose:** Set initial value when input is empty on initialization

**Effects:**
- Only applied if input field is empty on initialization
- Subject to min/max constraints and step alignment
- Not applied if input already has a value

**Usage Examples:**
```javascript
TouchSpin('#initialized', {
    initval: 10,    // Start at 10 if input is empty
    min: 0,
    max: 100
});
```

### replacementval - Empty Value Substitute
**Purpose:** Value to display when input becomes empty

**Effects:**
- Applied when input value becomes empty string
- Can be number or string
- Useful for providing sensible defaults

**Usage Examples:**
```javascript
TouchSpin('#with-default', {
    replacementval: 0,      // Show 0 when empty
});

TouchSpin('#placeholder', {
    replacementval: 'N/A',  // Show 'N/A' when empty
});
```

### firstclickvalueifempty - Click Behavior
**Purpose:** Value to set on first button click if input is empty

**Effects:**
- Applies only to first up/down click on empty input
- Overrides normal step increment from zero
- Useful for meaningful starting points

**Usage Examples:**
```javascript
TouchSpin('#smart-start', {
    firstclickvalueifempty: 1,  // First click sets to 1, not 0
    min: 1
});
```

## Interaction Options

### mousewheel - Scroll Support
**Purpose:** Enable mouse wheel increment/decrement when input is focused

**Default:** `true`

**Effects:**
- Wheel up/down maps to `upOnce()`/`downOnce()`
- Only active when input element has focus
- Prevents page scrolling with `preventDefault()`
- Provides keyboard-free interaction method

**Usage Examples:**
```javascript
TouchSpin('#wheel-enabled', {
    mousewheel: true   // Default - wheel scrolling works
});

TouchSpin('#wheel-disabled', {
    mousewheel: false  // Disable wheel to prevent conflicts
});
```

## Option Combinations & Patterns

### Currency Input Pattern
```javascript
TouchSpin('#currency', {
    min: 0,
    max: 999999.99,
    step: 0.01,
    decimals: 2,
    prefix: '$',
    postfix: ' USD',
    forcestepdivisibility: 'round',
    booster: true,
    boostat: 10,
    maxboostedstep: 1.00
});
```

### Quantity Selector Pattern
```javascript
TouchSpin('#quantity', {
    min: 1,
    max: 100,
    step: 1,
    initval: 1,
    firstclickvalueifempty: 1,
    verticalbuttons: true,
    booster: false,  // Precise control for quantities
    mousewheel: true
});
```

### Percentage Input Pattern
```javascript
TouchSpin('#percentage', {
    min: 0,
    max: 100,
    step: 0.1,
    decimals: 1,
    postfix: '%',
    forcestepdivisibility: 'round',
    stepinterval: 150,  // Slower for precision
    booster: false      // No acceleration for percentages
});
```

### Large Range Navigation Pattern
```javascript
TouchSpin('#large-range', {
    min: 0,
    max: 1000000,
    step: 1,
    booster: true,
    boostat: 5,
    maxboostedstep: 1000,
    stepinterval: 75,
    stepintervaldelay: 400
});
```

## Event-Driven Features

### Events Triggered by Options

| Option | Events Affected | When Fired |
|--------|----------------|------------|
| `min`/`max` | `min`, `max` | When boundary reached |
| `booster` settings | `boostchange` | When step size changes |
| All value options | `change` | When display value changes |

### Option-Specific Event Data

**Boundary Events (`min`/`max`):**
```javascript
{
    value: number,        // The boundary value
    direction: string,    // 'up' or 'down'
    prevented: boolean    // Whether operation was prevented
}
```

**Booster Events (`boostchange`):**
```javascript
{
    step: number,         // Current boosted step size
    isCapped: boolean,    // Whether step hit maxboostedstep limit
    level: number         // Boost level (0, 1, 2, ...)
}
```

**Change Events (`change`):**
```javascript
{
    oldValue: number,     // Previous value
    newValue: number,     // Current value
    triggeredBy: string   // 'user', 'api', 'spin', etc.
}
```

## Native Attribute Synchronization

### Conditional Sync Behavior

TouchSpin synchronizes certain options to native HTML attributes, but only under specific conditions:

**For `type="number"` inputs:**
- `min` → `min` attribute
- `max` → `max` attribute  
- `step` → `step` attribute

**For text inputs:**
- No native attribute synchronization
- Prevents browser formatting conflicts
- Maintains custom validation behavior

**MutationObserver Integration:**
- Watches for external changes to native attributes
- Automatically updates TouchSpin settings when attributes change
- Maintains two-way synchronization

### Accessibility Features by Option

| Option | ARIA Attribute | Purpose |
|--------|----------------|---------|
| `min` | `aria-valuemin` | Screen reader minimum |
| `max` | `aria-valuemax` | Screen reader maximum |
| `decimals` | `aria-valuetext` | Formatted value description |
| Current value | `aria-valuenow` | Current numeric value |

## Validation & Sanitization

### Automatic Option Sanitization

TouchSpin automatically validates and corrects invalid option values:

**Numeric Constraints:**
- `step`: Must be > 0, defaults to 1 if invalid
- `decimals`: Must be ≥ 0, rounds to integer
- `min`/`max`: Must be null or finite numbers
- Timing options: Must be non-negative integers

**Logic Validation:**
- `min` < `max` when both specified
- `step` compatibility with min/max range
- Decimal places match step precision

**Example Sanitization:**
```javascript
// Input with invalid options
TouchSpin('#sanitized', {
    step: 0,        // Invalid: corrected to 1
    decimals: -1,   // Invalid: corrected to 0
    min: 100,
    max: 50,        // Invalid: max < min, corrected or warned
    stepinterval: -50  // Invalid: corrected to 100 (default)
});
```

## Performance Considerations

### Option Impact on Performance

**High Impact:**
- `stepinterval`: Directly affects spinning frequency
- `booster` settings: Complex calculations during acceleration
- `decimals`: String formatting on every display update

**Medium Impact:**
- `prefix`/`postfix`: DOM updates when changed
- `mousewheel`: Event listener overhead

**Low Impact:**
- `min`/`max`: Only checked at boundaries
- Layout options: Only affect initialization

### Memory Usage by Options

**Static Options** (set once, minimal memory):
- Layout options (`verticalbuttons`, etc.)
- Initial values (`initval`, etc.)
- Text content (`prefix`, `postfix`)

**Dynamic Options** (cached for performance):
- Boundary values (`min`, `max`)
- Step calculations (`step`, booster settings)
- Formatting settings (`decimals`, `forcestepdivisibility`)

## Debugging Options

### Common Option-Related Issues

**Issue:** Values not aligning to expected boundaries
```javascript
// Problem: Step doesn't divide evenly into range
TouchSpin('#misaligned', {
    min: 0,
    max: 100,
    step: 7  // 100 is not divisible by 7
});

// Solution: Use boundary alignment or adjust step
TouchSpin('#aligned', {
    min: 0, 
    max: 98,    // 98 = 7 × 14
    step: 7
});
```

**Issue:** Acceleration not working as expected
```javascript
// Problem: boostat too high for typical usage
TouchSpin('#slow-boost', {
    boostat: 50  // Takes 50 steps to start accelerating
});

// Solution: Lower boostat for earlier acceleration
TouchSpin('#quick-boost', {
    boostat: 5   // Accelerates after just 5 steps
});
```

### Option Debugging

```javascript
const api = TouchSpin('#debug', options);

// Log current effective settings
console.log('Effective settings:', api.settings);

// Monitor setting changes
api.on('settingsChanged', (data) => {
    console.log('Settings updated:', data);
});

// Check sanitization results
console.log('Original options:', options);
console.log('Sanitized settings:', api.settings);
```