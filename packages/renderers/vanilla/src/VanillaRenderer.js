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

    // Place wrapper around input (do not append input yet; we will build order explicitly)
    const parent = this.input.parentElement;
    if (parent) parent.insertBefore(wrapper, this.input);

    // Create controls in explicit order: [down] [prefix?] [input] [postfix?] [up]
    let prefixEl = null;

    // Down button (left edge)
    const downBtn = doc.createElement('button');
    downBtn.type = 'button';
    downBtn.className = `ts-btn ts-btn-down ${this.settings.buttondown_class || ''}`.trim();
    downBtn.setAttribute('data-touchspin-injected', 'down');
    downBtn.setAttribute('aria-label', 'Decrease');
    if (testId) downBtn.setAttribute('data-testid', `${testId}-down`);
    downBtn.innerHTML = this.settings.buttondown_txt || '-';
    wrapper.appendChild(downBtn);

    // Optional prefix (inside, after down button)
    if (this.settings.prefix && String(this.settings.prefix).trim().length > 0) {
      prefixEl = doc.createElement('span');
      prefixEl.className = `ts-prefix ${this.settings.prefix_extraclass || ''}`.trim();
      prefixEl.setAttribute('data-touchspin-injected', 'prefix');
      if (testId) prefixEl.setAttribute('data-testid', `${testId}-prefix`);
      prefixEl.innerHTML = this.settings.prefix || '';
      wrapper.appendChild(prefixEl);
    }

    // Input in the middle
    wrapper.appendChild(this.input);

    // Optional postfix (inside, before up button)
    let postfixEl = null;
    if (this.settings.postfix && String(this.settings.postfix).trim().length > 0) {
      postfixEl = doc.createElement('span');
      postfixEl.className = `ts-postfix ${this.settings.postfix_extraclass || ''}`.trim();
      postfixEl.setAttribute('data-touchspin-injected', 'postfix');
      if (testId) postfixEl.setAttribute('data-testid', `${testId}-postfix`);
      postfixEl.innerHTML = this.settings.postfix || '';
      wrapper.appendChild(postfixEl);
    }

    // Up button (right edge)
    const upBtn = doc.createElement('button');
    upBtn.type = 'button';
    upBtn.className = `ts-btn ts-btn-up ${this.settings.buttonup_class || ''}`.trim();
    upBtn.setAttribute('data-touchspin-injected', 'up');
    upBtn.setAttribute('aria-label', 'Increase');
    if (testId) upBtn.setAttribute('data-testid', `${testId}-up`);
    upBtn.innerHTML = this.settings.buttonup_txt || '+';
    wrapper.appendChild(upBtn);

    // Save for teardown and dynamic updates
    this.wrapper = wrapper;
    this._upBtn = upBtn;
    this._downBtn = downBtn;
    this._prefixEl = prefixEl;
    this._postfixEl = postfixEl;

    // Attach events via core API
    this.core.attachUpEvents(upBtn);
    this.core.attachDownEvents(downBtn);

    // Observe setting changes for live prefix/postfix updates
    this.core.observeSetting('prefix', (val) => {
      const has = val && String(val).trim().length > 0;
      if (has && !this._prefixEl) {
        const el = doc.createElement('span');
        el.className = `ts-prefix ${this.settings.prefix_extraclass || ''}`.trim();
        el.setAttribute('data-touchspin-injected', 'prefix');
        const testId2 = this.input.getAttribute('data-testid');
        if (testId2) el.setAttribute('data-testid', `${testId2}-prefix`);
        el.innerHTML = String(val);
        this.wrapper.insertBefore(el, this.input);
        this._prefixEl = el;
      } else if (!has && this._prefixEl) {
        this._prefixEl.remove();
        this._prefixEl = null;
      } else if (has && this._prefixEl) {
        this._prefixEl.innerHTML = String(val);
      }
    });

    this.core.observeSetting('postfix', (val) => {
      const has = val && String(val).trim().length > 0;
      if (has && !this._postfixEl) {
        const el = doc.createElement('span');
        el.className = `ts-postfix ${this.settings.postfix_extraclass || ''}`.trim();
        el.setAttribute('data-touchspin-injected', 'postfix');
        const testId2 = this.input.getAttribute('data-testid');
        if (testId2) el.setAttribute('data-testid', `${testId2}-postfix`);
        el.innerHTML = String(val);
        this.wrapper.insertBefore(el, this._upBtn);
        this._postfixEl = el;
      } else if (!has && this._postfixEl) {
        this._postfixEl.remove();
        this._postfixEl = null;
      } else if (has && this._postfixEl) {
        this._postfixEl.innerHTML = String(val);
      }
    });
  }
  // Use AbstractRenderer.teardown() default to remove injected elements and unwrap input
}

export default VanillaRenderer;
