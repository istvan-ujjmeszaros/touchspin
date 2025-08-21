/**
 * Test Renderer for Settings Precedence Testing
 * Provides predictable defaults to verify that user settings take precedence
 */
class TestRenderer extends AbstractRenderer {

  getFrameworkId() {
    return 'test';
  }

  /**
   * Get test framework-specific default settings
   * These should be overridden by user settings in precedence tests
   */
  getDefaultSettings() {
    return {
      buttonup_class: 'test-btn test-btn-up',
      buttondown_class: 'test-btn test-btn-down',
      verticalupclass: 'test-btn test-btn-vertical-up',
      verticaldownclass: 'test-btn test-btn-vertical-down'
    };
  }

  /**
   * Simple test container - just wraps input in a div
   * Called without parameters - uses this.originalinput
   */
  buildInputGroup() {
    const input = this.originalinput;
    const testidAttr = input && input.data('testid') ? ` data-testid="${input.data('testid')}-wrapper"` : '';
    
    let html;
    if (this.settings.verticalbuttons) {
      html = `
        <div class="test-container bootstrap-touchspin bootstrap-touchspin-injected"${testidAttr}>
          <span class="test-prefix bootstrap-touchspin-prefix">${this.settings.prefix}</span>
          <span class="test-postfix bootstrap-touchspin-postfix">${this.settings.postfix}</span>
          ${this.buildVerticalButtons()}
        </div>
      `;
    } else {
      html = `
        <div class="test-container bootstrap-touchspin bootstrap-touchspin-injected"${testidAttr}>
          <button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down" type="button">${this.settings.buttondown_txt}</button>
          <span class="test-prefix bootstrap-touchspin-prefix">${this.settings.prefix}</span>
          <span class="test-postfix bootstrap-touchspin-postfix">${this.settings.postfix}</span>
          <button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up" type="button">${this.settings.buttonup_txt}</button>
        </div>
      `;
    }

    this.container = this.$(html).insertBefore(this.originalinput);
    
    // Insert the original input after the prefix
    this.$('.test-prefix', this.container).after(this.originalinput);

    return this.container;
  }

  buildAdvancedInputGroup(parentelement) {
    // For test renderer, treat advanced same as simple
    // But need to work with existing parent element
    const input = this.originalinput;
    const testidAttr = input && input.data('testid') ? ` data-testid="${input.data('testid')}-wrapper"` : '';
    
    // Add test classes to existing parent
    parentelement.addClass('test-container bootstrap-touchspin bootstrap-touchspin-injected');
    if (testidAttr) {
      parentelement.attr('data-testid', input.data('testid') + '-wrapper');
    }

    // Add buttons and spans to parent
    const downButton = this.$(`<button tabindex="-1" class="${this.settings.buttondown_class} bootstrap-touchspin-down" type="button">${this.settings.buttondown_txt}</button>`);
    const upButton = this.$(`<button tabindex="-1" class="${this.settings.buttonup_class} bootstrap-touchspin-up" type="button">${this.settings.buttonup_txt}</button>`);
    const prefix = this.$(`<span class="test-prefix bootstrap-touchspin-prefix">${this.settings.prefix}</span>`);
    const postfix = this.$(`<span class="test-postfix bootstrap-touchspin-postfix">${this.settings.postfix}</span>`);

    parentelement.prepend(downButton);
    parentelement.prepend(prefix);
    parentelement.append(postfix);
    parentelement.append(upButton);

    return {
      container: parentelement,
      elements: {
        up: upButton,
        down: downButton,
        input: input,
        prefix: prefix,
        postfix: postfix
      }
    };
  }

  buildVerticalButtons() {
    return `
      <div class="test-vertical-buttons bootstrap-touchspin-vertical-button-wrapper">
        <button tabindex="-1" class="${this.settings.buttonup_class} ${this.settings.verticalupclass} bootstrap-touchspin-up" type="button">${this.settings.verticalup}</button>
        <button tabindex="-1" class="${this.settings.buttondown_class} ${this.settings.verticaldownclass} bootstrap-touchspin-down" type="button">${this.settings.verticaldown}</button>
      </div>
    `;
  }

  updatePrefixPostfix(newsettings, detached) {
    if (newsettings.postfix) {
      const $postfix = this.originalinput.parent().find('.bootstrap-touchspin-postfix');

      if ($postfix.length === 0 && detached._detached_postfix) {
        detached._detached_postfix.insertAfter(this.originalinput);
      }

      // Test renderer simply updates text content
      this.originalinput.parent().find('.bootstrap-touchspin-postfix').text(newsettings.postfix);
    }

    if (newsettings.prefix) {
      const $prefix = this.originalinput.parent().find('.bootstrap-touchspin-prefix');

      if ($prefix.length === 0 && detached._detached_prefix) {
        detached._detached_prefix.insertBefore(this.originalinput);
      }

      // Test renderer simply updates text content
      this.originalinput.parent().find('.bootstrap-touchspin-prefix').text(newsettings.prefix);
    }
  }
}