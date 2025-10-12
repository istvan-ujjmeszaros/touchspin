/**
 * Shared test fixtures for all TouchSpin packages
 */

/**
 * Get the URL for a test fixture
 * @param fixtureName - Name of the fixture file (without .html extension)
 * @returns Full URL path to the fixture
 */
export function fixtureUrl(fixtureName: string): string {
  const basePath = '/packages/core/tests/__shared__/fixtures';
  const fileName = fixtureName.endsWith('.html') ? fixtureName : `${fixtureName}.html`;
  return `${basePath}/${fileName}`;
}

/**
 * Common fixture names for convenience
 */
export const Fixtures = {
  minimal: 'minimal',
  multi: 'multi',
  abCompare: 'ab-compare',
} as const;

/**
 * Get full URL for a common fixture
 */
export const FixtureUrls = {
  minimal: fixtureUrl('minimal'),
  multi: fixtureUrl('multi'),
  abCompare: fixtureUrl('ab-compare'),
} as const;
