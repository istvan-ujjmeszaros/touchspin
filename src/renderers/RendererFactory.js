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
    // Try to detect from Bootstrap CSS variables or classes in DOM
    
    // Method 1: Check for Bootstrap 5 CSS custom properties
    if (window.getComputedStyle && document.documentElement) {
      const styles = window.getComputedStyle(document.documentElement);
      if (styles.getPropertyValue('--bs-blue') || styles.getPropertyValue('--bs-primary')) {
        return 5;
      }
    }

    // Method 2: Check for version-specific CSS classes in stylesheets
    try {
      // Check if we can access stylesheets
      const sheets = document.styleSheets;
      for (let i = 0; i < sheets.length; i++) {
        try {
          const sheet = sheets[i];
          if (sheet.href && (sheet.href.includes('bootstrap') || sheet.href.includes('bs'))) {
            // Check for BS5 specific patterns
            if (sheet.href.includes('bootstrap/5') || sheet.href.includes('bootstrap@5')) {
              return 5;
            }
            // Check for BS4 specific patterns
            if (sheet.href.includes('bootstrap/4') || sheet.href.includes('bootstrap@4')) {
              return 4;
            }
            // Check for BS3 specific patterns
            if (sheet.href.includes('bootstrap/3') || sheet.href.includes('bootstrap@3')) {
              return 3;
            }
          }
        } catch (e) {
          // Cross-origin stylesheet, skip
          continue;
        }
      }
    } catch (e) {
      // Can't access stylesheets
    }

    // Method 3: Check for version-specific Bootstrap global variables
    if (typeof window.bootstrap !== 'undefined') {
      // Bootstrap 5+ has window.bootstrap
      return 5;
    }

    // Method 4: Check jQuery.fn.modal for version-specific features
    if (typeof $ !== 'undefined' && $.fn && $.fn.modal) {
      // Check for BS4+ specific modal methods
      if (typeof $.fn.modal.Constructor !== 'undefined') {
        const modalProto = $.fn.modal.Constructor.prototype;
        // BS4+ has _adjustDialog method
        if (typeof modalProto._adjustDialog === 'function') {
          // BS5 removed some BS4 methods, but this is a rough heuristic
          return 4;
        }
      }
      // If modal exists but no modern methods, likely BS3
      return 3;
    }

    // Method 5: Check for specific CSS classes in the DOM
    const testDiv = document.createElement('div');
    testDiv.className = 'input-group-prepend d-none';
    document.body.appendChild(testDiv);
    
    const styles = window.getComputedStyle(testDiv);
    const hasFlexDisplay = styles.display === 'flex' || styles.display === 'none';
    
    document.body.removeChild(testDiv);
    
    if (hasFlexDisplay) {
      // input-group-prepend with flex support suggests BS4+
      // Try to differentiate between BS4 and BS5
      const testDiv2 = document.createElement('div');
      testDiv2.className = 'form-select d-none';
      document.body.appendChild(testDiv2);
      
      const hasFormSelect = window.getComputedStyle(testDiv2).display === 'none';
      document.body.removeChild(testDiv2);
      
      return hasFormSelect ? 5 : 4;
    }

    // Default fallback - assume Bootstrap 4 as it's most common
    return 4;
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
    let bootstrapVersion = version;
    
    if (version === 'auto' || version === null || version === undefined) {
      bootstrapVersion = this.detectBootstrapVersion();
    }

    // Convert string to number if needed
    if (typeof bootstrapVersion === 'string') {
      bootstrapVersion = parseInt(bootstrapVersion, 10);
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
      throw new Error(`Bootstrap ${bootstrapVersion} renderer not available. Make sure the renderer files are loaded.`);
    }

    return new RendererClass($, settings, originalinput);
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