import type { Page } from '@playwright/test';
import type { TouchSpinCorePublicAPI } from '../types';

/*
 * Install page-side helpers for current and future documents (idempotent).
 * - window.__ts.requireInputByTestId(id)
 * - window.__ts.requireCoreByTestId(id)
 */
export async function installDomHelpers(page: Page): Promise<void> {
  // Future documents / iframes
  await page.addInitScript(() => {
    const install = () => {
      if (window.__ts) return;
      window.__ts = {
        requireInputByTestId(id: string): HTMLInputElement {
          const el = document.querySelector(`[data-testid="${id}"]`) as HTMLInputElement | null;
          if (!el) throw new Error(`Input with testId "${id}" not found`);
          return el;
        },
        requireCoreByTestId(id: string): TouchSpinCorePublicAPI {
          type WithCore = HTMLInputElement & { _touchSpinCore?: unknown };
          const input = (window.__ts as NonNullable<typeof window.__ts>).requireInputByTestId(id);
          const core = (input as WithCore)._touchSpinCore;
          if (!core) throw new Error(`TouchSpinCore not found for "${id}"`);
          return core as TouchSpinCorePublicAPI;
        },
      };
      Object.freeze(window.__ts);
    };
    install();
  });

  // Current document
  await page.evaluate(() => {
    const install = () => {
      if (window.__ts) return;
      window.__ts = {
        requireInputByTestId(id: string): HTMLInputElement {
          const el = document.querySelector(`[data-testid="${id}"]`) as HTMLInputElement | null;
          if (!el) throw new Error(`Input with testId "${id}" not found`);
          return el;
        },
        requireCoreByTestId(id: string): TouchSpinCorePublicAPI {
          type WithCore = HTMLInputElement & { _touchSpinCore?: unknown };
          const input = (window.__ts as NonNullable<typeof window.__ts>).requireInputByTestId(id);
          const core = (input as WithCore)._touchSpinCore;
          if (!core) throw new Error(`TouchSpinCore not found for "${id}"`);
          return core as TouchSpinCorePublicAPI;
        },
      };
      Object.freeze(window.__ts);
    };
    install();
  });
}
