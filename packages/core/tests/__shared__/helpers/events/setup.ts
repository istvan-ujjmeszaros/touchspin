import type { Page } from '@playwright/test';
import type { EventLogEntry, EventLogType, TouchSpinCorePublicAPI } from '../types';

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

    // Skip entirely if no event-log textarea exists
    if (!document.getElementById('event-log')) {
      console.log('[setupLogging] No event-log textarea found - skipping all event listener registration');
      window.__tsLoggingSetup = true; // Mark as setup to prevent re-runs
      return; // No event listeners registered at all
    }

    console.log('[setupLogging] Event-log textarea found - registering event listeners');
    window.__tsLoggingSetup = true;

    // (DOM helpers are installed via installDomHelpers; logging remains here)

    const logEvent =
      window.logEvent ||
      ((name: string, detail?: Partial<EventLogEntry>) => {
        window.eventLog = window.eventLog || [];
        const entry: EventLogEntry = {
          event: name,
          type: (detail?.type as EventLogType) ?? 'native',
        } as EventLogEntry;
        if (detail?.target !== undefined) (entry as { target?: string }).target = detail.target;
        if (detail?.value !== undefined) (entry as { value?: string }).value = detail.value;
        window.eventLog.push(entry);
        const box = document.getElementById('event-log') as HTMLTextAreaElement | null;
        if (box) {
          const t = entry.target ?? '';
          const v = entry.value ?? '';
          box.value += `${name}${t ? ` [${t}]` : ''}${v ? ` = ${v}` : ''}\n`;
        }
      });

    window.logEvent = logEvent;

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

    console.log(`[setupLogging] Registering ${tsEvents.length} TouchSpin event listeners`);
    tsEvents.forEach((ev) => {
      document.addEventListener(
        ev,
        (e: Event) => {
          // Early return if no textarea, not visible, or disabled
          const eventLogTextarea = document.getElementById('event-log') as HTMLTextAreaElement | null;
          if (!eventLogTextarea ||
              eventLogTextarea.style.display === 'none' ||
              eventLogTextarea.disabled) {
            return;
          }

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
          const detail: Partial<EventLogEntry> = { type: 'touchspin', target: testId };
          if (value !== undefined) (detail as { value?: string }).value = value;
          logEvent(ev, detail);
        },
        true
      );
    });

    // Native 'change' on inputs of interest
    console.log('[setupLogging] Registering change event listener');
    document.addEventListener(
      'change',
      (e: Event) => {
        // Early return if no textarea, not visible, or disabled
        const eventLogTextarea = document.getElementById('event-log') as HTMLTextAreaElement | null;
        if (!eventLogTextarea ||
            eventLogTextarea.style.display === 'none' ||
            eventLogTextarea.disabled) {
          return;
        }

        const input = e.target as HTMLInputElement | null;
        if (!input || !input.matches('input[data-testid]')) return;
        const testId = input.getAttribute('data-testid') || 'unknown';
        logEvent('change', { type: 'native', target: testId, value: input.value });
      },
      true
    );
  });
}
