/**
 * @touchspin/react - TypeScript Types
 */

import type { TouchSpinCoreOptions } from '@touchspin/core';
import type React from 'react';

/**
 * Metadata passed to onChange handler
 */
export interface TouchSpinChangeMeta {
  source: 'user' | 'prop' | 'api';
  action?: 'increment' | 'decrement' | 'setValue' | 'input';
}

/**
 * TouchSpin React component props
 */
export interface TouchSpinProps {
  // Value management
  value?: number;
  defaultValue?: number;
  onChange?: (value: number, meta: TouchSpinChangeMeta) => void;

  // Core settings
  min?: number;
  max?: number;
  step?: number;
  decimals?: number;

  // Display
  prefix?: string;
  suffix?: string;

  // State
  disabled?: boolean;
  readOnly?: boolean;

  // Form integration
  name?: string;
  id?: string;

  // Styling
  className?: string;
  inputClassName?: string;

  // Events
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;

  // Pass-through props for inner input
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;

  // Test ID (input will be suffixed with -input)
  'data-testid'?: string;

  // Advanced TouchSpin core options (optional)
  coreOptions?: Partial<Omit<TouchSpinCoreOptions, 'renderer'>>;
}

/**
 * Imperative handle API exposed via forwardRef
 */
export interface TouchSpinHandle {
  focus(): void;
  blur(): void;
  increment(): void;
  decrement(): void;
  getValue(): number;
  setValue(value: number): void;
}
