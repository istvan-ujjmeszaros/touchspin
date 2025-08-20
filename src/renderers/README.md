# TouchSpin Renderer System

## Overview

The TouchSpin renderer system provides a flexible architecture for generating HTML markup compatible with different CSS frameworks. Each renderer handles the specific HTML structure and CSS classes required by its target framework version.

## Architecture

### Core Components

1. **AbstractRenderer** - Base class defining the renderer interface
2. **Framework-specific Renderers** - Implementations for each framework version (Bootstrap 3, 4, 5)
3. **RendererFactory** - Factory class for creating renderer instances
4. **Build System** - Generates version-specific builds with embedded renderers

### How It Works

The renderer system operates through these key steps:

1. **Initialization**: When TouchSpin initializes, it uses `RendererFactory.createRenderer()` to get a renderer instance
2. **HTML Generation**: The renderer generates framework-specific HTML structure
3. **Element Management**: The renderer manages references to DOM elements
4. **Dynamic Updates**: The renderer handles updates to prefix/postfix content

## Renderer Interface

Every renderer must implement these core methods:

### Required Methods

```javascript
class MyRenderer extends AbstractRenderer {
  // Return the framework version number
  getVersion() {
    return 1; // Your framework version
  }

  // Return framework-specific CSS classes
  getClasses() {
    return {
      inputSmall: 'small-input',
      inputLarge: 'large-input',
      formControlSmall: 'form-control-sm',
      formControlLarge: 'form-control-lg',
      inputGroupSmall: 'input-group-sm',
      inputGroupLarge: 'input-group-lg',
      inputGroupBtn: 'input-group-btn',
      inputGroupPrepend: 'input-group-prepend',
      inputGroupAppend: 'input-group-append',
      inputGroupAddon: 'input-group-addon',
      inputGroupText: 'input-group-text'
    };
  }

  // Build HTML when parent has input-group class
  buildAdvancedInputGroup(parentelement) {
    // Add buttons and prefix/postfix to existing container
  }

  // Build complete input group from scratch
  buildInputGroup() {
    // Create and return new container with all elements
  }

  // Build vertical button layout
  buildVerticalButtons() {
    // Return HTML string for vertical buttons
  }
}
```

### Inherited Methods (from AbstractRenderer)

- `detectInputGroupSize()` - Detects size classes from original input
- `initElements(container)` - Initializes element references
- `hideEmptyPrefixPostfix()` - Hides empty prefix/postfix elements
- `updatePrefixPostfix(settings, detached)` - Updates prefix/postfix content
- `applySizeClasses()` - Applies size classes to container
- `getWrapperTestId()` - Gets test ID attribute for wrapper

## Creating a New Renderer

### Step 1: Create the Renderer Class

Create a new file in `src/renderers/` for your framework:

```javascript
// src/renderers/TailwindRenderer.js

class TailwindRenderer extends AbstractRenderer {
  
  getVersion() {
    return 3; // Tailwind CSS v3
  }

  getClasses() {
    return {
      // Map TouchSpin concepts to Tailwind classes
      inputSmall: 'text-sm',
      inputLarge: 'text-lg',
      formControlSmall: 'h-8',
      formControlLarge: 'h-12',
      inputGroupSmall: 'text-sm',
      inputGroupLarge: 'text-lg',
      // Tailwind doesn't have these Bootstrap concepts
      inputGroupBtn: '',
      inputGroupPrepend: '',
      inputGroupAppend: '',
      inputGroupAddon: '',
      inputGroupText: ''
    };
  }

  buildInputGroup() {
    const testidAttr = this.getWrapperTestId();
    
    // Tailwind-specific HTML structure
    const html = `
      <div class="flex rounded-md shadow-sm bootstrap-touchspin"${testidAttr}>
        <button type="button" tabindex="-1" 
                class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-l-md bootstrap-touchspin-down">
          ${this.settings.buttondown_txt}
        </button>
        
        <span class="px-3 py-2 bg-gray-50 text-gray-700 bootstrap-touchspin-prefix">
          ${this.settings.prefix}
        </span>
        
        <!-- Input will be inserted here -->
        
        <span class="px-3 py-2 bg-gray-50 text-gray-700 bootstrap-touchspin-postfix">
          ${this.settings.postfix}
        </span>
        
        <button type="button" tabindex="-1"
                class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-r-md bootstrap-touchspin-up">
          ${this.settings.buttonup_txt}
        </button>
      </div>
    `;

    this.container = this.$(html).insertBefore(this.originalinput);
    
    // Move input into container after prefix
    this.$('.bootstrap-touchspin-prefix', this.container).after(this.originalinput);
    
    // Add Tailwind input classes
    this.originalinput.addClass('px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500');
    
    return this.container;
  }

  buildAdvancedInputGroup(parentelement) {
    // Implementation for existing container
    parentelement.addClass('flex rounded-md shadow-sm bootstrap-touchspin');
    
    // Add Tailwind-specific structure...
    // Similar to buildInputGroup but working with existing container
  }

  buildVerticalButtons() {
    return `
      <div class="flex flex-col ml-1">
        <button type="button" tabindex="-1"
                class="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-t bootstrap-touchspin-up">
          ${this.settings.verticalup}
        </button>
        <button type="button" tabindex="-1" 
                class="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-b bootstrap-touchspin-down">
          ${this.settings.verticaldown}
        </button>
      </div>
    `;
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
for (const version of [3, 4, 5, 'Tailwind']) {
  const fileName = await buildVersionSpecific(version, outputDir);
  builtFiles.push(fileName);
}

// Update buildVersionSpecific() to handle non-numeric versions:
async function buildVersionSpecific(version, outputDir) {
  const versionSuffix = typeof version === 'number' ? `bs${version}` : version.toLowerCase();
  const fileName = `jquery.bootstrap-touchspin-${versionSuffix}.js`;
  const rendererName = typeof version === 'number' ? `Bootstrap${version}` : version;
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

### Step 4: Build and Test

1. Run the build process:
   ```bash
   npm run build
   ```

2. Test your renderer with HTML:
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <script src="https://cdn.tailwindcss.com"></script>
     <script src="jquery.min.js"></script>
     <script src="dist/jquery.bootstrap-touchspin-tailwind.js"></script>
   </head>
   <body>
     <input type="text" id="demo" value="55">
     <script>
       $('#demo').TouchSpin({
         min: 0,
         max: 100,
         prefix: '$'
       });
     </script>
   </body>
   </html>
   ```

## Key Considerations

### CSS Class Preservation

TouchSpin adds specific classes for JavaScript hooks:
- `bootstrap-touchspin` - Main container marker
- `bootstrap-touchspin-up` - Increment button
- `bootstrap-touchspin-down` - Decrement button
- `bootstrap-touchspin-prefix` - Prefix element
- `bootstrap-touchspin-postfix` - Postfix element

These classes must be preserved regardless of the CSS framework.

### Element Structure

The renderer must ensure:
1. Input element remains accessible
2. Buttons are properly positioned
3. Prefix/postfix elements are correctly placed
4. Container has proper structure for event delegation

### Framework Compatibility

Consider these aspects for your framework:
- How does it handle input groups?
- What are the sizing conventions?
- How are buttons styled?
- What accessibility attributes are needed?

### Testing

Test your renderer with:
- Basic initialization
- Vertical button mode
- Dynamic prefix/postfix updates
- Size detection and application
- Event handling
- Accessibility features

## Examples from Existing Renderers

### Bootstrap 3
- Uses `input-group-addon` for prefix/postfix
- Wraps buttons in `input-group-btn`
- Supports `input-sm` and `input-lg` classes

### Bootstrap 4
- Uses `input-group-prepend` and `input-group-append` wrappers
- Introduces `input-group-text` for prefix/postfix content
- Uses `form-control-sm` and `form-control-lg`

### Bootstrap 5
- Simplifies structure (no prepend/append wrappers)
- Direct children of `input-group`
- Maintains `input-group-text` for prefix/postfix

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

## Debugging

To debug renderer issues:

1. Check browser console for errors
2. Verify the correct build file is loaded
3. Inspect generated HTML structure
4. Use source maps for debugging
5. Check CSS framework is loaded
6. Verify jQuery is available

## Contributing

When contributing a new renderer:

1. Follow the existing code style
2. Include comprehensive comments
3. Test with all TouchSpin features
4. Update this README
5. Add demo files for your framework
6. Submit tests for your renderer

## Questions?

For questions about the renderer system:
- Check existing renderer implementations
- Review the AbstractRenderer base class
- Examine the build system
- Test with demo files