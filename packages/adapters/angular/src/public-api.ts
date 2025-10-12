/**
 * @touchspin/angular - Main public API
 *
 * Note: This is the root export. Users should import from per-renderer subpaths:
 * - @touchspin/angular/bootstrap3
 * - @touchspin/angular/bootstrap4
 * - @touchspin/angular/bootstrap5
 * - @touchspin/angular/tailwind
 * - @touchspin/angular/vanilla
 */

// Export core component (not typically used directly)
export { TouchSpinComponent } from './touch-spin.component';

// Export types
export type {
  TouchSpinChangeMeta,
  TouchSpinHandle,
  TouchSpinInputs,
  TouchSpinOutputs,
} from './types';
