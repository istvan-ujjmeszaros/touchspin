/**
 * TouchSpin Angular Component (Renderer-agnostic)
 *
 * Standalone component implementing ControlValueAccessor for Angular forms.
 * Use per-renderer exports instead of this directly.
 */

import { isPlatformBrowser } from '@angular/common';
import {
  type AfterViewInit,
  Component,
  type ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  inject,
  type OnChanges,
  type OnDestroy,
  Output,
  PLATFORM_ID,
  type SimpleChanges,
  ViewChild,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { TouchSpinCoreOptions, TouchSpinCorePublicAPI } from '@touchspin/core';
import { TouchSpin as TouchSpinCore } from '@touchspin/core';
import type { TouchSpinChangeMeta, TouchSpinHandle } from './types';

@Component({
  selector: 'touch-spin',
  standalone: true,
  template: `
    <div [class]="wrapperClass" [attr.data-testid]="testId">
      <input
        #input
        type="number"
        [name]="name"
        [id]="id"
        [class]="inputClass"
        [disabled]="disabled"
        [readonly]="readOnly"
        [attr.data-testid]="inputTestId"
        (blur)="onTouched()"
        (focus)="onInputFocus()"
      />
      @if (name) {
        <input type="hidden" [name]="name + '_display'" [value]="currentValue" />
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TouchSpinComponent),
      multi: true,
    },
  ],
})
export class TouchSpinComponent
  implements ControlValueAccessor, AfterViewInit, OnChanges, OnDestroy, TouchSpinHandle
{
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('input', { static: true }) inputRef!: ElementRef<HTMLInputElement>;

  // Core settings
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
  @Input() decimals?: number;
  @Input() prefix?: string;
  @Input() suffix?: string;

  // State
  @Input() disabled = false;
  @Input() readOnly = false;

  // Form
  @Input() name?: string;
  @Input() id?: string;

  // Styling
  @Input() class?: string;
  @Input() inputClass?: string;

  // Test ID
  @Input('data-testid') testId?: string;

  // Advanced
  @Input() coreOptions?: Partial<TouchSpinCoreOptions>;

  // Renderer (injected by per-renderer wrappers)
  @Input() renderer: any;

  // Events
  @Output() valueChange = new EventEmitter<number>();

  // Internal state
  private instance: TouchSpinCorePublicAPI | null = null;
  private internalValue = 0;
  private isControlled = false;
  private changeListener: (() => void) | null = null;

  // ControlValueAccessor callbacks
  private onChange: (value: number) => void = () => {};
  onTouched: () => void = () => {};

  get currentValue(): number {
    return this.instance?.getValue() ?? this.internalValue;
  }

  get wrapperClass(): string {
    return this.class || '';
  }

  get inputTestId(): string | undefined {
    return this.testId ? `${this.testId}-input` : undefined;
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.initializeTouchSpin();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.instance) return;

    // Update settings when inputs change (but not on first change)
    const settingsChanges: Record<string, any> = {};
    let hasSettingsChanges = false;

    if (changes['min'] && !changes['min'].firstChange && this.min !== undefined) {
      settingsChanges.min = this.min;
      hasSettingsChanges = true;
    }
    if (changes['max'] && !changes['max'].firstChange && this.max !== undefined) {
      settingsChanges.max = this.max;
      hasSettingsChanges = true;
    }
    if (changes['step'] && !changes['step'].firstChange && this.step !== undefined) {
      settingsChanges.step = this.step;
      hasSettingsChanges = true;
    }
    if (changes['decimals'] && !changes['decimals'].firstChange && this.decimals !== undefined) {
      settingsChanges.decimals = this.decimals;
      hasSettingsChanges = true;
    }
    if (changes['prefix'] && !changes['prefix'].firstChange && this.prefix !== undefined) {
      settingsChanges.prefix = this.prefix;
      hasSettingsChanges = true;
    }
    if (changes['suffix'] && !changes['suffix'].firstChange && this.suffix !== undefined) {
      settingsChanges.postfix = this.suffix;
      hasSettingsChanges = true;
    }

    if (hasSettingsChanges) {
      this.instance.updateSettings(settingsChanges);
    }

    // Update disabled/readonly state
    if (changes['disabled'] && !changes['disabled'].firstChange) {
      this.inputRef.nativeElement.disabled = this.disabled;
    }
    if (changes['readOnly'] && !changes['readOnly'].firstChange) {
      this.inputRef.nativeElement.readOnly = this.readOnly;
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  // ControlValueAccessor implementation
  writeValue(value: number | null | undefined): void {
    this.isControlled = true;
    const numValue = value ?? 0;

    if (this.instance) {
      const currentValue = this.instance.getValue();
      if (currentValue !== numValue) {
        this.instance.setValue(numValue);
      }
    } else {
      this.internalValue = numValue;
      if (this.inputRef?.nativeElement) {
        this.inputRef.nativeElement.value = String(numValue);
      }
    }
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.inputRef?.nativeElement) {
      this.inputRef.nativeElement.disabled = isDisabled;
    }
  }

  // Imperative methods (TouchSpinHandle interface)
  focus(): void {
    this.inputRef?.nativeElement.focus();
  }

  blur(): void {
    this.inputRef?.nativeElement.blur();
  }

  increment(): void {
    this.instance?.upOnce();
  }

  decrement(): void {
    this.instance?.downOnce();
  }

  getValue(): number {
    return this.currentValue;
  }

  setValue(value: number): void {
    this.instance?.setValue(value);
  }

  getCore(): TouchSpinCorePublicAPI | null {
    return this.instance;
  }

  // Internal helpers
  private initializeTouchSpin(): void {
    const input = this.inputRef.nativeElement;

    // Set initial value
    input.value = String(this.internalValue);

    // Build init options
    const initOptions: Record<string, any> = {
      renderer: this.renderer,
    };

    if (this.min !== undefined) initOptions.min = this.min;
    if (this.max !== undefined) initOptions.max = this.max;
    if (this.step !== undefined) initOptions.step = this.step;
    if (this.decimals !== undefined) initOptions.decimals = this.decimals;
    if (this.prefix !== undefined) initOptions.prefix = this.prefix;
    if (this.suffix !== undefined) initOptions.postfix = this.suffix;
    if (this.coreOptions) Object.assign(initOptions, this.coreOptions);

    // Initialize TouchSpin
    this.instance = TouchSpinCore(input, initOptions);

    // Subscribe to changes
    this.changeListener = () => {
      const numValue = Number(input.value);

      if (!this.isControlled) {
        this.internalValue = numValue;
      }

      // Notify Angular forms
      this.onChange(numValue);

      // Emit value change event
      this.valueChange.emit(numValue);
    };

    input.addEventListener('change', this.changeListener);
  }

  private cleanup(): void {
    if (this.changeListener && this.inputRef?.nativeElement) {
      this.inputRef.nativeElement.removeEventListener('change', this.changeListener);
      this.changeListener = null;
    }

    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }
  }

  onInputFocus(): void {
    // Could add focus event emission here if needed
  }
}
