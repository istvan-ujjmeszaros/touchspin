# Creating Custom Renderers Guide

TouchSpin's modular architecture allows you to create custom renderers for any CSS framework. This guide shows you how to extend TouchSpin beyond Bootstrap and Tailwind support.

## AbstractRenderer Interface

All renderers extend the `AbstractRenderer` base class, which provides the essential interface between the framework-agnostic core and your framework-specific DOM construction.

### Required Methods

```javascript
import { AbstractRenderer } from '@touchspin/core';

class YourRenderer extends AbstractRenderer {
    init() {
        // REQUIRED: Build DOM structure and connect to core
        this.wrapper = this.buildYourFrameworkWrapper();
        
        // REQUIRED: Find buttons and attach core event handlers
        const upButton = this.wrapper.querySelector('[data-touchspin-injected="up"]');
        const downButton = this.wrapper.querySelector('[data-touchspin-injected="down"]');
        this.core.attachUpEvents(upButton);
        this.core.attachDownEvents(downButton);
        
        // REQUIRED: Register for setting changes you want to handle
        this.core.observeSetting('prefix', (value) => this.updatePrefix(value));
        this.core.observeSetting('postfix', (value) => this.updatePostfix(value));
    }
    
    teardown() {
        // OPTIONAL: Custom cleanup
        // Parent teardown() handles DOM removal automatically
        super.teardown();
    }
}
```

### Available Properties

The renderer receives these properties from the core:

- `this.input` - The original input element
- `this.core` - TouchSpinCore instance for event attachment
- `this.settings` - Sanitized user settings
- `this.wrapper` - Set this to your created wrapper element

### Required Data Attributes

Your DOM structure must include these data attributes for core event targeting:

- `data-touchspin-injected="wrapper"` - Main container element
- `data-touchspin-injected="up"` - Increment button
- `data-touchspin-injected="down"` - Decrement button
- `data-touchspin-injected="prefix"` - Prefix element (if used)
- `data-touchspin-injected="postfix"` - Postfix element (if used)

## Generic Custom Renderer Example

Here's a simplified example of a custom renderer, focusing on the essential interactions with the core and DOM manipulation, without relying on a specific global UI library.

```javascript
import { AbstractRenderer } from '@touchspin/core';

class CustomRenderer extends AbstractRenderer {
    init() {
        // Initialize internal element references
        this.prefixEl = null;
        this.postfixEl = null;
        
        // Build your custom DOM structure
        this.wrapper = this.buildCustomWrapper();
        
        // Find created elements
        const upButton = this.wrapper.querySelector('[data-touchspin-injected="up"]');
        const downButton = this.wrapper.querySelector('[data-touchspin-injected="down"]');
        this.prefixEl = this.wrapper.querySelector('[data-touchspin-injected="prefix"]');
        this.postfixEl = this.wrapper.querySelector('[data-touchspin-injected="postfix"]');
        
        // Attach core event handlers
        this.core.attachUpEvents(upButton);
        this.core.attachDownEvents(downButton);
        
        // Register for setting changes
        this.core.observeSetting('prefix', (value) => this.updatePrefix(value));
        this.core.observeSetting('postfix', (value) => this.updatePostfix(value));
        this.core.observeSetting('buttonup_class', (value) => this.updateButtonClass('up', value));
        this.core.observeSetting('buttondown_class', (value) => this.updateButtonClass('down', value));
    }
    
    teardown() {
        // Custom cleanup specific to your renderer
        super.teardown();
    }
    
    buildCustomWrapper() {
        const testidAttr = this.getWrapperTestId();
        
        const html = `
            <div class="custom-touchspin-wrapper" 
                 data-touchspin-injected="wrapper"${testidAttr}>
                <span class="custom-touchspin-prefix" 
                      data-touchspin-injected="prefix"${this.getPrefixTestId()}>
                    ${this.settings.prefix || ''}
                </span>
                <div class="custom-touchspin-controls">
                    <button class="${this.settings.buttondown_class || 'custom-button'} custom-touchspin-down" 
                            data-touchspin-injected="down"${this.getDownButtonTestId()} 
                            type="button" aria-label="Decrease value">
                        ${this.settings.buttondown_txt || '−'}
                    </button>
                    <button class="${this.settings.buttonup_class || 'custom-button'} custom-touchspin-up" 
                            data-touchspin-injected="up"${this.getUpButtonTestId()} 
                            type="button" aria-label="Increase value">
                        ${this.settings.buttonup_txt || '+'}
                    </button>
                </div>
                <span class="custom-touchspin-postfix" 
                      data-touchspin-injected="postfix"${this.getPostfixTestId()}>
                    ${this.settings.postfix || ''}
                </span>
            </div>
        `;
        
        // Create wrapper and insert
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html.trim();
        const wrapper = tempDiv.firstChild;
        
        // Insert wrapper and move input
        this.input.parentElement.insertBefore(wrapper, this.input);
        wrapper.insertBefore(this.input, wrapper.querySelector('.custom-touchspin-controls'));
        
        // Hide empty prefix/postfix
        this.hideEmptyPrefixPostfix(wrapper);
        
        return wrapper;
    }
    
    hideEmptyPrefixPostfix(wrapper = this.wrapper) {
        const prefixEl = this.prefixEl || wrapper.querySelector('[data-touchspin-injected="prefix"]');
        const postfixEl = this.postfixEl || wrapper.querySelector('[data-touchspin-injected="postfix"]');
        
        if (prefixEl && (!this.settings.prefix || this.settings.prefix === '')) {
            prefixEl.style.display = 'none';
        }
        if (postfixEl && (!this.settings.postfix || this.settings.postfix === '')) {
            postfixEl.style.display = 'none';
        }
    }
    
    updatePrefix(value) {
        const prefixEl = this.prefixEl;
        
        if (value && value !== '') {
            if (prefixEl) {
                prefixEl.textContent = value;
                prefixEl.style.display = '';
            }
        } else if (prefixEl) {
            prefixEl.style.display = 'none';
        }
    }
    
    updatePostfix(value) {
        const postfixEl = this.postfixEl;
        
        if (value && value !== '') {
            if (postfixEl) {
                postfixEl.textContent = value;
                postfixEl.style.display = '';
            }
        } else if (postfixEl) {
            postfixEl.style.display = 'none';
        }
    }
    
    updateButtonClass(type, className) {
        const button = this.wrapper.querySelector(`[data-touchspin-injected="${type}"]`);
        if (button) {
            button.className = `${className || 'custom-button'} custom-touchspin-${type}`;
        }
    }
}

export default CustomRenderer;
```

## Using Your Custom Renderer

To use your custom renderer, you pass its class directly to the `TouchSpin` factory function via the `renderer` option.

```javascript
import { TouchSpin } from '@touchspin/core';
import CustomRenderer from './CustomRenderer.ts'; // Your custom renderer class

const inputElement = document.getElementById('my-input');
const api = TouchSpin(inputElement, {
    renderer: CustomRenderer, // Pass the class directly
    min: 0,
    max: 100
});
```

This approach ensures that the core can instantiate and manage your renderer directly, adhering to the modular architecture.

## CSS Styling Requirements

Your renderer should include CSS that provides proper layout and accessibility:

```css
/* Material UI TouchSpin Styles */
.touchspin-material {
    position: relative;
    display: inline-flex;
    align-items: center;
}

.touchspin-controls {
    display: flex;
    flex-direction: column;
    margin-left: 8px;
}

.touchspin-controls button {
    min-width: 32px;
    height: 24px;
    padding: 0 8px;
    margin: 1px 0;
}

.touchspin-prefix,
.touchspin-postfix {
    padding: 0 4px;
    font-size: 0.875rem;
    color: rgba(0, 0, 0, 0.6);
}

/* Hide empty prefix/postfix */
.touchspin-prefix:empty,
.touchspin-postfix:empty {
    display: none !important;
}

/* Ensure proper focus styles for accessibility */
.touchspin-controls button:focus {
    outline: 2px solid #6200ee;
    outline-offset: 2px;
}
```

## Testing Your Renderer

When testing your custom renderer, you can initialize TouchSpin directly with your renderer class and then use the returned API to interact with the component.

```javascript
// tests/custom-renderer.test.ts
import { test, expect } from '@playwright/test';
import { TouchSpin } from '@touchspin/core';
import CustomRenderer from '../src/CustomRenderer'; // Your custom renderer class

test.describe('Custom Renderer', () => {
    test('creates proper custom structure and functions', async ({ page }) => {
        await page.goto('/test-fixture.html'); // Assuming a basic test fixture
        
        // Initialize TouchSpin with your custom renderer
        await page.evaluate(() => {
            const input = document.getElementById('test-input');
            window.myTouchSpinInstance = TouchSpin(input, {
                renderer: CustomRenderer,
                min: 0,
                max: 100,
                value: 50
            });
        });
        
        // Check wrapper structure
        await expect(page.locator('.custom-touchspin-wrapper')).toBeVisible();
        
        // Check required data attributes
        await expect(page.locator('[data-touchspin-injected="wrapper"]')).toBeVisible();
        await expect(page.locator('[data-touchspin-injected="up"]')).toBeVisible();
        await expect(page.locator('[data-touchspin-injected="down"]')).toBeVisible();
        
        // Test functionality via the API
        await page.evaluate(() => {
            window.myTouchSpinInstance.upOnce();
        });
        await expect(page.locator('#test-input')).toHaveValue('51');
    });
    
    test('handles prefix/postfix updates', async ({ page }) => {
        await page.goto('/test-fixture.html');
        
        // Initialize with your custom renderer
        await page.evaluate(() => {
            const input = document.getElementById('test-input');
            window.myTouchSpinInstance = TouchSpin(input, {
                renderer: CustomRenderer,
                prefix: '```

## Common Patterns

### Handling Vertical Button Layout

```javascript
buildVerticalButtons() {
    if (this.settings.verticalbuttons) {
        return `
            <div class="your-framework-vertical-controls">
                <button data-touchspin-injected="up">${this.settings.verticalup || '+'}</button>
                <button data-touchspin-injected="down">${this.settings.verticaldown || '−'}</button>
            </div>
        `;
    }
    // Return horizontal layout
}
```

### Responsive Design Support

```javascript
init() {
    // ... basic setup
    
    // Apply responsive classes based on input size
    const inputSize = this.detectInputSize();
    this.wrapper.classList.add(`your-framework-${inputSize}`);
}

detectInputSize() {
    const classList = this.input.className;
    if (classList.includes('small')) return 'sm';
    if (classList.includes('large')) return 'lg';
    return 'md';
}
```

### Framework Component Integration

```javascript
init() {
    // ... DOM setup
    
    // Initialize framework-specific components
    this.initFrameworkComponents();
}

initFrameworkComponents() {
    // Example: Initialize component library features
    if (typeof YourFramework !== 'undefined') {
        this.frameworkInstance = new YourFramework.Component(this.wrapper, {
            // component options
        });
    }
}

teardown() {
    // Clean up framework components
    if (this.frameworkInstance) {
        this.frameworkInstance.destroy();
    }
    super.teardown();
}
```

## Best Practices

### 1. Framework Independence
- Don't assume the framework library is loaded
- Provide fallback behavior when framework features are unavailable
- Use feature detection instead of version checking

### 2. Accessibility
- Always include proper ARIA labels on buttons
- Ensure keyboard navigation works correctly
- Maintain proper focus management
- Test with screen readers

### 3. Performance
- Minimize DOM queries by storing element references
- Use event delegation where appropriate
- Clean up event listeners and framework instances in `teardown()`

### 4. Styling
- Provide default styles that work without the framework
- Use CSS custom properties for easy theming
- Ensure styles don't conflict with existing page styles

### 5. Testing
- Test initialization and teardown thoroughly
- Verify all settings updates work correctly
- Test edge cases like empty prefix/postfix
- Include accessibility testing

## Advanced Features

### Custom Event Handling

```javascript
init() {
    // ... basic setup
    
    // Add custom event handling
    this.core.on('change', (data) => {
        this.onValueChange(data);
    });
}

onValueChange(data) {
    // Custom logic for value changes
    this.updateCustomIndicator(data.newValue);
}
```

### Animation Support

```javascript
updatePrefix(value) {
    const prefixEl = this.prefixEl;
    
    if (value && value !== '') {
        prefixEl.textContent = value;
        
        // Add animation class
        prefixEl.classList.add('fade-in');
        prefixEl.style.display = '';
        
        // Remove animation class after completion
        setTimeout(() => {
            prefixEl.classList.remove('fade-in');
        }, 300);
    } else {
        // Animate out
        prefixEl.classList.add('fade-out');
        setTimeout(() => {
            prefixEl.style.display = 'none';
            prefixEl.classList.remove('fade-out');
        }, 300);
    }
}
```

This guide provides everything needed to create professional, accessible custom renderers for TouchSpin. The modular architecture makes it straightforward to support any CSS framework while maintaining full backward compatibility and functionality.
            });
        });
        
        // Test prefix update
        await page.evaluate(() => {
            window.myTouchSpinInstance.updateSettings({ prefix: '€' });
        });
        
        await expect(page.locator('[data-touchspin-injected="prefix"]')).toHaveText('€');
        await expect(page.locator('[data-touchspin-injected="prefix"]')).toBeVisible();
    });
});
```

## Common Patterns

### Handling Vertical Button Layout

```javascript
buildVerticalButtons() {
    if (this.settings.verticalbuttons) {
        return `
            <div class="your-framework-vertical-controls">
                <button data-touchspin-injected="up">${this.settings.verticalup || '+'}</button>
                <button data-touchspin-injected="down">${this.settings.verticaldown || '−'}</button>
            </div>
        `;
    }
    // Return horizontal layout
}
```

### Responsive Design Support

```javascript
init() {
    // ... basic setup
    
    // Apply responsive classes based on input size
    const inputSize = this.detectInputSize();
    this.wrapper.classList.add(`your-framework-${inputSize}`);
}

detectInputSize() {
    const classList = this.input.className;
    if (classList.includes('small')) return 'sm';
    if (classList.includes('large')) return 'lg';
    return 'md';
}
```

### Framework Component Integration

```javascript
init() {
    // ... DOM setup
    
    // Initialize framework-specific components
    this.initFrameworkComponents();
}

initFrameworkComponents() {
    // Example: Initialize component library features
    if (typeof YourFramework !== 'undefined') {
        this.frameworkInstance = new YourFramework.Component(this.wrapper, {
            // component options
        });
    }
}

teardown() {
    // Clean up framework components
    if (this.frameworkInstance) {
        this.frameworkInstance.destroy();
    }
    super.teardown();
}
```

## Best Practices

### 1. Framework Independence
- Don't assume the framework library is loaded
- Provide fallback behavior when framework features are unavailable
- Use feature detection instead of version checking

### 2. Accessibility
- Always include proper ARIA labels on buttons
- Ensure keyboard navigation works correctly
- Maintain proper focus management
- Test with screen readers

### 3. Performance
- Minimize DOM queries by storing element references
- Use event delegation where appropriate
- Clean up event listeners and framework instances in `teardown()`

### 4. Styling
- Provide default styles that work without the framework
- Use CSS custom properties for easy theming
- Ensure styles don't conflict with existing page styles

### 5. Testing
- Test initialization and teardown thoroughly
- Verify all settings updates work correctly
- Test edge cases like empty prefix/postfix
- Include accessibility testing

## Advanced Features

### Custom Event Handling

```javascript
init() {
    // ... basic setup
    
    // Add custom event handling
    this.core.on('change', (data) => {
        this.onValueChange(data);
    });
}

onValueChange(data) {
    // Custom logic for value changes
    this.updateCustomIndicator(data.newValue);
}
```

### Animation Support

```javascript
updatePrefix(value) {
    const prefixEl = this.prefixEl;
    
    if (value && value !== '') {
        prefixEl.textContent = value;
        
        // Add animation class
        prefixEl.classList.add('fade-in');
        prefixEl.style.display = '';
        
        // Remove animation class after completion
        setTimeout(() => {
            prefixEl.classList.remove('fade-in');
        }, 300);
    } else {
        // Animate out
        prefixEl.classList.add('fade-out');
        setTimeout(() => {
            prefixEl.style.display = 'none';
            prefixEl.classList.remove('fade-out');
        }, 300);
    }
}
```

This guide provides everything needed to create professional, accessible custom renderers for TouchSpin. The modular architecture makes it straightforward to support any CSS framework while maintaining full backward compatibility and functionality.