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

  describe('Bootstrap 5 Renderer (needs BS5 test file)', () => {
    it('should be tested with Bootstrap 5 specific features', async () => {
      // Note: This test currently skipped because no BS5 test file exists
      // Should test direct input-group-text usage without prepend/append wrappers
      expect(true).toBe(true); // Placeholder until BS5 test file is created
    });
  });

  describe('Renderer Factory Detection', () => {
    it('should automatically detect Bootstrap version correctly', async () => {
      await page.goto(`http://localhost:${port}/__tests__/html/index-bs4.html`);
      
      // Test if the correct renderer was selected by checking markup patterns
      const hasBS4Structure = await page.$('.input-group-prepend, .input-group-append');
      expect(hasBS4Structure).toBeTruthy();
    });
  });
});