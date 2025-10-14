/**
 * TouchSpin Angular - Type Definitions
 */

import type { TouchSpinCoreOptions, TouchSpinCorePublicAPI } from '@touchspin/core';

/**
 * Change metadata for TouchSpin events
 */
export interface TouchSpinChangeMeta {
  source: 'user' | 'programmatic';
  action: 'input' | 'increment' | 'decrement' | 'setValue';
}

/**
 * Inputs accepted by TouchSpin component
 */
export interface TouchSpinInputs {
  /** Current value (controlled mode – pair with valueChange) */
  value?: number | null;

  /** Initial value (uncontrolled mode, applied once until overridden) */
  defaultValue?: number | null;

  /** Minimum value */
  min?: number;

  /** Maximum value */
  max?: number;

  /** Step increment/decrement amount */
  step?: number;

  /** Number of decimal places */
  decimals?: number;

  /** Prefix text/symbol */
  prefix?: string;

  /** Suffix text/symbol */
  suffix?: string;

  /** Disabled state */
  disabled?: boolean;

  /** Readonly state */
  readOnly?: boolean;

  /** Form control name */
  name?: string;

  /** Element ID */
  id?: string;

  /** CSS class for wrapper */
  class?: string;

  /** CSS class for input element */
  inputClass?: string;

  /** Additional core options */
  coreOptions?: Partial<TouchSpinCoreOptions>;
}

/**
 * Outputs (events) emitted by TouchSpin component
 */
export interface TouchSpinOutputs {
  /** Emitted when value changes */
  valueChange: number;
}

/**
 * Imperative handle for programmatic control
 */
export interface TouchSpinHandle {
  /** Focus the input */
  focus(): void;

  /** Blur the input */
  blur(): void;

  /** Increment value by step */
  increment(): void;

  /** Decrement value by step */
  decrement(): void;

  /** Get current value */
  getValue(): number;

  /** Set value programmatically */
  setValue(value: number): void;

  /** Get core API instance */
  getCore(): TouchSpinCorePublicAPI | null;
}
