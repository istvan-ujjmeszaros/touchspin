import touchspinHelpers from './helpers/touchspinHelpers';
import {page, port} from './helpers/jestPuppeteerServerSetup';

describe('Vertical Buttons', () => {

  describe('Basic Vertical Button Functionality', () => {
    it('should render vertical buttons correctly', async () => {
      const selector = '#input_vertical';
      
      const verticalWrapper = await page.$('.bootstrap-touchspin-vertical-button-wrapper');
      expect(verticalWrapper).toBeTruthy();

      const upButton = await page.$('.bootstrap-touchspin-up');
      const downButton = await page.$('.bootstrap-touchspin-down');
      
      expect(upButton).toBeTruthy();
      expect(downButton).toBeTruthy();
    });

    it('should increase value when clicking vertical up button', async () => {
      const selector = '#input_vertical';
      
      await touchspinHelpers.touchspinClickUp(page, selector);
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });

    it('should decrease value when clicking vertical down button', async () => {
      const selector = '#input_vertical';
      
      await touchspinHelpers.touchspinClickDown(page, selector);
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('49');
    });
  });

  describe('Vertical Buttons with Size Variations', () => {
    it('should render small vertical buttons correctly', async () => {
      const selector = '#input_sm_vertical';
      
      const inputGroup = await page.$eval(selector, (input: Element) => {
        const inputElement = input as HTMLInputElement;
        return inputElement.parentElement?.className;
      });
      
      expect(inputGroup).toContain('input-group-sm');
      
      const verticalWrapper = await page.$('.bootstrap-touchspin-vertical-button-wrapper');
      expect(verticalWrapper).toBeTruthy();
    });

    it('should render large vertical buttons correctly', async () => {
      const selector = '#input_lg_vertical';
      
      const inputGroup = await page.$eval(selector, (input: Element) => {
        const inputElement = input as HTMLInputElement;
        return inputElement.parentElement?.className;
      });
      
      expect(inputGroup).toContain('input-group-lg');
      
      const verticalWrapper = await page.$('.bootstrap-touchspin-vertical-button-wrapper');
      expect(verticalWrapper).toBeTruthy();
    });
  });

  describe('Vertical Buttons with Prefix/Postfix', () => {
    it('should render vertical buttons with prefix and postfix', async () => {
      const selector = '#input_group_vertical';
      
      const prefix = await page.$('.bootstrap-touchspin-prefix');
      const postfix = await page.$('.bootstrap-touchspin-postfix');
      const verticalWrapper = await page.$('.bootstrap-touchspin-vertical-button-wrapper');
      
      expect(prefix).toBeTruthy();
      expect(postfix).toBeTruthy();
      expect(verticalWrapper).toBeTruthy();
    });

    it('should function correctly with prefix/postfix in small size', async () => {
      const selector = '#input_group_sm_vertical';
      
      await touchspinHelpers.touchspinClickUp(page, selector);
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });

    it('should function correctly with prefix/postfix in large size', async () => {
      const selector = '#input_group_lg_vertical';
      
      await touchspinHelpers.touchspinClickUp(page, selector);
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });
  });

  describe('Vertical Buttons in Existing Input Groups', () => {
    it('should work with existing DOM input group with prefix and postfix', async () => {
      const selector = '#input_group_from_dom_prefix_postfix_vertical';
      
      // Check that original DOM elements are preserved
      const existingPrepend = await page.$('.input-group .input-group-prepend:not(.bootstrap-touchspin-prefix)');
      const existingAppend = await page.$('.input-group .input-group-append:not(.bootstrap-touchspin-postfix)');
      
      expect(existingPrepend).toBeTruthy();
      expect(existingAppend).toBeTruthy();
      
      // Check that vertical buttons are added
      const verticalWrapper = await page.$('.bootstrap-touchspin-vertical-button-wrapper');
      expect(verticalWrapper).toBeTruthy();
      
      // Test functionality
      await touchspinHelpers.touchspinClickUp(page, selector);
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });

    it('should work with existing DOM input group with only prefix', async () => {
      const selector = '#input_group_from_dom_prefix_vertical';
      
      // Check that original DOM elements are preserved
      const existingPrepend = await page.$('.input-group .input-group-prepend:not(.bootstrap-touchspin-prefix)');
      expect(existingPrepend).toBeTruthy();
      
      // Check that vertical buttons are added
      const verticalWrapper = await page.$('.bootstrap-touchspin-vertical-button-wrapper');
      expect(verticalWrapper).toBeTruthy();
      
      // Test functionality
      await touchspinHelpers.touchspinClickUp(page, selector);
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });
  });

  describe('Vertical Button Event Handling', () => {
    it('should fire appropriate events when using vertical buttons', async () => {
      const selector = '#input_vertical';
      
      // Click up button
      await page.click('.bootstrap-touchspin-up');
      await touchspinHelpers.waitForTimeout(300);
      
      expect(await touchspinHelpers.changeEventCounter(page)).toBe(1);
    });

    it('should support long press on vertical buttons', async () => {
      const selector = '#input_vertical';
      const initialValue = await touchspinHelpers.readInputValue(page, selector);
      
      // Start mousedown on vertical up button
      await page.evaluate(() => {
        const button = document.querySelector('.bootstrap-touchspin-up');
        button?.dispatchEvent(new Event('mousedown'));
      });
      
      // Wait for spin interval
      await touchspinHelpers.waitForTimeout(600);
      
      // Stop the spin
      await page.evaluate(() => {
        const button = document.querySelector('.bootstrap-touchspin-up');
        button?.dispatchEvent(new Event('mouseup'));
      });
      
      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, selector) || '0');
      const originalValue = parseInt(initialValue || '0');
      
      expect(finalValue).toBeGreaterThan(originalValue + 1); // Should have incremented multiple times
    });

    it('should handle disabled state for vertical buttons', async () => {
      await touchspinHelpers.setInputAttr(page, '#input_vertical', 'disabled', true);
      
      const upButton = await page.$('.bootstrap-touchspin-up');
      const downButton = await page.$('.bootstrap-touchspin-down');
      
      const upDisabled = await upButton?.evaluate(el => (el as HTMLButtonElement).hasAttribute('disabled'));
      const downDisabled = await downButton?.evaluate(el => (el as HTMLButtonElement).hasAttribute('disabled'));
      
      expect(upDisabled).toBe(true);
      expect(downDisabled).toBe(true);
    });
  });

  describe('Bootstrap 3 Vertical Button Compatibility', () => {
    beforeEach(async () => {
      await page.goto(`http://localhost:${port}/__tests__/html/index-bs3-vertical.html`);
    });

    it('should use correct Bootstrap 3 classes for vertical buttons', async () => {
      const verticalWrapper = await page.$('.bootstrap-touchspin-vertical-button-wrapper');
      expect(verticalWrapper).toBeTruthy();

      // Check for Bootstrap 3 specific structure
      const wrapperClasses = await page.$eval('.bootstrap-touchspin-vertical-button-wrapper', el => el.className);
      expect(wrapperClasses).toContain('input-group-addon');
    });

    it('should function correctly in Bootstrap 3', async () => {
      const selector = '#input_vertical';
      
      await touchspinHelpers.touchspinClickUp(page, selector);
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });
  });
});