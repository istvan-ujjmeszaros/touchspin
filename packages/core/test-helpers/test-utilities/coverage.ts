import type { Page } from '@playwright/test';

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