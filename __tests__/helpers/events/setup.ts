import type { Page } from '@playwright/test';

/* ──────────────────────────
 * Centralized logging (idempotent)
 *
 * LAYERING RULES:
 * - This module has no dependencies (leaf level)
 * - Used by: core/initialization.ts, jquery/initialization.ts
 * - Do not import from other helper modules
 * ────────────────────────── */

/**
 * Wire up logging for TouchSpin DOM CustomEvents and the native 'change' event.
 * Safe to call multiple times; it runs only once per page.
 */
export async function setupLogging(page: Page): Promise<void> {
  await page.evaluate(() => {
    if (window.__tsLoggingSetup) return;
    window.__tsLoggingSetup = true;

    const logEvent =
      window.logEvent ||
      ((name: string, detail?: Record<string, unknown>) => {
        window.eventLog = window.eventLog || [];
        const entry = {
          event: name,
          type: (detail?.type as string) ?? 'native',
          ...(detail ?? {}),
        };
        window.eventLog.push(entry);
        const box = document.getElementById('event-log') as HTMLTextAreaElement | null;
        if (box) {
          const t = (detail?.target as string) ?? '';
          const v = (detail?.value as string) ?? '';
          box.value += `${name}${t ? ` [${t}]` : ''}${v ? ` = ${v}` : ''}\n`;
}
});

// TouchSpin emitted DOM CustomEvents (renderer-agnostic)
const tsEvents = [
  'touchspin.on.min',
  'touchspin.on.max',
  'touchspin.on.startspin',
  'touchspin.on.startupspin',
  'touchspin.on.startdownspin',
  'touchspin.on.stopspin',
  'touchspin.on.stopupspin',
  'touchspin.on.stopdownspin',
] as const;

tsEvents.forEach((ev) => {
  document.addEventListener(
    ev,
    (e: Event) => {
      const target = e.target as HTMLElement | null;
      // Try to resolve the owning input's testId
      const input =
        target?.closest('[data-testid$="-wrapper"]')?.querySelector('input[data-testid]') ??
        (target as HTMLInputElement | null);
      const testId =
        (input as HTMLInputElement | null)?.getAttribute('data-testid') ||
        target?.id ||
        'unknown';
      const value = (input as HTMLInputElement | null)?.value;
      logEvent(ev, { type: 'touchspin', target: testId, value });
    },
    true
  );
});

// Native 'change' on inputs of interest
document.addEventListener(
  'change',
  (e: Event) => {
    const input = e.target as HTMLInputElement | null;
    if (!input || !input.matches('input[data-testid]')) return;
    const testId = input.getAttribute('data-testid') || 'unknown';
    logEvent('change', { type: 'native', target: testId, value: input.value });
  },
  true
);
});
}