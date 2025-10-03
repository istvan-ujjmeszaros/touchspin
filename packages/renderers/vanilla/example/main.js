import { TouchSpin } from '@touchspin/core';
import VanillaRenderer from '@touchspin/renderers/vanilla';

// Default settings
const DEFAULT_SETTINGS = {
  min: 0,
  max: 100,
  step: 1,
  decimals: 0,
  stepinterval: 100,
  stepintervaldelay: 500,
  initval: 50,
  firstclickvalueifempty: null,
  replacementval: '',
  booster: true,
  boostat: 10,
  maxboostedstep: 10,
  forcestepdivisibility: 'round',
  verticalbuttons: false,
  verticalup: '▲',
  verticaldown: '▼',
  verticalupclass: '',
  verticaldownclass: '',
  mousewheel: true,
  focusablebuttons: false,
  buttonup_txt: '+',
  buttondown_txt: '−',
  prefix: '',
  postfix: '',
  prefix_extraclass: '',
  postfix_extraclass: '',
  buttonup_class: '',
  buttondown_class: '',
};

// Current settings
let currentSettings = { ...DEFAULT_SETTINGS };
let demoInstance = null;
let staticInstances = [];
let eventCount = 0;

// Storage keys
const STORAGE_KEY = 'touchspin-vanilla-demo-settings';
const CSS_VARS_STORAGE_KEY = 'touchspin-vanilla-css-vars';

// Load settings from localStorage
function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      currentSettings = { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load settings:', e);
  }
}

// Save settings to localStorage
function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

// Load CSS variables from localStorage
function loadCSSVariables() {
  try {
    const stored = localStorage.getItem(CSS_VARS_STORAGE_KEY);
    if (stored) {
      const vars = JSON.parse(stored);
      Object.entries(vars).forEach(([varName, value]) => {
        // Apply to DOM
        document.documentElement.style.setProperty(varName, value);
        // Update text input
        const textInput = document.querySelector(`input[data-var="${varName}"]`);
        if (textInput) {
          textInput.value = value;
        }
        // Update color picker if it's a color value
        if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
          const colorPicker = document.querySelector(`input[data-var-color="${varName}"]`);
          if (colorPicker) {
            colorPicker.value = value;
          }
        }
      });
    }
  } catch (e) {
    console.warn('Failed to load CSS variables:', e);
  }
}

// Save CSS variables to localStorage
function saveCSSVariables() {
  try {
    const vars = {};
    document.querySelectorAll('[data-var]').forEach((input) => {
      const varName = input.getAttribute('data-var');
      vars[varName] = input.value;
    });
    localStorage.setItem(CSS_VARS_STORAGE_KEY, JSON.stringify(vars));
  } catch (e) {
    console.warn('Failed to save CSS variables:', e);
  }
}

// Reset CSS variables to defaults
function resetCSSVariables() {
  const defaults = {
    '--ts-wrapper-background-color': '#ffffff',
    '--ts-wrapper-border-color': '#d1d5db',
    '--ts-wrapper-border-width': '1px',
    '--ts-wrapper-border-radius': '0.375rem',
    '--ts-wrapper-box-shadow': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '--ts-wrapper-focus-border-color': '#3b82f6',
    '--ts-wrapper-focus-box-shadow':
      '0 0 0 2px rgb(59 130 246 / 0.2), 0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '--ts-wrapper-disabled-background-color': '#f9fafb',
    '--ts-wrapper-disabled-opacity': '0.6',
    '--ts-wrapper-readonly-background-color': '#f9fafb',
    '--ts-input-text-color': '#111827',
    '--ts-input-placeholder-color': '#6b7280',
    '--ts-input-font-size': '1rem',
    '--ts-input-padding': '0.5rem 0.75rem',
    '--ts-button-background-color': '#f3f4f6',
    '--ts-button-background-color-hover': '#e5e7eb',
    '--ts-button-background-color-active': '#d1d5db',
    '--ts-button-text-color': '#374151',
    '--ts-button-font-weight': '500',
    '--ts-button-padding': '0.5rem 0.75rem',
    '--ts-button-disabled-opacity': '0.5',
    '--ts-button-down-border-radius': '0.375rem 0 0 0.375rem',
    '--ts-button-up-border-radius': '0 0.375rem 0.375rem 0',
    '--ts-button-min-width': '2rem',
    '--ts-addon-background-color': '#f9fafb',
    '--ts-addon-text-color': '#6b7280',
    '--ts-addon-padding': '0.5rem 0.75rem',
    '--ts-vertical-button-background-color': '#f3f4f6',
    '--ts-vertical-button-background-color-hover': '#e5e7eb',
    '--ts-vertical-button-text-color': '#374151',
    '--ts-vertical-button-border-color': '#d1d5db',
    '--ts-vertical-button-border-width': '1px',
    '--ts-vertical-button-padding': '0.25rem 0.5rem',
    '--ts-vertical-button-font-size': '0.75rem',
    '--ts-vertical-button-font-weight': '500',
    '--ts-vertical-button-disabled-opacity': '0.5',
    '--ts-vertical-button-up-border-radius': '0 0.25rem 0 0',
    '--ts-vertical-button-down-border-radius': '0 0 0.25rem 0',
    '--ts-vertical-button-min-width': '1.5rem',
  };

  // Apply defaults to CSS and form inputs
  Object.entries(defaults).forEach(([varName, value]) => {
    document.documentElement.style.setProperty(varName, value);
    const textInput = document.querySelector(`input[data-var="${varName}"]`);
    if (textInput) {
      textInput.value = value;
    }
    // Update color picker if it's a color value
    if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
      const colorPicker = document.querySelector(`input[data-var-color="${varName}"]`);
      if (colorPicker) {
        colorPicker.value = value;
      }
    }
  });

  // Clear from localStorage
  try {
    localStorage.removeItem(CSS_VARS_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear CSS variables from storage:', e);
  }
}

// Initialize demo instance
function initDemo() {
  const demoInput = document.getElementById('demo-input');
  if (demoInstance) {
    demoInstance.destroy();
  }
  demoInstance = TouchSpin(demoInput, {
    ...currentSettings,
    renderer: VanillaRenderer,
  });

  updateGeneratedCode();
}

// Initialize static examples
function initStaticExamples() {
  staticInstances.forEach((instance) => instance.destroy());
  staticInstances = [];

  staticInstances.push(
    TouchSpin(document.getElementById('currency-example'), {
      prefix: '$',
      postfix: ' USD',
      decimals: 2,
      renderer: VanillaRenderer,
    })
  );

  staticInstances.push(
    TouchSpin(document.getElementById('vertical-example'), {
      verticalbuttons: true,
      renderer: VanillaRenderer,
    })
  );

  staticInstances.push(
    TouchSpin(document.getElementById('boundary-example'), {
      min: 10,
      max: 50,
      step: 5,
      renderer: VanillaRenderer,
    })
  );
}

// Event logging
function logEvent(eventName, detail = null) {
  eventCount++;
  const logContent = document.getElementById('event-log-content');
  const entry = document.createElement('div');
  entry.className = 'event-entry';
  const detailStr = detail ? ` - ${JSON.stringify(detail)}` : '';
  entry.textContent = `[${eventCount}] ${eventName}${detailStr}`;

  logContent.insertBefore(entry, logContent.firstChild);

  // Limit log entries
  while (logContent.children.length > 100) {
    logContent.removeChild(logContent.lastChild);
  }
}

// Update generated code
function updateGeneratedCode() {
  const codeBlock = document.getElementById('generated-code');
  const nonDefaults = {};

  for (const [key, value] of Object.entries(currentSettings)) {
    if (DEFAULT_SETTINGS[key] !== value) {
      nonDefaults[key] = value;
    }
  }

  if (Object.keys(nonDefaults).length === 0) {
    codeBlock.textContent =
      '// All settings are at default values\nTouchSpin(element, {\n  renderer: VanillaRenderer\n});';
  } else {
    const lines = ['TouchSpin(element, {'];
    for (const [key, value] of Object.entries(nonDefaults)) {
      const formattedValue = typeof value === 'string' ? `'${value}'` : value;
      lines.push(`  ${key}: ${formattedValue},`);
    }
    lines.push('  renderer: VanillaRenderer');
    lines.push('});');
    codeBlock.textContent = lines.join('\n');
  }
}

// Update control values from current settings
function updateControls() {
  document.getElementById('control-initval').value = currentSettings.initval;
  document.getElementById('control-min').value = currentSettings.min;
  document.getElementById('control-max').value = currentSettings.max;
  document.getElementById('control-step').value = currentSettings.step;
  document.getElementById('control-decimals').value = currentSettings.decimals;
  document.getElementById('control-boostat').value = currentSettings.boostat;
  document.getElementById('control-maxboostedstep').value = currentSettings.maxboostedstep;
  document.getElementById('control-prefix').value = currentSettings.prefix;
  document.getElementById('control-postfix').value = currentSettings.postfix;
  document.getElementById('control-prefix-extraclass').value = currentSettings.prefix_extraclass;
  document.getElementById('control-postfix-extraclass').value = currentSettings.postfix_extraclass;
  document.getElementById('control-buttonup-txt').value = currentSettings.buttonup_txt;
  document.getElementById('control-buttondown-txt').value = currentSettings.buttondown_txt;
  document.getElementById('control-buttonup-class').value = currentSettings.buttonup_class;
  document.getElementById('control-buttondown-class').value = currentSettings.buttondown_class;
  document.getElementById('control-verticalup').value = currentSettings.verticalup;
  document.getElementById('control-verticaldown').value = currentSettings.verticaldown;
  document.getElementById('control-verticalupclass').value = currentSettings.verticalupclass;
  document.getElementById('control-verticaldownclass').value = currentSettings.verticaldownclass;
  document.getElementById('control-stepinterval').value = currentSettings.stepinterval;
  document.getElementById('control-stepintervaldelay').value = currentSettings.stepintervaldelay;
  document.getElementById('control-firstclickvalueifempty').value =
    currentSettings.firstclickvalueifempty || '';
  document.getElementById('control-replacementval').value = currentSettings.replacementval;
  document.getElementById('control-verticalbuttons').checked = currentSettings.verticalbuttons;
  document.getElementById('control-mousewheel').checked = currentSettings.mousewheel;
  document.getElementById('control-booster').checked = currentSettings.booster;
  document.getElementById('control-focusablebuttons').checked = currentSettings.focusablebuttons;
  document.getElementById('control-disabled').checked = false;
  document.getElementById('control-forcestepdivisibility').checked =
    currentSettings.forcestepdivisibility === 'round';
}

// Attach control listeners
function attachControlListeners() {
  // Number inputs
  [
    'initval',
    'min',
    'max',
    'step',
    'decimals',
    'boostat',
    'maxboostedstep',
    'stepinterval',
    'stepintervaldelay',
  ].forEach((key) => {
    document.getElementById(`control-${key}`).addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      if (!Number.isNaN(value)) {
        currentSettings[key] = value;
        if (key === 'initval') {
          demoInstance.setValue(value);
        } else {
          demoInstance.updateSettings({ [key]: value });
        }
        saveSettings();
        updateGeneratedCode();
      }
    });
  });

  // Text inputs
  [
    'prefix',
    'postfix',
    'prefix_extraclass',
    'postfix_extraclass',
    'buttonup_txt',
    'buttondown_txt',
    'buttonup_class',
    'buttondown_class',
    'verticalup',
    'verticaldown',
    'verticalupclass',
    'verticaldownclass',
    'replacementval',
  ].forEach((key) => {
    document.getElementById(`control-${key.replace('_', '-')}`).addEventListener('input', (e) => {
      currentSettings[key] = e.target.value;
      demoInstance.updateSettings({ [key]: e.target.value });
      saveSettings();
      updateGeneratedCode();
    });
  });

  // firstclickvalueifempty (special handling for null)
  document.getElementById('control-firstclickvalueifempty').addEventListener('input', (e) => {
    const value = e.target.value === '' ? null : parseFloat(e.target.value);
    currentSettings.firstclickvalueifempty = value;
    demoInstance.updateSettings({ firstclickvalueifempty: value });
    saveSettings();
    updateGeneratedCode();
  });

  // Checkboxes
  document.getElementById('control-verticalbuttons').addEventListener('change', (e) => {
    currentSettings.verticalbuttons = e.target.checked;
    initDemo();
    saveSettings();
  });

  document.getElementById('control-mousewheel').addEventListener('change', (e) => {
    currentSettings.mousewheel = e.target.checked;
    demoInstance.updateSettings({ mousewheel: e.target.checked });
    saveSettings();
    updateGeneratedCode();
  });

  document.getElementById('control-booster').addEventListener('change', (e) => {
    currentSettings.booster = e.target.checked;
    demoInstance.updateSettings({ booster: e.target.checked });
    saveSettings();
    updateGeneratedCode();
  });

  document.getElementById('control-focusablebuttons').addEventListener('change', (e) => {
    currentSettings.focusablebuttons = e.target.checked;
    demoInstance.updateSettings({ focusablebuttons: e.target.checked });
    saveSettings();
    updateGeneratedCode();
  });

  document.getElementById('control-disabled').addEventListener('change', (e) => {
    document.getElementById('demo-input').disabled = e.target.checked;
  });

  document.getElementById('control-forcestepdivisibility').addEventListener('change', (e) => {
    currentSettings.forcestepdivisibility = e.target.checked ? 'round' : 'none';
    demoInstance.updateSettings({ forcestepdivisibility: currentSettings.forcestepdivisibility });
    saveSettings();
    updateGeneratedCode();
  });

  // Reset button
  document.getElementById('reset-settings').addEventListener('click', () => {
    currentSettings = { ...DEFAULT_SETTINGS };
    updateControls();
    initDemo();
    saveSettings();
    resetCSSVariables();
    logEvent('Settings and CSS variables reset to defaults');
  });

  // Clear log button
  document.getElementById('clear-log').addEventListener('click', () => {
    document.getElementById('event-log-content').innerHTML =
      '<div class="event-entry">Log cleared</div>';
  });

  // API method testing buttons
  document.getElementById('test-up-once').addEventListener('click', () => {
    demoInstance.upOnce();
    showMethodFeedback('upOnce() called');
    logEvent('API: upOnce()');
  });

  document.getElementById('test-down-once').addEventListener('click', () => {
    demoInstance.downOnce();
    showMethodFeedback('downOnce() called');
    logEvent('API: downOnce()');
  });

  document.getElementById('test-start-up').addEventListener('click', () => {
    demoInstance.startUpSpin();
    showMethodFeedback('startUpSpin() called');
    logEvent('API: startUpSpin()');
  });

  document.getElementById('test-start-down').addEventListener('click', () => {
    demoInstance.startDownSpin();
    showMethodFeedback('startDownSpin() called');
    logEvent('API: startDownSpin()');
  });

  document.getElementById('test-stop-spin').addEventListener('click', () => {
    demoInstance.stopSpin();
    showMethodFeedback('stopSpin() called');
    logEvent('API: stopSpin()');
  });

  document.getElementById('test-set-random').addEventListener('click', () => {
    const randomValue =
      Math.floor(Math.random() * (currentSettings.max - currentSettings.min + 1)) +
      currentSettings.min;
    demoInstance.setValue(randomValue);
    showMethodFeedback(`setValue(${randomValue}) called`);
    logEvent(`API: setValue(${randomValue})`);
  });

  document.getElementById('test-get-value').addEventListener('click', () => {
    const value = demoInstance.getValue();
    showMethodFeedback(`getValue() returned: ${value}`);
    logEvent(`API: getValue() = ${value}`);
  });

  document.getElementById('test-destroy').addEventListener('click', () => {
    demoInstance.destroy();
    showMethodFeedback('destroy() called - instance destroyed');
    logEvent('API: destroy()');
  });

  document.getElementById('test-reinit').addEventListener('click', () => {
    initDemo();
    showMethodFeedback('Instance re-initialized');
    logEvent('API: Re-initialized');
  });
}

// Show method feedback
function showMethodFeedback(message) {
  const feedback = document.getElementById('method-feedback');
  feedback.textContent = message;
  feedback.style.color = '#059669';
  setTimeout(() => {
    feedback.textContent = '';
  }, 3000);
}

// CSS Variables management
function setupCSSVariables() {
  // Setup text input listeners for all CSS variables
  document.querySelectorAll('[data-var]').forEach((input) => {
    input.addEventListener('input', () => {
      const varName = input.getAttribute('data-var');
      document.documentElement.style.setProperty(varName, input.value);

      // Update corresponding color picker if it exists
      const colorPicker = document.querySelector(`input[data-var-color="${varName}"]`);
      if (colorPicker && input.value.match(/^#[0-9A-Fa-f]{6}$/)) {
        colorPicker.value = input.value;
      }

      // Save to localStorage
      saveCSSVariables();
    });
  });

  // Setup native color picker listeners
  document.querySelectorAll('[data-var-color]').forEach((colorInput) => {
    colorInput.addEventListener('input', () => {
      const varName = colorInput.getAttribute('data-var-color');
      const hexValue = colorInput.value;

      // Update text input
      const textInput = document.querySelector(`input[data-color-text="${varName}"]`);
      if (textInput) {
        textInput.value = hexValue;
      }

      // Apply to CSS
      document.documentElement.style.setProperty(varName, hexValue);

      // Save to localStorage
      saveCSSVariables();
    });
  });
}

// Copy CSS Variables to clipboard
function setupCopyButton() {
  const copyBtn = document.getElementById('btn-copy-vars');
  const copiedMsg = document.getElementById('copied-msg');

  copyBtn?.addEventListener('click', async () => {
    const vars = Array.from(document.querySelectorAll('[data-var]'));
    const entries = vars
      .map((el) => [el.getAttribute('data-var'), el.value])
      .sort((a, b) => a[0].localeCompare(b[0]));
    const block = `:root {\n${entries.map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`;

    try {
      await navigator.clipboard.writeText(block);
      if (copiedMsg) {
        copiedMsg.style.display = 'inline';
        setTimeout(() => (copiedMsg.style.display = 'none'), 1500);
      }
    } catch (_err) {
      console.warn('Clipboard unavailable, logging block:', block);
      alert('Clipboard not available. See console for the CSS block.');
      console.log(block);
    }
  });
}

// Initialize
loadSettings();
updateControls();
loadCSSVariables();
initDemo();
initStaticExamples();
attachControlListeners();
setupCSSVariables();
setupCopyButton();

// Attach event listeners to demo input (once, on page load)
const demoInput = document.getElementById('demo-input');
demoInput.addEventListener('touchspin.on.min', (e) => logEvent('touchspin.on.min', e.detail));
demoInput.addEventListener('touchspin.on.max', (e) => logEvent('touchspin.on.max', e.detail));
demoInput.addEventListener('touchspin.on.startspin', (e) =>
  logEvent('touchspin.on.startspin', e.detail)
);
demoInput.addEventListener('touchspin.on.startupspin', (e) =>
  logEvent('touchspin.on.startupspin', e.detail)
);
demoInput.addEventListener('touchspin.on.startdownspin', (e) =>
  logEvent('touchspin.on.startdownspin', e.detail)
);
demoInput.addEventListener('touchspin.on.stopspin', (e) =>
  logEvent('touchspin.on.stopspin', e.detail)
);
demoInput.addEventListener('touchspin.on.stopupspin', (e) =>
  logEvent('touchspin.on.stopupspin', e.detail)
);
demoInput.addEventListener('touchspin.on.stopdownspin', (e) =>
  logEvent('touchspin.on.stopdownspin', e.detail)
);
demoInput.addEventListener('change', (e) => logEvent('change', { value: e.target.value }));

logEvent('TouchSpin Vanilla demo initialized with color pickers');
