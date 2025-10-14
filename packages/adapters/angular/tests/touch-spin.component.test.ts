import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@angular/core', () => {
  class EventEmitter<T = unknown> {
    private listeners = new Set<(value: T) => void>();

    emit(value: T) {
      this.listeners.forEach((listener) => listener(value));
    }

    subscribe(callback: (value: T) => void) {
      this.listeners.add(callback);
      return { unsubscribe: () => this.listeners.delete(callback) };
    }
  }

  class ElementRef<T = unknown> {
    constructor(public nativeElement: T) {}
  }

  const identityDecorator = () => () => {};
  const Component = () => (target: any) => target;
  const Input = identityDecorator;
  const Output = identityDecorator;
  const ViewChild = identityDecorator;
  const PLATFORM_ID = Symbol('PLATFORM_ID');
  const inject = (token: unknown) => {
    if (token === PLATFORM_ID) return 'browser';
    throw new Error('Unsupported injection token in test environment');
  };
  const forwardRef = (fn: () => any) => fn;

  return {
    Component,
    EventEmitter,
    ElementRef,
    Input,
    Output,
    ViewChild,
    PLATFORM_ID,
    inject,
    forwardRef,
  };
});

vi.mock('@angular/common', () => ({
  isPlatformBrowser: () => true,
}));

vi.mock('@angular/forms', () => ({
  NG_VALUE_ACCESSOR: Symbol('NG_VALUE_ACCESSOR'),
}));

import { ElementRef } from '@angular/core';
import { TouchSpinComponent } from '../src/touch-spin.component';

vi.mock('@touchspin/core', () => ({
  TouchSpin: vi.fn((input: HTMLInputElement) => {
    let current = Number(input.value) || 0;

    return {
      getValue: () => current,
      setValue: (value: number) => {
        current = value;
        input.value = String(value);
        input.dispatchEvent(new Event('change'));
      },
      upOnce: () => {
        current += 1;
        input.value = String(current);
        input.dispatchEvent(new Event('change'));
      },
      downOnce: () => {
        current -= 1;
        input.value = String(current);
        input.dispatchEvent(new Event('change'));
      },
      updateSettings: vi.fn(),
      destroy: vi.fn(),
    };
  }),
}));

import { TouchSpin as TouchSpinCore } from '@touchspin/core';

const touchSpinFactory = vi.mocked(TouchSpinCore);

describe('TouchSpinComponent value handling', () => {
  beforeEach(() => {
    touchSpinFactory.mockClear();
  });

  const setup = async (inputs: Record<string, unknown> = {}) => {
    const inputElement = document.createElement('input');
    const component = new TouchSpinComponent();
    component.inputRef = new ElementRef<HTMLInputElement>(inputElement);
    component.renderer = {};

    if ('defaultValue' in inputs) {
      component.defaultValue = inputs.defaultValue as number | null | undefined;
    }
    if ('value' in inputs) {
      component.value = inputs.value as number | null | undefined;
    }

    component.ngAfterViewInit();

    await Promise.resolve();

    const teardown = () => component.ngOnDestroy();

    return { component, input: inputElement, destroy: teardown };
  };

  it('applies defaultValue before initialization completes', async () => {
    const { component, input, destroy } = await setup({ defaultValue: 5 });

    expect(input.value).toBe('5');
    expect(component.getValue()).toBe(5);

    destroy();
  });

  it('honors controlled value input and overrides defaultValue', async () => {
    const { component, input, destroy } = await setup({ defaultValue: 2, value: 10 });

    expect(input.value).toBe('10');
    expect(component.getValue()).toBe(10);

    component.value = 12;
    await Promise.resolve();

    expect(input.value).toBe('12');
    expect(component.getValue()).toBe(12);

    destroy();
  });

  it('syncs ControlValueAccessor writeValue with the underlying input', async () => {
    const { component, input, destroy } = await setup();
    const onChange = vi.fn();
    component.registerOnChange(onChange);

    component.writeValue(7);
    await Promise.resolve();

    expect(input.value).toBe('7');
    expect(component.getValue()).toBe(7);
    expect(onChange).not.toHaveBeenCalled();

    destroy();
  });

  it('returns to uncontrolled mode when value is cleared', async () => {
    const { component, input, destroy } = await setup({ value: 9 });
    const onChange = vi.fn();
    const emitted: number[] = [];
    component.registerOnChange(onChange);
    component.valueChange.subscribe((value) => emitted.push(value));

    component.value = null;
    await Promise.resolve();

    input.value = '11';
    input.dispatchEvent(new Event('change'));

    expect(onChange).toHaveBeenCalledWith(11);
    expect(emitted).toEqual([11]);
    expect(input.value).toBe('11');

    destroy();
  });
});
