// src/TouchSpinInput.ts
import { TouchSpin } from "@touchspin/core";
import { VanillaRenderer } from "@touchspin/renderer-vanilla";

// src/attribute-mapping.ts
function attributeToSetting(attrName) {
  const mapping = {
    "vertical-buttons": "verticalbuttons",
    "vertical-up": "verticalup",
    "vertical-down": "verticaldown",
    "vertical-up-class": "verticalupclass",
    "vertical-down-class": "verticaldownclass",
    "button-up-class": "buttonup_class",
    "button-down-class": "buttondown_class",
    "button-up-txt": "buttonup_txt",
    "button-down-txt": "buttondown_txt",
    "prefix-class": "prefix_extraclass",
    "postfix-class": "postfix_extraclass",
    "force-step-divisibility": "forcestepdivisibility",
    "step-interval": "stepinterval",
    "step-interval-delay": "stepintervaldelay",
    "boost-at": "boostat",
    "max-boosted-step": "maxboostedstep",
    "mouse-wheel": "mousewheel",
    "init-val": "initval",
    "replacement-val": "replacementval",
    "focusable-buttons": "focusablebuttons"
  };
  return mapping[attrName] || attrName;
}
function parseAttributeValue(value, settingName) {
  if (value === null) return null;
  if (value === "") return true;
  const booleanSettings = [
    "verticalbuttons",
    "mousewheel",
    "booster",
    "focusablebuttons"
  ];
  if (booleanSettings.includes(settingName)) {
    return value === "true" || value === "";
  }
  const numberSettings = [
    "min",
    "max",
    "step",
    "decimals",
    "stepinterval",
    "stepintervaldelay",
    "boostat",
    "maxboostedstep",
    "firstclickvalueifempty"
  ];
  if (numberSettings.includes(settingName)) {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }
  return value;
}
function getSettingsFromAttributes(element) {
  const settings = {};
  for (const attr of Array.from(element.attributes)) {
    if (attr.name === "is" || attr.name.startsWith("data-testid")) {
      continue;
    }
    const settingName = attributeToSetting(attr.name);
    const value = parseAttributeValue(attr.value, settingName);
    if (value !== null) {
      settings[settingName] = value;
    }
  }
  return settings;
}
var OBSERVED_ATTRIBUTES = [
  "min",
  "max",
  "step",
  "value",
  "decimals",
  "prefix",
  "postfix",
  "vertical-buttons",
  "vertical-up",
  "vertical-down",
  "button-up-txt",
  "button-down-txt",
  "mouse-wheel",
  "disabled",
  "readonly",
  "renderer",
  "force-step-divisibility",
  "step-interval",
  "step-interval-delay",
  "booster",
  "boost-at",
  "max-boosted-step"
];

// src/event-bridge.ts
import { CORE_EVENTS } from "@touchspin/core";
var EVENT_NAME_MAP = {
  [CORE_EVENTS.MIN]: "touchspin-min",
  [CORE_EVENTS.MAX]: "touchspin-max",
  [CORE_EVENTS.START_SPIN]: "touchspin-start-spin",
  [CORE_EVENTS.START_UP]: "touchspin-start-up",
  [CORE_EVENTS.START_DOWN]: "touchspin-start-down",
  [CORE_EVENTS.STOP_SPIN]: "touchspin-stop-spin",
  [CORE_EVENTS.STOP_UP]: "touchspin-stop-up",
  [CORE_EVENTS.STOP_DOWN]: "touchspin-stop-down"
};
function bridgeEvents(touchspinInstance, element) {
  const cleanupFunctions = [];
  const domToCustomEventMap = {
    "touchspin.on.min": "touchspin-min",
    "touchspin.on.max": "touchspin-max",
    "touchspin.on.startspin": "touchspin-start-spin",
    "touchspin.on.startupspin": "touchspin-start-up",
    "touchspin.on.startdownspin": "touchspin-start-down",
    "touchspin.on.stopspin": "touchspin-stop-spin",
    "touchspin.on.stopupspin": "touchspin-stop-up",
    "touchspin.on.stopdownspin": "touchspin-stop-down"
  };
  Object.entries(domToCustomEventMap).forEach(([domEventName, customEventName]) => {
    const handler = (e) => {
      const customEvent = new CustomEvent(customEventName, {
        detail: {
          value: touchspinInstance.getValue(),
          instance: touchspinInstance,
          originalEvent: e
        },
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(customEvent);
    };
    const input2 = element.querySelector("input");
    if (input2) {
      input2.addEventListener(domEventName, handler);
      cleanupFunctions.push(() => input2.removeEventListener(domEventName, handler));
    }
  });
  const input = element.querySelector("input");
  if (input) {
    const handleInputChange = (e) => {
      const customEvent = new CustomEvent("touchspin-change", {
        detail: {
          value: e.target.value,
          originalEvent: e,
          instance: touchspinInstance
        },
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(customEvent);
    };
    input.addEventListener("change", handleInputChange);
    cleanupFunctions.push(() => input.removeEventListener("change", handleInputChange));
  }
  return cleanupFunctions;
}
function getAvailableEvents() {
  return [
    ...Object.values(EVENT_NAME_MAP),
    "touchspin-change"
    // Input change event
  ];
}

// src/TouchSpinInput.ts
var TouchSpinInput = class extends HTMLElement {
  /**
   * Observed attributes for reactive updates
   */
  static get observedAttributes() {
    return OBSERVED_ATTRIBUTES;
  }
  constructor() {
    super();
    this._touchspin = null;
    this._input = null;
    this._eventUnsubscribers = [];
    this._isConnected = false;
  }
  /**
   * Called when element is inserted into DOM
   */
  connectedCallback() {
    this._isConnected = true;
    this._initialize();
  }
  /**
   * Called when element is removed from DOM
   */
  disconnectedCallback() {
    this._isConnected = false;
    this._cleanup();
  }
  /**
   * Called when observed attributes change
   * @param {string} name - Attribute name
   * @param {string|null} oldValue - Previous value
   * @param {string|null} newValue - New value
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (!this._isConnected || !this._touchspin) return;
    if (name === "value") {
      if (newValue !== oldValue) {
        this._touchspin.setValue(newValue ?? "");
      }
      return;
    }
    if (name === "disabled") {
      if (this._input) {
        this._input.disabled = newValue !== null;
      }
      return;
    }
    if (name === "readonly") {
      if (this._input) {
        this._input.readOnly = newValue !== null;
      }
      return;
    }
    if (name === "renderer") {
      this._handleRendererChange(newValue ?? "");
      return;
    }
    const settingName = attributeToSetting(name);
    const value = parseAttributeValue(newValue, settingName);
    if (this._touchspin && this._touchspin.updateSettings) {
      this._touchspin.updateSettings({ [settingName]: value });
    }
  }
  /**
   * Initialize TouchSpin instance
   * @private
   */
  _initialize() {
    this._input = this.querySelector('input[type="number"]') || this.querySelector("input");
    if (!this._input) {
      this._input = document.createElement("input");
      this._input.type = "number";
      this.appendChild(this._input);
    }
    const settings = getSettingsFromAttributes(this);
    if (!settings.renderer) {
      settings.renderer = VanillaRenderer;
    } else if (typeof settings.renderer === "string") {
      settings.renderer = this._resolveRenderer(settings.renderer);
    }
    this._applyInputAttributes();
    this._touchspin = TouchSpin(this._input, settings);
    if (this._touchspin) {
      this._eventUnsubscribers = bridgeEvents(this._touchspin, this);
    }
  }
  /**
   * Apply HTML attributes to input element
   * @private
   */
  _applyInputAttributes() {
    if (!this._input) return;
    const value = this.getAttribute("value");
    if (value !== null) {
      this._input.value = value;
    }
    if (this.hasAttribute("disabled")) {
      this._input.disabled = true;
    }
    if (this.hasAttribute("readonly")) {
      this._input.readOnly = true;
    }
    const nativeAttributes = ["min", "max", "step", "placeholder"];
    for (const attr of nativeAttributes) {
      const value2 = this.getAttribute(attr);
      if (value2 !== null) {
        this._input.setAttribute(attr, String(value2));
      }
    }
  }
  /**
   * Handle renderer changes
   * @param {string} rendererName - Name of renderer to switch to
   * @private
   */
  _handleRendererChange(rendererName) {
    if (!rendererName || !this._touchspin) return;
    const renderer = this._resolveRenderer(rendererName);
    if (renderer) {
      this._cleanup();
      this._initialize();
    }
  }
  /**
   * Resolve renderer from string name
   * @param {string} name - Renderer name
   * @returns {Function|null} - Renderer class
   * @private
   */
  _resolveRenderer(name) {
    if (name === "VanillaRenderer" || name === "vanilla") {
      return VanillaRenderer;
    }
    console.warn(`Unknown renderer: ${name}, falling back to VanillaRenderer`);
    return VanillaRenderer;
  }
  /**
   * Cleanup TouchSpin instance and event listeners
   * @private
   */
  _cleanup() {
    this._eventUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this._eventUnsubscribers = [];
    if (this._touchspin && this._touchspin.destroy) {
      this._touchspin.destroy();
    }
    this._touchspin = null;
  }
  // Public API - Properties
  /**
   * Get/set current value
   */
  get value() {
    return this._touchspin ? this._touchspin.getValue() : this._input ? this._input.value : "";
  }
  set value(val) {
    this.setAttribute("value", String(val));
  }
  /**
   * Get/set minimum value
   */
  get min() {
    return this.getAttribute("min");
  }
  set min(val) {
    if (val === null) this.removeAttribute("min");
    else this.setAttribute("min", String(val));
  }
  /**
   * Get/set maximum value
   */
  get max() {
    return this.getAttribute("max");
  }
  set max(val) {
    if (val === null) this.removeAttribute("max");
    else this.setAttribute("max", String(val));
  }
  /**
   * Get/set step value
   */
  get step() {
    return this.getAttribute("step");
  }
  set step(val) {
    if (val === null) this.removeAttribute("step");
    else this.setAttribute("step", String(val));
  }
  /**
   * Get/set disabled state
   */
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(val) {
    if (val) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }
  /**
   * Get/set readonly state
   */
  get readonly() {
    return this.hasAttribute("readonly");
  }
  set readonly(val) {
    if (val) {
      this.setAttribute("readonly", "");
    } else {
      this.removeAttribute("readonly");
    }
  }
  // Public API - Methods
  /**
   * Increment value once
   */
  upOnce() {
    if (this._touchspin && this._touchspin.upOnce) {
      this._touchspin.upOnce();
    }
  }
  /**
   * Decrement value once
   */
  downOnce() {
    if (this._touchspin && this._touchspin.downOnce) {
      this._touchspin.downOnce();
    }
  }
  /**
   * Start spinning up
   */
  startUpSpin() {
    if (this._touchspin && this._touchspin.startUpSpin) {
      this._touchspin.startUpSpin();
    }
  }
  /**
   * Start spinning down
   */
  startDownSpin() {
    if (this._touchspin && this._touchspin.startDownSpin) {
      this._touchspin.startDownSpin();
    }
  }
  /**
   * Stop spinning
   */
  stopSpin() {
    if (this._touchspin && this._touchspin.stopSpin) {
      this._touchspin.stopSpin();
    }
  }
  /**
   * Update TouchSpin settings
   * @param {Object} options - Settings to update
   */
  updateSettings(options) {
    if (this._touchspin && this._touchspin.updateSettings) {
      this._touchspin.updateSettings(options);
    }
  }
  /**
   * Get TouchSpin instance (for advanced usage)
   * @returns {Object|null} - TouchSpin instance
   */
  getTouchSpinInstance() {
    return this._touchspin;
  }
  /**
   * Manually destroy and cleanup
   */
  destroy() {
    this._cleanup();
  }
};

// src/index.ts
if (!customElements.get("touchspin-input")) {
  customElements.define("touchspin-input", TouchSpinInput);
}
var index_default = TouchSpinInput;
export {
  EVENT_NAME_MAP,
  OBSERVED_ATTRIBUTES,
  TouchSpinInput,
  attributeToSetting,
  bridgeEvents,
  index_default as default,
  getAvailableEvents,
  getSettingsFromAttributes,
  parseAttributeValue
};
//# sourceMappingURL=index.js.map