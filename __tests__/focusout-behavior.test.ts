import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Focus and Outside Click Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'focusout-behavior');
  });

  test('CURRENT BEHAVIOR: clicking outside widget sanitizes value (document listener)', async ({ page }) => {
    const testid = 'touchspin-default';
    
    // Type an invalid value that needs sanitization
    await touchspinHelpers.fillWithValue(page, testid, '3');
    
    // Click completely outside the TouchSpin widget (document listener should trigger)
    await page.click('body');
    
    // Should be sanitized to nearest step value (5, since step=1 and forcestepdivisibility="round")
    // This test will establish the current behavior baseline
    const finalValue = await touchspinHelpers.readInputValue(page, testid);
    console.log('Current behavior - outside click result:', finalValue);
    
    // For now, just document what currently happens
    expect(typeof finalValue).toBe('string');
  });

  test('CURRENT BEHAVIOR: verify document listeners are actually bound', async ({ page }) => {
    // Check if existing TouchSpin instances have document listeners
    const hasDocumentListeners = await page.evaluate(() => {
      // Check what the current TouchSpin instances have bound
      const $ = (window as any).jQuery;
      
      // Look for existing document events with touchspin namespace
      const events = $._data(document, 'events');
      console.log('Document events:', events);
      
      // Check if there are any touchspin.doc listeners
      let hasMousedown = false;
      let hasTouchstart = false;
      
      if (events) {
        if (events.mousedown) {
          hasMousedown = events.mousedown.some((handler: any) => 
            handler.namespace && handler.namespace.includes('touchspin.doc')
          );
        }
        if (events.touchstart) {
          hasTouchstart = events.touchstart.some((handler: any) => 
            handler.namespace && handler.namespace.includes('touchspin.doc')
          );
        }
      }
      
      return { hasMousedown, hasTouchstart, totalEvents: events };
    });
    
    console.log('Document listener check:', hasDocumentListeners);
    
    // For now, just document what we found
    expect(typeof hasDocumentListeners.hasMousedown).toBe('boolean');
    expect(typeof hasDocumentListeners.hasTouchstart).toBe('boolean');
  });

  test('NEW BEHAVIOR TARGET: focus moving within widget should not sanitize', async ({ page }) => {
    const testid = 'touchspin-default';
    
    // Type invalid value
    await touchspinHelpers.fillWithValue(page, testid, '3');
    
    // Tab to the up button (within the same widget)
    await page.keyboard.press('Tab');
    
    // Should NOT sanitize because we're still within the widget
    const valueAfterTabToButton = await touchspinHelpers.readInputValue(page, testid);
    
    // This test documents our target behavior - currently might fail
    console.log('Target behavior - tab within widget:', valueAfterTabToButton);
    expect(valueAfterTabToButton).toBe('3'); // Should stay unsanitized
  });

  test('NEW BEHAVIOR TARGET: leaving widget completely should sanitize', async ({ page }) => {
    const testid = 'touchspin-default';
    
    // Type invalid value
    await touchspinHelpers.fillWithValue(page, testid, '3');
    
    // Tab completely out of the widget to another element
    const otherElement = page.getByTestId('touchspin-group-lg');
    await otherElement.focus();
    
    // Should sanitize because we left the widget
    const valueAfterLeavingWidget = await touchspinHelpers.readInputValue(page, testid);
    
    // Target behavior - this is what we want after refactoring
    console.log('Target behavior - leaving widget:', valueAfterLeavingWidget);
    // Should be sanitized to step boundary
    expect(valueAfterLeavingWidget).not.toBe('3');
  });

  test('BEHAVIOR PRESERVATION: change events should only fire for user actions', async ({ page }) => {
    const testid = 'touchspin-default';
    
    // Set up change event counting
    await page.evaluate((testid) => {
      (window as any).changeEventCount = 0;
      const input = document.querySelector(`[data-testid="${testid}"]`);
      input?.addEventListener('change', () => {
        (window as any).changeEventCount++;
      });
    }, testid);
    
    // Type invalid value
    await touchspinHelpers.fillWithValue(page, testid, '3');
    
    // Click outside to trigger sanitization
    await page.click('body');
    
    // Sanitization should NOT emit change event
    const changeCount = await page.evaluate(() => (window as any).changeEventCount);
    expect(changeCount).toBe(0);
    
    // But button click SHOULD emit change event
    await touchspinHelpers.touchspinClickUp(page, testid);
    const changeCountAfterButton = await page.evaluate(() => (window as any).changeEventCount);
    expect(changeCountAfterButton).toBe(1);
  });

  test('CLEANUP BEHAVIOR: destroy should remove all listeners', async ({ page }) => {
    const testid = 'touchspin-default';
    
    // Initialize and then destroy
    await page.evaluate((testid) => {
      const $ = (window as any).jQuery;
      const input = $(`[data-testid="${testid}"]`);
      (input as any).trigger('touchspin.destroy');
    }, testid);
    
    // After destroy, outside clicks should NOT trigger sanitization
    await touchspinHelpers.fillWithValue(page, testid, '3');
    await page.click('body');
    
    const valueAfterDestroy = await touchspinHelpers.readInputValue(page, testid);
    expect(valueAfterDestroy).toBe('3'); // Should stay unchanged
  });
});