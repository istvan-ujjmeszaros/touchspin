/**
 * Settings Precedence Tests
 * Tests the framework-agnostic settings precedence system where:
 * 1. Core defaults use null for framework-specific properties
 * 2. User settings take highest precedence
 * 3. Renderer defaults only fill null placeholders
 * 4. User customizations are never overridden by renderer defaults
 */

import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Settings Precedence System', () => {

  test.describe('User Settings Take Priority Over Renderer Defaults', () => {

    test('should preserve user buttonup_class over Bootstrap 3 renderer defaults', async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html/index-bs3.html');
      
      const customClass = 'my-custom-btn-class';
      
      const result = await page.evaluate((customClass) => {
        const $ = (window as any).jQuery;
        const input = $('#default-spinner');
        
        // Initialize with user-provided buttonup_class
        input.TouchSpin({
          buttonup_class: customClass
        });
        
        const upButton = input.parent().find('.bootstrap-touchspin-up')[0];
        return upButton?.className || '';
      }, customClass);
      
      expect(result).toContain(customClass);
      expect(result).not.toContain('btn btn-default'); // Should not contain Bootstrap 3 default
      
      await touchspinHelpers.collectCoverage(page, 'settingsPrecedence');
    });

    test('should preserve user buttondown_class over Bootstrap 4 renderer defaults', async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html/index-bs4.html');
      
      const customClass = 'my-custom-down-btn';
      
      const result = await page.evaluate((customClass) => {
        const $ = (window as any).jQuery;
        const input = $('#default-spinner');
        
        // Initialize with user-provided buttondown_class
        input.TouchSpin({
          buttondown_class: customClass
        });
        
        const downButton = input.parent().find('.bootstrap-touchspin-down')[0];
        return downButton?.className || '';
      }, customClass);
      
      expect(result).toContain(customClass);
      expect(result).not.toContain('btn btn-outline-secondary'); // Should not contain Bootstrap 4 default
      
      await touchspinHelpers.collectCoverage(page, 'settingsPrecedence');
    });

    test('should preserve user vertical button classes over Bootstrap 5 renderer defaults', async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html/index-bs5.html');
      
      const customUpClass = 'custom-vertical-up';
      const customDownClass = 'custom-vertical-down';
      
      const result = await page.evaluate(({ customUpClass, customDownClass }) => {
        const $ = (window as any).jQuery;
        const input = $('#default-spinner');
        
        // Initialize with user-provided vertical button classes
        input.TouchSpin({
          verticalbuttons: true,
          verticalupclass: customUpClass,
          verticaldownclass: customDownClass
        });
        
        const upButton = input.parent().find('.bootstrap-touchspin-up')[0];
        const downButton = input.parent().find('.bootstrap-touchspin-down')[0];
        
        return {
          upClasses: upButton?.className || '',
          downClasses: downButton?.className || ''
        };
      }, { customUpClass, customDownClass });
      
      expect(result.upClasses).toContain(customUpClass);
      expect(result.downClasses).toContain(customDownClass);
      expect(result.upClasses).not.toContain('btn btn-outline-secondary');
      expect(result.downClasses).not.toContain('btn btn-outline-secondary');
      
      await touchspinHelpers.collectCoverage(page, 'settingsPrecedence');
    });

  });

  test.describe('Renderer Defaults Fill Null Placeholders', () => {

    test('should apply Bootstrap 3 renderer defaults when user provides no button classes', async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html/index-bs3.html');
      
      const result = await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const input = $('#default-spinner');
        
        // Initialize without providing button classes (should use renderer defaults)
        input.TouchSpin({});
        
        const upButton = input.parent().find('.bootstrap-touchspin-up')[0];
        const downButton = input.parent().find('.bootstrap-touchspin-down')[0];
        
        return {
          upClasses: upButton?.className || '',
          downClasses: downButton?.className || ''
        };
      });
      
      // Should contain Bootstrap 3 default classes
      expect(result.upClasses).toContain('btn btn-default');
      expect(result.downClasses).toContain('btn btn-default');
      
      await touchspinHelpers.collectCoverage(page, 'settingsPrecedence');
    });

    test('should apply Bootstrap 4 renderer defaults when user provides no button classes', async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html/index-bs4.html');
      
      const result = await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const input = $('#default-spinner');
        
        // Initialize without providing button classes (should use renderer defaults)
        input.TouchSpin({});
        
        const upButton = input.parent().find('.bootstrap-touchspin-up')[0];
        const downButton = input.parent().find('.bootstrap-touchspin-down')[0];
        
        return {
          upClasses: upButton?.className || '',
          downClasses: downButton?.className || ''
        };
      });
      
      // Should contain Bootstrap 4 default classes
      expect(result.upClasses).toContain('btn btn-outline-secondary');
      expect(result.downClasses).toContain('btn btn-outline-secondary');
      
      await touchspinHelpers.collectCoverage(page, 'settingsPrecedence');
    });

    test('should apply Bootstrap 5 renderer defaults when user provides no button classes', async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html/index-bs5.html');
      
      const result = await page.evaluate(() => {
        const $ = (window as any).jQuery;
        const input = $('#default-spinner');
        
        // Initialize without providing button classes (should use renderer defaults)
        input.TouchSpin({});
        
        const upButton = input.parent().find('.bootstrap-touchspin-up')[0];
        const downButton = input.parent().find('.bootstrap-touchspin-down')[0];
        
        return {
          upClasses: upButton?.className || '',
          downClasses: downButton?.className || ''
        };
      });
      
      // Should contain Bootstrap 5 default classes  
      expect(result.upClasses).toContain('btn btn-outline-secondary');
      expect(result.downClasses).toContain('btn btn-outline-secondary');
      
      await touchspinHelpers.collectCoverage(page, 'settingsPrecedence');
    });

  });

  test.describe('Mixed User Settings and Renderer Defaults', () => {

    test('should apply user setting for one property and renderer default for another', async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html/index-bs4.html');
      
      const customUpClass = 'user-provided-up-btn';
      
      const result = await page.evaluate((customUpClass) => {
        const $ = (window as any).jQuery;
        const input = $('#default-spinner');
        
        // Provide only buttonup_class, leave buttondown_class as null
        input.TouchSpin({
          buttonup_class: customUpClass
          // buttondown_class intentionally omitted - should get renderer default
        });
        
        const upButton = input.parent().find('.bootstrap-touchspin-up')[0];
        const downButton = input.parent().find('.bootstrap-touchspin-down')[0];
        
        return {
          upClasses: upButton?.className || '',
          downClasses: downButton?.className || ''
        };
      }, customUpClass);
      
      // Up button should have user-provided class
      expect(result.upClasses).toContain(customUpClass);
      expect(result.upClasses).not.toContain('btn btn-outline-secondary');
      
      // Down button should have renderer default since user didn't provide it
      expect(result.downClasses).toContain('btn btn-outline-secondary');
      expect(result.downClasses).not.toContain(customUpClass);
      
      await touchspinHelpers.collectCoverage(page, 'settingsPrecedence');
    });

    test('should handle vertical buttons with mixed user/renderer settings', async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html/index-bs3-vertical.html');
      
      const customVerticalUp = 'custom-vertical-up-class';
      
      const result = await page.evaluate((customVerticalUp) => {
        const $ = (window as any).jQuery;
        const input = $('#default-spinner');
        
        // Provide only verticalupclass, leave verticaldownclass as null
        input.TouchSpin({
          verticalbuttons: true,
          verticalupclass: customVerticalUp
          // verticaldownclass intentionally omitted - should get renderer default
        });
        
        const upButton = input.parent().find('.bootstrap-touchspin-up')[0];
        const downButton = input.parent().find('.bootstrap-touchspin-down')[0];
        
        return {
          upClasses: upButton?.className || '',
          downClasses: downButton?.className || ''
        };
      }, customVerticalUp);
      
      // Up button should have user-provided class
      expect(result.upClasses).toContain(customVerticalUp);
      
      // Down button should have renderer default since user didn't provide it
      expect(result.downClasses).toContain('btn btn-default');
      expect(result.downClasses).not.toContain(customVerticalUp);
      
      await touchspinHelpers.collectCoverage(page, 'settingsPrecedence');
    });

  });

  test.describe('Data Attributes Integration', () => {

    test('should respect data attribute settings over renderer defaults', async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html/index-bs4.html');
      
      const dataAttrClass = 'data-attr-custom-btn';
      
      const result = await page.evaluate((dataAttrClass) => {
        const $ = (window as any).jQuery;
        const input = $('#default-spinner');
        
        // Set data attribute for button class
        input.attr('data-bts-buttonup-class', dataAttrClass);
        
        // Initialize without explicit buttonup_class option
        input.TouchSpin({});
        
        const upButton = input.parent().find('.bootstrap-touchspin-up')[0];
        return upButton?.className || '';
      }, dataAttrClass);
      
      // Should contain data attribute value, not renderer default
      expect(result).toContain(dataAttrClass);
      expect(result).not.toContain('btn btn-outline-secondary');
      
      await touchspinHelpers.collectCoverage(page, 'settingsPrecedence');
    });

  });

  test.describe('Settings Update Precedence', () => {

    test('should maintain precedence when updating settings programmatically', async ({ page }) => {
      await touchspinHelpers.startCoverage(page);
      await page.goto('/__tests__/html/index-bs5.html');
      
      const initialCustomClass = 'initial-custom-class';
      const updatedCustomClass = 'updated-custom-class';
      
      const result = await page.evaluate(({ initialCustomClass, updatedCustomClass }) => {
        const $ = (window as any).jQuery;
        const input = $('#default-spinner');
        
        // Initialize with custom button class
        input.TouchSpin({
          buttonup_class: initialCustomClass
        });
        
        let initialClasses = input.parent().find('.bootstrap-touchspin-up')[0]?.className || '';
        
        // Update settings - should preserve user setting precedence
        input.trigger('touchspin.updatesettings', {
          buttonup_class: updatedCustomClass
        });
        
        let updatedClasses = input.parent().find('.bootstrap-touchspin-up')[0]?.className || '';
        
        return {
          initial: initialClasses,
          updated: updatedClasses
        };
      }, { initialCustomClass, updatedCustomClass });
      
      // Initial should have initial custom class
      expect(result.initial).toContain(initialCustomClass);
      expect(result.initial).not.toContain('btn btn-outline-secondary');
      
      // Updated should have updated custom class  
      expect(result.updated).toContain(updatedCustomClass);
      expect(result.updated).not.toContain(initialCustomClass);
      expect(result.updated).not.toContain('btn btn-outline-secondary');
      
      await touchspinHelpers.collectCoverage(page, 'settingsPrecedence');
    });

  });

});