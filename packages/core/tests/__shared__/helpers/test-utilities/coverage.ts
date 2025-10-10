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

export async function collectCoverage(
  page: Page,
  testName: string,
  testFile?: string
): Promise<void> {
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
      await saveCoverageData(result, testName, testFile);
    }
  } catch (err) {
    console.error(`Coverage collection error for ${testName}:`, err);
  }
}

export async function saveCoverageData(
  coverage: Array<{ url?: string }>,
  testName: string,
  _testFile?: string
): Promise<void> {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const coverageDir = path.join(process.cwd(), 'reports', 'playwright-coverage');
  if (!fs.existsSync(coverageDir)) fs.mkdirSync(coverageDir, { recursive: true });

  const sourceCoverage = coverage.filter((entry) => {
    const url = entry.url ?? '';
    // Accept URLs with /packages/ (old structure) OR /devdist/ (single-root devdist from PR#2)
    const hasProjectPath = url.includes('/packages/') || url.includes('/devdist/');
    const hasSourceOrBuild =
      url.includes('/src/') || url.includes('/dist/') || url.includes('/devdist/');
    return hasProjectPath && hasSourceOrBuild && !url.includes('node_modules');
  });

  if (sourceCoverage.length > 0) {
    // Create unique filename by detecting which renderer's IIFE/UMD bundle is loaded
    // This identifies which fixture was actually used during the test
    let rendererPrefix = '';
    for (const entry of sourceCoverage) {
      const url = entry.url || '';
      // Check which renderer's bundle is loaded (old structure, new structure, or standalone)
      if (
        url.includes('/bootstrap3/devdist/iife/') ||
        url.includes('/devdist/renderers/bootstrap3/iife/') ||
        url.includes('/devdist/adapters/standalone/umd/bootstrap3.global.js')
      ) {
        rendererPrefix = 'bootstrap3_';
        break;
      } else if (
        url.includes('/bootstrap4/devdist/iife/') ||
        url.includes('/devdist/renderers/bootstrap4/iife/') ||
        url.includes('/devdist/adapters/standalone/umd/bootstrap4.global.js')
      ) {
        rendererPrefix = 'bootstrap4_';
        break;
      } else if (
        url.includes('/bootstrap5/devdist/iife/') ||
        url.includes('/devdist/renderers/bootstrap5/iife/') ||
        url.includes('/devdist/adapters/standalone/umd/bootstrap5.global.js')
      ) {
        rendererPrefix = 'bootstrap5_';
        break;
      } else if (
        url.includes('/tailwind/devdist/iife/') ||
        url.includes('/devdist/renderers/tailwind/iife/') ||
        url.includes('/devdist/adapters/standalone/umd/tailwind.global.js')
      ) {
        rendererPrefix = 'tailwind_';
        break;
      } else if (
        url.includes('/vanilla/devdist/') ||
        url.includes('/devdist/renderers/vanilla/') ||
        url.includes('/devdist/adapters/standalone/umd/vanilla.global.js')
      ) {
        rendererPrefix = 'vanilla_';
        break;
      }
    }

    const fileName = `${rendererPrefix}${testName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    const filePath = path.join(coverageDir, fileName);
    await fs.promises.writeFile(filePath, JSON.stringify(sourceCoverage, null, 2));
  }
}
