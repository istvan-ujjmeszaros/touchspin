// src/VanillaRenderer.ts
import { AbstractRenderer } from "@touchspin/core/renderer";
var VanillaRenderer = class extends AbstractRenderer {
  constructor() {
    super(...arguments);
    this.prefixEl = null;
    this.postfixEl = null;
  }
  init() {
    this.prefixEl = null;
    this.postfixEl = null;
    this.wrapper = this.buildInputGroup();
    const wrapper = this.wrapper;
    if (!wrapper) return;
    const upButtonEl = wrapper.querySelector('[data-touchspin-injected="up"]');
    const downButtonEl = wrapper.querySelector('[data-touchspin-injected="down"]');
    this.prefixEl = wrapper.querySelector('[data-touchspin-injected="prefix"]');
    this.postfixEl = wrapper.querySelector('[data-touchspin-injected="postfix"]');
    const upButton = upButtonEl instanceof HTMLElement ? upButtonEl : null;
    const downButton = downButtonEl instanceof HTMLElement ? downButtonEl : null;
    this.core.attachUpEvents(upButton);
    this.core.attachDownEvents(downButton);
    this.core.observeSetting("prefix", (newValue) => this.updatePrefix(newValue));
    this.core.observeSetting("postfix", (newValue) => this.updatePostfix(newValue));
    this.core.observeSetting("buttonup_class", (newValue) => this.updateButtonClass("up", newValue));
    this.core.observeSetting("buttondown_class", (newValue) => this.updateButtonClass("down", newValue));
    this.core.observeSetting("verticalupclass", (newValue) => this.updateVerticalButtonClass("up", newValue));
    this.core.observeSetting("verticaldownclass", (newValue) => this.updateVerticalButtonClass("down", newValue));
    this.core.observeSetting("verticalup", (newValue) => this.updateVerticalButtonText("up", newValue));
    this.core.observeSetting("verticaldown", (newValue) => this.updateVerticalButtonText("down", newValue));
    this.core.observeSetting("buttonup_txt", (newValue) => this.updateButtonText("up", newValue));
    this.core.observeSetting("buttondown_txt", (newValue) => this.updateButtonText("down", newValue));
    this.core.observeSetting("prefix_extraclass", (newValue) => this.updatePrefixClasses());
    this.core.observeSetting("postfix_extraclass", (newValue) => this.updatePostfixClasses());
    this.core.observeSetting("verticalbuttons", (newValue) => this.handleVerticalButtonsChange(newValue));
    this.core.observeSetting("focusablebuttons", (newValue) => this.updateButtonFocusability(newValue));
  }
  buildInputGroup() {
    const isVertical = this.settings.verticalbuttons;
    let html;
    if (isVertical) {
      html = `
        <div class="ts-wrapper ts-wrapper--vertical" data-touchspin-injected="wrapper">
          <span class="ts-addon ts-prefix ${this.settings.prefix_extraclass || ""}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix || ""}</span>
          <span class="ts-addon ts-postfix ${this.settings.postfix_extraclass || ""}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix || ""}</span>
          ${this.buildVerticalButtons()}
        </div>
      `;
    } else {
      html = `
        <div class="ts-wrapper" data-touchspin-injected="wrapper">
          <button 
            tabindex="${this.settings.focusablebuttons ? "0" : "-1"}" 
            class="ts-btn ts-btn--down ${this.settings.buttondown_class || ""}" 
            data-touchspin-injected="down"${this.getDownButtonTestId()} 
            type="button" 
            aria-label="Decrease value"
            ${this.input.disabled ? "disabled" : ""}
          >${this.settings.buttondown_txt || "\u2212"}</button>
          <span class="ts-addon ts-prefix ${this.settings.prefix_extraclass || ""}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix || ""}</span>
          <span class="ts-addon ts-postfix ${this.settings.postfix_extraclass || ""}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix || ""}</span>
          <button 
            tabindex="${this.settings.focusablebuttons ? "0" : "-1"}" 
            class="ts-btn ts-btn--up ${this.settings.buttonup_class || ""}" 
            data-touchspin-injected="up"${this.getUpButtonTestId()} 
            type="button" 
            aria-label="Increase value"
            ${this.input.disabled ? "disabled" : ""}
          >${this.settings.buttonup_txt || "+"}</button>
        </div>
      `;
    }
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html.trim();
    const wrapper = tempDiv.firstChild;
    const parent = this.input.parentElement;
    if (parent) {
      parent.insertBefore(wrapper, this.input);
    }
    const postfixEl = wrapper.querySelector('[data-touchspin-injected="postfix"]');
    if (postfixEl) {
      wrapper.insertBefore(this.input, postfixEl);
    } else {
      const upButton = wrapper.querySelector('[data-touchspin-injected="up"]');
      wrapper.insertBefore(this.input, upButton);
    }
    this.input.classList.add("ts-input");
    this.hideEmptyPrefixPostfix(wrapper);
    return wrapper;
  }
  buildVerticalButtons() {
    return `
      <div class="ts-vertical-wrapper" data-touchspin-injected="vertical-wrapper">
        <button tabindex="${this.settings.focusablebuttons ? "0" : "-1"}" class="ts-btn ts-btn--vertical ts-btn--vertical-up ${this.settings.verticalupclass || ""}" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.settings.verticalup || "+"}</button>
        <button tabindex="${this.settings.focusablebuttons ? "0" : "-1"}" class="ts-btn ts-btn--vertical ts-btn--vertical-down ${this.settings.verticaldownclass || ""}" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.settings.verticaldown || "\u2212"}</button>
      </div>
    `;
  }
  hideEmptyPrefixPostfix(wrapper = this.wrapper) {
    const prefixEl = this.prefixEl || wrapper?.querySelector('[data-touchspin-injected="prefix"]');
    const postfixEl = this.postfixEl || wrapper?.querySelector('[data-touchspin-injected="postfix"]');
    if (prefixEl && (!this.settings.prefix || this.settings.prefix === "")) {
      prefixEl.style.display = "none";
    }
    if (postfixEl && (!this.settings.postfix || this.settings.postfix === "")) {
      postfixEl.style.display = "none";
    }
  }
  updatePrefix(value) {
    const prefixEl = this.prefixEl;
    if (!prefixEl) return;
    if (value && value !== "") {
      prefixEl.textContent = value;
      prefixEl.style.display = "";
      prefixEl.className = `ts-addon ts-prefix ${this.settings.prefix_extraclass || ""}`.trim();
    } else {
      prefixEl.style.display = "none";
    }
  }
  updatePostfix(value) {
    const postfixEl = this.postfixEl;
    if (!postfixEl) return;
    if (value && value !== "") {
      postfixEl.textContent = value;
      postfixEl.style.display = "";
      postfixEl.className = `ts-addon ts-postfix ${this.settings.postfix_extraclass || ""}`.trim();
    } else {
      postfixEl.style.display = "none";
    }
  }
  updateButtonClass(type, className) {
    if (!this.wrapper) return;
    const button = this.wrapper.querySelector(`[data-touchspin-injected="${type}"]`);
    if (!button) return;
    const baseClasses = `ts-btn ts-btn--${type}`;
    const verticalClass = button.classList.contains("ts-btn--vertical") ? " ts-btn--vertical" : "";
    button.className = `${baseClasses}${verticalClass} ${className || ""}`.trim();
  }
  updateVerticalButtonClass(type, className) {
    if (!this.wrapper) return;
    const verticalWrapper = this.wrapper.querySelector('[data-touchspin-injected="vertical-wrapper"]');
    if (!verticalWrapper) return;
    const button = verticalWrapper.querySelector(`[data-touchspin-injected="${type}"]`);
    if (!button) return;
    const baseClasses = `ts-btn ts-btn--${type} ts-btn--vertical`;
    const buttonClass = this.settings.buttonup_class || this.settings.buttondown_class || "";
    button.className = `${baseClasses} ${buttonClass} ${className || ""}`.trim();
  }
  updateVerticalButtonText(type, text) {
    if (!this.wrapper) return;
    const verticalWrapper = this.wrapper.querySelector('[data-touchspin-injected="vertical-wrapper"]');
    if (!verticalWrapper) return;
    const button = verticalWrapper.querySelector(`[data-touchspin-injected="${type}"]`);
    if (button) {
      button.textContent = text || (type === "up" ? "+" : "\u2212");
    }
  }
  updateButtonText(type, text) {
    if (!this.wrapper) return;
    const button = this.wrapper.querySelector(`[data-touchspin-injected="${type}"]`);
    if (button) {
      button.textContent = text || (type === "up" ? "+" : "\u2212");
    }
  }
  updatePrefixClasses() {
    const prefixEl = this.prefixEl;
    if (prefixEl) {
      prefixEl.className = `ts-addon ts-prefix ${this.settings.prefix_extraclass || ""}`.trim();
    }
  }
  updatePostfixClasses() {
    const postfixEl = this.postfixEl;
    if (postfixEl) {
      postfixEl.className = `ts-addon ts-postfix ${this.settings.postfix_extraclass || ""}`.trim();
    }
  }
  handleVerticalButtonsChange(_newValue) {
    this.rebuildDOM();
  }
  rebuildDOM() {
    this.removeInjectedElements();
    this.wrapper = null;
    this.prefixEl = null;
    this.postfixEl = null;
    this.buildAndAttachDOM();
    if (this.wrapper) {
      this.finalizeWrapperAttributes();
    }
  }
  buildAndAttachDOM() {
    this.wrapper = this.buildInputGroup();
    const wrapper = this.wrapper;
    if (!wrapper) return;
    const upButtonEl = wrapper.querySelector('[data-touchspin-injected="up"]');
    const downButtonEl = wrapper.querySelector('[data-touchspin-injected="down"]');
    this.prefixEl = wrapper.querySelector('[data-touchspin-injected="prefix"]');
    this.postfixEl = wrapper.querySelector('[data-touchspin-injected="postfix"]');
    const upButton = upButtonEl instanceof HTMLElement ? upButtonEl : null;
    const downButton = downButtonEl instanceof HTMLElement ? downButtonEl : null;
    this.core.attachUpEvents(upButton);
    this.core.attachDownEvents(downButton);
  }
  updateButtonFocusability(newValue) {
    if (!this.wrapper) return;
    const buttons = this.wrapper.querySelectorAll('[data-touchspin-injected="up"], [data-touchspin-injected="down"]');
    const tabindex = newValue ? "0" : "-1";
    buttons.forEach((button) => {
      button.setAttribute("tabindex", tabindex);
    });
  }
  /**
   * Apply theme via CSS custom properties
   * @param {Object} theme - Theme object with CSS property values
   */
  // Accept any record of CSS custom property values (read-only for clarity)
  setTheme(theme) {
    const wrapper = this.wrapper;
    if (!wrapper || !theme) return;
    Object.entries(theme).forEach(([key, value]) => {
      const cssProperty = key.startsWith("--") ? key : `--ts-${key}`;
      wrapper.style.setProperty(cssProperty, value);
    });
  }
  teardown() {
    this.input.classList.remove("ts-input");
    super.teardown();
  }
};
var VanillaRenderer_default = VanillaRenderer;

export {
  VanillaRenderer_default
};
//# sourceMappingURL=chunk-LEGPSPNV.js.map