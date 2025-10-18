/**
 * Utility functions for mapping HTML attributes to TouchSpin settings
 */

import type { TouchSpinCoreOptions } from '@touchspin/core';

/**
 * Parsed attribute value type - primitive values that can be set via HTML attributes
 */
export type ParsedAttributeValue = string | number | boolean | null;

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
    'focusable-buttons': 'focusablebuttons',
  } as const satisfies Record<string, string>;

  return (mapping as Record<string, string>)[attrName] || attrName;
}

/**
 * Parse attribute value to appropriate JavaScript type
 * @param value - Raw attribute value
 * @param settingName - TouchSpin setting name
 * @returns Parsed value as appropriate primitive type
 */
export function parseAttributeValue(
  value: string | null,
  settingName: string
): ParsedAttributeValue {
  if (value === null) return null;
  if (value === '') return true; // Boolean attributes present without value

  // Boolean settings
  const booleanSettings = ['verticalbuttons', 'mousewheel', 'booster', 'focusablebuttons'] as const;

  if ((booleanSettings as readonly string[]).includes(settingName)) {
    return value === 'true' || value === '';
  }

  // Number settings
  const numberSettings = [
    'min',
    'max',
    'step',
    'decimals',
    'stepinterval',
    'stepintervaldelay',
    'boostat',
    'maxboostedstep',
    'firstclickvalueifempty',
  ] as const;

  if ((numberSettings as readonly string[]).includes(settingName)) {
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  }

  // String settings - return as-is
  return value;
}

/**
 * Get all TouchSpin settings from element attributes
 * @param element - Custom element instance
 * @returns TouchSpin settings object with parsed attribute values
 */
export function getSettingsFromAttributes(
  element: HTMLElement
): Record<string, ParsedAttributeValue> & {
  renderer?: import('@touchspin/core').RendererConstructor;
} {
  const settings: Record<string, ParsedAttributeValue> = {};

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
  'max-boosted-step',
] as const;
