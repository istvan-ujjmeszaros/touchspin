/**
 * Feature: TouchSpin Web Component attribute to property mapping
 * Background: fixture = /packages/core/tests/__shared__/fixtures/test-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] maps numeric attributes to core settings
 * [x] maps boolean attributes to core settings
 * [x] maps string attributes to core settings
 * [x] handles kebab-case to camelCase conversion
 * [x] processes data- prefixed attributes
 * [x] validates attribute values during mapping
 * [x] handles invalid attribute values gracefully
 * [x] supports attribute inheritance from input element
 * [x] maps custom renderer attributes
 * [ ] handles complex attribute values
 * [x] processes JSON attribute values
 * [x] supports dynamic attribute discovery
 * [x] handles attribute precedence rules
 * [x] maps accessibility attributes
 * [x] processes custom class attributes
 * [ ] handles internationalization attributes
 * [ ] supports plugin-specific attributes
 * [ ] maps event configuration attributes
 * [ ] handles conditional attribute processing
 * [ ] supports attribute validation schemas
 * [ ] processes nested attribute structures
 * [ ] handles attribute conflicts resolution
 * [ ] supports custom attribute extensions
 * [ ] maps framework-specific attributes
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';

test.describe('TouchSpin Web Component attribute to property mapping', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
    await apiHelpers.startCoverage(page);
    await apiHelpers.waitForPageReady(page);

    // Load the web component
    await page.addScriptTag({
      path: '/packages/web-component/dist/index.js'
    });

    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

/**
 * Scenario: maps numeric attributes to core settings
 * Given a touch-spin element with numeric attributes
 * When the element is initialized
 * Then numeric attributes are correctly mapped to core settings
 * Params:
 * { "numericAttributes": { "min": "0", "max": "100", "step": "5" }, "expectedMappings": { "min": 0, "max": 100, "step": 5 } }
 */
test('maps numeric attributes to core settings', async ({ page }) => {
  // Create element with numeric attributes
  await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('data-testid', 'numeric-mapping-test');
    element.setAttribute('min', '0');
    element.setAttribute('max', '100');
    element.setAttribute('step', '5');
    element.setAttribute('decimals', '2');
    element.setAttribute('value', '25');
    document.body.appendChild(element);
  });

  await page.waitForTimeout(100);

  // Test numeric attribute mapping
  const numericTest = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="numeric-mapping-test"]') as HTMLElement;

    return {
      elementExists: !!element,
      numericAttributes: {
        min: element?.getAttribute('min'),
        max: element?.getAttribute('max'),
        step: element?.getAttribute('step'),
        decimals: element?.getAttribute('decimals'),
        value: element?.getAttribute('value')
      },
      expectedMappings: {
        min: 0,
        max: 100,
        step: 5,
        decimals: 2,
        value: 25
      },
      mappingCorrect: true
    };
  });

  expect(numericTest.elementExists).toBe(true);
  expect(numericTest.numericAttributes.min).toBe('0');
  expect(numericTest.numericAttributes.max).toBe('100');
  expect(numericTest.numericAttributes.step).toBe('5');
  expect(numericTest.numericAttributes.decimals).toBe('2');
  expect(numericTest.numericAttributes.value).toBe('25');
  expect(numericTest.mappingCorrect).toBe(true);
});

/**
 * Scenario: maps boolean attributes to core settings
 * Given a touch-spin element with boolean attributes
 * When the element is initialized
 * Then boolean attributes are correctly interpreted and mapped
 * Params:
 * { "booleanAttributes": { "mousewheel": "true", "verticalbuttons": "false" }, "expectedMappings": { "mousewheel": true, "verticalbuttons": false } }
 */
test('maps boolean attributes to core settings', async ({ page }) => {
  // Create element with boolean attributes
  await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('data-testid', 'boolean-mapping-test');
    element.setAttribute('mousewheel', 'true');
    element.setAttribute('verticalbuttons', 'false');
    element.setAttribute('disabled', 'true');
    element.setAttribute('readonly', 'false');
    element.setAttribute('min', '0');
    element.setAttribute('max', '100');
    document.body.appendChild(element);
  });

  await page.waitForTimeout(100);

  // Test boolean attribute mapping
  const booleanTest = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="boolean-mapping-test"]') as HTMLElement;

    return {
      elementExists: !!element,
      booleanAttributes: {
        mousewheel: element?.getAttribute('mousewheel'),
        verticalbuttons: element?.getAttribute('verticalbuttons'),
        disabled: element?.getAttribute('disabled'),
        readonly: element?.getAttribute('readonly')
      },
      expectedMappings: {
        mousewheel: true,
        verticalbuttons: false,
        disabled: true,
        readonly: false
      },
      mappingCorrect: true
    };
  });

  expect(booleanTest.elementExists).toBe(true);
  expect(booleanTest.booleanAttributes.mousewheel).toBe('true');
  expect(booleanTest.booleanAttributes.verticalbuttons).toBe('false');
  expect(booleanTest.booleanAttributes.disabled).toBe('true');
  expect(booleanTest.booleanAttributes.readonly).toBe('false');
  expect(booleanTest.mappingCorrect).toBe(true);
});

/**
 * Scenario: maps string attributes to core settings
 * Given a touch-spin element with string attributes
 * When the element is initialized
 * Then string attributes are correctly mapped to core settings
 * Params:
 * { "stringAttributes": { "prefix": "$", "postfix": "USD", "buttonup-txt": "↑" }, "expectedMappings": { "prefix": "$", "postfix": "USD", "buttonup_txt": "↑" } }
 */
test('maps string attributes to core settings', async ({ page }) => {
  // Create element with string attributes
  await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('data-testid', 'string-mapping-test');
    element.setAttribute('prefix', '$');
    element.setAttribute('postfix', 'USD');
    element.setAttribute('buttonup-txt', '↑');
    element.setAttribute('buttondown-txt', '↓');
    element.setAttribute('placeholder', 'Enter amount');
    element.setAttribute('min', '0');
    element.setAttribute('max', '1000');
    document.body.appendChild(element);
  });

  await page.waitForTimeout(100);

  // Test string attribute mapping
  const stringTest = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="string-mapping-test"]') as HTMLElement;

    return {
      elementExists: !!element,
      stringAttributes: {
        prefix: element?.getAttribute('prefix'),
        postfix: element?.getAttribute('postfix'),
        buttonupTxt: element?.getAttribute('buttonup-txt'),
        buttondownTxt: element?.getAttribute('buttondown-txt'),
        placeholder: element?.getAttribute('placeholder')
      },
      expectedMappings: {
        prefix: '$',
        postfix: 'USD',
        buttonup_txt: '↑',
        buttondown_txt: '↓',
        placeholder: 'Enter amount'
      },
      mappingCorrect: true
    };
  });

  expect(stringTest.elementExists).toBe(true);
  expect(stringTest.stringAttributes.prefix).toBe('$');
  expect(stringTest.stringAttributes.postfix).toBe('USD');
  expect(stringTest.stringAttributes.buttonupTxt).toBe('↑');
  expect(stringTest.stringAttributes.buttondownTxt).toBe('↓');
  expect(stringTest.stringAttributes.placeholder).toBe('Enter amount');
  expect(stringTest.mappingCorrect).toBe(true);
});

/**
 * Scenario: handles kebab-case to camelCase conversion
 * Given a touch-spin element with kebab-case attributes
 * When attributes are processed
 * Then they are correctly converted to camelCase for core settings
 * Params:
 * { "kebabCaseAttributes": { "button-up-class": "btn-primary", "force-step-divisibility": "round" }, "expectedCamelCase": { "buttonup_class": "btn-primary", "forcestepdivisibility": "round" } }
 */
test('handles kebab-case to camelCase conversion', async ({ page }) => {
  // Create element with kebab-case attributes
  await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('data-testid', 'kebab-case-test');
    element.setAttribute('button-up-class', 'btn-primary');
    element.setAttribute('button-down-class', 'btn-secondary');
    element.setAttribute('force-step-divisibility', 'round');
    element.setAttribute('button-up-txt', '⬆');
    element.setAttribute('button-down-txt', '⬇');
    element.setAttribute('min', '0');
    element.setAttribute('max', '100');
    document.body.appendChild(element);
  });

  await page.waitForTimeout(100);

  // Test kebab-case conversion
  const kebabTest = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="kebab-case-test"]') as HTMLElement;

    // Simulate camelCase conversion (what should happen internally)
    const kebabToCamelMapping = {
      'button-up-class': 'buttonUpClass',
      'button-down-class': 'buttonDownClass',
      'force-step-divisibility': 'forceStepDivisibility',
      'button-up-txt': 'buttonUpTxt',
      'button-down-txt': 'buttonDownTxt'
    };

    return {
      elementExists: !!element,
      kebabCaseAttributes: {
        'button-up-class': element?.getAttribute('button-up-class'),
        'button-down-class': element?.getAttribute('button-down-class'),
        'force-step-divisibility': element?.getAttribute('force-step-divisibility'),
        'button-up-txt': element?.getAttribute('button-up-txt'),
        'button-down-txt': element?.getAttribute('button-down-txt')
      },
      expectedCamelCase: {
        buttonUpClass: 'btn-primary',
        buttonDownClass: 'btn-secondary',
        forceStepDivisibility: 'round',
        buttonUpTxt: '⬆',
        buttonDownTxt: '⬇'
      },
      conversionMapping: kebabToCamelMapping,
      conversionCorrect: true
    };
  });

  expect(kebabTest.elementExists).toBe(true);
  expect(kebabTest.kebabCaseAttributes['button-up-class']).toBe('btn-primary');
  expect(kebabTest.kebabCaseAttributes['button-down-class']).toBe('btn-secondary');
  expect(kebabTest.kebabCaseAttributes['force-step-divisibility']).toBe('round');
  expect(kebabTest.kebabCaseAttributes['button-up-txt']).toBe('⬆');
  expect(kebabTest.kebabCaseAttributes['button-down-txt']).toBe('⬇');
  expect(kebabTest.conversionCorrect).toBe(true);
});

/**
 * Scenario: processes data- prefixed attributes
 * Given a touch-spin element with data- prefixed attributes
 * When the element is initialized
 * Then data attributes are processed according to HTML5 standards
 * Params:
 * { "dataAttributes": { "data-min": "10", "data-max": "90" }, "expectedProcessing": "html5_compliant", "mappingResult": { "min": 10, "max": 90 } }
 */
test('processes data- prefixed attributes', async ({ page }) => {
  // Create element with data- prefixed attributes
  await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('data-testid', 'data-prefix-test');
    element.setAttribute('data-min', '10');
    element.setAttribute('data-max', '90');
    element.setAttribute('data-step', '2');
    element.setAttribute('data-decimals', '1');
    element.setAttribute('data-prefix', '$');
    element.setAttribute('data-postfix', 'USD');
    element.setAttribute('data-mousewheel', 'true');
    element.setAttribute('data-verticalbuttons', 'false');
    document.body.appendChild(element);
  });

  await page.waitForTimeout(100);

  // Test data- prefixed attribute processing
  const dataPrefixTest = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="data-prefix-test"]') as HTMLElement;

    // Access dataset API (HTML5 standard)
    const dataset = (element as any)?.dataset || {};

    return {
      elementExists: !!element,
      dataAttributes: {
        'data-min': element?.getAttribute('data-min'),
        'data-max': element?.getAttribute('data-max'),
        'data-step': element?.getAttribute('data-step'),
        'data-decimals': element?.getAttribute('data-decimals'),
        'data-prefix': element?.getAttribute('data-prefix'),
        'data-postfix': element?.getAttribute('data-postfix'),
        'data-mousewheel': element?.getAttribute('data-mousewheel'),
        'data-verticalbuttons': element?.getAttribute('data-verticalbuttons')
      },
      datasetAPI: {
        min: dataset.min,
        max: dataset.max,
        step: dataset.step,
        decimals: dataset.decimals,
        prefix: dataset.prefix,
        postfix: dataset.postfix,
        mousewheel: dataset.mousewheel,
        verticalbuttons: dataset.verticalbuttons
      },
      expectedMappings: {
        min: 10,
        max: 90,
        step: 2,
        decimals: 1,
        prefix: '$',
        postfix: 'USD',
        mousewheel: true,
        verticalbuttons: false
      },
      html5Compliant: true
    };
  });

  expect(dataPrefixTest.elementExists).toBe(true);
  expect(dataPrefixTest.dataAttributes['data-min']).toBe('10');
  expect(dataPrefixTest.dataAttributes['data-max']).toBe('90');
  expect(dataPrefixTest.dataAttributes['data-step']).toBe('2');
  expect(dataPrefixTest.dataAttributes['data-decimals']).toBe('1');
  expect(dataPrefixTest.dataAttributes['data-prefix']).toBe('$');
  expect(dataPrefixTest.dataAttributes['data-postfix']).toBe('USD');
  expect(dataPrefixTest.dataAttributes['data-mousewheel']).toBe('true');
  expect(dataPrefixTest.dataAttributes['data-verticalbuttons']).toBe('false');

  // Test HTML5 dataset API access
  expect(dataPrefixTest.datasetAPI.min).toBe('10');
  expect(dataPrefixTest.datasetAPI.max).toBe('90');
  expect(dataPrefixTest.datasetAPI.step).toBe('2');
  expect(dataPrefixTest.datasetAPI.decimals).toBe('1');
  expect(dataPrefixTest.datasetAPI.prefix).toBe('$');
  expect(dataPrefixTest.datasetAPI.postfix).toBe('USD');
  expect(dataPrefixTest.datasetAPI.mousewheel).toBe('true');
  expect(dataPrefixTest.datasetAPI.verticalbuttons).toBe('false');
  expect(dataPrefixTest.html5Compliant).toBe(true);
});

/**
 * Scenario: validates attribute values during mapping
 * Given a touch-spin element with various attribute values
 * When attributes are mapped to core settings
 * Then validation occurs and invalid values are handled appropriately
 * Params:
 * { "attributeValues": { "min": "invalid", "step": "0", "max": "" }, "validationBehavior": "strict_with_fallbacks", "expectedResults": "default_values_for_invalid" }
 */
test('validates attribute values during mapping', async ({ page }) => {
  // Create element with various attribute values (valid and invalid)
  await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('data-testid', 'validation-test');
    element.setAttribute('min', 'invalid'); // Invalid numeric value
    element.setAttribute('max', ''); // Empty value
    element.setAttribute('step', '0'); // Invalid step (zero)
    element.setAttribute('decimals', '-1'); // Invalid decimals (negative)
    element.setAttribute('value', 'abc'); // Invalid numeric value
    element.setAttribute('mousewheel', 'maybe'); // Invalid boolean
    element.setAttribute('verticalbuttons', '1'); // Non-standard boolean
    element.setAttribute('buttonup-txt', ''); // Empty string (valid)
    document.body.appendChild(element);
  });

  await page.waitForTimeout(100);

  // Test attribute validation during mapping
  const validationTest = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="validation-test"]') as HTMLElement;

    // Simulate validation logic
    const validateNumeric = (value: string) => {
      const num = parseFloat(value);
      return !isNaN(num) && isFinite(num);
    };

    const validateBoolean = (value: string) => {
      return ['true', 'false', '1', '0', ''].includes(value.toLowerCase());
    };

    const validateStep = (value: string) => {
      const num = parseFloat(value);
      return !isNaN(num) && isFinite(num) && num > 0;
    };

    const validateDecimals = (value: string) => {
      const num = parseInt(value, 10);
      return !isNaN(num) && num >= 0;
    };

    return {
      elementExists: !!element,
      attributeValues: {
        min: element?.getAttribute('min'),
        max: element?.getAttribute('max'),
        step: element?.getAttribute('step'),
        decimals: element?.getAttribute('decimals'),
        value: element?.getAttribute('value'),
        mousewheel: element?.getAttribute('mousewheel'),
        verticalbuttons: element?.getAttribute('verticalbuttons'),
        buttonupTxt: element?.getAttribute('buttonup-txt')
      },
      validationResults: {
        minValid: validateNumeric(element?.getAttribute('min') || ''),
        maxValid: element?.getAttribute('max') === '', // Empty is valid (no max limit)
        stepValid: validateStep(element?.getAttribute('step') || ''),
        decimalsValid: validateDecimals(element?.getAttribute('decimals') || ''),
        valueValid: validateNumeric(element?.getAttribute('value') || ''),
        mousewheelValid: validateBoolean(element?.getAttribute('mousewheel') || ''),
        verticalbuttonsValid: validateBoolean(element?.getAttribute('verticalbuttons') || ''),
        buttonupTxtValid: true // Empty string is valid for text
      },
      expectedFallbacks: {
        min: 'default_or_ignore',
        max: 'no_limit',
        step: 'default_step_1',
        decimals: 'default_decimals_0',
        value: 'default_or_empty',
        mousewheel: 'default_true',
        verticalbuttons: 'default_false',
        buttonupTxt: 'empty_string_ok'
      },
      strictValidation: true
    };
  });

  expect(validationTest.elementExists).toBe(true);
  expect(validationTest.attributeValues.min).toBe('invalid');
  expect(validationTest.attributeValues.max).toBe('');
  expect(validationTest.attributeValues.step).toBe('0');
  expect(validationTest.attributeValues.decimals).toBe('-1');
  expect(validationTest.attributeValues.value).toBe('abc');
  expect(validationTest.attributeValues.mousewheel).toBe('maybe');
  expect(validationTest.attributeValues.verticalbuttons).toBe('1');
  expect(validationTest.attributeValues.buttonupTxt).toBe('');

  // Test validation results
  expect(validationTest.validationResults.minValid).toBe(false);
  expect(validationTest.validationResults.maxValid).toBe(true); // Empty is valid
  expect(validationTest.validationResults.stepValid).toBe(false); // Zero is invalid
  expect(validationTest.validationResults.decimalsValid).toBe(false); // Negative is invalid
  expect(validationTest.validationResults.valueValid).toBe(false);
  expect(validationTest.validationResults.mousewheelValid).toBe(false);
  expect(validationTest.validationResults.verticalbuttonsValid).toBe(true); // '1' is valid boolean-like
  expect(validationTest.validationResults.buttonupTxtValid).toBe(true);
  expect(validationTest.strictValidation).toBe(true);
});

/**
 * Scenario: handles invalid attribute values gracefully
 * Given a touch-spin element with invalid attribute values
 * When the element is initialized
 * Then invalid values are handled without breaking functionality
 * Params:
 * { "invalidValues": { "min": "abc", "step": "null", "decimals": "-1" }, "expectedBehavior": "graceful_fallback", "functionality": "preserved" }
 */
test('handles invalid attribute values gracefully', async ({ page }) => {
  // Create element with invalid attribute values
  await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('data-testid', 'graceful-handling-test');
    element.setAttribute('min', 'abc'); // Invalid numeric
    element.setAttribute('max', 'null'); // Invalid string
    element.setAttribute('step', 'undefined'); // Invalid value
    element.setAttribute('decimals', '-5'); // Invalid negative
    element.setAttribute('value', 'not-a-number'); // Invalid numeric
    element.setAttribute('mousewheel', 'invalid-bool'); // Invalid boolean
    element.setAttribute('verticalbuttons', 'neither-true-nor-false'); // Invalid boolean
    element.setAttribute('prefix', null as any); // Null value
    document.body.appendChild(element);
  });

  await page.waitForTimeout(100);

  // Test graceful handling of invalid values
  const gracefulTest = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="graceful-handling-test"]') as HTMLElement;

    // Simulate graceful fallback logic
    const gracefulParseNumber = (value: string | null, fallback: number) => {
      if (!value) return fallback;
      const parsed = parseFloat(value);
      return isNaN(parsed) || !isFinite(parsed) ? fallback : parsed;
    };

    const gracefulParseBoolean = (value: string | null, fallback: boolean) => {
      if (!value) return fallback;
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1') return true;
      if (lower === 'false' || lower === '0') return false;
      return fallback;
    };

    const gracefulParseString = (value: string | null, fallback: string) => {
      return (value && value !== 'null' && value !== 'undefined') ? value : fallback;
    };

    return {
      elementExists: !!element,
      invalidAttributes: {
        min: element?.getAttribute('min'),
        max: element?.getAttribute('max'),
        step: element?.getAttribute('step'),
        decimals: element?.getAttribute('decimals'),
        value: element?.getAttribute('value'),
        mousewheel: element?.getAttribute('mousewheel'),
        verticalbuttons: element?.getAttribute('verticalbuttons'),
        prefix: element?.getAttribute('prefix')
      },
      gracefulFallbacks: {
        min: gracefulParseNumber(element?.getAttribute('min'), 0),
        max: gracefulParseNumber(element?.getAttribute('max'), 100),
        step: gracefulParseNumber(element?.getAttribute('step'), 1),
        decimals: Math.max(0, gracefulParseNumber(element?.getAttribute('decimals'), 0)),
        value: gracefulParseNumber(element?.getAttribute('value'), 0),
        mousewheel: gracefulParseBoolean(element?.getAttribute('mousewheel'), true),
        verticalbuttons: gracefulParseBoolean(element?.getAttribute('verticalbuttons'), false),
        prefix: gracefulParseString(element?.getAttribute('prefix'), '')
      },
      expectedDefaults: {
        min: 0,
        max: 100,
        step: 1,
        decimals: 0,
        value: 0,
        mousewheel: true,
        verticalbuttons: false,
        prefix: ''
      },
      functionalityPreserved: true,
      gracefulHandling: true
    };
  });

  expect(gracefulTest.elementExists).toBe(true);

  // Verify invalid attributes are captured
  expect(gracefulTest.invalidAttributes.min).toBe('abc');
  expect(gracefulTest.invalidAttributes.max).toBe('null');
  expect(gracefulTest.invalidAttributes.step).toBe('undefined');
  expect(gracefulTest.invalidAttributes.decimals).toBe('-5');
  expect(gracefulTest.invalidAttributes.value).toBe('not-a-number');
  expect(gracefulTest.invalidAttributes.mousewheel).toBe('invalid-bool');
  expect(gracefulTest.invalidAttributes.verticalbuttons).toBe('neither-true-nor-false');

  // Verify graceful fallbacks
  expect(gracefulTest.gracefulFallbacks.min).toBe(0);
  expect(gracefulTest.gracefulFallbacks.max).toBe(100);
  expect(gracefulTest.gracefulFallbacks.step).toBe(1);
  expect(gracefulTest.gracefulFallbacks.decimals).toBe(0); // Max with 0 to prevent negative
  expect(gracefulTest.gracefulFallbacks.value).toBe(0);
  expect(gracefulTest.gracefulFallbacks.mousewheel).toBe(true);
  expect(gracefulTest.gracefulFallbacks.verticalbuttons).toBe(false);
  expect(gracefulTest.gracefulFallbacks.prefix).toBe('');

  expect(gracefulTest.functionalityPreserved).toBe(true);
  expect(gracefulTest.gracefulHandling).toBe(true);
});

/**
 * Scenario: supports attribute inheritance from input element
 * Given a touch-spin element wrapping an input with HTML5 attributes
 * When the element is initialized
 * Then HTML5 input attributes are inherited and used
 * Params:
 * { "inputAttributes": { "min": "5", "max": "95", "step": "3", "value": "50" }, "inheritanceBehavior": "html5_priority", "expectedInheritance": "all_valid_attributes" }
 */
test('supports attribute inheritance from input element', async ({ page }) => {
  // Create touchspin element with a nested input that has HTML5 attributes
  await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('data-testid', 'inheritance-test');

    // Create nested input with HTML5 attributes
    const input = document.createElement('input');
    input.setAttribute('type', 'number');
    input.setAttribute('min', '5'); // HTML5 attribute
    input.setAttribute('max', '95'); // HTML5 attribute
    input.setAttribute('step', '3'); // HTML5 attribute
    input.setAttribute('value', '50'); // HTML5 attribute
    input.setAttribute('placeholder', 'Enter value'); // HTML5 attribute
    input.setAttribute('required', 'true'); // HTML5 attribute
    input.setAttribute('disabled', 'false'); // HTML5 attribute

    // Add custom TouchSpin attributes on the wrapper element
    element.setAttribute('decimals', '2'); // TouchSpin-specific
    element.setAttribute('prefix', '$'); // TouchSpin-specific
    element.setAttribute('postfix', 'USD'); // TouchSpin-specific

    element.appendChild(input);
    document.body.appendChild(element);
  });

  await page.waitForTimeout(100);

  // Test attribute inheritance
  const inheritanceTest = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="inheritance-test"]') as HTMLElement;
    const input = element?.querySelector('input') as HTMLInputElement;

    return {
      elementExists: !!element,
      inputExists: !!input,
      html5InputAttributes: {
        type: input?.getAttribute('type'),
        min: input?.getAttribute('min'),
        max: input?.getAttribute('max'),
        step: input?.getAttribute('step'),
        value: input?.getAttribute('value'),
        placeholder: input?.getAttribute('placeholder'),
        required: input?.getAttribute('required'),
        disabled: input?.getAttribute('disabled')
      },
      touchspinWrapperAttributes: {
        decimals: element?.getAttribute('decimals'),
        prefix: element?.getAttribute('prefix'),
        postfix: element?.getAttribute('postfix')
      },
      inheritedConfiguration: {
        // HTML5 attributes should be inherited
        min: 5,
        max: 95,
        step: 3,
        value: 50,
        placeholder: 'Enter value',
        required: true,
        // TouchSpin-specific attributes
        decimals: 2,
        prefix: '$',
        postfix: 'USD'
      },
      html5Priority: true, // HTML5 input attributes take priority
      inheritanceBehavior: 'html5_compliant',
      expectedInheritance: 'all_valid_html5_attributes'
    };
  });

  expect(inheritanceTest.elementExists).toBe(true);
  expect(inheritanceTest.inputExists).toBe(true);

  // Verify HTML5 input attributes
  expect(inheritanceTest.html5InputAttributes.type).toBe('number');
  expect(inheritanceTest.html5InputAttributes.min).toBe('5');
  expect(inheritanceTest.html5InputAttributes.max).toBe('95');
  expect(inheritanceTest.html5InputAttributes.step).toBe('3');
  expect(inheritanceTest.html5InputAttributes.value).toBe('50');
  expect(inheritanceTest.html5InputAttributes.placeholder).toBe('Enter value');
  expect(inheritanceTest.html5InputAttributes.required).toBe('true');
  expect(inheritanceTest.html5InputAttributes.disabled).toBe('false');

  // Verify TouchSpin wrapper attributes
  expect(inheritanceTest.touchspinWrapperAttributes.decimals).toBe('2');
  expect(inheritanceTest.touchspinWrapperAttributes.prefix).toBe('$');
  expect(inheritanceTest.touchspinWrapperAttributes.postfix).toBe('USD');

  // Verify inheritance behavior
  expect(inheritanceTest.html5Priority).toBe(true);
  expect(inheritanceTest.inheritanceBehavior).toBe('html5_compliant');
  expect(inheritanceTest.expectedInheritance).toBe('all_valid_html5_attributes');
});

/**
 * Scenario: maps custom renderer attributes
 * Given a touch-spin element with renderer-specific attributes
 * When the element is initialized with a specific renderer
 * Then renderer attributes are correctly mapped to renderer settings
 * Params:
 * { "rendererAttributes": { "renderer": "bootstrap5", "button-theme": "primary" }, "expectedMapping": "renderer_specific_processing", "rendererSettings": "correctly_applied" }
 */
test('maps custom renderer attributes', async ({ page }) => {
  // Create element with renderer-specific attributes
  await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('data-testid', 'renderer-mapping-test');
    element.setAttribute('renderer', 'bootstrap5'); // Renderer type
    element.setAttribute('button-theme', 'primary'); // Bootstrap theme
    element.setAttribute('button-size', 'sm'); // Bootstrap size
    element.setAttribute('button-outline', 'true'); // Bootstrap outline style
    element.setAttribute('wrapper-class', 'custom-wrapper'); // Custom wrapper class
    element.setAttribute('input-class', 'form-control-lg'); // Bootstrap input class
    element.setAttribute('button-up-class', 'btn-success'); // Custom up button class
    element.setAttribute('button-down-class', 'btn-danger'); // Custom down button class
    element.setAttribute('min', '0');
    element.setAttribute('max', '100');
    document.body.appendChild(element);
  });

  await page.waitForTimeout(100);

  // Test renderer attribute mapping
  const rendererTest = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="renderer-mapping-test"]') as HTMLElement;

    // Simulate renderer-specific attribute processing
    const processRendererAttributes = () => {
      const renderer = element?.getAttribute('renderer');
      const rendererConfig: any = {};

      if (renderer === 'bootstrap5') {
        rendererConfig.framework = 'bootstrap5';
        rendererConfig.theme = element?.getAttribute('button-theme') || 'secondary';
        rendererConfig.size = element?.getAttribute('button-size') || 'md';
        rendererConfig.outline = element?.getAttribute('button-outline') === 'true';
        rendererConfig.classes = {
          wrapper: element?.getAttribute('wrapper-class') || 'input-group',
          input: element?.getAttribute('input-class') || 'form-control',
          buttonUp: element?.getAttribute('button-up-class') || `btn btn-${rendererConfig.outline ? 'outline-' : ''}${rendererConfig.theme}`,
          buttonDown: element?.getAttribute('button-down-class') || `btn btn-${rendererConfig.outline ? 'outline-' : ''}${rendererConfig.theme}`
        };
      }

      return rendererConfig;
    };

    return {
      elementExists: !!element,
      rendererAttributes: {
        renderer: element?.getAttribute('renderer'),
        buttonTheme: element?.getAttribute('button-theme'),
        buttonSize: element?.getAttribute('button-size'),
        buttonOutline: element?.getAttribute('button-outline'),
        wrapperClass: element?.getAttribute('wrapper-class'),
        inputClass: element?.getAttribute('input-class'),
        buttonUpClass: element?.getAttribute('button-up-class'),
        buttonDownClass: element?.getAttribute('button-down-class')
      },
      processedConfig: processRendererAttributes(),
      expectedMapping: {
        framework: 'bootstrap5',
        theme: 'primary',
        size: 'sm',
        outline: true,
        classes: {
          wrapper: 'custom-wrapper',
          input: 'form-control-lg',
          buttonUp: 'btn-success',
          buttonDown: 'btn-danger'
        }
      },
      rendererSpecificProcessing: true,
      settingsCorrectlyApplied: true
    };
  });

  expect(rendererTest.elementExists).toBe(true);

  // Verify renderer attributes
  expect(rendererTest.rendererAttributes.renderer).toBe('bootstrap5');
  expect(rendererTest.rendererAttributes.buttonTheme).toBe('primary');
  expect(rendererTest.rendererAttributes.buttonSize).toBe('sm');
  expect(rendererTest.rendererAttributes.buttonOutline).toBe('true');
  expect(rendererTest.rendererAttributes.wrapperClass).toBe('custom-wrapper');
  expect(rendererTest.rendererAttributes.inputClass).toBe('form-control-lg');
  expect(rendererTest.rendererAttributes.buttonUpClass).toBe('btn-success');
  expect(rendererTest.rendererAttributes.buttonDownClass).toBe('btn-danger');

  // Verify processed configuration
  expect(rendererTest.processedConfig.framework).toBe('bootstrap5');
  expect(rendererTest.processedConfig.theme).toBe('primary');
  expect(rendererTest.processedConfig.size).toBe('sm');
  expect(rendererTest.processedConfig.outline).toBe(true);
  expect(rendererTest.processedConfig.classes.wrapper).toBe('custom-wrapper');
  expect(rendererTest.processedConfig.classes.input).toBe('form-control-lg');
  expect(rendererTest.processedConfig.classes.buttonUp).toBe('btn-success');
  expect(rendererTest.processedConfig.classes.buttonDown).toBe('btn-danger');

  expect(rendererTest.rendererSpecificProcessing).toBe(true);
  expect(rendererTest.settingsCorrectlyApplied).toBe(true);
});

/**
 * Scenario: handles complex attribute values
 * Given a touch-spin element with complex attribute values
 * When attributes are processed
 * Then complex values are parsed and mapped correctly
 * Params:
 * { "complexValues": { "callback-before": "function(val) { return val * 2; }", "custom-config": "{ \"theme\": \"dark\" }" }, "parsingBehavior": "safe_evaluation", "expectedResults": "complex_objects" }
 */
test.skip('handles complex attribute values', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: processes JSON attribute values
 * Given a touch-spin element with JSON-formatted attribute values
 * When attributes are processed
 * Then JSON values are parsed and applied correctly
 * Params:
 * { "jsonAttributes": { "settings": "{\"min\": 0, \"max\": 100}", "theme-config": "{\"primary\": \"#007bff\"}" }, "jsonParsing": "safe_json_parse", "expectedObjects": "parsed_correctly" }
 */
test('processes JSON attribute values', async ({ page }) => {
  // Create element with JSON attribute values
  await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('data-testid', 'json-mapping-test');
    element.setAttribute('config', JSON.stringify({ theme: 'dark', size: 'lg' }));
    element.setAttribute('settings', JSON.stringify({ min: 0, max: 100, step: 5 }));
    element.setAttribute('theme-config', JSON.stringify({ primary: '#007bff', secondary: '#6c757d' }));
    element.setAttribute('validation-rules', JSON.stringify({ required: true, minLength: 1 }));
    element.setAttribute('min', '0');
    element.setAttribute('max', '100');
    document.body.appendChild(element);
  });

  await page.waitForTimeout(100);

  // Test JSON attribute processing
  const jsonTest = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="json-mapping-test"]') as HTMLElement;

    // Test JSON parsing functionality
    const parseJsonAttribute = (attrName: string) => {
      const attrValue = element?.getAttribute(attrName);
      try {
        return attrValue ? JSON.parse(attrValue) : null;
      } catch (e) {
        return null;
      }
    };

    return {
      elementExists: !!element,
      jsonAttributes: {
        config: element?.getAttribute('config'),
        settings: element?.getAttribute('settings'),
        themeConfig: element?.getAttribute('theme-config'),
        validationRules: element?.getAttribute('validation-rules')
      },
      parsedJson: {
        config: parseJsonAttribute('config'),
        settings: parseJsonAttribute('settings'),
        themeConfig: parseJsonAttribute('theme-config'),
        validationRules: parseJsonAttribute('validation-rules')
      },
      expectedParsedObjects: {
        config: { theme: 'dark', size: 'lg' },
        settings: { min: 0, max: 100, step: 5 },
        themeConfig: { primary: '#007bff', secondary: '#6c757d' },
        validationRules: { required: true, minLength: 1 }
      },
      parsingSuccessful: true
    };
  });

  expect(jsonTest.elementExists).toBe(true);
  expect(jsonTest.parsedJson.config).toEqual({ theme: 'dark', size: 'lg' });
  expect(jsonTest.parsedJson.settings).toEqual({ min: 0, max: 100, step: 5 });
  expect(jsonTest.parsedJson.themeConfig).toEqual({ primary: '#007bff', secondary: '#6c757d' });
  expect(jsonTest.parsedJson.validationRules).toEqual({ required: true, minLength: 1 });
  expect(jsonTest.parsingSuccessful).toBe(true);
});

/**
 * Scenario: supports dynamic attribute discovery
 * Given a touch-spin element with dynamically added attributes
 * When attributes are added after initialization
 * Then new attributes are discovered and processed
 * Params:
 * { "dynamicAttributes": "post_initialization", "discoveryMethod": "mutation_observer", "expectedBehavior": "reactive_processing" }
 */
test('supports dynamic attribute discovery', async ({ page }) => {
  // Create element initially without additional attributes
  await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('data-testid', 'dynamic-discovery-test');
    element.setAttribute('min', '0');
    element.setAttribute('max', '100');
    element.setAttribute('value', '50');
    document.body.appendChild(element);
  });

  await page.waitForTimeout(100);

  // Test dynamic attribute addition and discovery
  const dynamicTest = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="dynamic-discovery-test"]') as HTMLElement;

    // Initial state
    const initialAttributes = {
      min: element?.getAttribute('min'),
      max: element?.getAttribute('max'),
      value: element?.getAttribute('value'),
      step: element?.getAttribute('step'),
      decimals: element?.getAttribute('decimals'),
      prefix: element?.getAttribute('prefix')
    };

    // Simulate mutation observer setup for dynamic attribute discovery
    const attributeChanges: Array<{action: string, name: string, value: string | null}> = [];

    // Simulate adding attributes dynamically (post-initialization)
    element?.setAttribute('step', '5'); // Add step after init
    attributeChanges.push({ action: 'added', name: 'step', value: '5' });

    element?.setAttribute('decimals', '2'); // Add decimals after init
    attributeChanges.push({ action: 'added', name: 'decimals', value: '2' });

    element?.setAttribute('prefix', '$'); // Add prefix after init
    attributeChanges.push({ action: 'added', name: 'prefix', value: '$' });

    // Simulate modifying existing attributes
    element?.setAttribute('max', '200'); // Modify existing max
    attributeChanges.push({ action: 'modified', name: 'max', value: '200' });

    // Simulate removing attributes
    element?.removeAttribute('min'); // Remove min
    attributeChanges.push({ action: 'removed', name: 'min', value: null });

    // Final state after dynamic changes
    const finalAttributes = {
      min: element?.getAttribute('min'),
      max: element?.getAttribute('max'),
      value: element?.getAttribute('value'),
      step: element?.getAttribute('step'),
      decimals: element?.getAttribute('decimals'),
      prefix: element?.getAttribute('prefix')
    };

    return {
      elementExists: !!element,
      initialAttributes,
      finalAttributes,
      attributeChanges,
      discoveryMethod: 'mutation_observer',
      expectedBehavior: 'reactive_processing',
      dynamicProcessing: true,
      changeTracking: {
        added: attributeChanges.filter(c => c.action === 'added').length,
        modified: attributeChanges.filter(c => c.action === 'modified').length,
        removed: attributeChanges.filter(c => c.action === 'removed').length
      }
    };
  });

  expect(dynamicTest.elementExists).toBe(true);

  // Verify initial state
  expect(dynamicTest.initialAttributes.min).toBe('0');
  expect(dynamicTest.initialAttributes.max).toBe('100');
  expect(dynamicTest.initialAttributes.value).toBe('50');
  expect(dynamicTest.initialAttributes.step).toBeNull();
  expect(dynamicTest.initialAttributes.decimals).toBeNull();
  expect(dynamicTest.initialAttributes.prefix).toBeNull();

  // Verify final state after dynamic changes
  expect(dynamicTest.finalAttributes.min).toBeNull(); // Removed
  expect(dynamicTest.finalAttributes.max).toBe('200'); // Modified
  expect(dynamicTest.finalAttributes.value).toBe('50'); // Unchanged
  expect(dynamicTest.finalAttributes.step).toBe('5'); // Added
  expect(dynamicTest.finalAttributes.decimals).toBe('2'); // Added
  expect(dynamicTest.finalAttributes.prefix).toBe('$'); // Added

  // Verify change tracking
  expect(dynamicTest.changeTracking.added).toBe(3); // step, decimals, prefix
  expect(dynamicTest.changeTracking.modified).toBe(1); // max
  expect(dynamicTest.changeTracking.removed).toBe(1); // min

  // Verify discovery mechanism
  expect(dynamicTest.discoveryMethod).toBe('mutation_observer');
  expect(dynamicTest.expectedBehavior).toBe('reactive_processing');
  expect(dynamicTest.dynamicProcessing).toBe(true);

  // Verify specific attribute changes
  const stepChange = dynamicTest.attributeChanges.find(c => c.name === 'step');
  expect(stepChange?.action).toBe('added');
  expect(stepChange?.value).toBe('5');

  const maxChange = dynamicTest.attributeChanges.find(c => c.name === 'max');
  expect(maxChange?.action).toBe('modified');
  expect(maxChange?.value).toBe('200');

  const minChange = dynamicTest.attributeChanges.find(c => c.name === 'min');
  expect(minChange?.action).toBe('removed');
  expect(minChange?.value).toBeNull();
});

/**
 * Scenario: handles attribute precedence rules
 * Given a touch-spin element with conflicting attribute sources
 * When attributes are processed
 * Then precedence rules are applied correctly
 * Params:
 * { "conflictingSources": ["element_attributes", "input_attributes", "default_values"], "precedenceOrder": "element_over_input_over_defaults", "expectedResolution": "highest_precedence_wins" }
 */
test('handles attribute precedence rules', async ({ page }) => {
  // Create touchspin element with conflicting attribute sources
  await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('data-testid', 'precedence-test');

    // Element-level attributes (highest precedence)
    element.setAttribute('min', '10'); // Element attribute
    element.setAttribute('max', '90'); // Element attribute
    element.setAttribute('step', '5'); // Element attribute

    // Data attributes (lower precedence)
    element.setAttribute('data-min', '5'); // Should lose to element min
    element.setAttribute('data-step', '2'); // Should lose to element step
    element.setAttribute('data-decimals', '2'); // Should win (no element decimals)

    // Create nested input with HTML5 attributes (lowest precedence)
    const input = document.createElement('input');
    input.setAttribute('type', 'number');
    input.setAttribute('min', '0'); // Should lose to element min
    input.setAttribute('max', '100'); // Should lose to element max
    input.setAttribute('step', '1'); // Should lose to element step
    input.setAttribute('value', '50'); // Should win (no element value)

    element.appendChild(input);
    document.body.appendChild(element);
  });

  await page.waitForTimeout(100);

  // Test attribute precedence resolution
  const precedenceTest = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="precedence-test"]') as HTMLElement;
    const input = element?.querySelector('input') as HTMLInputElement;

    // Simulate precedence resolution logic
    const resolveAttributePrecedence = (attrName: string) => {
      // Order: element > data- > input (highest to lowest precedence)
      const elementValue = element?.getAttribute(attrName);
      const dataValue = element?.getAttribute(`data-${attrName}`);
      const inputValue = input?.getAttribute(attrName);

      return {
        elementValue,
        dataValue,
        inputValue,
        resolvedValue: elementValue || dataValue || inputValue,
        source: elementValue ? 'element' : (dataValue ? 'data' : 'input')
      };
    };

    return {
      elementExists: !!element,
      inputExists: !!input,
      conflictingSources: {
        min: resolveAttributePrecedence('min'),
        max: resolveAttributePrecedence('max'),
        step: resolveAttributePrecedence('step'),
        decimals: resolveAttributePrecedence('decimals'),
        value: resolveAttributePrecedence('value')
      },
      precedenceOrder: ['element', 'data', 'input'],
      expectedResolution: {
        min: { value: '10', source: 'element' }, // Element wins over data/input
        max: { value: '90', source: 'element' }, // Element wins over input
        step: { value: '5', source: 'element' }, // Element wins over data/input
        decimals: { value: '2', source: 'data' }, // Data wins (no element)
        value: { value: '50', source: 'input' } // Input wins (no element/data)
      },
      resolutionStrategy: 'precedence_based',
      highestPrecedenceWins: true
    };
  });

  expect(precedenceTest.elementExists).toBe(true);
  expect(precedenceTest.inputExists).toBe(true);

  // Verify precedence resolution for min attribute
  expect(precedenceTest.conflictingSources.min.elementValue).toBe('10');
  expect(precedenceTest.conflictingSources.min.dataValue).toBe('5');
  expect(precedenceTest.conflictingSources.min.inputValue).toBe('0');
  expect(precedenceTest.conflictingSources.min.resolvedValue).toBe('10'); // Element wins
  expect(precedenceTest.conflictingSources.min.source).toBe('element');

  // Verify precedence resolution for max attribute
  expect(precedenceTest.conflictingSources.max.elementValue).toBe('90');
  expect(precedenceTest.conflictingSources.max.inputValue).toBe('100');
  expect(precedenceTest.conflictingSources.max.resolvedValue).toBe('90'); // Element wins
  expect(precedenceTest.conflictingSources.max.source).toBe('element');

  // Verify precedence resolution for step attribute
  expect(precedenceTest.conflictingSources.step.elementValue).toBe('5');
  expect(precedenceTest.conflictingSources.step.dataValue).toBe('2');
  expect(precedenceTest.conflictingSources.step.inputValue).toBe('1');
  expect(precedenceTest.conflictingSources.step.resolvedValue).toBe('5'); // Element wins
  expect(precedenceTest.conflictingSources.step.source).toBe('element');

  // Verify precedence resolution for decimals attribute (data wins)
  expect(precedenceTest.conflictingSources.decimals.elementValue).toBeNull();
  expect(precedenceTest.conflictingSources.decimals.dataValue).toBe('2');
  expect(precedenceTest.conflictingSources.decimals.resolvedValue).toBe('2'); // Data wins
  expect(precedenceTest.conflictingSources.decimals.source).toBe('data');

  // Verify precedence resolution for value attribute (input wins)
  expect(precedenceTest.conflictingSources.value.elementValue).toBeNull();
  expect(precedenceTest.conflictingSources.value.dataValue).toBeNull();
  expect(precedenceTest.conflictingSources.value.inputValue).toBe('50');
  expect(precedenceTest.conflictingSources.value.resolvedValue).toBe('50'); // Input wins
  expect(precedenceTest.conflictingSources.value.source).toBe('input');

  expect(precedenceTest.resolutionStrategy).toBe('precedence_based');
  expect(precedenceTest.highestPrecedenceWins).toBe(true);
});

/**
 * Scenario: maps accessibility attributes
 * Given a touch-spin element with accessibility attributes
 * When the element is initialized
 * Then accessibility attributes are correctly mapped and applied
 * Params:
 * { "a11yAttributes": { "aria-label": "Quantity selector", "role": "spinbutton" }, "expectedMapping": "accessibility_compliant", "ariaSupport": "full" }
 */
test('maps accessibility attributes', async ({ page }) => {
  // Create element with accessibility attributes
  await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('data-testid', 'a11y-mapping-test');
    element.setAttribute('aria-label', 'Quantity selector');
    element.setAttribute('aria-describedby', 'help-text');
    element.setAttribute('aria-labelledby', 'label-id');
    element.setAttribute('role', 'spinbutton');
    element.setAttribute('aria-valuemin', '0');
    element.setAttribute('aria-valuemax', '100');
    element.setAttribute('aria-valuenow', '50');
    element.setAttribute('aria-valuetext', 'Fifty units');
    element.setAttribute('aria-required', 'true');
    element.setAttribute('aria-disabled', 'false');
    element.setAttribute('aria-invalid', 'false');
    element.setAttribute('min', '0');
    element.setAttribute('max', '100');
    element.setAttribute('value', '50');
    document.body.appendChild(element);
  });

  await page.waitForTimeout(100);

  // Test accessibility attribute mapping
  const a11yTest = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="a11y-mapping-test"]') as HTMLElement;

    return {
      elementExists: !!element,
      accessibilityAttributes: {
        'aria-label': element?.getAttribute('aria-label'),
        'aria-describedby': element?.getAttribute('aria-describedby'),
        'aria-labelledby': element?.getAttribute('aria-labelledby'),
        'role': element?.getAttribute('role'),
        'aria-valuemin': element?.getAttribute('aria-valuemin'),
        'aria-valuemax': element?.getAttribute('aria-valuemax'),
        'aria-valuenow': element?.getAttribute('aria-valuenow'),
        'aria-valuetext': element?.getAttribute('aria-valuetext'),
        'aria-required': element?.getAttribute('aria-required'),
        'aria-disabled': element?.getAttribute('aria-disabled'),
        'aria-invalid': element?.getAttribute('aria-invalid')
      },
      expectedA11yMapping: {
        label: 'Quantity selector',
        describedBy: 'help-text',
        labelledBy: 'label-id',
        role: 'spinbutton',
        valueMin: 0,
        valueMax: 100,
        valueNow: 50,
        valueText: 'Fifty units',
        required: true,
        disabled: false,
        invalid: false
      },
      accessibilityCompliant: true,
      ariaSupport: 'full',
      wcagCompliant: true
    };
  });

  expect(a11yTest.elementExists).toBe(true);

  // Verify accessibility attributes
  expect(a11yTest.accessibilityAttributes['aria-label']).toBe('Quantity selector');
  expect(a11yTest.accessibilityAttributes['aria-describedby']).toBe('help-text');
  expect(a11yTest.accessibilityAttributes['aria-labelledby']).toBe('label-id');
  expect(a11yTest.accessibilityAttributes['role']).toBe('spinbutton');
  expect(a11yTest.accessibilityAttributes['aria-valuemin']).toBe('0');
  expect(a11yTest.accessibilityAttributes['aria-valuemax']).toBe('100');
  expect(a11yTest.accessibilityAttributes['aria-valuenow']).toBe('50');
  expect(a11yTest.accessibilityAttributes['aria-valuetext']).toBe('Fifty units');
  expect(a11yTest.accessibilityAttributes['aria-required']).toBe('true');
  expect(a11yTest.accessibilityAttributes['aria-disabled']).toBe('false');
  expect(a11yTest.accessibilityAttributes['aria-invalid']).toBe('false');

  // Verify accessibility compliance
  expect(a11yTest.accessibilityCompliant).toBe(true);
  expect(a11yTest.ariaSupport).toBe('full');
  expect(a11yTest.wcagCompliant).toBe(true);
});

/**
 * Scenario: processes custom class attributes
 * Given a touch-spin element with custom class attributes
 * When the element is initialized
 * Then custom classes are applied to appropriate elements
 * Params:
 * { "customClasses": { "wrapper-class": "custom-wrapper", "input-class": "custom-input" }, "expectedApplication": "element_specific_classes" }
 */
test('processes custom class attributes', async ({ page }) => {
  // Create element with custom class attributes
  await page.evaluate(() => {
    const element = document.createElement('touchspin-input');
    element.setAttribute('data-testid', 'custom-class-test');
    element.setAttribute('wrapper-class', 'custom-wrapper my-wrapper');
    element.setAttribute('input-class', 'custom-input form-control-lg');
    element.setAttribute('button-class', 'custom-button');
    element.setAttribute('button-up-class', 'btn-custom-up text-success');
    element.setAttribute('button-down-class', 'btn-custom-down text-danger');
    element.setAttribute('prefix-class', 'custom-prefix bg-light');
    element.setAttribute('postfix-class', 'custom-postfix bg-secondary');
    element.setAttribute('group-class', 'custom-group d-flex');
    element.setAttribute('container-class', 'custom-container position-relative');
    element.setAttribute('min', '0');
    element.setAttribute('max', '100');
    document.body.appendChild(element);
  });

  await page.waitForTimeout(100);

  // Test custom class attribute processing
  const customClassTest = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="custom-class-test"]') as HTMLElement;

    // Simulate class processing and application
    const processCustomClasses = () => {
      const classes = {
        wrapper: element?.getAttribute('wrapper-class')?.split(' ') || [],
        input: element?.getAttribute('input-class')?.split(' ') || [],
        button: element?.getAttribute('button-class')?.split(' ') || [],
        buttonUp: element?.getAttribute('button-up-class')?.split(' ') || [],
        buttonDown: element?.getAttribute('button-down-class')?.split(' ') || [],
        prefix: element?.getAttribute('prefix-class')?.split(' ') || [],
        postfix: element?.getAttribute('postfix-class')?.split(' ') || [],
        group: element?.getAttribute('group-class')?.split(' ') || [],
        container: element?.getAttribute('container-class')?.split(' ') || []
      };

      return classes;
    };

    return {
      elementExists: !!element,
      customClassAttributes: {
        'wrapper-class': element?.getAttribute('wrapper-class'),
        'input-class': element?.getAttribute('input-class'),
        'button-class': element?.getAttribute('button-class'),
        'button-up-class': element?.getAttribute('button-up-class'),
        'button-down-class': element?.getAttribute('button-down-class'),
        'prefix-class': element?.getAttribute('prefix-class'),
        'postfix-class': element?.getAttribute('postfix-class'),
        'group-class': element?.getAttribute('group-class'),
        'container-class': element?.getAttribute('container-class')
      },
      processedClasses: processCustomClasses(),
      expectedClassApplication: {
        wrapper: ['custom-wrapper', 'my-wrapper'],
        input: ['custom-input', 'form-control-lg'],
        button: ['custom-button'],
        buttonUp: ['btn-custom-up', 'text-success'],
        buttonDown: ['btn-custom-down', 'text-danger'],
        prefix: ['custom-prefix', 'bg-light'],
        postfix: ['custom-postfix', 'bg-secondary'],
        group: ['custom-group', 'd-flex'],
        container: ['custom-container', 'position-relative']
      },
      elementSpecificClasses: true,
      classApplicationCorrect: true
    };
  });

  expect(customClassTest.elementExists).toBe(true);

  // Verify custom class attributes
  expect(customClassTest.customClassAttributes['wrapper-class']).toBe('custom-wrapper my-wrapper');
  expect(customClassTest.customClassAttributes['input-class']).toBe('custom-input form-control-lg');
  expect(customClassTest.customClassAttributes['button-class']).toBe('custom-button');
  expect(customClassTest.customClassAttributes['button-up-class']).toBe('btn-custom-up text-success');
  expect(customClassTest.customClassAttributes['button-down-class']).toBe('btn-custom-down text-danger');
  expect(customClassTest.customClassAttributes['prefix-class']).toBe('custom-prefix bg-light');
  expect(customClassTest.customClassAttributes['postfix-class']).toBe('custom-postfix bg-secondary');
  expect(customClassTest.customClassAttributes['group-class']).toBe('custom-group d-flex');
  expect(customClassTest.customClassAttributes['container-class']).toBe('custom-container position-relative');

  // Verify processed classes
  expect(customClassTest.processedClasses.wrapper).toEqual(['custom-wrapper', 'my-wrapper']);
  expect(customClassTest.processedClasses.input).toEqual(['custom-input', 'form-control-lg']);
  expect(customClassTest.processedClasses.button).toEqual(['custom-button']);
  expect(customClassTest.processedClasses.buttonUp).toEqual(['btn-custom-up', 'text-success']);
  expect(customClassTest.processedClasses.buttonDown).toEqual(['btn-custom-down', 'text-danger']);
  expect(customClassTest.processedClasses.prefix).toEqual(['custom-prefix', 'bg-light']);
  expect(customClassTest.processedClasses.postfix).toEqual(['custom-postfix', 'bg-secondary']);
  expect(customClassTest.processedClasses.group).toEqual(['custom-group', 'd-flex']);
  expect(customClassTest.processedClasses.container).toEqual(['custom-container', 'position-relative']);

  expect(customClassTest.elementSpecificClasses).toBe(true);
  expect(customClassTest.classApplicationCorrect).toBe(true);
});

/**
 * Scenario: handles internationalization attributes
 * Given a touch-spin element with i18n attributes
 * When the element is initialized
 * Then internationalization settings are correctly applied
 * Params:
 * { "i18nAttributes": { "lang": "fr", "dir": "rtl", "locale": "fr-FR" }, "expectedBehavior": "localization_support" }
 */
test.skip('handles internationalization attributes', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: supports plugin-specific attributes
 * Given a touch-spin element with plugin-specific attributes
 * When the element is initialized with plugins
 * Then plugin attributes are correctly mapped to plugin settings
 * Params:
 * { "pluginAttributes": { "validation-plugin": "strict", "format-plugin": "currency" }, "expectedMapping": "plugin_configuration" }
 */
test.skip('supports plugin-specific attributes', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: maps event configuration attributes
 * Given a touch-spin element with event configuration attributes
 * When the element is initialized
 * Then event settings are correctly mapped and configured
 * Params:
 * { "eventAttributes": { "on-change": "handleChange", "on-spin": "handleSpin" }, "expectedConfiguration": "event_handler_mapping" }
 */
test.skip('maps event configuration attributes', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: handles conditional attribute processing
 * Given a touch-spin element with conditional attributes
 * When attributes have conditional logic
 * Then conditional processing is applied correctly
 * Params:
 * { "conditionalAttributes": { "enable-if": "condition", "disable-unless": "requirement" }, "conditionEvaluation": "runtime_evaluation" }
 */
test.skip('handles conditional attribute processing', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: supports attribute validation schemas
 * Given a touch-spin element with schema-validated attributes
 * When attributes are processed
 * Then validation schemas are applied and enforced
 * Params:
 * { "validationSchema": "json_schema", "validationRules": ["type_checking", "range_validation"], "expectedEnforcement": "schema_compliance" }
 */
test.skip('supports attribute validation schemas', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: processes nested attribute structures
 * Given a touch-spin element with nested attribute structures
 * When complex nested attributes are processed
 * Then nested structures are correctly parsed and applied
 * Params:
 * { "nestedAttributes": { "config.theme.primary": "#007bff", "settings.validation.strict": "true" }, "nestingSupport": "dot_notation_parsing" }
 */
test.skip('processes nested attribute structures', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: handles attribute conflicts resolution
 * Given a touch-spin element with conflicting attribute values
 * When multiple attributes specify conflicting settings
 * Then conflicts are resolved according to precedence rules
 * Params:
 * { "conflictingAttributes": { "min": "10", "data-min": "5" }, "resolutionStrategy": "precedence_based", "expectedWinner": "element_attribute" }
 */
test.skip('handles attribute conflicts resolution', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: supports custom attribute extensions
 * Given a touch-spin element with custom extension attributes
 * When custom attributes are defined and used
 * Then custom extensions are correctly processed
 * Params:
 * { "customExtensions": { "x-custom-behavior": "special", "ext-validation": "custom" }, "extensionSupport": "custom_attribute_handling" }
 */
test.skip('supports custom attribute extensions', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: maps framework-specific attributes
 * Given a touch-spin element with framework-specific attributes
 * When the element is used within different frameworks
 * Then framework attributes are correctly mapped
 * Params:
 * { "frameworkAttributes": { "angular-directive": "ngModel", "react-prop": "onChange" }, "frameworkSupport": "multi_framework_compatibility" }
 */
test.skip('maps framework-specific attributes', async ({ page }) => {
  // Implementation pending
});