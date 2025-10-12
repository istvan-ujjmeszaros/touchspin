/**
 * Core Package Test Helpers
 *
 * Re-exports core-specific testing utilities and the main shared helpers.
 * This allows Core tests to import everything they need from one location.
 */

// Re-export all shared helpers from the main test helpers
export * from '../tests/__shared__/helpers/index';

// Export Core-specific adapter functions
export * from './core-adapter';
