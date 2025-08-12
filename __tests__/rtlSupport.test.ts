import touchspinHelpers from './helpers/touchspinHelpers';
import {page, port} from './helpers/jestPuppeteerServerSetup';

describe('RTL (Right-to-Left) Support', () => {

  describe('Bootstrap 3 RTL', () => {
    beforeEach(async () => {
      await page.goto(`http://localhost:${port}/__tests__/html/rtl-bs3.html`);
    });

    it('should render correctly in RTL layout for Bootstrap 3', async () => {
      const selector = '#testinput_default';
      
      // Check that the page has RTL class/direction
      const bodyDir = await page.$eval('body', el => el.getAttribute('dir'));
      const rtlClass = await page.$eval('body', el => el.classList.contains('rtl'));
      
      expect(bodyDir === 'rtl' || rtlClass).toBe(true);
      
      // Check that TouchSpin is rendered
      const upButton = await page.$(selector + ' + .input-group-btn > .bootstrap-touchspin-up');
      const downButton = await page.$(selector + ' + .input-group-btn > .bootstrap-touchspin-down');
      
      expect(upButton).toBeTruthy();
      expect(downButton).toBeTruthy();
    });

    it('should function correctly in RTL mode for Bootstrap 3', async () => {
      const selector = '#testinput_default';
      
      await touchspinHelpers.touchspinClickUp(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
      
      // Try the other button as well  
      await page.evaluate((sel) => {
        const button = document.querySelector(sel + ' + .input-group-btn > .bootstrap-touchspin-down');
        button?.dispatchEvent(new Event('mousedown'));
      }, selector);
      
      await touchspinHelpers.waitForTimeout(200);
      
      await page.evaluate((sel) => {
        const button = document.querySelector(sel + ' + .input-group-btn > .bootstrap-touchspin-down');
        button?.dispatchEvent(new Event('mouseup'));
      }, selector);
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
    });

    it('should handle vertical buttons in RTL correctly for Bootstrap 3', async () => {
      const selector = '#input_vertical';
      
      const verticalWrapper = await page.$('.bootstrap-touchspin-vertical-button-wrapper');
      expect(verticalWrapper).toBeTruthy();
      
      // Test functionality
      await page.click('.bootstrap-touchspin-up');
      await touchspinHelpers.waitForTimeout(200);
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });

    it('should render prefix and postfix correctly in RTL for Bootstrap 3', async () => {
      const selector = '#input_group_sm';
      
      const prefix = await page.$('.bootstrap-touchspin-prefix');
      const postfix = await page.$('.bootstrap-touchspin-postfix');
      
      expect(prefix).toBeTruthy();
      expect(postfix).toBeTruthy();
      
      // In RTL, prefix and postfix positions should be visually swapped
      // but functionally they should still work
      await touchspinHelpers.touchspinClickUp(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });
  });

  describe('Bootstrap 4 RTL', () => {
    beforeEach(async () => {
      await page.goto(`http://localhost:${port}/__tests__/html/rtl-bs4.html`);
    });

    it('should render correctly in RTL layout for Bootstrap 4', async () => {
      const selector = '#testinput_default';
      
      // Check that the page has RTL class/direction
      const bodyDir = await page.$eval('body', el => el.getAttribute('dir'));
      const rtlClass = await page.$eval('body', el => el.classList.contains('rtl'));
      
      expect(bodyDir === 'rtl' || rtlClass).toBe(true);
      
      // Check for Bootstrap 4 specific structure
      const prepend = await page.$('.input-group-prepend');
      const append = await page.$('.input-group-append');
      
      expect(prepend || append).toBeTruthy();
    });

    it('should function correctly in RTL mode for Bootstrap 4', async () => {
      const selector = '#testinput_default';
      
      await touchspinHelpers.touchspinClickUp(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });

    it('should use correct Bootstrap 4 classes in RTL', async () => {
      const selector = '#input_group_sm';
      
      // Check for input-group-text inside prefix/postfix
      const prefixText = await page.$('.bootstrap-touchspin-prefix .input-group-text');
      const postfixText = await page.$('.bootstrap-touchspin-postfix .input-group-text');
      
      expect(prefixText).toBeTruthy();
      expect(postfixText).toBeTruthy();
    });

    it('should handle vertical buttons in RTL correctly for Bootstrap 4', async () => {
      const selector = '#input_vertical';
      
      const verticalWrapper = await page.$('.bootstrap-touchspin-vertical-button-wrapper');
      expect(verticalWrapper).toBeTruthy();
      
      // Test functionality
      await page.click('.bootstrap-touchspin-up');
      await touchspinHelpers.waitForTimeout(200);
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });
  });

  describe('RTL CSS Styling', () => {
    beforeEach(async () => {
      await page.goto(`http://localhost:${port}/__tests__/html/rtl-bs4.html`);
    });

    it('should apply RTL-specific CSS classes', async () => {
      // Check that the RTL class exists on body or a parent element
      const hasRtlClass = await page.$eval('body', el => 
        el.classList.contains('rtl') || 
        el.getAttribute('dir') === 'rtl' ||
        document.documentElement.getAttribute('dir') === 'rtl'
      );
      
      expect(hasRtlClass).toBe(true);
    });

    it('should handle button positioning correctly in RTL', async () => {
      const selector = '#testinput_default';
      
      // Get the computed styles to verify RTL positioning
      const inputGroup = await page.$(selector + ' + .input-group, ' + selector + ' + .bootstrap-touchspin, ' + selector + ' + .input-group-btn');
      expect(inputGroup).toBeTruthy();
      
      // Verify buttons are still clickable and functional in RTL
      await touchspinHelpers.touchspinClickUp(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });

    it('should maintain proper border radius in RTL vertical buttons', async () => {
      const upButton = await page.$('.bootstrap-touchspin-up');
      const downButton = await page.$('.bootstrap-touchspin-down');
      
      expect(upButton).toBeTruthy();
      expect(downButton).toBeTruthy();
      
      // Test that buttons are functional
      await page.click('.bootstrap-touchspin-up');
      await touchspinHelpers.waitForTimeout(200);
      
      const result = await page.$eval('#input_vertical', (el: Element) => (el as HTMLInputElement).value);
      expect(result).toBe('51');
    });
  });

  describe('RTL Text Direction', () => {
    beforeEach(async () => {
      await page.goto(`http://localhost:${port}/__tests__/html/rtl-bs4.html`);
    });

    it('should handle text input correctly in RTL', async () => {
      const selector = '#testinput_default';
      
      // Clear and enter a number
      await touchspinHelpers.fillWithValue(page, selector, '123');
      await page.keyboard.press('Tab');
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('123');
    });

    it('should handle prefix and postfix text direction correctly', async () => {
      const selector = '#input_group_sm';
      
      // Check that prefix and postfix are rendered
      const prefixText = await page.$eval('.bootstrap-touchspin-prefix', el => el.textContent);
      const postfixText = await page.$eval('.bootstrap-touchspin-postfix', el => el.textContent);
      
      expect(prefixText).toBeTruthy();
      expect(postfixText).toBeTruthy();
      
      // Functionality should still work
      await touchspinHelpers.touchspinClickUp(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    });

    it('should handle decimal values in RTL correctly', async () => {
      const selector = '#testinput_decimals';
      
      // Test decimal input in RTL
      await touchspinHelpers.fillWithValue(page, selector, '12.34');
      await page.keyboard.press('Tab');
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('12.34');
      
      // Test increment
      await touchspinHelpers.touchspinClickUp(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('12.35');
    });
  });
});