import touchspinHelpers from './helpers/touchspinHelpers';
import {page, port} from './helpers/jestPuppeteerServerSetup';

describe('Vertical Buttons', () => {

  beforeEach(async () => {
    await touchspinHelpers.waitForTouchSpinReady(page, '#input_vertical');
  });

  it('should render vertical button structure correctly', async () => {
    // Check for vertical wrapper
    const verticalWrapper = await page.$('.bootstrap-touchspin-vertical-button-wrapper');
    expect(verticalWrapper).toBeTruthy();

    // Check buttons are inside wrapper
    const upButton = await page.$('.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-up');
    const downButton = await page.$('.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-down');
    
    expect(upButton).toBeTruthy();
    expect(downButton).toBeTruthy();
  });

  it('should function correctly with vertical buttons', async () => {
    const selector = '#input_vertical';
    
    // Test increment
    await touchspinHelpers.touchspinClickUp(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    
    // Test decrement
    await touchspinHelpers.touchspinClickDown(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
  });

  it('should work with size variations and prefix/postfix', async () => {
    // Test small size with prefix/postfix
    const smallSelector = '#input_group_sm_vertical';
    await touchspinHelpers.touchspinClickUp(page, smallSelector);
    expect(await touchspinHelpers.readInputValue(page, smallSelector)).toBe('51');
    
    // Verify prefix/postfix exist
    const prefix = await page.$('.bootstrap-touchspin-prefix');
    const postfix = await page.$('.bootstrap-touchspin-postfix');
    expect(prefix).toBeTruthy();
    expect(postfix).toBeTruthy();
  });

  it('should work with existing DOM input groups', async () => {
    const selector = '#input_group_from_dom_prefix_postfix_vertical';
    
    // Should maintain existing DOM structure
    const existingPrefix = await page.evaluate(() => {
      const container = document.querySelector('#input_group_from_dom_prefix_postfix_vertical')?.parentElement;
      return container?.querySelector('.input-group-addon:not(.bootstrap-touchspin-prefix), .input-group-text:not(.bootstrap-touchspin-prefix)') !== null;
    });
    expect(existingPrefix).toBe(true);
    
    // Should still function correctly
    await touchspinHelpers.touchspinClickUp(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
  });

  it('should handle disabled state for vertical buttons', async () => {
    const selector = '#input_vertical';
    
    await touchspinHelpers.setInputAttr(page, selector, 'disabled', true);
    
    // Buttons should be disabled
    const upButtonDisabled = await page.evaluate(() => {
      const button = document.querySelector('.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-up') as HTMLButtonElement;
      return button?.disabled || button?.hasAttribute('disabled');
    });
    
    expect(upButtonDisabled).toBe(true);
    
    // Functionality should be disabled
    await touchspinHelpers.touchspinClickUp(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
  });

  it('should support long press spinning for vertical buttons', async () => {
    const selector = '#input_vertical';
    
    // Simulate long press by holding mousedown for longer than stepintervaldelay (500ms)
    await page.evaluate(() => {
      const button = document.querySelector('.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-up');
      button?.dispatchEvent(new Event('mousedown', { bubbles: true }));
    });
    
    // Wait longer than the default stepintervaldelay (500ms) to trigger spinning
    await touchspinHelpers.waitForTimeout(700);
    
    await page.evaluate(() => {
      const button = document.querySelector('.bootstrap-touchspin-vertical-button-wrapper .bootstrap-touchspin-up');
      button?.dispatchEvent(new Event('mouseup', { bubbles: true }));
    });
    
    // Should have incremented multiple times due to spinning
    const finalValue = parseInt(await touchspinHelpers.readInputValue(page, selector) || '50');
    expect(finalValue).toBeGreaterThan(51);
  });
});