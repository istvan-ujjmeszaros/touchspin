/**
 * TouchSpin Core Test Helpers
 * Shared test infrastructure for all packages
 */

// Re-export shared helpers from the copied helpers directory
export { default as touchspinHelpers } from './helpers/touchspinHelpers';
export { default as dualTestHelpers } from './helpers/dualTestHelpers';

// Default export uses touchspinHelpers as the main helper
export { default } from './helpers/touchspinHelpers';