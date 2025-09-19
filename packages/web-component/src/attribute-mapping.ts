/**
 * Utility functions for mapping HTML attributes to TouchSpin settings
 */

/**
 * Convert kebab-case attribute names to camelCase setting names
 * @param {string} attrName - HTML attribute name (e.g. 'vertical-buttons')
 * @returns {string} - TouchSpin setting name (e.g. 'verticalbuttons')
 */
export function attributeToSetting(attrName: string): string {
  const mapping = {
    'vertical-buttons': 'verticalbuttons',
    'vertical-up': 'verticalup',
    'vertical-down': 'verticaldown',
    'vertical-up-class': 'verticalupclass',
    'vertical-down-class': 'verticaldownclass',
    'button-up-class': 'buttonup_class',
    'button-down-class': 'buttondown_class',
    'button-up-txt': 'buttonup_txt',
    'button-down-txt': 'buttondown_txt',
    'prefix-class': 'prefix_extraclass',
    'postfix-class': 'postfix_extraclass',
    'force-step-divisibility': 'forcestepdivisibility',
    'step-interval': 'stepinterval',
    'step-interval-delay': 'stepintervaldelay',
    'boost-at': 'boostat',
    'max-boosted-step': 'maxboostedstep',
    'mouse-wheel': 'mousewheel',
    'init-val': 'initval',
    'replacement-val': 'replacementval',
    'focusable-buttons': 'focusablebuttons'
  } as const satisfies Record<string, string>;

  return (mapping as Record<string, string>)[attrName] || attrName;
}

/**
 * Parse attribute value to appropriate JavaScript type
 * @param {string} value - Raw attribute value
 * @param {string} settingName - TouchSpin setting name
 * @returns {any} - Parsed value
 */
// TODO: refine type
export function parseAttributeValue(value: string | null, settingName: string): unknown {
  if (value === null) return null;
  if (value === '') return true; // Boolean attributes present without value

  // Boolean settings
  const booleanSettings = [
    'verticalbuttons', 'mousewheel', 'booster', 'focusablebuttons'
  ] as const;

  if ((booleanSettings as readonly string[]).includes(settingName)) {
    return value === 'true' || value === '';
  }

  // Number settings
  const numberSettings = [
    'min', 'max', 'step', 'decimals', 'stepinterval', 'stepintervaldelay',
    'boostat', 'maxboostedstep', 'firstclickvalueifempty'
  ] as const;

  if ((numberSettings as readonly string[]).includes(settingName)) {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  // String settings - return as-is
  return value;
}

/**
 * Get all TouchSpin settings from element attributes
 * @param {HTMLElement} element - Custom element instance
 * @returns {Object} - TouchSpin settings object
 */
export function getSettingsFromAttributes(element: HTMLElement): Record<string, unknown> {
  const settings: Record<string, unknown> = {};

  // Get all attributes (ensure iterable in TS)
  for (const attr of Array.from(element.attributes)) {
    if (attr.name === 'is' || attr.name.startsWith('data-testid')) {
      continue; // Skip special attributes
    }

    const settingName = attributeToSetting(attr.name);
    const value = parseAttributeValue(attr.value, settingName);

    if (value !== null) {
      settings[settingName] = value;
    }
  }

  return settings;
}

/**
 * List of attributes that should trigger TouchSpin updates when changed
 */
export const OBSERVED_ATTRIBUTES = [
  'min',
  'max',
  'step',
  'value',
  'decimals',
  'prefix',
  'postfix',
  'vertical-buttons',
  'vertical-up',
  'vertical-down',
  'button-up-txt',
  'button-down-txt',
  'mouse-wheel',
  'disabled',
  'readonly',
  'renderer',
  'force-step-divisibility',
  'step-interval',
  'step-interval-delay',
  'booster',
  'boost-at',
  'max-boosted-step'
 ] as const;
