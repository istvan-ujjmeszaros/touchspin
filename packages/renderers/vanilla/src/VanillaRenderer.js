import AbstractRenderer from '../../../core/src/AbstractRenderer.js';

/**
 * VanillaRenderer
 * Framework-agnostic DOM with CSS variables for theming.
 */
class VanillaRenderer extends AbstractRenderer {
  init() {
    const doc = this.inputEl.ownerDocument;

    // Build wrapper
    const wrapper = doc.createElement('div');
    wrapper.className = 'ts-vanilla';
    wrapper.setAttribute('data-touchspin-injected', 'wrapper');

    // Derive testid suffixes if present
    const testId = this.inputEl.getAttribute('data-testid');
    if (testId) {
      wrapper.setAttribute('data-testid', `${testId}-wrapper`);
    }

    // Place wrapper around input
    const parent = this.inputEl.parentElement;
    if (parent) parent.insertBefore(wrapper, this.inputEl);
    wrapper.appendChild(this.inputEl);

    // Prefix
    let prefixEl = null;
    if (this.settings.prefix !== undefined && this.settings.prefix !== null) {
      prefixEl = doc.createElement('span');
      prefixEl.className = `ts-prefix ${this.settings.prefix_extraclass || ''}`.trim();
      prefixEl.setAttribute('data-touchspin-injected', 'prefix');
      if (testId) prefixEl.setAttribute('data-testid', `${testId}-prefix`);
      prefixEl.innerHTML = this.settings.prefix || '';
      wrapper.insertBefore(prefixEl, this.inputEl);
    }

    // Down button
    const downBtn = doc.createElement('button');
    downBtn.type = 'button';
    downBtn.className = `ts-btn ts-btn-down ${this.settings.buttondown_class || ''}`.trim();
    downBtn.setAttribute('data-touchspin-injected', 'down');
    downBtn.setAttribute('aria-label', 'Decrease');
    if (testId) downBtn.setAttribute('data-testid', `${testId}-down`);
    downBtn.innerHTML = this.settings.buttondown_txt || '-';
    wrapper.insertBefore(downBtn, this.inputEl);

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
    this.container = wrapper;
    this._upBtn = upBtn;
    this._downBtn = downBtn;
    this._prefixEl = prefixEl;
    this._postfixEl = postfixEl;

    // Attach events via core API
    this.core.attachUpEvents(upBtn);
    this.core.attachDownEvents(downBtn);
  }

  teardown() {
    // Remove injected elements and unwrap input
    const wrapper = this.container;
    if (!wrapper) return;

    // Detach buttons explicitly in case core listeners were attached
    if (this._upBtn && this._upBtn.parentElement === wrapper) wrapper.removeChild(this._upBtn);
    if (this._downBtn && this._downBtn.parentElement === wrapper) wrapper.removeChild(this._downBtn);
    if (this._prefixEl && this._prefixEl.parentElement === wrapper) wrapper.removeChild(this._prefixEl);
    if (this._postfixEl && this._postfixEl.parentElement === wrapper) wrapper.removeChild(this._postfixEl);

    // Move input out of wrapper
    if (this.inputEl.parentElement === wrapper && wrapper.parentElement) {
      wrapper.parentElement.insertBefore(this.inputEl, wrapper);
    }
    // Remove wrapper
    if (wrapper.parentElement) wrapper.parentElement.removeChild(wrapper);

    this.container = null;
    this._upBtn = null;
    this._downBtn = null;
    this._prefixEl = null;
    this._postfixEl = null;
  }
}

export default VanillaRenderer;

