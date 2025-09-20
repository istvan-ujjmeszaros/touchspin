import type { Page } from '@playwright/test';
// Minimal CDP session interface to avoid external type dependency
interface MinimalCDPSession {
  send(method: string, params?: unknown): Promise<unknown>;
}

/* ──────────────────────────
 * Coverage helpers (CDP)
 * ────────────────────────── */

interface PageWithCDP extends Page {
  __cdpSession?: MinimalCDPSession;
}

export async function startCoverage(page: Page): Promise<void> {
  // Use PW_COVERAGE as the single source of truth for coverage runs
  if (process.env.PW_COVERAGE !== '1') return;
  try {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Profiler.enable');
    await cdp.send('Profiler.startPreciseCoverage', { callCount: true, detailed: true });
    (page as PageWithCDP).__cdpSession = cdp;
  } catch (err) {

    console.error('Failed to start CDP coverage:', err);
  }
}

export async function collectCoverage(page: Page, testName: string): Promise<void> {
  // Use PW_COVERAGE as the single source of truth for coverage runs
  if (process.env.PW_COVERAGE !== '1') return;
  try {
    const cdp = (page as PageWithCDP).__cdpSession;
    if (!cdp) {

      console.warn(`No CDP session found for test: ${testName}`);
      return;
    }
    const out = await cdp.send('Profiler.takePreciseCoverage');
    const result = (out as { result?: unknown }).result as Array<{ url?: string }> | undefined;
    if (result) {
      await saveCoverageData(result, testName);
    }
  } catch (err) {

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
      // Include dev runtime too: /src/ (unit), /dist/ (prod), /devdist/ (Playwright coverage)
      (url.includes('/src/') || url.includes('/dist/') || url.includes('/devdist/')) &&
      !url.includes('node_modules')
    );
  });

  if (sourceCoverage.length > 0) {
    const fileName = `${testName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    const filePath = path.join(coverageDir, fileName);
    await fs.promises.writeFile(filePath, JSON.stringify(sourceCoverage, null, 2));
  }
}
