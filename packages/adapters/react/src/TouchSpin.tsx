/**
 * TouchSpin React Component (Renderer-agnostic)
 *
 * This component provides a React wrapper around the TouchSpin core.
 * Use per-renderer exports instead of this directly.
 */

import React, { forwardRef, useImperativeHandle } from 'react';
import { useTouchSpin } from './hooks/useTouchSpin.js';
import type { TouchSpinProps, TouchSpinHandle } from './types.js';

export interface TouchSpinComponentProps extends TouchSpinProps {
  renderer: any;
}

export const TouchSpinComponent = forwardRef<TouchSpinHandle, TouchSpinComponentProps>(
  (props, ref) => {
    const {
      // Value props
      value,
      defaultValue,
      onChange,

      // Core settings
      min,
      max,
      step,
      decimals,
      prefix,
      suffix,

      // State
      disabled,
      readOnly,

      // Form
      name,
      id,

      // Styling
      className,
      inputClassName,

      // Events
      onBlur,
      onFocus,

      // Input props
      inputProps,

      // Test ID
      'data-testid': testId,

      // Advanced
      coreOptions,

      // Renderer (injected by per-renderer wrappers)
      renderer,
    } = props;

    const { inputRef, instanceRef, currentValue } = useTouchSpin({
      value,
      defaultValue,
      onChange,
      min,
      max,
      step,
      decimals,
      prefix,
      suffix,
      disabled,
      readOnly,
      coreOptions,
      renderer,
    });

    // Expose imperative handle
    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          inputRef.current?.focus();
        },
        blur: () => {
          inputRef.current?.blur();
        },
        increment: () => {
          instanceRef.current?.upOnce();
        },
        decrement: () => {
          instanceRef.current?.downOnce();
        },
        getValue: () => {
          return instanceRef.current?.getValue() ?? currentValue;
        },
        setValue: (val: number) => {
          instanceRef.current?.setValue(val);
        },
      }),
      [currentValue]
    );

    // Compute input test-id (component-testid becomes component-testid-input)
    const inputTestId = testId ? `${testId}-input` : undefined;

    return (
      <div className={className} data-testid={testId}>
        <input
          ref={inputRef}
          type="number"
          name={name}
          id={id}
          className={inputClassName}
          disabled={disabled}
          readOnly={readOnly}
          onBlur={onBlur}
          onFocus={onFocus}
          data-testid={inputTestId}
          {...inputProps}
        />
        {/* Hidden input for form submission when using name */}
        {name && (
          <input type="hidden" name={`${name}_display`} value={currentValue} />
        )}
      </div>
    );
  }
);

TouchSpinComponent.displayName = 'TouchSpin';

export default TouchSpinComponent;
