/**
 * React-specific test helpers for TouchSpin React adapter
 * Extends core helpers with React component testing utilities
 */

import type { Locator, Page } from '@playwright/test';

/**
 * Get React-specific elements for TouchSpin component
 */
export async function getReactTouchSpinElements(page: Page, testId: string) {
  return {
    /**
     * Get the hidden input used for form data submission
     * React adapter creates a hidden input with name="${name}_display" for form integration
     */
    async getHiddenInput(name: string): Promise<Locator> {
      return page.locator(`input[type="hidden"][name="${name}_display"]`);
    },
  };
}

/**
 * Blur the currently focused element by clicking the body
 * Useful for testing blur/focus behavior
 */
export async function blurActiveElement(page: Page): Promise<void> {
  await page.locator('body').click();
}

/**
 * Get a form element by test ID
 * Useful for form submission testing
 */
export async function getFormElement(page: Page, testId: string): Promise<Locator> {
  return page.locator(`[data-testid="${testId}"]`);
}

/**
 * Wait for React to finish mounting and hydrating
 */
export async function waitForReactMount(page: Page, timeout = 5000): Promise<void> {
  // Wait for React root to be hydrated
  await page.waitForFunction(
    () => {
      const root = document.getElementById('root');
      return root && root.childNodes.length > 0;
    },
    { timeout }
  );
}

/**
 * Get form data from a form element
 */
export async function getFormData(page: Page, formTestId: string): Promise<Record<string, string>> {
  const form = await getFormElement(page, formTestId);
  return await form.evaluate((formEl) => {
    const formData = new FormData(formEl as HTMLFormElement);
    return Object.fromEntries(formData.entries()) as Record<string, string>;
  });
}
