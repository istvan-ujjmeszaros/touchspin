import type { Page, Locator } from '@playwright/test';

/** Event log entry shape emitted by test fixtures */
export type EventLogType = 'native' | 'touchspin';
export interface EventLogEntry {
  type: EventLogType;
  event: string;
  target?: string;
  value?: string;
}

/** Structured locators for a single TouchSpin instance identified by a testId. */
export interface TouchSpinElements {
  /** Root wrapper around the TouchSpin input and controls. */
  wrapper: Locator;
  /** Underlying input element with the given data-testid. */
  input: Locator;
  /** The "up" button (increment). */
  upButton: Locator;
  /** The "down" button (decrement). */
  downButton: Locator;
  /** Optional prefix element rendered before the input. */
  prefix: Locator;
  /** Optional postfix element rendered after the input. */
  postfix: Locator;
}

/* ──────────────────────────
 * Small selector builders (renderer-agnostic)
 * ────────────────────────── */
const inputById = (page: Page, testId: string): Locator =>
  page.locator(`[data-testid="${testId}"]`);

const wrapperById = (page: Page, testId: string): Locator =>
  page.getByTestId(`${testId}-wrapper`);

const injected = (
  wrapper: Locator,
  role: 'up' | 'down' | 'prefix' | 'postfix'
): Locator => wrapper.locator(`[data-touchspin-injected="${role}"]`).first();

const upButtonIn = (wrapper: Locator): Locator => injected(wrapper, 'up');
const downButtonIn = (wrapper: Locator): Locator => injected(wrapper, 'down');
const prefixIn = (wrapper: Locator): Locator => injected(wrapper, 'prefix');
const postfixIn = (wrapper: Locator): Locator => injected(wrapper, 'postfix');

/* ──────────────────────────
 * Centralized logging (idempotent)
 * ────────────────────────── */

/**
 * Wire up logging for TouchSpin DOM CustomEvents and the native 'change' event.
 * Safe to call multiple times; it runs only once per page.
 */
export async function setupLogging(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as any;
    if (w.__tsLoggingSetup) return;
    w.__tsLoggingSetup = true;

    const logEvent =
      w.logEvent ||
      ((name: string, detail?: Record<string, unknown>) => {
        w.eventLog = w.eventLog || [];
        const entry = {
          event: name,
          type: (detail?.type as string) ?? 'native',
          ...(detail ?? {}),
        };
        w.eventLog.push(entry);
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

/* ──────────────────────────
 * Readiness / initialization
 * ────────────────────────── */

/** True if wrapper with injection marker exists. */
export async function isTouchSpinInitialized(page: Page, testId: string): Promise<boolean> {
  return (await wrapperById(page, testId).locator('[data-touchspin-injected]').count()) > 0;
}

/** Throws a clear error if not initialized. */
export async function expectTouchSpinInitialized(page: Page, testId: string): Promise<void> {
  if (!(await isTouchSpinInitialized(page, testId))) {
    throw new Error(
      `TouchSpin not initialized for "${testId}". Expected [data-testid="${testId}-wrapper"][data-touchspin-injected].`
    );
  }
}

/** True if wrapper (with injection marker) no longer exists. */
export async function isTouchSpinDestroyed(page: Page, testId: string): Promise<boolean> {
  return (await wrapperById(page, testId).locator('[data-touchspin-injected]').count()) === 0;
}

/** Throws if still initialized. */
export async function expectTouchSpinDestroyed(page: Page, testId: string): Promise<void> {
  if (!(await isTouchSpinDestroyed(page, testId))) {
    throw new Error(
      `TouchSpin still initialized for "${testId}". Expected no [data-testid="${testId}-wrapper"].`
    );
  }
}

/** Wait until the input is marked as injected by TouchSpin. */
export async function waitForTouchspinInitialized(
  page: Page,
  testId: string,
  timeout = 5000
): Promise<void> {
  try {
    await inputById(page, testId).locator('[data-touchspin-injected]').waitFor({
      state: 'attached',
      timeout,
    });
  } catch {
    throw new Error(`TouchSpin failed to initialize within ${timeout}ms for testId "${testId}".`);
  }
}

/* ──────────────────────────
 * Element bundles / element ops
 * ────────────────────────── */

export async function getTouchSpinWrapper(page: Page, testId: string): Promise<Locator> {
  await waitForTouchspinInitialized(page, testId);
  const wrapper = wrapperById(page, testId);
  if ((await wrapper.count()) === 0) {
    throw new Error(`TouchSpin wrapper not found for "${testId}".`);
  }
  return wrapper;
}

/** Returns all key locators, throws if critical parts are missing. */
export async function getTouchSpinElements(page: Page, testId: string): Promise<TouchSpinElements> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  const input = inputById(page, testId);
  const upButton = upButtonIn(wrapper);
  const downButton = downButtonIn(wrapper);
  const prefix = prefixIn(wrapper);
  const postfix = postfixIn(wrapper);

  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  if ((await upButton.count()) === 0) throw new Error(`Up button not found for "${testId}".`);
  if ((await downButton.count()) === 0) throw new Error(`Down button not found for "${testId}".`);

  return { wrapper, input, upButton, downButton, prefix, postfix };
}

/* ──────────────────────────
 * Interactions
 * ────────────────────────── */

export async function clickUpButton(page: Page, testId: string): Promise<void> {
  const { upButton } = await getTouchSpinElements(page, testId);
  await upButton.click();
}

export async function clickDownButton(page: Page, testId: string): Promise<void> {
  const { downButton } = await getTouchSpinElements(page, testId);
  await downButton.click();
}

export async function holdUpButton(page: Page, testId: string, durationMs: number): Promise<void> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  const btn = upButtonIn(wrapper);
  if ((await btn.count()) === 0) throw new Error(`Up button not found for "${testId}".`);
  await btn.dispatchEvent('mousedown');
  await page.waitForTimeout(durationMs);
  await btn.dispatchEvent('mouseup');
}

export async function holdDownButton(
  page: Page,
  testId: string,
  durationMs: number
): Promise<void> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  const btn = downButtonIn(wrapper);
  if ((await btn.count()) === 0) throw new Error(`Down button not found for "${testId}".`);
  await btn.dispatchEvent('mousedown');
  await page.waitForTimeout(durationMs);
  await btn.dispatchEvent('mouseup');
}

export async function pressUpArrowKeyOnInput(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.keyboard.press('ArrowUp');
}

export async function pressDownArrowKeyOnInput(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.keyboard.press('ArrowDown');
}

export async function holdUpArrowKeyOnInput(
  page: Page,
  testId: string,
  durationMs: number
): Promise<void> {
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(durationMs);
  await page.keyboard.up('ArrowUp');
}

export async function holdDownArrowKeyOnInput(
  page: Page,
  testId: string,
  durationMs: number
): Promise<void> {
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(durationMs);
  await page.keyboard.up('ArrowDown');
}

export async function typeInInput(page: Page, testId: string, text: string): Promise<void> {
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.keyboard.type(text);
}

export async function selectAllInInput(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.keyboard.press('Control+a');
}

export async function readInputValue(page: Page, testId: string): Promise<string> {
  await waitForTouchspinInitialized(page, testId);
  return inputById(page, testId).inputValue();
}

export async function fillWithValue(page: Page, testId: string, value: string): Promise<void> {
  await waitForTouchspinInitialized(page, testId);
  const input = inputById(page, testId);
  await input.focus();
  await input.click({ clickCount: 3 });
  await input.fill(value);
  await page.waitForTimeout(10); // short settle
}

export async function fillWithValueAndBlur(
  page: Page,
  testId: string,
  value: string
): Promise<void> {
  await fillWithValue(page, testId, value);
  const before = await readInputValue(page, testId);
  await page.keyboard.press('Tab');
  try {
    await page.waitForFunction(
      ({ testId, before }) => {
        const el = document.querySelector(
          `[data-testid="${testId}"]`
        ) as HTMLInputElement | null;
        return !!el && el.value !== before;
      },
      { testId, before },
      { timeout: 1000 }
    );
  } catch {
    await page.waitForTimeout(100);
  }
}

export async function waitForSanitization(page: Page, _testId: string): Promise<void> {
  // Keep simple; wire a deterministic hook here if you add one in the app.
  await page.waitForTimeout(100);
}

export async function focusUpButton(page: Page, testId: string): Promise<void> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  await upButtonIn(wrapper).focus();
}

export async function focusDownButton(page: Page, testId: string): Promise<void> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  await downButtonIn(wrapper).focus();
}

export async function focusOutside(page: Page, outsideTestId: string): Promise<void> {
  await inputById(page, outsideTestId).focus();
}

export async function blurAway(page: Page): Promise<void> {
  await page.click('#blur-target');
}

/** Enable/disable boolean attributes on input (`disabled` / `readonly`). */
export async function setInputAttribute(
  page: Page,
  testId: string,
  attributeName: 'disabled' | 'readonly',
  attributeValue: boolean
): Promise<void> {
  await waitForTouchspinInitialized(page, testId);
  const input = inputById(page, testId);
  if (attributeValue) {
    await input.evaluate((el, attr) => el.setAttribute(attr, ''), attributeName);
  } else {
    await input.evaluate((el, attr) => el.removeAttribute(attr), attributeName);
  }
}

/** Quick “is disabled” check for the up button. */
export async function checkTouchspinUpIsDisabled(page: Page, testId: string): Promise<boolean> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  return upButtonIn(wrapper).isDisabled();
}

/** Prefix/postfix helpers (renderer-agnostic via injected attributes) */
export async function hasPrefix(
  page: Page,
  testId: string,
  expectedText?: string
): Promise<boolean> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  const prefix = prefixIn(wrapper);
  const exists = (await prefix.count()) > 0;
  if (!exists) return false;
  if (expectedText == null) return true;
  return (await prefix.textContent()) === expectedText;
}

export async function hasPostfix(
  page: Page,
  testId: string,
  expectedText?: string
): Promise<boolean> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  const postfix = postfixIn(wrapper);
  const exists = (await postfix.count()) > 0;
  if (!exists) return false;
  if (expectedText == null) return true;
  return (await postfix.textContent()) === expectedText;
}

/** NOTE: The following three remain Bootstrap-specific; keep only if still needed. */
export async function getInputGroupAddons(page: Page, testId: string): Promise<string[]> {
  const wrapper = wrapperById(page, testId);
  if ((await wrapper.count()) === 0) throw new Error(`Wrapper not found for "${testId}".`);
  return wrapper.evaluate((el) =>
    Array.from(el.querySelectorAll('.input-group-addon, .input-group-text'))
      .map((n) => (n.textContent || '').trim())
      .filter(Boolean)
  );
}
export async function checkPrependExists(page: Page): Promise<boolean> {
  return (await page.locator('.input-group-prepend').count()) > 0;
}
export async function checkAppendExists(page: Page): Promise<boolean> {
  return (await page.locator('.input-group-append').count()) > 0;
}

/* ──────────────────────────
 * Event log helpers (typed)
 * ────────────────────────── */

export async function getEventLog(page: Page): Promise<EventLogEntry[]> {
  return page.evaluate(() => (window as any).eventLog || []);
}

export async function clearEventLog(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as any;
    if (w.clearEventLog) {
      w.clearEventLog();
      return;
    }
    w.eventLog = [];
    const box = document.getElementById('event-log') as HTMLTextAreaElement | null;
    if (box) box.value = '';
  });
}

export async function hasEventInLog(
  page: Page,
  eventName: string,
  eventType?: EventLogType
): Promise<boolean> {
  const log = await getEventLog(page);
  return log.some((e) => e.event === eventName && (!eventType || e.type === eventType));
}

export async function getEventsOfType(
  page: Page,
  eventType: EventLogType
): Promise<EventLogEntry[]> {
  const log = await getEventLog(page);
  return log.filter((e) => e.type === eventType);
}

export async function countEventInLog(
  page: Page,
  eventName: string,
  eventType?: EventLogType
): Promise<number> {
  const log = await getEventLog(page);
  return log.filter((e) => e.event === eventName && (!eventType || e.type === eventType)).length;
}

export async function waitForEventInLog(
  page: Page,
  eventName: string,
  options?: { eventType?: EventLogType; timeout?: number }
): Promise<boolean> {
  const timeout = options?.timeout ?? 5000;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await hasEventInLog(page, eventName, options?.eventType)) return true;
    await page.waitForTimeout(100);
  }
  return false;
}

export async function getEventLogText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const el = document.getElementById('event-log') as HTMLTextAreaElement | null;
    return el?.value ?? '';
  });
}

/* ──────────────────────────
 * Mouse wheel helpers
 * ────────────────────────── */

export async function wheelUpOnInput(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.mouse.wheel(0, -100);
}

export async function wheelDownOnInput(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  if ((await input.count()) === 0) throw new Error(`Input not found for "${testId}".`);
  await input.focus();
  await page.mouse.wheel(0, 100);
}

/* ──────────────────────────
 * Page readiness
 * ────────────────────────── */

export async function waitForPageReady(
  page: Page,
  readyFlag = 'testPageReady',
  timeout = 5000
): Promise<void> {
  await page.waitForFunction((flag) => (window as any)[flag] === true, readyFlag, { timeout });
}

/* ──────────────────────────
 * Attributes & generic ops
 * ────────────────────────── */

export async function getInputAttribute(
  page: Page,
  testId: string,
  attributeName: string
): Promise<string | null> {
  await waitForTouchspinInitialized(page, testId);
  return inputById(page, testId).getAttribute(attributeName);
}

export function getElement(page: Page, testId: string): Locator {
  return inputById(page, testId);
}

export async function clickElement(page: Page, testId: string): Promise<void> {
  const el = inputById(page, testId);
  if ((await el.count()) === 0) throw new Error(`Element not found for "${testId}".`);
  await el.click();
}

/* ──────────────────────────
 * Coverage helpers (CDP)
 * ────────────────────────── */

export async function startCoverage(page: Page): Promise<void> {
  if (process.env.COVERAGE !== '1') return;
  try {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Profiler.enable');
    await cdp.send('Profiler.startPreciseCoverage', { callCount: true, detailed: true });
    (page as any).__cdpSession = cdp;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start CDP coverage:', err);
  }
}

export async function collectCoverage(page: Page, testName: string): Promise<void> {
  if (process.env.COVERAGE !== '1') return;
  try {
    const cdp = (page as any).__cdpSession;
    if (!cdp) {
      // eslint-disable-next-line no-console
      console.warn(`No CDP session found for test: ${testName}`);
      return;
    }
    const { result } = await cdp.send('Profiler.takePreciseCoverage');
    await saveCoverageData(result as Array<{ url?: string }>, testName);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Coverage collection error for ${testName}:`, err);
  }
}

export async function saveCoverageData(
  coverage: Array<{ url?: string }>,
  testName: string
): Promise<void> {
  const fs = await import('fs');
  const path = await import('path');

  const coverageDir = path.join(process.cwd(), 'reports', 'playwright-coverage');
  if (!fs.existsSync(coverageDir)) fs.mkdirSync(coverageDir, { recursive: true });

  const sourceCoverage = coverage.filter((entry) => {
    const url = entry.url ?? '';
    return (
      url.includes('/packages/') &&
      (url.includes('/src/') || url.includes('/dist/')) &&
      !url.includes('node_modules') &&
      !url.includes('@vite/client')
    );
  });

  if (sourceCoverage.length > 0) {
    const fileName = `${testName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    const filePath = path.join(coverageDir, fileName);
    await fs.promises.writeFile(filePath, JSON.stringify(sourceCoverage, null, 2));
  }
}

/* ──────────────────────────
 * jQuery plugin bootstrap (for jQuery pages)
 * ────────────────────────── */

export async function installJqueryPlugin(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const offenders = Array.from(document.querySelectorAll('script[src*="/src/"]')).map(
      (s) => (s as HTMLScriptElement).src
    );
    if (offenders.length) {
      throw new Error('Tests must not load /src/. Use /dist/index.js.\n' + offenders.join('\n'));
    }

    const { installWithRenderer } = await import('/packages/jquery-plugin/dist/index.js');
    const rendererMod = await import('/packages/renderers/bootstrap5/dist/index.js');
    const Bootstrap5Renderer = (rendererMod as any).default || (rendererMod as any).Bootstrap5Renderer;
    installWithRenderer(Bootstrap5Renderer);

    (window as any).touchSpinReady = true;
  });

  // Centralized logging (no jQuery-specific .on wiring)
  await setupLogging(page);
}

/* ──────────────────────────
 * jQuery init for a single input
 * ────────────────────────── */

export async function initializeTouchspinJQuery(
  page: Page,
  testId: string,
  options: Record<string, unknown> = {}
): Promise<void> {
  await setupLogging(page);
  await page.evaluate(({ id, opts }) => {
    const $ = (window as any).$;
    const $input = $.call ? $.call(null, `[data-testid="${id}"]`) : $(`[data-testid="${id}"]`);
    if ((opts as any).initval !== undefined) $input.val((opts as any).initval);
    $input.TouchSpin(opts);
  }, { id: testId, opts: options });
}

/* ──────────────────────────
 * Dynamic test inputs (fixture helpers)
 * ────────────────────────── */

export async function createAdditionalInput(
  page: Page,
  testId: string,
  options: {
    value?: string;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    readonly?: boolean;
    label?: string;
  } = {}
): Promise<void> {
  await page.evaluate(({ id, opts }) => {
    (window as any).createTestInput(id, opts);
  }, { id: testId, opts: options });
}

export async function clearAdditionalInputs(page: Page): Promise<void> {
  await page.evaluate(() => (window as any).clearAdditionalInputs());
}

/* ──────────────────────────
 * Core (direct) API hooks
 * ────────────────────────── */

export async function initializeTouchspin(
  page: Page,
  testId: string,
  options: Record<string, unknown> = {}
): Promise<void> {
  await setupLogging(page);
  await page.evaluate(async ({ testId, options }) => {
    const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    if (!input) throw new Error(`Input with testId "${testId}" not found`);
    if ((options as any).initval !== undefined) input.value = String((options as any).initval);

    const core = new TouchSpinCore(input, options);
    (input as any)._touchSpinCore = core;

    // No per-instance listeners here: core will dispatch DOM CustomEvents
    core.initDOMEventHandling();
  }, { testId, options });

  await inputById(page, testId).locator('[data-touchspin-injected]').waitFor({ timeout: 5000 });
}

export async function isCoreInitialized(page: Page, testId: string): Promise<boolean> {
  return page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    return !!(input && (input as any)._touchSpinCore);
  }, { testId });
}

export async function getNumericValue(page: Page, testId: string): Promise<number> {
  const v = await readInputValue(page, testId);
  return parseFloat(v) || 0;
}

export async function setValueViaAPI(
  page: Page,
  testId: string,
  value: number | string
): Promise<void> {
  await page.evaluate(({ testId, value }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    const core = input && (input as any)._touchSpinCore;
    if (!core) throw new Error(`TouchSpinCore not found for "${testId}"`);
    core.setValue(value);
  }, { testId, value });
}

export async function destroyCore(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    const core = input && (input as any)._touchSpinCore;
    if (!core) throw new Error(`TouchSpinCore not found for "${testId}"`);
    core.destroy();
  }, { testId });
}

export async function incrementViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    const core = input && (input as any)._touchSpinCore;
    if (!core) throw new Error(`TouchSpinCore not found for "${testId}"`);
    core.upOnce();
  }, { testId });
}

export async function decrementViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    const core = input && (input as any)._touchSpinCore;
    if (!core) throw new Error(`TouchSpinCore not found for "${testId}"`);
    core.downOnce();
  }, { testId });
}

export async function startUpSpinViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    const core = input && (input as any)._touchSpinCore;
    if (!core) throw new Error(`TouchSpinCore not found for "${testId}"`);
    core.startUpSpin();
  }, { testId });
}

export async function startDownSpinViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    const core = input && (input as any)._touchSpinCore;
    if (!core) throw new Error(`TouchSpinCore not found for "${testId}"`);
    core.startDownSpin();
  }, { testId });
}

export async function stopSpinViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    const core = input && (input as any)._touchSpinCore;
    if (!core) throw new Error(`TouchSpinCore not found for "${testId}"`);
    core.stopSpin();
  }, { testId });
}

export async function updateSettingsViaAPI(
  page: Page,
  testId: string,
  newSettings: Record<string, unknown>
): Promise<void> {
  await page.evaluate(({ testId, newSettings }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    const core = input && (input as any)._touchSpinCore;
    if (!core) throw new Error(`TouchSpinCore not found for "${testId}"`);
    core.updateSettings(newSettings);
  }, { testId, newSettings });
}

export async function getPublicAPI(page: Page, testId: string): Promise<unknown> {
  return page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    const core = input && (input as any)._touchSpinCore;
    if (!core) throw new Error(`TouchSpinCore not found for "${testId}"`);
    return core.toPublicApi();
  }, { testId });
}

/* ──────────────────────────
 * Polled expectations
 * ────────────────────────── */

export async function expectValueToBe(
  page: Page,
  testId: string,
  expected: string,
  timeout = 3000
): Promise<void> {
  await page.waitForFunction(
    ({ testId, expected }) => {
      const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
      return !!input && input.value === expected;
    },
    { testId, expected },
    { timeout }
  );
}

export async function expectValueToChange(
  page: Page,
  testId: string,
  from: string,
  to: string,
  timeout = 3000
): Promise<void> {
  await expectValueToBe(page, testId, from, timeout);
  await expectValueToBe(page, testId, to, timeout);
}

export async function expectValueToBeGreaterThan(
  page: Page,
  testId: string,
  value: number,
  timeout = 3000
): Promise<void> {
  await page.waitForFunction(
    ({ testId, value }) => {
      const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
      return !!input && parseFloat(input.value || '0') > value;
    },
    { testId, value },
    { timeout }
  );
}

export async function expectValueToBeLessThan(
  page: Page,
  testId: string,
  value: number,
  timeout = 3000
): Promise<void> {
  await page.waitForFunction(
    ({ testId, value }) => {
      const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
      return !!input && parseFloat(input.value || '0') < value;
    },
    { testId, value },
    { timeout }
  );
}

export async function expectValueToBeBetween(
  page: Page,
  testId: string,
  min: number,
  max: number,
  timeout = 3000
): Promise<void> {
  await page.waitForFunction(
    ({ testId, min, max }) => {
      const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
      if (!input) return false;
      const val = parseFloat(input.value || '0');
      return val >= min && val <= max;
    },
    { testId, min, max },
    { timeout }
  );
}

/** Renderer-agnostic: button locator is based on injected attribute. */
export async function expectButtonToBeDisabled(
  page: Page,
  testId: string,
  button: 'up' | 'down',
  timeout = 3000
): Promise<void> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  const target = button === 'up' ? upButtonIn(wrapper) : downButtonIn(wrapper);
  await target.waitFor({ state: 'attached', timeout });
  if (!(await target.isDisabled())) {
    throw new Error(`Expected "${button}" button to be disabled for "${testId}", but it is enabled.`);
  }
}

export async function expectButtonToBeEnabled(
  page: Page,
  testId: string,
  button: 'up' | 'down',
  timeout = 3000
): Promise<void> {
  const wrapper = await getTouchSpinWrapper(page, testId);
  const target = button === 'up' ? upButtonIn(wrapper) : downButtonIn(wrapper);
  await target.waitFor({ state: 'attached', timeout });
  if (await target.isDisabled()) {
    throw new Error(`Expected "${button}" button to be enabled for "${testId}", but it is disabled.`);
  }
}

export async function expectEventFired(
  page: Page,
  eventName: string,
  timeout = 3000
): Promise<void> {
  await page.waitForFunction(
    (eventName) => {
      const log = (window as any).eventLog || [];
      return log.some((e: any) => e.event === eventName);
    },
    eventName,
    { timeout }
  );
}

export async function expectNoEvent(
  page: Page,
  eventName: string,
  timeout = 1000
): Promise<void> {
  try {
    await expectEventFired(page, eventName, timeout);
    throw new Error(`Expected event '${eventName}' NOT to be fired, but it appeared in the log.`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!/Timeout/i.test(msg)) throw err; // timeout = success
  }
}

export async function expectEventCount(
  page: Page,
  eventName: string,
  count: number,
  timeout = 3000
): Promise<void> {
  await page.waitForFunction(
    ({ eventName, count }) => {
      const log = (window as any).eventLog || [];
      return log.filter((e: any) => e.event === eventName).length === count;
    },
    { eventName, count },
    { timeout }
  );
}
