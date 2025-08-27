/**
 * Migrated copy from src/renderers/AbstractRenderer.js (transitional)
 */
class AbstractRenderer {
  constructor($, settings, originalinput) {
    this.$ = $;
    this.settings = settings;
    this.originalinput = originalinput;
    this.container = null;
    this.elements = null;
  }

  getFrameworkId() { throw new Error('getFrameworkId() must be implemented by subclasses'); }
  getDefaultSettings() { return {}; }
  buildAdvancedInputGroup(parentelement) { throw new Error('buildAdvancedInputGroup() must be implemented by subclasses'); }
  buildInputGroup() { throw new Error('buildInputGroup() must be implemented by subclasses'); }
  buildVerticalButtons() { throw new Error('buildVerticalButtons() must be implemented by subclasses'); }

  initElements(container) {
    this.container = container;
    let downButtons = this._findElements(container, 'down');
    let upButtons = this._findElements(container, 'up');
    if (downButtons.length === 0 || upButtons.length === 0) {
      const verticalContainer = this._findElements(container.parent(), 'vertical-wrapper');
      if (verticalContainer.length > 0) {
        downButtons = this._findElements(verticalContainer, 'down');
        upButtons = this._findElements(verticalContainer, 'up');
      }
    }
    this.elements = {
      down: downButtons,
      up: upButtons,
      input: this.$('input', container),
      prefix: this._findElements(container, 'prefix').addClass(this.settings.prefix_extraclass),
      postfix: this._findElements(container, 'postfix').addClass(this.settings.postfix_extraclass)
    };
    return this.elements;
  }

  _findElements(container, role) { return this.$(`[data-touchspin-injected="${role}"]`, container); }

  hideEmptyPrefixPostfix() {
    const detached = {};
    if (this.settings.prefix === '') detached._detached_prefix = this.elements.prefix.detach();
    if (this.settings.postfix === '') detached._detached_postfix = this.elements.postfix.detach();
    return detached;
  }

  updatePrefixPostfix(newsettings, detached) { throw new Error('updatePrefixPostfix() must be implemented by subclasses'); }

  getWrapperTestId() {
    const inputTestId = this.originalinput.attr('data-testid');
    if (inputTestId) return ` data-testid="${inputTestId}-wrapper"`;
    return '';
  }
}

// UMD-style export retained for now (transitional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AbstractRenderer;
} else if (typeof window !== 'undefined') {
  window.AbstractRenderer = AbstractRenderer;
}

