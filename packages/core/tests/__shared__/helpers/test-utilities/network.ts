import type { Page } from '@playwright/test';

/**
 * Pre-check that a resource is fetchable before attempting dynamic imports.
 * This helps provide better error messages when the web server isn't properly configured.
 *
 * @param page - The Playwright page instance
 * @param url - The URL to check
 * @throws Error with detailed message if the resource is not fetchable
 */
export async function preFetchCheck(page: Page, url: string): Promise<void> {
  const response = await page.evaluate(async (fetchUrl: string) => {
    try {
      const res = await fetch(fetchUrl, { method: 'HEAD' });
      return {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        url: res.url,
        headers: {
          contentType: res.headers.get('content-type'),
          server: res.headers.get('server'),
        },
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message || 'Failed to fetch',
        url: fetchUrl,
      };
    }
  }, url);

  if (!response.ok) {
    const errorDetails = [];
    errorDetails.push(`Failed to fetch resource: ${url}`);

    if ('error' in response) {
      errorDetails.push(`Network error: ${response.error}`);
      errorDetails.push('');
      errorDetails.push('Possible causes:');
      errorDetails.push(
        '1. Web server not running (check that playwright webServer is configured)'
      );
      errorDetails.push('2. Incorrect port configuration (expected port 8866)');
      errorDetails.push('3. File not built (run "yarn build:test" first)');
    } else {
      errorDetails.push(`HTTP ${response.status}: ${response.statusText}`);
      if (response.status === 404) {
        errorDetails.push('');
        errorDetails.push('File not found. Possible causes:');
        errorDetails.push('1. Files not built (run "yarn build:test" first)');
        errorDetails.push('2. Incorrect path mapping (check import maps or paths)');
        errorDetails.push('3. Web server not serving repository root');
      } else if (response.status >= 500) {
        errorDetails.push('');
        errorDetails.push('Server error. Check web server logs for details.');
      }
    }

    errorDetails.push('');
    errorDetails.push(`Server info: ${response.headers?.server || 'Unknown'}`);
    errorDetails.push(`Content-Type: ${response.headers?.contentType || 'Not specified'}`);

    throw new Error(errorDetails.join('\n'));
  }
}

/**
 * Pre-check multiple resources in parallel.
 * Useful for checking all required scripts before test execution.
 *
 * @param page - The Playwright page instance
 * @param urls - Array of URLs to check
 * @throws Error with details about all failed resources
 */
export async function preFetchCheckMultiple(page: Page, urls: string[]): Promise<void> {
  const results = await Promise.allSettled(urls.map((url) => preFetchCheck(page, url)));

  const failures = results
    .map((result, index) => ({ result, url: urls[index] }))
    .filter(({ result }) => result.status === 'rejected')
    .map(({ result, url }) => {
      const error = (result as PromiseRejectedResult).reason;
      return `\n${url}:\n${error.message || error}`;
    });

  if (failures.length > 0) {
    throw new Error(`Failed to fetch ${failures.length} resource(s):${failures.join('\n')}`);
  }
}
