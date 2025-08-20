# TouchSpin Renderer System

## Overview

The TouchSpin renderer system provides a flexible architecture for generating HTML markup compatible with different CSS frameworks. Each renderer handles the specific HTML structure and CSS classes required by its target framework version.

## Simplified Architecture

The renderer system has been simplified to make it easier to create new renderers:

### Core Components

1. **AbstractRenderer** - Minimal base class with essential methods only
2. **Framework-specific Renderers** - Self-contained implementations with hard-coded classes
3. **RendererFactory** - Factory class for creating renderer instances
4. **Build System** - Generates version-specific builds with embedded renderers

### Key Simplifications

- **No class mapping**: All CSS classes are hard-coded directly in HTML templates
- **Framework-specific logic**: Size detection and styling logic moved to individual renderers
- **String identifiers**: Framework identification uses descriptive strings instead of numbers

## Renderer Interface

Every renderer must implement these core methods:

### Required Methods

```javascript
class MyRenderer extends AbstractRenderer {
  // Return the framework identifier string
  getFrameworkId() {
    return 'myframework'; // e.g., "bootstrap3", "bootstrap4", "bootstrap5", "tailwind"
  }

  // Build complete input group from scratch
  buildInputGroup() {
    // Return jQuery element with all HTML hard-coded
    const testidAttr = this.getWrapperTestId();
    const html = `
      <div class="my-input-group bootstrap-touchspin"${testidAttr}>
        <button class="my-btn bootstrap-touchspin-down" type="button" tabindex="-1">
          ${this.settings.buttondown_txt}
        </button>
        <span class="my-prefix bootstrap-touchspin-prefix">${this.settings.prefix}</span>
        <span class="my-postfix bootstrap-touchspin-postfix">${this.settings.postfix}</span>
        <button class="my-btn bootstrap-touchspin-up" type="button" tabindex="-1">
          ${this.settings.buttonup_txt}
        </button>
      </div>
    `;
    
    this.container = this.$(html).insertBefore(this.originalinput);
    this.$('.bootstrap-touchspin-prefix', this.container).after(this.originalinput);
    return this.container;
  }

  // Build HTML when parent already has input-group class
  buildAdvancedInputGroup(parentelement) {
    // Add buttons and prefix/postfix to existing container
    parentelement.addClass('bootstrap-touchspin');
    
    // Insert buttons and prefix/postfix as needed
    // All classes are hard-coded here
  }

  // Build vertical button layout
  buildVerticalButtons() {
    return `
      <span class="my-vertical-wrapper bootstrap-touchspin-vertical-button-wrapper">
        <button class="my-btn bootstrap-touchspin-up" type="button" tabindex="-1">
          ${this.settings.verticalup}
        </button>
        <button class="my-btn bootstrap-touchspin-down" type="button" tabindex="-1">
          ${this.settings.verticaldown}
        </button>
      </span>
    `;
  }

  // Update prefix/postfix content dynamically
  updatePrefixPostfix(newsettings, detached) {
    // Framework-specific implementation for updating content
  }
}
```

### Inherited Methods (from AbstractRenderer)

- `initElements(container)` - Initializes element references
- `hideEmptyPrefixPostfix()` - Hides empty prefix/postfix elements
- `getWrapperTestId()` - Gets test ID attribute for wrapper

### Private Methods Pattern

Each renderer should implement private methods for framework-specific logic:

```javascript
class Bootstrap5Renderer extends AbstractRenderer {
  /**
   * Detect input group size from original input classes (Bootstrap 5 specific)
   * @private
   */
  _detectInputGroupSize() {
    if (this.originalinput.hasClass('form-control-sm')) {
      return 'input-group-sm';
    } else if (this.originalinput.hasClass('form-control-lg')) {
      return 'input-group-lg';
    }
    return '';
  }

  /**
   * Apply size classes to container (Bootstrap 5 specific)
   * @private
   */
  _applySizeClasses() {
    if (this.originalinput.hasClass('form-control-sm')) {
      this.container.addClass('input-group-sm');
    } else if (this.originalinput.hasClass('form-control-lg')) {
      this.container.addClass('input-group-lg');
    }
  }
}
```

## Creating a New Renderer

### Step 1: Create the Renderer Class

Create a new file in `src/renderers/` for your framework:

```javascript
// src/renderers/TailwindRenderer.js

class TailwindRenderer extends AbstractRenderer {
  
  getFrameworkId() {
    return 'tailwind';
  }

  /**
   * Detect size classes for Tailwind (private method)
   * @private
   */
  _detectInputSize() {
    if (this.originalinput.hasClass('text-sm')) {
      return 'text-sm';
    } else if (this.originalinput.hasClass('text-lg')) {
      return 'text-lg';
    }
    return '';
  }

  buildInputGroup() {
    const testidAttr = this.getWrapperTestId();
    const sizeClass = this._detectInputSize();
    
    // All Tailwind classes hard-coded - no mapping needed
    const html = `
      <div class="flex rounded-md shadow-sm bootstrap-touchspin ${sizeClass}"${testidAttr}>
        <button class="px-3 py-2 bg-gray-200 hover:bg-gray-300 border border-r-0 border-gray-300 rounded-l-md bootstrap-touchspin-down" 
                type="button" tabindex="-1">
          ${this.settings.buttondown_txt}
        </button>
        
        <span class="px-3 py-2 bg-gray-50 text-gray-700 border-t border-b border-gray-300 bootstrap-touchspin-prefix">
          ${this.settings.prefix}
        </span>
        
        <!-- Input inserted here -->
        
        <span class="px-3 py-2 bg-gray-50 text-gray-700 border-t border-b border-gray-300 bootstrap-touchspin-postfix">
          ${this.settings.postfix}
        </span>
        
        <button class="px-3 py-2 bg-gray-200 hover:bg-gray-300 border border-l-0 border-gray-300 rounded-r-md bootstrap-touchspin-up"
                type="button" tabindex="-1">
          ${this.settings.buttonup_txt}
        </button>
      </div>
    `;

    this.container = this.$(html).insertBefore(this.originalinput);
    
    // Move input into container after prefix
    this.$('.bootstrap-touchspin-prefix', this.container).after(this.originalinput);
    
    // Add Tailwind input classes
    this.originalinput.addClass('flex-1 px-3 py-2 border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500');
    
    return this.container;
  }

  buildAdvancedInputGroup(parentelement) {
    // Implementation for existing container with Tailwind classes
    parentelement.addClass('flex rounded-md shadow-sm bootstrap-touchspin');
    
    // Add Tailwind-specific buttons and elements...
  }

  buildVerticalButtons() {
    return `
      <div class="flex flex-col ml-1 bootstrap-touchspin-vertical-button-wrapper">
        <button type="button" tabindex="-1"
                class="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 border border-gray-300 rounded-t bootstrap-touchspin-up">
          ${this.settings.verticalup}
        </button>
        <button type="button" tabindex="-1" 
                class="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 border border-t-0 border-gray-300 rounded-b bootstrap-touchspin-down">
          ${this.settings.verticaldown}
        </button>
      </div>
    `;
  }

  updatePrefixPostfix(newsettings, detached) {
    // Tailwind-specific implementation for updating prefix/postfix
    if (newsettings.postfix) {
      const $postfix = this.originalinput.parent().find('.bootstrap-touchspin-postfix');
      if ($postfix.length === 0 && detached._detached_postfix) {
        detached._detached_postfix.insertAfter(this.originalinput);
      }
      this.originalinput.parent().find('.bootstrap-touchspin-postfix').text(newsettings.postfix);
    }

    if (newsettings.prefix) {
      const $prefix = this.originalinput.parent().find('.bootstrap-touchspin-prefix');
      if ($prefix.length === 0 && detached._detached_prefix) {
        detached._detached_prefix.insertBefore(this.originalinput);
      }
      this.originalinput.parent().find('.bootstrap-touchspin-prefix').text(newsettings.prefix);
    }
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TailwindRenderer;
} else if (typeof window !== 'undefined') {
  window.TailwindRenderer = TailwindRenderer;
}
```

### Step 2: Update the Build System

Modify `build.mjs` to create a Tailwind-specific build:

```javascript
// In buildAll() function, add Tailwind to the versions array:
for (const version of [3, 4, 5, 'tailwind']) {
  const fileName = await buildVersionSpecific(version, outputDir);
  builtFiles.push(fileName);
}

// Update buildVersionSpecific() to handle non-numeric versions:
async function buildVersionSpecific(version, outputDir) {
  const versionSuffix = typeof version === 'number' ? `bs${version}` : version.toLowerCase();
  const fileName = `jquery.bootstrap-touchspin-${versionSuffix}.js`;
  const rendererName = typeof version === 'number' ? `Bootstrap${version}` : version;
  
  // Update the factory creation to use proper capitalization
  const factoryCode = `
    static createRenderer($, settings, originalinput) {
      return new ${rendererName}Renderer($, settings, originalinput);
    }
    
    static getFrameworkId() {
      return '${typeof version === 'number' ? 'bootstrap' + version : version}';
    }
  `;
  // ... rest of the function
}
```

### Step 3: Register in index.js

Add your renderer to `src/renderers/index.js`:

```javascript
if (typeof module !== 'undefined' && module.exports) {
  // CommonJS
  global.TailwindRenderer = require('./TailwindRenderer');
  
  module.exports = {
    // ... existing exports
    TailwindRenderer: global.TailwindRenderer
  };
} else if (typeof window !== 'undefined') {
  // Browser globals
  window.TouchSpinRenderers = {
    // ... existing renderers
    TailwindRenderer: window.TailwindRenderer
  };
}
```

## Key Considerations

### CSS Class Preservation

TouchSpin adds specific classes for JavaScript functionality:
- `bootstrap-touchspin` - Main container marker
- `bootstrap-touchspin-up` - Increment button
- `bootstrap-touchspin-down` - Decrement button
- `bootstrap-touchspin-prefix` - Prefix element
- `bootstrap-touchspin-postfix` - Postfix element

These classes must be preserved regardless of the CSS framework being used.

### Element Structure Requirements

The renderer must ensure:
1. Input element remains accessible and functional
2. Buttons are properly positioned and clickable
3. Prefix/postfix elements are correctly placed
4. Container has proper structure for event delegation
5. Test ID propagation works correctly

### Framework Compatibility

When creating a renderer, consider:
- How does the framework handle input groups?
- What are the sizing conventions?
- How are buttons styled?
- What accessibility attributes are needed?
- Are there responsive considerations?

### Size Detection Pattern

Each renderer should implement private methods for size detection:

```javascript
class MyFrameworkRenderer extends AbstractRenderer {
  /**
   * Detect input size classes (framework-specific)
   * @private
   */
  _detectInputGroupSize() {
    // Check for framework-specific size classes
    if (this.originalinput.hasClass('small-input')) {
      return 'small-container';
    } else if (this.originalinput.hasClass('large-input')) {
      return 'large-container';
    }
    return '';
  }

  /**
   * Apply size classes to container (framework-specific)
   * @private
   */
  _applySizeClasses() {
    // Apply size classes based on input
    if (this.originalinput.hasClass('small-input')) {
      this.container.addClass('small-container');
    } else if (this.originalinput.hasClass('large-input')) {
      this.container.addClass('large-container');
    }
  }

  buildInputGroup() {
    const inputGroupSize = this._detectInputGroupSize();
    // Use inputGroupSize in HTML template...
    
    // Apply size classes after container creation
    this._applySizeClasses();
  }
}
```

## Testing

Test your renderer with:
- Basic initialization and functionality
- Vertical button mode
- Dynamic prefix/postfix updates
- Size detection and application
- Event handling (clicks, keyboard, etc.)
- Accessibility features
- Integration with TouchSpin settings

## Examples from Existing Renderers

### Bootstrap 3
- Uses `input-group-addon` for prefix/postfix
- Wraps buttons in `input-group-btn`
- Supports `input-sm` and `input-lg` classes
- All classes hard-coded in HTML templates

### Bootstrap 4
- Uses `input-group-prepend` and `input-group-append` wrappers
- Uses `input-group-text` for prefix/postfix content
- Supports both legacy (`input-sm`) and new (`form-control-sm`) classes
- Complex structure with multiple wrapper divs

### Bootstrap 5
- Simplifies structure (no prepend/append wrappers)
- Direct children of `input-group`
- Uses `input-group-text` for prefix/postfix
- Removes legacy size classes, uses only `form-control-*`

## Build System Details

The build system (`build.mjs`):

1. **Reads renderer files** from `src/renderers/`
2. **Bundles renderer with factory** - Creates a specialized RendererFactory for each version
3. **Embeds in UMD wrapper** - Makes it work with different module systems
4. **Transpiles to ES5** - Ensures browser compatibility
5. **Generates source maps** - For debugging
6. **Creates minified versions** - For production use

Each build file (e.g., `jquery.bootstrap-touchspin-bs5.js`) contains:
- The AbstractRenderer base class
- The specific renderer implementation
- A specialized RendererFactory that returns only that renderer
- The main TouchSpin plugin code

## Migration from Class-Based System

The previous system used:
- `getVersion()` returning numbers - now `getFrameworkId()` returning strings
- `getClasses()` method for class mapping - now classes are hard-coded
- `detectInputGroupSize()` and `applySizeClasses()` in base class - now private methods in each renderer

This simplification makes it much easier to create new renderers without understanding Bootstrap-specific concepts.

## Debugging

To debug renderer issues:

1. Check browser console for errors
2. Verify the correct build file is loaded (framework-specific)
3. Inspect generated HTML structure
4. Use source maps for debugging
5. Check CSS framework is loaded correctly
6. Verify jQuery is available
7. Test with different input configurations

## Contributing

When contributing a new renderer:

1. Follow the existing code style
2. Include comprehensive comments
3. Test with all TouchSpin features
4. Keep framework-specific logic in private methods
5. Hard-code all CSS classes in HTML templates
6. Add demo files for your framework
7. Update this documentation
8. Submit tests for your renderer

## Framework Support Status

- ✅ **Bootstrap 3** - Full support with `input-group-addon` structure
- ✅ **Bootstrap 4** - Full support with `input-group-prepend/append` structure  
- ✅ **Bootstrap 5** - Full support with simplified structure
- 🚧 **Tailwind CSS** - Example implementation (not included in builds)
- 🚧 **Other Frameworks** - Easy to add with new simplified system