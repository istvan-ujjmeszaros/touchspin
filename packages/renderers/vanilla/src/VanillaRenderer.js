import AbstractRenderer from '../../../core/src/AbstractRenderer.js';

/**
 * VanillaRenderer
 * Framework-agnostic DOM with CSS variables for theming.
 */
class VanillaRenderer extends AbstractRenderer {
  init() {
    const doc = this.input.ownerDocument;

    // Build wrapper
    const wrapper = doc.createElement('div');
    wrapper.className = 'ts-vanilla';
    wrapper.setAttribute('data-touchspin-injected', 'wrapper');

    // Derive testid suffixes if present
    const testId = this.input.getAttribute('data-testid');
    if (testId) {
      wrapper.setAttribute('data-testid', `${testId}-wrapper`);
    }

    // Place wrapper around input
    const parent = this.input.parentElement;
    if (parent) parent.insertBefore(wrapper, this.input);
    wrapper.appendChild(this.input);

    // Prefix
    let prefixEl = null;
    if (this.settings.prefix !== undefined && this.settings.prefix !== null) {
      prefixEl = doc.createElement('span');
      prefixEl.className = `ts-prefix ${this.settings.prefix_extraclass || ''}`.trim();
      prefixEl.setAttribute('data-touchspin-injected', 'prefix');
      if (testId) prefixEl.setAttribute('data-testid', `${testId}-prefix`);
      prefixEl.innerHTML = this.settings.prefix || '';
      wrapper.insertBefore(prefixEl, this.input);
    }

    // Down button
    const downBtn = doc.createElement('button');
    downBtn.type = 'button';
    downBtn.className = `ts-btn ts-btn-down ${this.settings.buttondown_class || ''}`.trim();
    downBtn.setAttribute('data-touchspin-injected', 'down');
    downBtn.setAttribute('aria-label', 'Decrease');
    if (testId) downBtn.setAttribute('data-testid', `${testId}-down`);
    downBtn.innerHTML = this.settings.buttondown_txt || '-';
    wrapper.insertBefore(downBtn, this.input);

    // Up button
    const upBtn = doc.createElement('button');
    upBtn.type = 'button';
    upBtn.className = `ts-btn ts-btn-up ${this.settings.buttonup_class || ''}`.trim();
    upBtn.setAttribute('data-touchspin-injected', 'up');
    upBtn.setAttribute('aria-label', 'Increase');
    if (testId) upBtn.setAttribute('data-testid', `${testId}-up`);
    upBtn.innerHTML = this.settings.buttonup_txt || '+';
    wrapper.appendChild(upBtn);

    // Postfix
    let postfixEl = null;
    if (this.settings.postfix !== undefined && this.settings.postfix !== null) {
      postfixEl = doc.createElement('span');
      postfixEl.className = `ts-postfix ${this.settings.postfix_extraclass || ''}`.trim();
      postfixEl.setAttribute('data-touchspin-injected', 'postfix');
      if (testId) postfixEl.setAttribute('data-testid', `${testId}-postfix`);
      postfixEl.innerHTML = this.settings.postfix || '';
      wrapper.appendChild(postfixEl);
    }

    // Save for teardown
    this.wrapper = wrapper;
    this._upBtn = upBtn;
    this._downBtn = downBtn;
    this._prefixEl = prefixEl;
    this._postfixEl = postfixEl;

    // Attach events via core API
    this.core.attachUpEvents(upBtn);
    this.core.attachDownEvents(downBtn);
  }
  // Use AbstractRenderer.teardown() default to remove injected elements and unwrap input
}

export default VanillaRenderer;
