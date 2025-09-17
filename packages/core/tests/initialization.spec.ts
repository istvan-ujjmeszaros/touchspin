import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../../__tests__/helpers/touchspinHelpers';
import { initializeTouchSpinCore, isTouchSpinCoreInitialized, getInputValue, setInputAttribute } from '../test-helpers';

test.describe('Core TouchSpin Initialization', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/test-helpers/fixtures/minimal.html');
    await page.waitForFunction(() => (window as any).coreTestReady === true);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'core-initialization');
  });

  test.describe('Constructor Validation', () => {

    test('should throw error when no input element provided', async ({ page }) => {
      const errorMessage = await page.evaluate(async () => {
        try {
          const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
          new TouchSpinCore(null as any);
          return null;
        } catch (error) {
          return error.message;
        }
      });

      expect(errorMessage).toBe('TouchSpinCore requires an <input> element');
    });

    test('should throw error when non-input element provided', async ({ page }) => {
      const errorMessage = await page.evaluate(async () => {
        try {
          const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
          const div = document.createElement('div');
          new TouchSpinCore(div as any);
          return null;
        } catch (error) {
          return error.message;
        }
      });

      expect(errorMessage).toBe('TouchSpinCore requires an <input> element');
    });

    test('should initialize with valid input element', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {});

      expect(await isTouchSpinCoreInitialized(page, 'test-input')).toBe(true);
    });
  });

  test.describe('Default Settings', () => {

    test('should apply default settings when no options provided', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {});

      const settings = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        return core.settings;
      });

      expect(settings.min).toBe(0);
      expect(settings.max).toBe(100);
      expect(settings.step).toBe(1);
      expect(settings.decimals).toBe(0);
      expect(settings.forcestepdivisibility).toBe('round');
      expect(settings.initval).toBe('');
      expect(settings.booster).toBe(true);
      expect(settings.mousewheel).toBe(true);
    });

    test('should merge custom options with defaults', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {
        min: 10,
        max: 50,
        step: 5
      });

      const settings = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        return {
          min: core.settings.min,
          max: core.settings.max,
          step: core.settings.step,
          decimals: core.settings.decimals // Should remain default
        };
      });

      expect(settings.min).toBe(10);
      expect(settings.max).toBe(50);
      expect(settings.step).toBe(5);
      expect(settings.decimals).toBe(0); // Default value
    });
  });

  test.describe('Global Defaults', () => {

    test('should use global defaults when available', async ({ page }) => {
      const settings = await page.evaluate(async () => {
        // Set global defaults
        (globalThis as any).TouchSpinDefaultOptions = {
          min: 5,
          max: 95,
          step: 2
        };

        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = new TouchSpinCore(input, {});

        return {
          min: core.settings.min,
          max: core.settings.max,
          step: core.settings.step
        };
      });

      expect(settings.min).toBe(5);
      expect(settings.max).toBe(95);
      expect(settings.step).toBe(2);

      // Clean up global defaults
      await page.evaluate(() => {
        delete (globalThis as any).TouchSpinDefaultOptions;
      });
    });

    test('should prioritize explicit options over global defaults', async ({ page }) => {
      const settings = await page.evaluate(async () => {
        // Set global defaults
        (globalThis as any).TouchSpinDefaultOptions = {
          min: 5,
          max: 95,
          step: 2
        };

        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        // Explicit options should override global defaults
        const core = new TouchSpinCore(input, { min: 20, step: 10 });

        return {
          min: core.settings.min,
          max: core.settings.max, // Should use global default
          step: core.settings.step
        };
      });

      expect(settings.min).toBe(20); // Explicit option
      expect(settings.max).toBe(95); // Global default
      expect(settings.step).toBe(10); // Explicit option

      // Clean up global defaults
      await page.evaluate(() => {
        delete (globalThis as any).TouchSpinDefaultOptions;
      });
    });
  });

  test.describe('Data Attributes', () => {

    test('should parse data-bts-* attributes', async ({ page }) => {
      // Set data attributes on the input
      await setInputAttribute(page, 'test-input', 'data-bts-min', '15');
      await setInputAttribute(page, 'test-input', 'data-bts-max', '85');
      await setInputAttribute(page, 'test-input', 'data-bts-step', '3');

      await initializeTouchSpinCore(page, 'test-input', {});

      const settings = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        return {
          min: core.settings.min,
          max: core.settings.max,
          step: core.settings.step
        };
      });

      expect(settings.min).toBe(15);
      expect(settings.max).toBe(85);
      expect(settings.step).toBe(3);
    });

    test('should parse native min/max/step attributes', async ({ page }) => {
      await setInputAttribute(page, 'test-input', 'min', '25');
      await setInputAttribute(page, 'test-input', 'max', '75');
      await setInputAttribute(page, 'test-input', 'step', '2.5');

      await initializeTouchSpinCore(page, 'test-input', {});

      const settings = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        return {
          min: core.settings.min,
          max: core.settings.max,
          step: core.settings.step
        };
      });

      expect(settings.min).toBe(25);
      expect(settings.max).toBe(75);
      expect(settings.step).toBe(2.5);
    });

    test('should prioritize native attributes over data-bts attributes with warning', async ({ page }) => {
      // Set both native and data-bts attributes
      await setInputAttribute(page, 'test-input', 'min', '30');
      await setInputAttribute(page, 'test-input', 'data-bts-min', '15');

      let warningLogged = false;
      page.on('console', msg => {
        if (msg.type() === 'warning' && msg.text().includes('Native attribute takes precedence')) {
          warningLogged = true;
        }
      });

      await initializeTouchSpinCore(page, 'test-input', {});

      const settings = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        return { min: core.settings.min };
      });

      expect(settings.min).toBe(30); // Native attribute wins
      expect(warningLogged).toBe(true);
    });
  });

  test.describe('Initial Value', () => {

    test('should use existing input value when no initval specified', async ({ page }) => {
      // Input has value="50" by default
      await initializeTouchSpinCore(page, 'test-input', {});

      expect(await getInputValue(page, 'test-input')).toBe('50');
    });

    test('should set initval when input is empty', async ({ page }) => {
      // Clear the input first
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '';
      });

      await initializeTouchSpinCore(page, 'test-input', { initval: '25' });

      expect(await getInputValue(page, 'test-input')).toBe('25');
    });

    test('should not override existing value with initval', async ({ page }) => {
      // Input already has value="50"
      await initializeTouchSpinCore(page, 'test-input', { initval: '25' });

      expect(await getInputValue(page, 'test-input')).toBe('50'); // Existing value preserved
    });
  });

  test.describe('No Renderer Warning', () => {

    test('should warn when no renderer specified', async ({ page }) => {
      let warningLogged = false;
      page.on('console', msg => {
        if (msg.type() === 'warning' && msg.text().includes('No renderer specified')) {
          warningLogged = true;
        }
      });

      await initializeTouchSpinCore(page, 'test-input', { renderer: null });

      expect(warningLogged).toBe(true);
    });

    test('should use global default renderer when available', async ({ page }) => {
      const rendererUsed = await page.evaluate(async () => {
        // Mock global default renderer
        (globalThis as any).TouchSpinDefaultRenderer = class MockRenderer {
          constructor() {}
          init() {}
          finalizeWrapperAttributes() {}
        };

        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = new TouchSpinCore(input, {}); // No explicit renderer

        const hasRenderer = !!core.renderer;

        // Clean up
        delete (globalThis as any).TouchSpinDefaultRenderer;

        return hasRenderer;
      });

      expect(rendererUsed).toBe(true);
    });
  });

  test.describe('Instance Storage', () => {

    test('should store instance on input element', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {});

      const hasInstance = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        return !!(input as any)._touchSpinCore;
      });

      expect(hasInstance).toBe(true);
    });

    test('should return public API from TouchSpin function', async ({ page }) => {
      const apiMethods = await page.evaluate(async () => {
        const { TouchSpin } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const api = TouchSpin(input, {});

        return {
          hasUpOnce: typeof api.upOnce === 'function',
          hasDownOnce: typeof api.downOnce === 'function',
          hasGetValue: typeof api.getValue === 'function',
          hasSetValue: typeof api.setValue === 'function',
          hasDestroy: typeof api.destroy === 'function'
        };
      });

      expect(apiMethods.hasUpOnce).toBe(true);
      expect(apiMethods.hasDownOnce).toBe(true);
      expect(apiMethods.hasGetValue).toBe(true);
      expect(apiMethods.hasSetValue).toBe(true);
      expect(apiMethods.hasDestroy).toBe(true);
    });
  });

  test.describe('ARIA Attributes', () => {

    test('should set spinbutton role and ARIA attributes', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { min: 0, max: 100 });

      const ariaAttributes = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        return {
          role: input.getAttribute('role'),
          valuemin: input.getAttribute('aria-valuemin'),
          valuemax: input.getAttribute('aria-valuemax'),
          valuenow: input.getAttribute('aria-valuenow'),
          valuetext: input.getAttribute('aria-valuetext')
        };
      });

      expect(ariaAttributes.role).toBe('spinbutton');
      expect(ariaAttributes.valuemin).toBe('0');
      expect(ariaAttributes.valuemax).toBe('100');
      expect(ariaAttributes.valuenow).toBe('50'); // Current input value
      expect(ariaAttributes.valuetext).toBe('50');
    });

    test('should handle null min/max in ARIA attributes', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { min: null, max: null });

      const ariaAttributes = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        return {
          hasValuemin: input.hasAttribute('aria-valuemin'),
          hasValuemax: input.hasAttribute('aria-valuemax'),
          valuenow: input.getAttribute('aria-valuenow')
        };
      });

      expect(ariaAttributes.hasValuemin).toBe(false);
      expect(ariaAttributes.hasValuemax).toBe(false);
      expect(ariaAttributes.valuenow).toBe('50');
    });
  });
});