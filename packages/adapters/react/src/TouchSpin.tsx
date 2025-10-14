/**
 * TouchSpin React Component (Renderer-agnostic)
 *
 * This component provides a React wrapper around the TouchSpin core.
 * Use per-renderer exports instead of this directly.
 */

import type { RendererConstructor } from '@touchspin/core/renderer';
import { forwardRef, useImperativeHandle } from 'react';
import { type UseTouchSpinOptions, useTouchSpin } from './hooks/useTouchSpin.js';
import type { TouchSpinHandle, TouchSpinProps } from './types.js';

export interface TouchSpinComponentProps extends TouchSpinProps {
  renderer: RendererConstructor | null | undefined;
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

    // Filter out undefined values for exactOptionalPropertyTypes
    const touchSpinOptions: Partial<UseTouchSpinOptions> = { renderer };
    if (value !== undefined) touchSpinOptions.value = value;
    if (defaultValue !== undefined) touchSpinOptions.defaultValue = defaultValue;
    if (onChange !== undefined) touchSpinOptions.onChange = onChange;
    if (min !== undefined) touchSpinOptions.min = min;
    if (max !== undefined) touchSpinOptions.max = max;
    if (step !== undefined) touchSpinOptions.step = step;
    if (decimals !== undefined) touchSpinOptions.decimals = decimals;
    if (prefix !== undefined) touchSpinOptions.prefix = prefix;
    if (suffix !== undefined) touchSpinOptions.suffix = suffix;
    if (disabled !== undefined) touchSpinOptions.disabled = disabled;
    if (readOnly !== undefined) touchSpinOptions.readOnly = readOnly;
    if (coreOptions !== undefined) touchSpinOptions.coreOptions = coreOptions;

    const { inputRef, instanceRef, currentValue } = useTouchSpin(
      touchSpinOptions as UseTouchSpinOptions
    );

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
      [
        currentValue,
        inputRef.current?.blur,
        inputRef.current?.focus,
        instanceRef.current?.downOnce,
        instanceRef.current?.getValue,
        instanceRef.current?.setValue,
        instanceRef.current?.upOnce,
      ]
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
        {name && <input type="hidden" name={`${name}_display`} value={currentValue} />}
      </div>
    );
  }
);

TouchSpinComponent.displayName = 'TouchSpin';

export default TouchSpinComponent;
