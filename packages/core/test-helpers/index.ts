/**
 * TouchSpin Core Test Helpers
 * Shared test infrastructure for all packages
 */

// Import all helpers
import coreHelpers from './helpers/core-helpers';
import eventHelpers from './helpers/events';
import coverageHelpers from './helpers/coverage';

// Re-export everything for easy access
export * from './helpers/core-helpers';
export * from './helpers/events';
export * from './helpers/coverage';

// Default export with all helpers combined
export default {
  ...coreHelpers,
  ...eventHelpers,
  ...coverageHelpers
};

// Individual helper exports for specific use cases
export { coreHelpers, eventHelpers, coverageHelpers };