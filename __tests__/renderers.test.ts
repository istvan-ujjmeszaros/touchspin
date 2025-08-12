import touchspinHelpers from './helpers/touchspinHelpers';
import {page, port} from './helpers/jestPuppeteerServerSetup';

describe('Bootstrap Renderer System', () => {

  describe('Bootstrap 3 Renderer', () => {
    beforeEach(async () => {
      await page.goto(`http://localhost:${port}/__tests__/html/index-bs3.html`);
    });

    it('should use input-group-addon class for prefix and postfix', async () => {
      const selector = '#input_group_sm';
      const prefixClasses = await page.$eval('.bootstrap-touchspin-prefix', el => el.className);
      const postfixClasses = await page.$eval('.bootstrap-touchspin-postfix', el => el.className);
      
      expect(prefixClasses).toContain('input-group-addon');
      expect(postfixClasses).toContain('input-group-addon');
    });

    it('should use input-group-btn class for buttons', async () => {
      const selector = '#testinput_default';
      const buttonContainer = await page.$eval(selector + ' + .input-group-btn', el => el.className);
      
      expect(buttonContainer).toContain('input-group-btn');
    });

    it('should detect and apply input-group-sm class for small inputs', async () => {
      const selector = '#input_group_sm';
      const inputGroupClasses = await page.$eval(selector, (input: Element) => {
        const inputElement = input as HTMLInputElement;
        return inputElement.parentElement?.className;
      });
      
      expect(inputGroupClasses).toContain('input-group-sm');
    });

    it('should detect and apply input-group-lg class for large inputs', async () => {
      const selector = '#input_group_lg';
      const inputGroupClasses = await page.$eval(selector, (input: Element) => {
        const inputElement = input as HTMLInputElement;
        return inputElement.parentElement?.className;
      });
      
      expect(inputGroupClasses).toContain('input-group-lg');
    });

    it('should render vertical buttons correctly with proper wrapper classes', async () => {
      const selector = '#input_vertical';
      const verticalWrapper = await page.$('.bootstrap-touchspin-vertical-button-wrapper');
      expect(verticalWrapper).toBeTruthy();

      const verticalContainer = await page.$('.input-group-btn-vertical');
      expect(verticalContainer).toBeTruthy();
    });
  });

  describe('Bootstrap 4 Renderer', () => {
    beforeEach(async () => {
      await page.goto(`http://localhost:${port}/__tests__/html/index-bs4.html`);
    });

    it('should use input-group-text class for prefix and postfix content', async () => {
      const selector = '#input_group_sm';
      
      // Check for input-group-text inside prefix
      const prefixText = await page.$('.bootstrap-touchspin-prefix .input-group-text');
      expect(prefixText).toBeTruthy();

      // Check for input-group-text inside postfix
      const postfixText = await page.$('.bootstrap-touchspin-postfix .input-group-text');
      expect(postfixText).toBeTruthy();
    });

    it('should use input-group-prepend and input-group-append classes', async () => {
      const selector = '#input_group_sm';
      const prefixClasses = await page.$eval('.bootstrap-touchspin-prefix', el => el.className);
      const postfixClasses = await page.$eval('.bootstrap-touchspin-postfix', el => el.className);
      
      expect(prefixClasses).toContain('input-group-prepend');
      expect(postfixClasses).toContain('input-group-append');
    });

    it('should properly handle existing input groups with prepend/append', async () => {
      const selector = '#input_group_from_dom_prefix_postfix';
      
      // Check that existing prepend/append elements are preserved
      const existingPrepend = await page.$('.input-group .input-group-prepend:not(.bootstrap-touchspin-prefix)');
      const existingAppend = await page.$('.input-group .input-group-append:not(.bootstrap-touchspin-postfix)');
      
      expect(existingPrepend).toBeTruthy();
      expect(existingAppend).toBeTruthy();
    });
  });

  describe('Bootstrap 5 Renderer', () => {
    beforeEach(async () => {
      await page.goto(`http://localhost:${port}/__tests__/html/index-bs5.html`);
    });

    it('should use direct input-group-text without prepend/append wrappers', async () => {
      const selector = '#input_group_sm';
      
      // Check for direct input-group-text elements (no prepend/append wrappers)
      const prefixText = await page.$('.bootstrap-touchspin-prefix.input-group-text');
      const postfixText = await page.$('.bootstrap-touchspin-postfix.input-group-text');
      
      expect(prefixText).toBeTruthy();
      expect(postfixText).toBeTruthy();

      // Verify no prepend/append wrapper classes exist
      const prepend = await page.$('.input-group-prepend');
      const append = await page.$('.input-group-append');
      
      expect(prepend).toBeFalsy();
      expect(append).toBeFalsy();
    });

    it('should use direct button placement in input groups', async () => {
      const selector = '#testinput_default';
      
      // Check that buttons are direct children of input-group
      const upButton = await page.$('.input-group > .bootstrap-touchspin-up');
      const downButton = await page.$('.input-group > .bootstrap-touchspin-down');
      
      expect(upButton).toBeTruthy();
      expect(downButton).toBeTruthy();
    });

    it('should function correctly with Bootstrap 5 structure', async () => {
      const selector = '#testinput_default';
      
      // Test basic functionality
      await touchspinHelpers.touchspinClickUp(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
      
      await touchspinHelpers.touchspinClickDown(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
    });

    it('should handle existing input-group-text elements correctly', async () => {
      const selector = '#input_group_from_dom_prefix_postfix';
      
      // Check that existing input-group-text elements are preserved
      const existingElements = await page.$$('.input-group .input-group-text:not(.bootstrap-touchspin-prefix):not(.bootstrap-touchspin-postfix)');
      expect(existingElements.length).toBeGreaterThan(0);
      
      // Test that TouchSpin still works
      await touchspinHelpers.touchspinClickUp(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });

    it('should properly handle size classes for input groups', async () => {
      const selector = '#input_group_sm';
      const inputGroupClasses = await page.$eval(selector, (input: Element) => {
        const inputElement = input as HTMLInputElement;
        return inputElement.parentElement?.className;
      });
      
      expect(inputGroupClasses).toContain('input-group-sm');
    });

    it('should render vertical buttons correctly in Bootstrap 5', async () => {
      const selector = '#input_vertical';
      const verticalWrapper = await page.$('.bootstrap-touchspin-vertical-button-wrapper');
      expect(verticalWrapper).toBeTruthy();

      // Test vertical button functionality
      await page.click('.bootstrap-touchspin-up');
      await touchspinHelpers.waitForTimeout(200);
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });

    it('should handle form-control size classes correctly', async () => {
      // Test that form-control-sm and form-control-lg are properly detected
      const smallInput = await page.$('#input_group_sm.form-control-sm');
      const largeInput = await page.$('#input_group_lg.form-control-lg');
      
      expect(smallInput).toBeTruthy();
      expect(largeInput).toBeTruthy();
    });

    it('should work with Bootstrap 5 form labels', async () => {
      // BS5 uses .form-label class instead of just label
      const formLabels = await page.$$('.form-label');
      expect(formLabels.length).toBeGreaterThan(0);
      
      // Verify accessibility - labels should be associated with inputs
      const labelFor = await page.$eval('label[for="testinput_default"]', el => el.getAttribute('for'));
      expect(labelFor).toBe('testinput_default');
    });
  });

});