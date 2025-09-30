"use strict";
var Bootstrap5Renderer = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/Bootstrap5Renderer.ts
  var Bootstrap5Renderer_exports = {};
  __export(Bootstrap5Renderer_exports, {
    default: () => Bootstrap5Renderer_default
  });

  // ../../core/dist/renderer.js
  var TOUCHSPIN_ATTRIBUTE = "data-touchspin-injected";
  var TEST_ID_ATTRIBUTE = "data-testid";
  var WRAPPER_TYPE_DEFAULT = "wrapper";
  var WRAPPER_TYPE_ADVANCED = "wrapper-advanced";
  var WRAPPER_READY_CLASS = "bootstrap-touchspin";
  var AbstractRenderer = class {
    constructor(input, settings, core) {
      this.wrapper = null;
      this.wrapperType = WRAPPER_TYPE_DEFAULT;
      this.input = input;
      this.settings = settings;
      this.core = core;
    }
    teardown() {
      this.removeInjectedElements();
    }
    removeInjectedElements() {
      this.removeInjectedNodesWithinWrapper();
      this.removeNearbyInjectedNodes();
    }
    finalizeWrapperAttributes() {
      if (!this.wrapper) return;
      const testId = this.input.getAttribute(TEST_ID_ATTRIBUTE);
      if (testId && !this.wrapper.hasAttribute(TEST_ID_ATTRIBUTE)) {
        this.wrapper.setAttribute(TEST_ID_ATTRIBUTE, `${testId}-wrapper`);
      }
      this.wrapper.setAttribute(TOUCHSPIN_ATTRIBUTE, this.wrapperType);
    }
    getUpButtonTestId() {
      return this.buildDataTestId("up");
    }
    getDownButtonTestId() {
      return this.buildDataTestId("down");
    }
    getPrefixTestId() {
      return this.buildDataTestId("prefix");
    }
    getPostfixTestId() {
      return this.buildDataTestId("postfix");
    }
    extractRendererSettings(schema, sourceSettings = this.settings) {
      const selected = {};
      for (const key in schema) {
        if (Object.prototype.hasOwnProperty.call(sourceSettings, key)) {
          selected[key] = sourceSettings[key];
        }
      }
      return selected;
    }
    // Backward compatibility alias
    projectRendererOptions(schema, from = this.settings) {
      return this.extractRendererSettings(schema, from);
    }
    removeInjectedNodesWithinWrapper() {
      const { wrapper } = this;
      if (!wrapper) return;
      wrapper.querySelectorAll(`[${TOUCHSPIN_ATTRIBUTE}]`).forEach((element) => element.remove());
      if (!wrapper.hasAttribute(TOUCHSPIN_ATTRIBUTE) || !wrapper.parentElement) {
        return;
      }
      const wrapperType = wrapper.getAttribute(TOUCHSPIN_ATTRIBUTE);
      if (wrapperType === WRAPPER_TYPE_ADVANCED) {
        wrapper.classList.remove(WRAPPER_READY_CLASS);
        wrapper.removeAttribute(TOUCHSPIN_ATTRIBUTE);
        return;
      }
      wrapper.parentElement.insertBefore(this.input, wrapper);
      wrapper.remove();
    }
    removeNearbyInjectedNodes() {
      const injectedNodes = document.querySelectorAll(`[${TOUCHSPIN_ATTRIBUTE}]`);
      injectedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node === this.input) return;
        if (!this.isNodeRelatedToInput(node)) return;
        node.remove();
      });
    }
    isNodeRelatedToInput(node) {
      const parent = node.parentElement;
      const inputParent = this.input.parentElement;
      const nodeContainsInput = node.contains(this.input);
      const parentContainsInput = parent?.contains(this.input) ?? false;
      const inputContainsNode = inputParent?.contains(node) ?? false;
      return nodeContainsInput || parentContainsInput || inputContainsNode;
    }
    buildDataTestId(suffix) {
      const base = this.input.getAttribute(TEST_ID_ATTRIBUTE);
      return base ? ` data-testid="${base}-${suffix}"` : "";
    }
  };
  var AbstractRenderer_default = AbstractRenderer;

  // src/Bootstrap5Renderer.ts
  var bootstrap5Schema = Object.freeze({
    // Button text
    buttonup_txt: { kind: "string" },
    buttondown_txt: { kind: "string" },
    // Button classes
    buttonup_class: { kind: "string" },
    buttondown_class: { kind: "string" },
    // Vertical layout
    verticalbuttons: { kind: "boolean" },
    verticalup: { kind: "string" },
    verticaldown: { kind: "string" },
    verticalupclass: { kind: "string" },
    verticaldownclass: { kind: "string" },
    // Prefix/postfix
    prefix: { kind: "string" },
    postfix: { kind: "string" },
    prefix_extraclass: { kind: "string" },
    postfix_extraclass: { kind: "string" }
  });
  var CSS_CLASSES = {
    FORM_CONTROL: "form-control",
    INPUT_GROUP: "input-group",
    INPUT_GROUP_TEXT: "input-group-text",
    BOOTSTRAP_TOUCHSPIN: "bootstrap-touchspin",
    BTN_VERTICAL: "input-group-btn-vertical",
    DEFAULT_BUTTON: "btn btn-outline-secondary"
  };
  var SELECTORS = {
    UP_BUTTON: '[data-touchspin-injected="up"]',
    DOWN_BUTTON: '[data-touchspin-injected="down"]',
    PREFIX: '[data-touchspin-injected="prefix"]',
    POSTFIX: '[data-touchspin-injected="postfix"]',
    VERTICAL_WRAPPER: '[data-touchspin-injected="vertical-wrapper"]'
  };
  var BUTTON_TEXT = {
    UP: "+",
    DOWN: "\u2212"
  };
  var INJECTED_TYPES = {
    UP: "up",
    DOWN: "down",
    PREFIX: "prefix",
    POSTFIX: "postfix",
    VERTICAL_WRAPPER: "vertical-wrapper"
  };
  var Bootstrap5Renderer = class extends AbstractRenderer_default {
    constructor(...args) {
      super(...args);
      __publicField(this, "initialInputGroup");
      __publicField(this, "opts", {});
      __publicField(this, "prefixEl", null);
      __publicField(this, "postfixEl", null);
      __publicField(this, "formControlAdded", false);
      const [input] = args;
      this.initialInputGroup = input.closest(`.${CSS_CLASSES.INPUT_GROUP}`);
    }
    init() {
      this.initializeOptions();
      this.resetElementReferences();
      this.ensureFormControlClass();
      this.buildAndAttachDOM();
      this.registerSettingObservers();
    }
    teardown() {
      this.restoreFormControlClass();
      super.teardown();
    }
    // Initialization helpers
    initializeOptions() {
      this.opts = this.extractRendererSettings(bootstrap5Schema);
    }
    resetElementReferences() {
      this.prefixEl = null;
      this.postfixEl = null;
    }
    ensureFormControlClass() {
      if (!this.input.classList.contains(CSS_CLASSES.FORM_CONTROL)) {
        this.input.classList.add(CSS_CLASSES.FORM_CONTROL);
        this.formControlAdded = true;
      }
    }
    restoreFormControlClass() {
      if (this.formControlAdded) {
        this.input.classList.remove(CSS_CLASSES.FORM_CONTROL);
        this.formControlAdded = false;
      }
    }
    // DOM building
    buildInputGroup() {
      const closestGroup = this.input.closest(`.${CSS_CLASSES.INPUT_GROUP}`);
      const existingInputGroup = closestGroup ?? this.initialInputGroup;
      return existingInputGroup ? this.buildAdvancedInputGroup(existingInputGroup) : this.buildBasicInputGroup();
    }
    buildBasicInputGroup() {
      const inputGroupSize = this.detectInputGroupSize();
      const wrapper = this.createInputGroupWrapper(inputGroupSize);
      this.appendElementsToWrapper(wrapper);
      this.insertWrapperAndInput(wrapper);
      this.positionInputWithinWrapper(wrapper);
      return wrapper;
    }
    buildAdvancedInputGroup(existingInputGroup) {
      existingInputGroup.classList.add(CSS_CLASSES.BOOTSTRAP_TOUCHSPIN);
      this.wrapperType = "wrapper-advanced";
      this.insertElementsIntoExistingGroup(existingInputGroup);
      this.storeElementReferences(existingInputGroup);
      return existingInputGroup;
    }
    createInputGroupWrapper(sizeClass) {
      const wrapper = document.createElement("div");
      wrapper.className = this.buildClasses([
        CSS_CLASSES.INPUT_GROUP,
        sizeClass,
        CSS_CLASSES.BOOTSTRAP_TOUCHSPIN
      ]);
      return wrapper;
    }
    appendElementsToWrapper(wrapper) {
      if (!this.opts.verticalbuttons) {
        wrapper.appendChild(this.createDownButton());
      }
      if (this.opts.prefix) {
        wrapper.appendChild(this.createPrefixElement());
      }
      if (this.opts.postfix) {
        wrapper.appendChild(this.createPostfixElement());
      }
      if (this.opts.verticalbuttons) {
        wrapper.appendChild(this.createVerticalButtonWrapper());
      } else {
        wrapper.appendChild(this.createUpButton());
      }
    }
    insertWrapperAndInput(wrapper) {
      if (this.input.parentElement) {
        this.input.parentElement.insertBefore(wrapper, this.input);
      }
    }
    positionInputWithinWrapper(wrapper) {
      const insertionPoint = this.findInputInsertionPoint(wrapper);
      wrapper.insertBefore(this.input, insertionPoint);
    }
    findInputInsertionPoint(wrapper) {
      if (this.opts.verticalbuttons) {
        return this.findVerticalInsertionPoint(wrapper);
      }
      return this.findHorizontalInsertionPoint(wrapper);
    }
    findVerticalInsertionPoint(wrapper) {
      const prefixEl = wrapper.querySelector(SELECTORS.PREFIX);
      const postfixEl = wrapper.querySelector(SELECTORS.POSTFIX);
      const verticalWrapper = wrapper.querySelector(SELECTORS.VERTICAL_WRAPPER);
      if (prefixEl) return prefixEl.nextSibling;
      if (postfixEl) return postfixEl;
      return verticalWrapper;
    }
    findHorizontalInsertionPoint(wrapper) {
      const prefixEl = wrapper.querySelector(SELECTORS.PREFIX);
      const postfixEl = wrapper.querySelector(SELECTORS.POSTFIX);
      const upButton = wrapper.querySelector(SELECTORS.UP_BUTTON);
      if (prefixEl) return prefixEl.nextSibling;
      if (postfixEl) return postfixEl;
      return upButton;
    }
    insertElementsIntoExistingGroup(existingInputGroup) {
      this.ensureInputInGroup(existingInputGroup);
      if (!this.opts.verticalbuttons) {
        existingInputGroup.insertBefore(this.createDownButton(), this.input);
      }
      if (this.opts.prefix) {
        existingInputGroup.insertBefore(this.createPrefixElement(), this.input);
      }
      if (this.opts.postfix) {
        existingInputGroup.insertBefore(this.createPostfixElement(), this.input.nextSibling);
      }
      if (this.opts.verticalbuttons) {
        const insertionPoint = this.opts.postfix ? existingInputGroup.querySelector(SELECTORS.POSTFIX)?.nextSibling ?? null : this.input.nextSibling;
        existingInputGroup.insertBefore(this.createVerticalButtonWrapper(), insertionPoint);
      } else {
        const insertionPoint = this.opts.postfix ? existingInputGroup.querySelector(SELECTORS.POSTFIX)?.nextSibling ?? null : this.input.nextSibling;
        existingInputGroup.insertBefore(this.createUpButton(), insertionPoint);
      }
    }
    ensureInputInGroup(existingInputGroup) {
      if (this.input.parentElement === existingInputGroup) {
        return;
      }
      existingInputGroup.appendChild(this.input);
    }
    // Element creation helpers
    createButton(type, isVertical = false) {
      const button = document.createElement("button");
      button.type = "button";
      button.tabIndex = this.settings.focusablebuttons ? 0 : -1;
      button.setAttribute("data-touchspin-injected", type);
      button.setAttribute("aria-label", type === "up" ? "Increase value" : "Decrease value");
      const inputTestId = this.input.getAttribute("data-testid");
      if (inputTestId) {
        button.setAttribute("data-testid", `${inputTestId}-${type}`);
      }
      button.className = this.getButtonClass(type, isVertical);
      const rawLabel = this.getButtonSetting(type, isVertical);
      const fallback = this.getButtonFallback(type);
      this.applyButtonLabel(button, rawLabel, fallback);
      return button;
    }
    createUpButton() {
      return this.createButton("up");
    }
    createDownButton() {
      return this.createButton("down");
    }
    createPrefixElement() {
      const element = document.createElement("span");
      element.className = this.buildClasses([
        CSS_CLASSES.INPUT_GROUP_TEXT,
        "bootstrap-touchspin-prefix",
        this.opts.prefix_extraclass
      ]);
      element.setAttribute("data-touchspin-injected", INJECTED_TYPES.PREFIX);
      element.textContent = this.opts.prefix || "";
      const inputTestId = this.input.getAttribute("data-testid");
      if (inputTestId) {
        element.setAttribute("data-testid", `${inputTestId}-prefix`);
      }
      return element;
    }
    createPostfixElement() {
      const element = document.createElement("span");
      element.className = this.buildClasses([
        CSS_CLASSES.INPUT_GROUP_TEXT,
        "bootstrap-touchspin-postfix",
        this.opts.postfix_extraclass
      ]);
      element.setAttribute("data-touchspin-injected", INJECTED_TYPES.POSTFIX);
      element.textContent = this.opts.postfix || "";
      const inputTestId = this.input.getAttribute("data-testid");
      if (inputTestId) {
        element.setAttribute("data-testid", `${inputTestId}-postfix`);
      }
      return element;
    }
    createVerticalButtonWrapper() {
      const wrapper = document.createElement("span");
      wrapper.className = this.buildClasses([
        CSS_CLASSES.INPUT_GROUP_TEXT,
        "bootstrap-touchspin-vertical-button-wrapper"
      ]);
      wrapper.setAttribute("data-touchspin-injected", INJECTED_TYPES.VERTICAL_WRAPPER);
      const buttonContainer = document.createElement("span");
      buttonContainer.className = CSS_CLASSES.BTN_VERTICAL;
      buttonContainer.appendChild(this.createButton("up", true));
      buttonContainer.appendChild(this.createButton("down", true));
      wrapper.appendChild(buttonContainer);
      return wrapper;
    }
    // Utility helpers
    buildClasses(classes) {
      return classes.filter(Boolean).join(" ");
    }
    getButtonClass(type, isVertical = false) {
      const baseClass = type === "up" ? this.opts.buttonup_class || CSS_CLASSES.DEFAULT_BUTTON : this.opts.buttondown_class || CSS_CLASSES.DEFAULT_BUTTON;
      const verticalClass = isVertical && type === "up" ? this.opts.verticalupclass || CSS_CLASSES.DEFAULT_BUTTON : isVertical && type === "down" ? this.opts.verticaldownclass || CSS_CLASSES.DEFAULT_BUTTON : "";
      return this.buildClasses([
        baseClass,
        verticalClass,
        `bootstrap-touchspin-${type}`
      ]);
    }
    getButtonSetting(type, isVertical) {
      return isVertical ? type === "up" ? this.opts.verticalup : this.opts.verticaldown : type === "up" ? this.opts.buttonup_txt : this.opts.buttondown_txt;
    }
    getButtonFallback(type) {
      return type === "up" ? BUTTON_TEXT.UP : BUTTON_TEXT.DOWN;
    }
    detectInputGroupSize() {
      const classList = this.input.className;
      if (classList.includes("form-control-sm")) return "input-group-sm";
      if (classList.includes("form-control-lg")) return "input-group-lg";
      return "";
    }
    findInjectedElement(type) {
      return this.wrapper?.querySelector(`[data-touchspin-injected="${type}"]`);
    }
    // DOM building coordination
    buildAndAttachDOM() {
      this.initializeOptions();
      this.wrapper = this.buildInputGroup();
      this.storeElementReferences(this.wrapper);
      this.attachEventsToButtons();
    }
    storeElementReferences(wrapper) {
      if (!wrapper) return;
      this.prefixEl = wrapper.querySelector(SELECTORS.PREFIX);
      this.postfixEl = wrapper.querySelector(SELECTORS.POSTFIX);
    }
    attachEventsToButtons() {
      if (!this.wrapper) return;
      const upButton = this.wrapper.querySelector(SELECTORS.UP_BUTTON);
      const downButton = this.wrapper.querySelector(SELECTORS.DOWN_BUTTON);
      this.core.attachUpEvents(upButton instanceof HTMLElement ? upButton : null);
      this.core.attachDownEvents(downButton instanceof HTMLElement ? downButton : null);
    }
    // Setting observers
    registerSettingObservers() {
      this.core.observeSetting("prefix", (value) => this.updatePrefix(value));
      this.core.observeSetting("postfix", (value) => this.updatePostfix(value));
      this.core.observeSetting("buttonup_class", (value) => this.updateButtonClass("up", value));
      this.core.observeSetting("buttondown_class", (value) => this.updateButtonClass("down", value));
      this.core.observeSetting("verticalupclass", (value) => this.updateVerticalButtonClass("up", value));
      this.core.observeSetting("verticaldownclass", (value) => this.updateVerticalButtonClass("down", value));
      this.core.observeSetting("verticalup", (value) => this.updateVerticalButtonText("up", value));
      this.core.observeSetting("verticaldown", (value) => this.updateVerticalButtonText("down", value));
      this.core.observeSetting("buttonup_txt", (value) => this.updateButtonText("up", value));
      this.core.observeSetting("buttondown_txt", (value) => this.updateButtonText("down", value));
      this.core.observeSetting("prefix_extraclass", () => this.updatePrefixClasses());
      this.core.observeSetting("postfix_extraclass", () => this.updatePostfixClasses());
      this.core.observeSetting("verticalbuttons", (value) => this.handleVerticalButtonsChange(value));
      this.core.observeSetting("focusablebuttons", (value) => this.updateButtonFocusability(value));
    }
    // Update methods
    updatePrefix(value) {
      if (value && value !== "") {
        if (this.prefixEl) {
          this.prefixEl.textContent = value;
          this.prefixEl.style.display = "";
          this.updatePrefixClasses();
        } else {
          this.rebuildDOM();
        }
      } else if (this.prefixEl) {
        this.rebuildDOM();
      }
    }
    updatePostfix(value) {
      if (value && value !== "") {
        if (this.postfixEl) {
          this.postfixEl.textContent = value;
          this.postfixEl.style.display = "";
          this.updatePostfixClasses();
        } else {
          this.rebuildDOM();
        }
      } else if (this.postfixEl) {
        this.rebuildDOM();
      }
    }
    updateButtonClass(type, className) {
      const button = this.findInjectedElement(type);
      if (button) {
        button.className = this.buildClasses([
          className || CSS_CLASSES.DEFAULT_BUTTON,
          `bootstrap-touchspin-${type}`
        ]);
      }
    }
    updateVerticalButtonClass(type, className) {
      const verticalWrapper = this.findInjectedElement(INJECTED_TYPES.VERTICAL_WRAPPER);
      const button = verticalWrapper?.querySelector(`[data-touchspin-injected="${type}"]`);
      if (button) {
        this.initializeOptions();
        const baseClass = type === "up" ? this.opts.buttonup_class ?? CSS_CLASSES.DEFAULT_BUTTON : this.opts.buttondown_class ?? CSS_CLASSES.DEFAULT_BUTTON;
        button.className = this.buildClasses([
          baseClass,
          className ?? CSS_CLASSES.DEFAULT_BUTTON,
          `bootstrap-touchspin-${type}`
        ]);
      }
    }
    updateVerticalButtonText(type, text) {
      const verticalWrapper = this.findInjectedElement(INJECTED_TYPES.VERTICAL_WRAPPER);
      const button = verticalWrapper ? verticalWrapper.querySelector(`[data-touchspin-injected="${type}"]`) : null;
      if (button) {
        this.initializeOptions();
        const fallback = this.getButtonFallback(type);
        const raw = text ?? this.getButtonSetting(type, true);
        this.applyButtonLabel(button, raw, fallback);
      }
    }
    updateButtonText(type, text) {
      const button = this.findInjectedElement(type);
      if (button) {
        this.initializeOptions();
        const fallback = this.getButtonFallback(type);
        const raw = text ?? this.getButtonSetting(type, false);
        this.applyButtonLabel(button, raw, fallback);
      }
    }
    updatePrefixClasses() {
      if (this.prefixEl) {
        this.initializeOptions();
        this.prefixEl.className = this.buildClasses([
          CSS_CLASSES.INPUT_GROUP_TEXT,
          "bootstrap-touchspin-prefix",
          this.opts.prefix_extraclass
        ]);
      }
    }
    updatePostfixClasses() {
      if (this.postfixEl) {
        this.initializeOptions();
        this.postfixEl.className = this.buildClasses([
          CSS_CLASSES.INPUT_GROUP_TEXT,
          "bootstrap-touchspin-postfix",
          this.opts.postfix_extraclass
        ]);
      }
    }
    updateButtonFocusability(newValue) {
      if (!this.wrapper) return;
      const buttons = this.wrapper.querySelectorAll(`${SELECTORS.UP_BUTTON}, ${SELECTORS.DOWN_BUTTON}`);
      const tabindex = newValue ? "0" : "-1";
      buttons.forEach((button) => {
        button.setAttribute("tabindex", tabindex);
      });
    }
    handleVerticalButtonsChange(_newValue) {
      this.rebuildDOM();
    }
    rebuildDOM() {
      this.removeInjectedElements();
      this.resetStateAfterRemoval();
      this.buildAndAttachDOM();
      if (this.wrapper) {
        this.finalizeWrapperAttributes();
      }
    }
    resetStateAfterRemoval() {
      this.wrapper = null;
      this.prefixEl = null;
      this.postfixEl = null;
    }
    applyButtonLabel(button, raw, fallback) {
      const { value, isHtml } = this.resolveButtonContent(raw, fallback);
      if (isHtml) {
        button.innerHTML = value;
        return;
      }
      button.textContent = value;
    }
    resolveButtonContent(raw, fallback) {
      if (raw === void 0 || raw === null) {
        return { value: fallback, isHtml: false };
      }
      const trimmed = raw.trim();
      if (trimmed === "") {
        return { value: fallback, isHtml: false };
      }
      if (this.containsHtml(trimmed)) {
        return { value: trimmed, isHtml: true };
      }
      const decoded = this.decodeHtml(trimmed);
      if (decoded === void 0 || decoded === "") {
        return { value: fallback, isHtml: false };
      }
      return { value: decoded, isHtml: false };
    }
    containsHtml(value) {
      return /<\/?[a-zA-Z][\s\S]*>/.test(value);
    }
    decodeHtml(value) {
      if (typeof document === "undefined" || !value.includes("&")) return value;
      const parser = document.createElement("textarea");
      parser.innerHTML = value;
      return parser.value;
    }
  };
  var Bootstrap5Renderer_default = Bootstrap5Renderer;
  return __toCommonJS(Bootstrap5Renderer_exports);
})();
//# sourceMappingURL=Bootstrap5Renderer.global.js.map