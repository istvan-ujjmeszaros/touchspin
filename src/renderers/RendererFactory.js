/**
 * Renderer Factory
 * Handles Bootstrap version detection and renderer instantiation
 */
class RendererFactory {
  
  /**
   * Detect Bootstrap version from the DOM/CSS
   * @returns {number} Detected Bootstrap version (3, 4, 5) or null if not detected
   */
  static detectBootstrapVersion() {
    try {
      // Method 1: Check for Bootstrap 5 CSS custom properties
      if (window.getComputedStyle && document.documentElement) {
        const styles = window.getComputedStyle(document.documentElement);
        if (styles.getPropertyValue('--bs-blue') || 
            styles.getPropertyValue('--bs-primary') ||
            styles.getPropertyValue('--bs-body-font-family')) {
          return 5;
        }
      }

      // Method 2: Check for version-specific CSS classes in stylesheets
      try {
        const sheets = document.styleSheets;
        for (let i = 0; i < sheets.length; i++) {
          try {
            const sheet = sheets[i];
            if (sheet.href && (sheet.href.includes('bootstrap') || sheet.href.includes('bs'))) {
              // Check for BS5 specific patterns
              if (sheet.href.includes('bootstrap/5') || 
                  sheet.href.includes('bootstrap@5') ||
                  sheet.href.includes('5.') ||
                  sheet.href.includes('/5/')) {
                return 5;
              }
              // Check for BS4 specific patterns
              if (sheet.href.includes('bootstrap/4') || 
                  sheet.href.includes('bootstrap@4') ||
                  sheet.href.includes('4.') ||
                  sheet.href.includes('/4/')) {
                return 4;
              }
              // Check for BS3 specific patterns
              if (sheet.href.includes('bootstrap/3') || 
                  sheet.href.includes('bootstrap@3') ||
                  sheet.href.includes('3.') ||
                  sheet.href.includes('/3/')) {
                return 3;
              }
            }
          } catch (e) {
            // Cross-origin stylesheet, skip
            continue;
          }
        }
      } catch (e) {
        // Can't access stylesheets, continue with other methods
      }

      // Method 3: Check for version-specific Bootstrap global variables
      if (typeof window.bootstrap !== 'undefined') {
        // Bootstrap 5+ has window.bootstrap
        if (window.bootstrap.Tooltip || window.bootstrap.Modal) {
          return 5;
        }
      }

      // Method 4: Check jQuery.fn.modal for version-specific features
      if (typeof $ !== 'undefined' && $.fn && $.fn.modal) {
        try {
          if (typeof $.fn.modal.Constructor !== 'undefined') {
            const modalProto = $.fn.modal.Constructor.prototype;
            // BS5 specific method
            if (typeof modalProto._initializeBackDrop === 'function') {
              return 5;
            }
            // BS4+ has _adjustDialog method
            if (typeof modalProto._adjustDialog === 'function') {
              return 4;
            }
          }
          // If modal exists but no modern methods, likely BS3
          return 3;
        } catch (e) {
          // Error accessing modal constructor, continue
        }
      }

      // Method 5: Check for specific CSS classes behavior
      const testDiv = document.createElement('div');
      testDiv.className = 'input-group-prepend d-none';
      testDiv.style.position = 'absolute';
      testDiv.style.visibility = 'hidden';
      document.body.appendChild(testDiv);
      
      const styles = window.getComputedStyle(testDiv);
      const hasFlexDisplay = styles.display === 'flex' || styles.display === 'none';
      
      if (hasFlexDisplay) {
        // Test for BS5 vs BS4 by checking if form-select class exists
        testDiv.className = 'form-select d-none';
        const hasFormSelect = window.getComputedStyle(testDiv).display === 'none';
        
        document.body.removeChild(testDiv);
        return hasFormSelect ? 5 : 4;
      }
      
      document.body.removeChild(testDiv);

      // Method 6: Check for BS3 specific classes
      const testDiv3 = document.createElement('div');
      testDiv3.className = 'input-group-addon d-none';
      testDiv3.style.position = 'absolute';
      testDiv3.style.visibility = 'hidden';
      document.body.appendChild(testDiv3);
      
      const hasAddonClass = window.getComputedStyle(testDiv3).display === 'none';
      document.body.removeChild(testDiv3);
      
      if (hasAddonClass) {
        return 3;
      }

      // Default fallback - assume Bootstrap 4 as it's most common
      console.warn('TouchSpin: Could not detect Bootstrap version, defaulting to version 4');
      return 4;
      
    } catch (error) {
      console.error('TouchSpin: Error detecting Bootstrap version:', error);
      return 4; // Safe fallback
    }
  }

  /**
   * Create appropriate renderer based on Bootstrap version
   * @param {jQuery} $ jQuery instance
   * @param {object} settings Plugin settings
   * @param {jQuery} originalinput Original input element
   * @param {number|string} version Optional explicit version, or 'auto' to detect
   * @returns {BootstrapRenderer} Appropriate renderer instance
   */
  static createRenderer($, settings, originalinput, version = 'auto') {
    try {
      let bootstrapVersion = version;
      
      if (version === 'auto' || version === null || version === undefined) {
        bootstrapVersion = this.detectBootstrapVersion();
      }

      // Convert string to number if needed and validate
      if (typeof bootstrapVersion === 'string') {
        bootstrapVersion = parseInt(bootstrapVersion, 10);
      }

      // Validate version number
      if (isNaN(bootstrapVersion) || ![3, 4, 5].includes(bootstrapVersion)) {
        console.warn(`TouchSpin: Invalid Bootstrap version "${version}", defaulting to version 4`);
        bootstrapVersion = 4;
      }

      // Import renderers dynamically or use global references
      let RendererClass;
      
      switch (bootstrapVersion) {
        case 3:
          RendererClass = (typeof Bootstrap3Renderer !== 'undefined') ? Bootstrap3Renderer : 
                         (typeof require !== 'undefined') ? require('./Bootstrap3Renderer') : null;
          break;
        case 5:
          RendererClass = (typeof Bootstrap5Renderer !== 'undefined') ? Bootstrap5Renderer :
                         (typeof require !== 'undefined') ? require('./Bootstrap5Renderer') : null;
          break;
        case 4:
        default:
          RendererClass = (typeof Bootstrap4Renderer !== 'undefined') ? Bootstrap4Renderer :
                         (typeof require !== 'undefined') ? require('./Bootstrap4Renderer') : null;
          break;
      }

      if (!RendererClass) {
        // Try to fall back to Bootstrap 4 renderer if specific version not available
        if (bootstrapVersion !== 4) {
          console.warn(`TouchSpin: Bootstrap ${bootstrapVersion} renderer not available, falling back to Bootstrap 4 renderer`);
          RendererClass = (typeof Bootstrap4Renderer !== 'undefined') ? Bootstrap4Renderer :
                         (typeof require !== 'undefined') ? require('./Bootstrap4Renderer') : null;
        }
        
        if (!RendererClass) {
          throw new Error(`TouchSpin: No Bootstrap renderer available. Make sure the renderer files are loaded.`);
        }
      }

      return new RendererClass($, settings, originalinput);
      
    } catch (error) {
      console.error('TouchSpin: Error creating renderer:', error);
      
      // Last resort fallback - try to create Bootstrap 4 renderer
      try {
        const FallbackRenderer = (typeof Bootstrap4Renderer !== 'undefined') ? Bootstrap4Renderer :
                                (typeof require !== 'undefined') ? require('./Bootstrap4Renderer') : null;
        if (FallbackRenderer) {
          console.warn('TouchSpin: Using Bootstrap 4 renderer as fallback');
          return new FallbackRenderer($, settings, originalinput);
        }
      } catch (fallbackError) {
        console.error('TouchSpin: Fallback renderer creation failed:', fallbackError);
      }
      
      throw new Error('TouchSpin: Failed to create any renderer. Please check that Bootstrap and renderer files are properly loaded.');
    }
  }

  /**
   * Get all available renderer versions
   * @returns {Array<number>} Array of supported Bootstrap versions
   */
  static getAvailableVersions() {
    const versions = [];
    
    if ((typeof Bootstrap3Renderer !== 'undefined') || 
        (typeof require !== 'undefined' && require.resolve && require.resolve('./Bootstrap3Renderer'))) {
      versions.push(3);
    }
    
    if ((typeof Bootstrap4Renderer !== 'undefined') || 
        (typeof require !== 'undefined' && require.resolve && require.resolve('./Bootstrap4Renderer'))) {
      versions.push(4);
    }
    
    if ((typeof Bootstrap5Renderer !== 'undefined') || 
        (typeof require !== 'undefined' && require.resolve && require.resolve('./Bootstrap5Renderer'))) {
      versions.push(5);
    }
    
    return versions;
  }
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RendererFactory;
} else if (typeof window !== 'undefined') {
  window.RendererFactory = RendererFactory;
}