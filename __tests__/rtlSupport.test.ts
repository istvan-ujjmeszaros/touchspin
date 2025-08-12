import touchspinHelpers from './helpers/touchspinHelpers';
import {page, port} from './helpers/jestPuppeteerServerSetup';

describe('RTL (Right-to-Left) Support', () => {

  describe('Bootstrap 3 RTL', () => {
    beforeEach(async () => {
      await page.goto(`http://localhost:${port}/__tests__/html/rtl-bs3.html`);
      await touchspinHelpers.waitForTouchSpinReady(page, '#testinput_default');
    });

    it('should render and function correctly in RTL layout', async () => {
      const selector = '#testinput_default';
      
      // Check that the page has RTL direction
      const htmlDir = await page.$eval('html', el => el.getAttribute('dir'));
      const bodyDir = await page.$eval('body', el => el.getAttribute('dir'));
      const rtlClass = await page.$eval('body', el => el.classList.contains('rtl'));
      
      expect(htmlDir === 'rtl' || bodyDir === 'rtl' || rtlClass).toBe(true);
      
      // Check that TouchSpin buttons are rendered and functional
      await touchspinHelpers.touchspinClickUp(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
      
      await touchspinHelpers.touchspinClickDown(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
    });

    it('should handle vertical buttons and prefix/postfix in RTL', async () => {
      // Test vertical buttons
      const verticalSelector = '#input_vertical';
      await touchspinHelpers.touchspinClickUp(page, verticalSelector);
      expect(await touchspinHelpers.readInputValue(page, verticalSelector)).toBe('51');
      
      // Test prefix/postfix elements exist and are functional
      const prefixSelector = '#input_group_sm';
      const prefix = await page.$('.bootstrap-touchspin-prefix');
      const postfix = await page.$('.bootstrap-touchspin-postfix');
      
      expect(prefix).toBeTruthy();
      expect(postfix).toBeTruthy();
      
      await touchspinHelpers.touchspinClickUp(page, prefixSelector);
      expect(await touchspinHelpers.readInputValue(page, prefixSelector)).toBe('51');
    });
  });

  describe('Bootstrap 4 RTL', () => {
    beforeEach(async () => {
      await page.goto(`http://localhost:${port}/__tests__/html/rtl-bs4.html`);
      await touchspinHelpers.waitForTouchSpinReady(page, '#testinput_default');
    });

    it('should render and function correctly in RTL layout', async () => {
      const selector = '#testinput_default';
      
      // Check RTL direction
      const htmlDir = await page.$eval('html', el => el.getAttribute('dir'));
      expect(htmlDir).toBe('rtl');
      
      // Test basic functionality in RTL
      await touchspinHelpers.touchspinClickUp(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
      
      // Check Bootstrap 4 specific structure exists
      const hasBS4Structure = await page.evaluate(() => {
        return document.querySelector('.input-group-prepend') !== null ||
               document.querySelector('.input-group-append') !== null;
      });
      expect(hasBS4Structure).toBe(true);
    });
  });

  describe('Bootstrap 5 RTL', () => {
    beforeEach(async () => {
      await page.goto(`http://localhost:${port}/__tests__/html/rtl-bs5.html`);
      await touchspinHelpers.waitForTouchSpinReady(page, '#testinput_default');
    });

    it('should render and function correctly in RTL layout', async () => {
      const selector = '#testinput_default';
      
      // Check RTL direction and Bootstrap 5 RTL CSS
      const htmlDir = await page.$eval('html', el => el.getAttribute('dir'));
      expect(htmlDir).toBe('rtl');
      
      const rtlCSS = await page.$('link[href*="bootstrap.rtl.min.css"]');
      expect(rtlCSS).toBeTruthy();
      
      // Test functionality
      await touchspinHelpers.touchspinClickUp(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
      
      await touchspinHelpers.touchspinClickDown(page, selector);
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
    });

    it('should handle Bootstrap 5 structure without deprecated classes', async () => {
      // Verify no deprecated prepend/append classes exist
      const hasDeprecatedClasses = await page.evaluate(() => {
        return document.querySelector('.input-group-prepend') !== null ||
               document.querySelector('.input-group-append') !== null;
      });
      expect(hasDeprecatedClasses).toBe(false);
      
      // Test prefix/postfix with direct input-group-text
      const prefixSelector = '#input_group_sm';
      const directPrefix = await page.$('.bootstrap-touchspin-prefix.input-group-text');
      expect(directPrefix).toBeTruthy();
      
      await touchspinHelpers.touchspinClickUp(page, prefixSelector);
      expect(await touchspinHelpers.readInputValue(page, prefixSelector)).toBe('51');
    });
  });

  describe('RTL Text Input Handling', () => {
    beforeEach(async () => {
      await page.goto(`http://localhost:${port}/__tests__/html/rtl-bs4.html`);
      await touchspinHelpers.waitForTouchSpinReady(page, '#testinput_default');
    });

    it('should handle manual text input correctly in RTL', async () => {
      const selector = '#testinput_default';
      
      // Test manual input of values
      await touchspinHelpers.fillWithValue(page, selector, '123');
      await page.keyboard.press('Tab');
      
      expect(await touchspinHelpers.readInputValue(page, selector)).toBe('123');
      
      // Test decimal values in RTL
      const decimalSelector = '#testinput_decimals';
      await touchspinHelpers.fillWithValue(page, decimalSelector, '12.34');
      await page.keyboard.press('Tab');
      
      expect(await touchspinHelpers.readInputValue(page, decimalSelector)).toBe('12.34');
    });
  });
});