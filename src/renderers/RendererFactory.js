/**
 * Renderer Factory
 * Creates version-specific renderers (auto-detection removed - use version-specific builds instead)
 */
class RendererFactory {

  /**
   * Create renderer (simplified - no auto-detection, version determined by build)
   * @param {jQuery} $ jQuery instance
   * @param {object} settings Plugin settings
   * @param {jQuery} originalinput Original input element
   * @returns {AbstractRenderer} Renderer instance
   */
  static createRenderer($, settings, originalinput) {
    // This method is overridden in version-specific builds to return the correct renderer
    throw new Error('TouchSpin: Use version-specific build files (bootstrap-touchspin-bs3.js, bootstrap-touchspin-bs4.js, or bootstrap-touchspin-bs5.js)');
  }

  /**
   * Get the framework identifier supported by this build
   * @returns {string} Framework identifier (e.g., "bootstrap3", "bootstrap4", "bootstrap5")
   */
  static getFrameworkId() {
    // This method is overridden in version-specific builds
    throw new Error('TouchSpin: Use version-specific build files');
  }
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RendererFactory;
} else if (typeof window !== 'undefined') {
  window.RendererFactory = RendererFactory;
}