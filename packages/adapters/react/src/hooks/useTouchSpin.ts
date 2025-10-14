/**
 * useTouchSpin - Core hook for mounting and managing TouchSpin instance
 */

import type { TouchSpinCorePublicAPI } from '@touchspin/core';
import { TouchSpin as TouchSpinCore } from '@touchspin/core';
import type { RendererConstructor } from '@touchspin/core/renderer';
import { useEffect, useRef, useState } from 'react';
import type { TouchSpinProps } from '../types.js';

export interface UseTouchSpinOptions extends TouchSpinProps {
  renderer: RendererConstructor | null | undefined;
}

export function useTouchSpin(options: UseTouchSpinOptions) {
  const {
    value: controlledValue,
    defaultValue = 0,
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
  } = options;

  const inputRef = useRef<HTMLInputElement>(null);
  const instanceRef = useRef<TouchSpinCorePublicAPI | null>(null);
  const isControlled = controlledValue !== undefined;

  // Uncontrolled state
  const [internalValue, setInternalValue] = useState<number>(defaultValue);

  // Current value (controlled or uncontrolled)
  const currentValue = isControlled ? controlledValue : internalValue;

  // Mount/unmount TouchSpin
  useEffect(() => {
    if (typeof window === 'undefined' || !inputRef.current) return;

    const input = inputRef.current;

    // Set initial value
    input.value = String(currentValue);

    // Initialize TouchSpin - filter out undefined values for exactOptionalPropertyTypes
    const initOptions: Record<string, unknown> = { renderer };
    if (min !== undefined) initOptions.min = min;
    if (max !== undefined) initOptions.max = max;
    if (step !== undefined) initOptions.step = step;
    if (decimals !== undefined) initOptions.decimals = decimals;
    if (prefix !== undefined) initOptions.prefix = prefix;
    if (suffix !== undefined) initOptions.postfix = suffix;
    if (coreOptions) Object.assign(initOptions, coreOptions);

    instanceRef.current = TouchSpinCore(input, initOptions);

    // Subscribe to changes via native DOM events
    const handleChange = () => {
      const numValue = Number(input.value);

      // Validate: skip NaN values to prevent state corruption
      if (Number.isNaN(numValue)) {
        return;
      }

      if (!isControlled) {
        setInternalValue(numValue);
      }

      onChange?.(numValue, { source: 'user', action: 'input' });
    };

    input.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      input.removeEventListener('change', handleChange);
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [
    renderer,
    coreOptions,
    currentValue,
    decimals,
    isControlled,
    max,
    min,
    onChange,
    prefix,
    step,
    suffix,
  ]); // Only re-mount if renderer changes

  // Update value when controlled value changes
  useEffect(() => {
    if (isControlled && instanceRef.current) {
      const currentInstanceValue = instanceRef.current.getValue();
      if (currentInstanceValue !== controlledValue) {
        instanceRef.current.setValue(controlledValue);
      }
    }
  }, [isControlled, controlledValue]);

  // Update settings when props change
  useEffect(() => {
    if (!instanceRef.current) return;

    // Filter out undefined values for exactOptionalPropertyTypes
    const updateOptions: Record<string, unknown> = {};
    if (min !== undefined) updateOptions.min = min;
    if (max !== undefined) updateOptions.max = max;
    if (step !== undefined) updateOptions.step = step;
    if (decimals !== undefined) updateOptions.decimals = decimals;
    if (prefix !== undefined) updateOptions.prefix = prefix;
    if (suffix !== undefined) updateOptions.postfix = suffix;

    instanceRef.current.updateSettings(updateOptions);
  }, [min, max, step, decimals, prefix, suffix]);

  // Update disabled/readonly
  useEffect(() => {
    if (!inputRef.current) return;

    if (disabled !== undefined) {
      inputRef.current.disabled = disabled;
    }
    if (readOnly !== undefined) {
      inputRef.current.readOnly = readOnly;
    }
  }, [disabled, readOnly]);

  return {
    inputRef,
    instanceRef,
    currentValue,
  };
}
