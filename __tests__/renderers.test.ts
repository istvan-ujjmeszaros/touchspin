import touchspinHelpers from './helpers/touchspinHelpers';
import {page, port} from './helpers/jestPuppeteerServerSetup';

describe('Bootstrap Renderer System', () => {

  describe('Bootstrap 3 Renderer', () => {
    beforeEach(async () => {
      await page.goto(`http://localhost:${port}/__tests__/html/index-bs3.html`);
      await touchspinHelpers.waitForTouchSpinReady(page, '#testinput_default');
    });

    it('should generate correct Bootstrap 3 markup structure', async () => {
      // Test basic button structure
      const buttonContainer = await page.$('.input-group-btn');
      expect(buttonContainer).toBeTruthy();
      
      // Test buttons have correct classes
      const upButton = await page.$('.bootstrap-touchspin-up');
      const downButton = await page.$('.bootstrap-touchspin-down');
      expect(upButton).toBeTruthy();
      expect(downButton).toBeTruthy();
      
      // Validate button classes
      const upButtonClasses = await upButton?.evaluate((el) => el.className);
      const downButtonClasses = await downButton?.evaluate((el) => el.className);
      
      expect(upButtonClasses).toContain('btn');
      expect(downButtonClasses).toContain('btn');
    });

    it('should use input-group-addon class for prefix and postfix', async () => {
      const prefixClasses = await page.$eval('.bootstrap-touchspin-prefix', el => el.className);
      const postfixClasses = await page.$eval('.bootstrap-touchspin-postfix', el => el.className);
      
      expect(prefixClasses).toContain('input-group-addon');
      expect(postfixClasses).toContain('input-group-addon');
    });

    it('should apply correct size classes', async () => {
      // Test small input group
      const smallInputGroup = await page.evaluate(() => {
        const input = document.querySelector('#input_group_sm');
        return input?.parentElement?.className;
      });
      expect(smallInputGroup).toContain('input-group-sm');
      
      // Test large input group  
      const largeInputGroup = await page.evaluate(() => {
        const input = document.querySelector('#input_group_lg');
        return input?.parentElement?.className;
      });
      expect(largeInputGroup).toContain('input-group-lg');
    });

    it('should handle vertical button markup correctly', async () => {
      const verticalWrapper = await page.$('.bootstrap-touchspin-vertical-button-wrapper');
      expect(verticalWrapper).toBeTruthy();
      
      const upButton = await page.$('.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-up');
      const downButton = await page.$('.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-down');
      
      expect(upButton).toBeTruthy();
      expect(downButton).toBeTruthy();
    });
  });

  describe('Bootstrap 4 Renderer', () => {
    beforeEach(async () => {
      await page.goto(`http://localhost:${port}/__tests__/html/index-bs4.html`);
      await touchspinHelpers.waitForTouchSpinReady(page, '#testinput_default');
    });

    it('should generate correct Bootstrap 4 markup structure', async () => {
      // Test for prepend/append structure
      const prepend = await page.$('.input-group-prepend');
      const append = await page.$('.input-group-append');
      
      expect(prepend || append).toBeTruthy();
      
      // Test input-group-text wrapper
      const prefixText = await page.$('.bootstrap-touchspin-prefix .input-group-text');
      const postfixText = await page.$('.bootstrap-touchspin-postfix .input-group-text');
      
      expect(prefixText).toBeTruthy();
      expect(postfixText).toBeTruthy();
    });

    it('should handle existing input groups correctly', async () => {
      // Test with existing DOM structure
      const existingGroup = await page.$('#input_group_from_dom_prefix_postfix');
      expect(existingGroup).toBeTruthy();
      
      // Ensure original prepend/append are preserved
      const originalPrepend = await page.evaluate(() => {
        const container = document.querySelector('#input_group_from_dom_prefix_postfix')?.parentElement;
        return container?.querySelector('.input-group-prepend:not(.bootstrap-touchspin-prefix)') !== null;
      });
      expect(originalPrepend).toBe(true);
    });

    it('should apply correct form-control size classes', async () => {
      const smallInput = await page.$('#input_group_sm');
      const largeInput = await page.$('#input_group_lg');
      
      const smallClasses = await smallInput?.evaluate((el) => el.className);
      const largeClasses = await largeInput?.evaluate((el) => el.className);
      
      expect(smallClasses).toContain('form-control-sm');
      expect(largeClasses).toContain('form-control-lg');
    });
  });

  describe('Bootstrap 5 Renderer', () => {
    beforeEach(async () => {
      await page.goto(`http://localhost:${port}/__tests__/html/index-bs5.html`);
      await touchspinHelpers.waitForTouchSpinReady(page, '#testinput_default');
    });

    it('should generate correct Bootstrap 5 markup structure', async () => {
      // Test direct input-group-text without prepend/append wrappers
      const directPrefix = await page.$('.bootstrap-touchspin-prefix.input-group-text');
      const directPostfix = await page.$('.bootstrap-touchspin-postfix.input-group-text');
      
      expect(directPrefix).toBeTruthy();
      expect(directPostfix).toBeTruthy();
      
      // Ensure no deprecated prepend/append classes
      const prepend = await page.$('.input-group-prepend');
      const append = await page.$('.input-group-append');
      
      expect(prepend).toBeFalsy();
      expect(append).toBeFalsy();
    });

    it('should handle direct button placement', async () => {
      // Buttons should be placed directly in input group without wrapper divs
      const inputGroup = await page.$('.input-group');
      const buttons = await page.$$('.input-group .btn.bootstrap-touchspin-up, .input-group .btn.bootstrap-touchspin-down');
      
      expect(inputGroup).toBeTruthy();
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should preserve existing input-group-text elements', async () => {
      const existingElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('.input-group .input-group-text:not(.bootstrap-touchspin-prefix):not(.bootstrap-touchspin-postfix)');
        return elements.length;
      });
      
      expect(existingElements).toBeGreaterThan(0);
    });

    it('should function correctly with Bootstrap 5 structure', async () => {
      const selector = '#testinput_default';
      
      // Test functionality
      await touchspinHelpers.touchspinClickUp(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
      
      await touchspinHelpers.touchspinClickDown(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
    });
  });

  describe('Renderer Consistency Across Versions', () => {
    it('should maintain consistent button behavior across Bootstrap versions', async () => {
      const versions = [
        { name: 'Bootstrap 3', html: 'index-bs3.html' },
        { name: 'Bootstrap 4', html: 'index-bs4.html' },
        { name: 'Bootstrap 5', html: 'index-bs5.html' }
      ];

      for (const version of versions) {
        await page.goto(`http://localhost:${port}/__tests__/html/${version.html}`);
        await touchspinHelpers.waitForTouchSpinReady(page, '#testinput_default');
        
        // Reset value and test increment
        await touchspinHelpers.fillWithValue(page, '#testinput_default', '50');
        await touchspinHelpers.touchspinClickUp(page, '#testinput_default');
        
        const value = await touchspinHelpers.readInputValue(page, '#testinput_default');
        expect(value).toBe('51');
      }
    });

    it('should generate valid HTML structure for all versions', async () => {
      const versions = ['index-bs3.html', 'index-bs4.html', 'index-bs5.html'];
      
      for (const html of versions) {
        await page.goto(`http://localhost:${port}/__tests__/html/${html}`);
        await touchspinHelpers.waitForTouchSpinReady(page, '#testinput_default');
        
        // Validate basic structure exists
        const hasInputGroup = await page.$('.input-group');
        const hasUpButton = await page.$('.bootstrap-touchspin-up');
        const hasDownButton = await page.$('.bootstrap-touchspin-down');
        
        expect(hasInputGroup).toBeTruthy();
        expect(hasUpButton).toBeTruthy();
        expect(hasDownButton).toBeTruthy();
      }
    });
  });
});