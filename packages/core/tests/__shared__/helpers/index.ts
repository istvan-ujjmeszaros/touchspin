/**
 * TouchSpin Test Helpers - Barrel Export File
 *
 * This file re-exports all helpers from the modular structure for backward compatibility.
 * Existing tests can continue to import from this file while new tests can use specific imports.
 */

export * from './core/api';
export * from './core/elements';
export * from './core/initialization';
// Core functionality
export * from './core/selectors';
// Types
export type { EventLogEntry, EventLogType, TouchSpinElements } from './types';

// jQuery functionality
// Moved to '@touchspin/jquery/test-helpers'

export * from './assertions/buttons';
export * from './assertions/events';
// Assertions
export * from './assertions/values';
// Deprecated (Bootstrap-specific)
export * from './deprecated/bootstrap-specific';
export * from './events/log';
// Event system
export * from './events/setup';
// Interactions
export * from './interactions/buttons';
export * from './interactions/input';
export * from './interactions/keyboard';
export * from './interactions/mouse';
export * from './runtime/installDomHelpers';
export * from './runtime/paths';
export * from './test-utilities/console';
// Test utilities
export * from './test-utilities/coverage';
export * from './test-utilities/fixtures';
export * from './test-utilities/network';
export * from './test-utilities/script-loader';
export * from './test-utilities/test-environment';
export * from './test-utilities/wait';
export * from './test-utilities/web-component-loader';
