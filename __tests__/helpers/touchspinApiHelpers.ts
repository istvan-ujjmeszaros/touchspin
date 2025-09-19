/**
 * TouchSpin Test Helpers - Barrel Export File
 *
 * This file re-exports all helpers from the modular structure for backward compatibility.
 * Existing tests can continue to import from this file while new tests can use specific imports.
 */

// Types
export type { EventLogType, EventLogEntry, TouchSpinElements } from './types';

// Core functionality
export * from './core/selectors';
export * from './core/elements';
export * from './core/initialization';
export * from './core/api';

// jQuery functionality
export * from './jquery/initialization';

// Interactions
export * from './interactions/buttons';
export * from './interactions/keyboard';
export * from './interactions/mouse';
export * from './interactions/input';

// Event system
export * from './events/setup';
export * from './events/log';

// Assertions
export * from './assertions/values';
export * from './assertions/buttons';
export * from './assertions/events';

// Test utilities
export * from './test-utilities/coverage';
export * from './test-utilities/fixtures';
export * from './test-utilities/wait';

// Deprecated (Bootstrap-specific)
export * from './deprecated/bootstrap-specific';