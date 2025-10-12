/**
 * useTouchSpin - Core hook for mounting and managing TouchSpin instance
 */

import { useEffect, useRef, useState } from 'react';
import { TouchSpin as TouchSpinCore } from '@touchspin/core';
import type { TouchSpinCorePublicAPI } from '@touchspin/core';
import type { TouchSpinProps, TouchSpinChangeMeta } from '../types.js';

export interface UseTouchSpinOptions extends TouchSpinProps {
  renderer: any;
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

    // Initialize TouchSpin
    instanceRef.current = TouchSpinCore(input, {
      min,
      max,
      step,
      decimals,
      prefix,
      suffix,
      renderer,
      ...coreOptions,
    });

    // Subscribe to changes via native DOM events
    const handleChange = () => {
      const numValue = Number(input.value);

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
  }, [renderer]); // Only re-mount if renderer changes

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

    instanceRef.current.updateSettings({
      min,
      max,
      step,
      decimals,
      prefix,
      suffix,
    });
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
