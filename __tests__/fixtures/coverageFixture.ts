import { test as base } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Custom test fixture that automatically handles coverage
export const test = base.extend({
  // Auto-fixture that runs for every test
  page: async ({ page }, use) => {
    // Start coverage collection if COVERAGE env is set
    if (process.env.COVERAGE === '1') {
      try {
        await page.coverage.startJSCoverage({
          resetOnNavigation: false
        });
      } catch (error) {
        // Ignore if coverage not supported
      }
    }

    // Use the page in the test
    await use(page);

    // Collect coverage after test
    if (process.env.COVERAGE === '1') {
      try {
        const coverage = await page.coverage.stopJSCoverage();

        // Get test title for filename
        const testInfo = (page as any)._testInfo || {};
        const testName = (testInfo.title || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
        const testFile = (testInfo.file || 'unknown').replace(/.*\/([^/]+)\.test\.ts$/, '$1');

        await saveCoverageData(coverage, `${testFile}_${testName}`);
      } catch (error) {
        // Ignore coverage errors
      }
    }
  }
});

async function saveCoverageData(coverage: any[], testName: string): Promise<void> {
  const coverageDir = path.join(process.cwd(), 'reports', 'playwright-coverage');

  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }

  // Filter coverage to include source files from packages
  const sourceCoverage = coverage.filter(entry => {
    const url = entry.url || '';
    return url.includes('/packages/') &&
           url.includes('/src/') &&
           !url.includes('node_modules') &&
           !url.includes('dist/');
  });

  if (sourceCoverage.length > 0) {
    // Save raw V8 coverage for processing in teardown
    const fileName = `${testName}.json`;
    const filePath = path.join(coverageDir, fileName);

    // If file already exists, merge coverage
    let existingCoverage = [];
    if (fs.existsSync(filePath)) {
      try {
        existingCoverage = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch {
        // Ignore parse errors
      }
    }

    // Merge with existing coverage
    const merged = [...existingCoverage, ...sourceCoverage];
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
  }
}

export { expect } from '@playwright/test';