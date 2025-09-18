import { Page } from '@playwright/test';
import touchspinHelpers from './touchspinHelpers';

/**
 * Test helper that can run tests against both original and modern implementations
 */
export class DualTestHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Load the appropriate test fixture based on implementation type
   */
  async loadFixture(implementation: 'original' | 'modern', bootstrap: 3 | 4 | 5 = 4) {
    const baseUrl = implementation === 'original'
      ? `/__tests__/html/index-bs${bootstrap}.html`
      : `/__tests__/html/index-bs${bootstrap}-modern.html`;

    await this.page.goto(baseUrl);

    // Wait for initialization
    if (implementation === 'modern') {
      await this.page.waitForFunction(() => window.modernTouchSpinInstalled === true);
    }

    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Test basic increment/decrement functionality
   */
  async testBasicIncrementDecrement(testid: string) {
    // Get initial value
    const initialValue = await touchspinHelpers.readInputValue(this.page, testid);

    // Test increment
    await touchspinHelpers.clickUpButton(this.page, testid);
    const afterIncrement = await touchspinHelpers.readInputValue(this.page, testid);

    // Test decrement
    await touchspinHelpers.clickDownButton(this.page, testid);
    const afterDecrement = await touchspinHelpers.readInputValue(this.page, testid);

    return {
      initial: initialValue,
      afterIncrement,
      afterDecrement
    };
  }

  /**
   * Test programmatic API methods
   */
  async testProgrammaticAPI(testid: string) {
    const inputSelector = `input[data-testid="${testid}"]`;

    // Test getValue
    const getValue = await this.page.evaluate((selector) => {
      const input = document.querySelector(selector);
      if (!input) return { error: 'Input not found' };

      const $ = window.jQuery || window.$;
      if (!$) return { error: 'jQuery not found' };

      const $input = $(input);
      // Try both 'touchspin' (modern) and 'touchspinInternal' (original)
      let api = $input.data('touchspin');
      if (!api) api = $input.data('touchspinInternal');
      if (!api) return { error: 'TouchSpin API not found', hasData: !!$input.data() };

      try {
        return api.getValue();
      } catch (e) {
        return { error: 'getValue failed', message: e.message };
      }
    }, inputSelector);

    // Test setValue
    await this.page.evaluate((selector) => {
      const input = document.querySelector(selector);
      const $ = window.jQuery || window.$;
      if (!$ || !input) return;
      const $input = $(input);
      let api = $input.data('touchspin');
      if (!api) api = $input.data('touchspinInternal');
      if (api) api.setValue(99);
    }, inputSelector);

    const valueAfterSet = await touchspinHelpers.readInputValue(this.page, testid);

    // Test upOnce
    await this.page.evaluate((selector) => {
      const input = document.querySelector(selector);
      const $ = window.jQuery || window.$;
      if (!$ || !input) return;
      const $input = $(input);
      let api = $input.data('touchspin');
      if (!api) api = $input.data('touchspinInternal');
      if (api) api.upOnce();
    }, inputSelector);

    const valueAfterUpOnce = await touchspinHelpers.readInputValue(this.page, testid);

    return {
      getValue,
      valueAfterSet,
      valueAfterUpOnce
    };
  }

  /**
   * Test event emission
   */
  async testEventEmission(testid: string): Promise<string[]> {
    // Clear event log
    await this.page.evaluate(() => {
      const log = document.getElementById('events_log');
      if (log) log.textContent = '';
    });

    // Perform some actions
    await touchspinHelpers.clickUpButton(this.page, testid);
    await touchspinHelpers.clickDownButton(this.page, testid);

    // Get logged events
    const events = await this.page.evaluate(() => {
      const log = document.getElementById('events_log');
      return log ? log.textContent.split('\n').filter(line => line.trim()) : [];
    });

    return events;
  }

  /**
   * Test boundary behavior (min/max)
   */
  async testBoundaryBehavior(testid: string, min: number = 0, max: number = 100) {
    const inputSelector = `input[data-testid="${testid}"]`;

    // Set to near max
    await this.page.evaluate(({selector, value}) => {
      const input = document.querySelector(selector);
      const $ = window.jQuery || window.$;
      if (!$ || !input) return;
      const $input = $(input);
      let api = $input.data('touchspin');
      if (!api) api = $input.data('touchspinInternal');
      if (api) api.setValue(value);
    }, {selector: inputSelector, value: max - 1});

    const nearMax = await touchspinHelpers.readInputValue(this.page, testid);

    // Try to go beyond max
    await touchspinHelpers.clickUpButton(this.page, testid);
    const atMax = await touchspinHelpers.readInputValue(this.page, testid);

    await touchspinHelpers.clickUpButton(this.page, testid);
    const beyondMax = await touchspinHelpers.readInputValue(this.page, testid);

    // Set to near min
    await this.page.evaluate(({selector, value}) => {
      const input = document.querySelector(selector);
      const $ = window.jQuery || window.$;
      if (!$ || !input) return;
      const $input = $(input);
      let api = $input.data('touchspin');
      if (!api) api = $input.data('touchspinInternal');
      if (api) api.setValue(value);
    }, {selector: inputSelector, value: min + 1});

    const nearMin = await touchspinHelpers.readInputValue(this.page, testid);

    // Try to go beyond min
    await touchspinHelpers.clickDownButton(this.page, testid);
    const atMin = await touchspinHelpers.readInputValue(this.page, testid);

    await touchspinHelpers.clickDownButton(this.page, testid);
    const beyondMin = await touchspinHelpers.readInputValue(this.page, testid);

    return {
      nearMax,
      atMax,
      beyondMax,
      nearMin,
      atMin,
      beyondMin
    };
  }

  /**
   * Test disabled/readonly state handling
   */
  async testDisabledReadonly(testid: string) {
    const initialValue = await touchspinHelpers.readInputValue(this.page, testid);

    // Try to click buttons - should not change value
    await touchspinHelpers.clickUpButton(this.page, testid);
    const afterUpClick = await touchspinHelpers.readInputValue(this.page, testid);

    await touchspinHelpers.clickDownButton(this.page, testid);
    const afterDownClick = await touchspinHelpers.readInputValue(this.page, testid);

    return {
      initial: initialValue,
      afterUpClick,
      afterDownClick
    };
  }
}

/**
 * Factory function to create dual test helpers
 */
export function createDualTestHelpers(page: Page): DualTestHelpers {
  return new DualTestHelpers(page);
}

export default DualTestHelpers;
