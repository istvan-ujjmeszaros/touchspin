/**
 * jQuery-specific TouchSpin helpers
 *
 */

import { Page } from '@playwright/test';

// Generic jQuery TouchSpin command executor
async function jQueryTouchSpinApi(page: Page, testId: string, command: string, ...args: any[]): Promise<any> {
  return await page.evaluate(({ testId, command, args }) => {
    const $ = (window as any).jQuery;
    if (!$) throw new Error('jQuery not found');
    const $input = $(`[data-testid="${testId}"]`);
    if ($input.length === 0) {
      throw new Error(`Input element not found for testId: ${testId}`);
    }
    return $input.TouchSpin(command, ...args);
  }, { testId, command, args });
}

export {
  jQueryTouchSpinApi
};
