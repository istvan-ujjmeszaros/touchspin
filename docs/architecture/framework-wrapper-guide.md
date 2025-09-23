# Creating Framework Wrappers Guide

TouchSpin's framework-agnostic core makes it easy to create wrappers for modern JavaScript frameworks like Angular, React, Vue, and Svelte. This guide shows you how to build idiomatic components for each framework.

## Core Integration Pattern

All framework wrappers follow the same basic pattern:

1. **Initialize TouchSpin** with a DOM element reference
2. **Bridge events** from core to framework event system  
3. **Manage lifecycle** (create on mount, destroy on unmount)
4. **Handle updates** when props/inputs change

```javascript
// Universal pattern
const api = TouchSpin(elementRef, options);
api.on('change', (data) => handleValueChange(data.newValue));

// Cleanup
api.destroy();
```

## Angular Component

### Complete Implementation

```typescript
// touchspin.component.ts
import {
    Component,
    Input,
    Output,
    EventEmitter,
    ElementRef,
    ViewChild,
    OnInit,
    OnDestroy,
    OnChanges,
    SimpleChanges,
    forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TouchSpin, TouchSpinCorePublicAPI, TouchSpinCoreOptions } from '@touchspin/core';

@Component({
    selector: 'app-touchspin',
    template: `
        <input 
            #inputElement
            type="number"
            [attr.data-testid]="testId"
            [id]="inputId"
            [disabled]="disabled"
            [readonly]="readonly"
        />
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TouchSpinComponent),
            multi: true
        }
    ]
})
export class TouchSpinComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
    @ViewChild('inputElement', { static: true }) inputElement!: ElementRef<HTMLInputElement>;
    
    // TouchSpin configuration
    @Input() options: TouchSpinOptions = {};
    @Input() renderer: string = 'bootstrap5';
    @Input() testId?: string;
    @Input() inputId: string = `touchspin-${Math.random().toString(36).substr(2, 9)}`;
    
    // Form integration
    @Input() disabled: boolean = false;
    @Input() readonly: boolean = false;
    
    // Events
    @Output() valueChange = new EventEmitter<number>();
    @Output() min = new EventEmitter<{value: number, direction: string}>();
    @Output() max = new EventEmitter<{value: number, direction: string}>();
    @Output() spinStart = new EventEmitter<{direction: string}>();
    @Output() spinStop = new EventEmitter<{direction: string}>();
    
    private api?: TouchSpinAPI;
    private onChange = (value: number) => {};
    private onTouched = () => {};
    
    ngOnInit() {
        this.initializeTouchSpin();
    }
    
    ngOnDestroy() {
        this.api?.destroy();
    }
    
    ngOnChanges(changes: SimpleChanges) {
        if (this.api && (changes['options'] || changes['renderer'])) {
            // Reinitialize if major options change
            this.api.destroy();
            this.initializeTouchSpin();
        }
        
        if (this.api && changes['disabled']) {
            this.api.updateSettings({ disabled: this.disabled });
        }
    }
    
    private initializeTouchSpin() {
        const element = this.inputElement.nativeElement;
        
        this.api = TouchSpin(element, {
            renderer: this.renderer,
            disabled: this.disabled,
            ...this.options
        });
        
        // Bridge events
        this.api.on('change', (data) => {
            this.valueChange.emit(data.newValue);
            this.onChange(data.newValue);
        });
        
        this.api.on('min', (data) => {
            this.min.emit(data);
        });
        
        this.api.on('max', (data) => {
            this.max.emit(data);
        });
        
        this.api.on('startspin', (data) => {
            this.spinStart.emit(data);
        });
        
        this.api.on('stopspin', (data) => {
            this.spinStop.emit(data);
            this.onTouched();
        });
    }
    
    // ControlValueAccessor implementation
    writeValue(value: number): void {
        if (this.api) {
            this.api.setValue(value);
        } else {
            // Store value for when TouchSpin initializes
            this.inputElement.nativeElement.value = String(value || 0);
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
        if (this.api) {
            this.api.updateSettings({ disabled: isDisabled });
        }
    }
    
    // Public API methods
    getValue(): number {
        return this.api?.getValue() || 0;
    }
    
    setValue(value: number): void {
        this.api?.setValue(value);
    }
    
    upOnce(): void {
        this.api?.upOnce();
    }
    
    downOnce(): void {
        this.api?.downOnce();
    }
    
    updateSettings(options: Partial<TouchSpinOptions>): void {
        this.api?.updateSettings(options);
    }
}
```

### Module Setup

```typescript
// touchspin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TouchSpinComponent } from './touchspin.component';

@NgModule({
    declarations: [TouchSpinComponent],
    imports: [CommonModule],
    exports: [TouchSpinComponent]
})
export class TouchSpinModule { }
```

### Usage Examples

```typescript
// Basic usage
@Component({
    template: `
        <app-touchspin
            [options]="{min: 0, max: 100, step: 5}"
            (valueChange)="onValueChange($event)">
        </app-touchspin>
    `
})
export class BasicExampleComponent {
    onValueChange(value: number) {
        console.log('Value changed:', value);
    }
}

// Reactive forms
@Component({
    template: `
        <form [formGroup]="form">
            <app-touchspin
                formControlName="quantity"
                [options]="{min: 1, max: 999, prefix: 'Qty: '}"
                testId="quantity-spinner">
            </app-touchspin>
        </form>
    `
})
export class ReactiveFormComponent {
    form = this.fb.group({
        quantity: [1, [Validators.min(1), Validators.max(999)]]
    });
    
    constructor(private fb: FormBuilder) {}
}
```

## React Hook

### Custom Hook Implementation

```javascript
// useTouchSpin.ts
import { useRef, useEffect, useState, useCallback } from 'react';
import { TouchSpin } from '@touchspin/core';

export function useTouchSpin(options = {}) {
    const inputRef = useRef(null);
    const apiRef = useRef(null);
    const [value, setValue] = useState(options.initval || 0);
    const [isAtMin, setIsAtMin] = useState(false);
    const [isAtMax, setIsAtMax] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    
    // Initialize TouchSpin
    useEffect(() => {
        if (inputRef.current) {
            apiRef.current = TouchSpin(inputRef.current, {
                renderer: 'bootstrap5',
                ...options
            });
            
            // Set up event listeners
            const api = apiRef.current;
            
            const unsubscribeChange = api.on('change', (data) => {
                setValue(data.newValue);
            });
            
            const unsubscribeMin = api.on('min', () => {
                setIsAtMin(true);
            });
            
            const unsubscribeMax = api.on('max', () => {
                setIsAtMax(true);
            });
            
            const unsubscribeStartSpin = api.on('startspin', () => {
                setIsSpinning(true);
            });
            
            const unsubscribeStopSpin = api.on('stopspin', () => {
                setIsSpinning(false);
                setIsAtMin(false);
                setIsAtMax(false);
            });
            
            // Get initial value
            setValue(api.getValue());
            
            // Cleanup function
            return () => {
                unsubscribeChange();
                unsubscribeMin();
                unsubscribeMax();
                unsubscribeStartSpin();
                unsubscribeStopSpin();
                api.destroy();
            };
        }
    }, [options]); // Simplified dependencies
    
    // Update settings when options change
    useEffect(() => {
        if (apiRef.current) {
            apiRef.current.updateSettings(options);
        }
    }, [options]);
    
    // API methods
    const upOnce = useCallback(() => {
        apiRef.current?.upOnce();
    }, []);
    
    const downOnce = useCallback(() => {
        apiRef.current?.downOnce();
    }, []);
    
    const setValueProgrammatically = useCallback((newValue) => {
        apiRef.current?.setValue(newValue);
    }, []);
    
    const startUpSpin = useCallback(() => {
        apiRef.current?.startUpSpin();
    }, []);
    
    const startDownSpin = useCallback(() => {
        apiRef.current?.startDownSpin();
    }, []);
    
    const stopSpin = useCallback(() => {
        apiRef.current?.stopSpin();
    }, []);
    
    const updateSettings = useCallback((newOptions) => {
        apiRef.current?.updateSettings(newOptions);
    }, []);
    
    return {
        inputRef,
        value,
        isAtMin,
        isAtMax,
        isSpinning,
        api: apiRef.current,
        upOnce,
        downOnce,
        setValue: setValueProgrammatically,
        startUpSpin,
        startDownSpin,
        stopSpin,
        updateSettings
    };
}
```

### React Component Implementation

```javascript
// TouchSpinComponent.jsx
import React, { forwardRef, useImperativeHandle } from 'react';
import { useTouchSpin } from './useTouchSpin';

const TouchSpinComponent = forwardRef(({
    options = {},
    testId,
    disabled = false,
    onChange,
    onMin,
    onMax,
    onSpinStart,
    onSpinStop,
    className,
    ...inputProps
}, ref) => {
    const {
        inputRef,
        value,
        isAtMin,
        isAtMax,
        isSpinning,
        api,
        upOnce,
        downOnce,
        setValue,
        updateSettings
    } = useTouchSpin({
        disabled,
        ...options
    }, [options, disabled]);
    
    // Handle change events
    React.useEffect(() => {
        if (onChange) {
            onChange(value);
        }
    }, [value, onChange]);
    
    // Handle boundary events
    React.useEffect(() => {
        if (isAtMin && onMin) {
            onMin(value);
        }
    }, [isAtMin, value, onMin]);
    
    React.useEffect(() => {
        if (isAtMax && onMax) {
            onMax(value);
        }
    }, [isAtMax, value, onMax]);
    
    // Handle spin events
    React.useEffect(() => {
        if (isSpinning && onSpinStart) {
            onSpinStart();
        } else if (!isSpinning && onSpinStop) {
            onSpinStop();
        }
    }, [isSpinning, onSpinStart, onSpinStop]);
    
    // Expose API to parent components
    useImperativeHandle(ref, () => ({
        getValue: () => value,
        setValue,
        upOnce,
        downOnce,
        updateSettings,
        api
    }), [value, setValue, upOnce, downOnce, updateSettings, api]);
    
    return (
        <input
            ref={inputRef}
            type="number"
            data-testid={testId}
            disabled={disabled}
            className={className}
            {...inputProps}
        />
    );
});

TouchSpinComponent.displayName = 'TouchSpinComponent';

export default TouchSpinComponent;
```

### Usage Examples

```javascript
// Basic usage
function BasicExample() {
    const [value, setValue] = useState(0);
    
    return (
        <TouchSpinComponent
            options={{ min: 0, max: 100, step: 5, prefix: '$' }}
            testId="price-spinner"
            onChange={setValue}
        />
    );
}

// Using the hook directly
function AdvancedExample() {
    const {
        inputRef,
        value,
        isAtMin,
        isAtMax,
        upOnce,
        downOnce,
        updateSettings
    } = useTouchSpin({
        min: 0,
        max: 100,
        step: 1,
        prefix: 'Count: '
    });
    
    return (
        <div>
            <input ref={inputRef} type="number" />
            <div>
                <button onClick={downOnce} disabled={isAtMin}>-</button>
                <span>Current: {value}</span>
                <button onClick={upOnce} disabled={isAtMax}>+</button>
            </div>
        </div>
    );
}
```

## Vue Composition API

### Composable Implementation

```javascript
// useTouchSpin.ts
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { TouchSpin } from '@touchspin/core';

export function useTouchSpin(elementRef, options) {
    const api = ref(null);
    const value = ref(options.initval || 0);
    const isAtMin = ref(false);
    const isAtMax = ref(false);
    const isSpinning = ref(false);
    
    let unsubscribeFunctions = [];
    
    const initTouchSpin = async () => {
        if (!elementRef.value) return;
        
        await nextTick(); // Ensure DOM is ready
        
        api.value = TouchSpin(elementRef.value, {
            renderer: 'bootstrap5',
            ...options
        });
        
        // Set up event listeners
        const changeUnsub = api.on('change', (data) => {
            value.value = data.newValue;
        });
        
        const minUnsub = api.on('min', () => {
            isAtMin.value = true;
        });
        
        const maxUnsub = api.on('max', () => {
            isAtMax.value = true;
        });
        
        const startSpinUnsub = api.on('startspin', () => {
            isSpinning.value = true;
        });
        
        const stopSpinUnsub = api.on('stopspin', () => {
            isSpinning.value = false;
            isAtMin.value = false;
            isAtMax.value = false;
        });
        
        unsubscribeFunctions = [
            changeUnsub,
            minUnsub,
            maxUnsub,
            startSpinUnsub,
            stopSpinUnsub
        ];
        
        // Set initial value
        value.value = api.value.getValue();
    };
    
    const cleanup = () => {
        unsubscribeFunctions.forEach(unsub => {
            try { unsub(); } catch {}
        });
        unsubscribeFunctions = [];
        
        if (api.value) {
            api.value.destroy();
            api.value = null;
        }
    };
    
    onMounted(initTouchSpin);
    onUnmounted(cleanup);
    
    // Watch for options changes
    watch(options, (newOptions) => {
        if (api.value) {
            api.value.updateSettings(newOptions);
        }
    }, { deep: true });
    
    // API methods
    const upOnce = () => api.value?.upOnce();
    const downOnce = () => api.value?.downOnce();
    const setValue = (newValue) => api.value?.setValue(newValue);
    const updateSettings = (newOptions) => api.value?.updateSettings(newOptions);
    
    return {
        api: readonly(api),
        value: readonly(value),
        isAtMin: readonly(isAtMin),
        isAtMax: readonly(isAtMax),
        isSpinning: readonly(isSpinning),
        upOnce,
        downOnce,
        setValue,
        updateSettings
    };
}
```

### Vue Component Implementation

```vue
<!-- TouchSpinComponent.vue -->
<template>
    <input
        ref="inputElement"
        type="number"
        :data-testid="testId"
        :disabled="disabled"
        :class="inputClass"
        v-bind="$attrs"
    />
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useTouchSpin } from './useTouchSpin';

const props = defineProps({
    options: {
        type: Object,
        default: () => ({})
    },
    testId: String,
    disabled: {
        type: Boolean,
        default: false
    },
    inputClass: String,
    modelValue: Number
});

const emit = defineEmits([
    'update:modelValue',
    'min',
    'max',
    'spin-start',
    'spin-stop'
]);

const inputElement = ref(null);
const touchSpinOptions = computed(() => ({
    disabled: props.disabled,
    ...props.options
}));

const {
    value,
    isAtMin,
    isAtMax,
    isSpinning,
    upOnce,
    downOnce,
    setValue,
    updateSettings,
    api
} = useTouchSpin(inputElement, touchSpinOptions);

// Two-way binding
watch(value, (newValue) => {
    emit('update:modelValue', newValue);
});

watch(() => props.modelValue, (newValue) => {
    if (newValue !== undefined && newValue !== value.value) {
        setValue(newValue);
    }
});

// Boundary events
watch(isAtMin, (atMin) => {
    if (atMin) emit('min', value.value);
});

watch(isAtMax, (atMax) => {
    if (atMax) emit('max', value.value);
});

// Spin events
watch(isSpinning, (spinning) => {
    if (spinning) {
        emit('spin-start');
    } else {
        emit('spin-stop');
    }
});

// Expose methods to parent
defineExpose({
    getValue: () => value.value,
    setValue,
    upOnce,
    downOnce,
    updateSettings,
    api
});
</script>
```

### Usage Examples

```vue
<!-- Basic usage -->
<template>
    <TouchSpinComponent
        v-model="quantity"
        :options="{ min: 0, max: 100, step: 5 }"
        test-id="quantity-spinner"
        @min="onMinReached"
        @max="onMaxReached"
    />
</template>

<script setup>
import { ref } from 'vue';
import TouchSpinComponent from './TouchSpinComponent.vue';

const quantity = ref(10);

const onMinReached = (value) => {
    console.log('Minimum reached:', value);
};

const onMaxReached = (value) => {
    console.log('Maximum reached:', value);
};
</script>

<!-- Using composable directly -->
<template>
    <div>
        <input ref="spinnerRef" type="number" />
        <div>
            <button @click="downOnce" :disabled="isAtMin">-</button>
            <span>{{ value }}</span>
            <button @click="upOnce" :disabled="isAtMax">+</button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTouchSpin } from './useTouchSpin';

const spinnerRef = ref(null);
const options = ref({
    min: 0,
    max: 100,
    prefix: '$'
});

const {
    value,
    isAtMin,
    isAtMax,
    upOnce,
    downOnce
} = useTouchSpin(spinnerRef, options);
</script>
```

## Svelte Component

### Svelte Store Implementation

```javascript
// touchSpinStore.ts
import { writable } from 'svelte/store';
import { TouchSpin } from '@touchspin/core';

export function createTouchSpinStore(element, options = {}) {
    const { subscribe, set, update } = writable({
        value: options.initval || 0,
        isAtMin: false,
        isAtMax: false,
        isSpinning: false,
        api: null
    });
    
    let api = null;
    let unsubscribeFunctions = [];
    
    const init = () => {
        if (!element) return;
        
        api = TouchSpin(element, {
            renderer: 'bootstrap5',
            ...options
        });
        
        // Set up event listeners
        const changeUnsub = api.on('change', (data) => {
            update(state => ({ ...state, value: data.newValue }));
        });
        
        const minUnsub = api.on('min', () => {
            update(state => ({ ...state, isAtMin: true }));
        });
        
        const maxUnsub = api.on('max', () => {
            update(state => ({ ...state, isAtMax: true }));
        });
        
        const startSpinUnsub = api.on('startspin', () => {
            update(state => ({ ...state, isSpinning: true }));
        });
        
        const stopSpinUnsub = api.on('stopspin', () => {
            update(state => ({ 
                ...state, 
                isSpinning: false, 
                isAtMin: false, 
                isAtMax: false 
            }));
        });
        
        unsubscribeFunctions = [
            changeUnsub,
            minUnsub,
            maxUnsub,
            startSpinUnsub,
            stopSpinUnsub
        ];
        
        update(state => ({ 
            ...state, 
            api,
            value: api.getValue()
        }));
    };
    
    const destroy = () => {
        unsubscribeFunctions.forEach(unsub => {
            try { unsub(); } catch {}
        });
        unsubscribeFunctions = [];
        
        if (api) {
            api.destroy();
            api = null;
        }
    };
    
    return {
        subscribe,
        init,
        destroy,
        upOnce: () => api?.upOnce(),
        downOnce: () => api?.downOnce(),
        setValue: (value) => api?.setValue(value),
        updateSettings: (newOptions) => api?.updateSettings(newOptions),
        getApi: () => api
    };
}
```

### Svelte Component Implementation

```svelte
<!-- TouchSpinComponent.svelte -->
<script>
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { createTouchSpinStore } from './touchSpinStore.ts';
    
    export let options = {};
    export let testId = undefined;
    export let disabled = false;
    export let value = 0;
    
    const dispatch = createEventDispatcher();
    
    let inputElement;
    let store;
    let storeValue = { value: 0, isAtMin: false, isAtMax: false, isSpinning: false, api: null };
    
    // Reactive options
    $: touchSpinOptions = {
        disabled,
        ...options
    };
    
    onMount(() => {
        store = createTouchSpinStore(inputElement, touchSpinOptions);
        
        const unsubscribe = store.subscribe((state) => {
            const oldValue = storeValue.value;
            storeValue = state;
            
            // Dispatch events
            if (state.value !== oldValue) {
                value = state.value;
                dispatch('change', state.value);
            }
            
            if (state.isAtMin) {
                dispatch('min', state.value);
            }
            
            if (state.isAtMax) {
                dispatch('max', state.value);
            }
            
            if (state.isSpinning !== (oldValue.isSpinning || false)) {
                if (state.isSpinning) {
                    dispatch('spin-start');
                } else {
                    dispatch('spin-stop');
                }
            }
        });
        
        store.init();
        
        return () => {
            unsubscribe();
        };
    });
    
    onDestroy(() => {
        store?.destroy();
    });
    
    // Reactive updates
    $: if (store && value !== storeValue.value) {
        store.setValue(value);
    }
    
    $: if (store && options) {
        store.updateSettings(touchSpinOptions);
    }
    
    // Expose methods
    export const getValue = () => storeValue.value;
    export const setValue = (newValue) => store?.setValue(newValue);
    export const upOnce = () => store?.upOnce();
    export const downOnce = () => store?.downOnce();
    export const updateSettings = (newOptions) => store?.updateSettings(newOptions);
    export const getApi = () => store?.getApi();
</script>

<input
    bind:this={inputElement}
    type="number"
    data-testid={testId}
    {disabled}
    {...$$restProps}
/>
```

### Usage Examples

```svelte
<!-- Basic usage -->
<script>
    import TouchSpinComponent from './TouchSpinComponent.svelte';
    
    let quantity = 5;
    
    function handleChange(event) {
        console.log('Value changed:', event.detail);
    }
    
    function handleMin(event) {
        console.log('Minimum reached:', event.detail);
    }
</script>

<TouchSpinComponent
    bind:value={quantity}
    options={{
        min: 0,
        max: 100,
        step: 5,
        prefix: 'Qty: '
    }}
    testId="quantity-spinner"
    on:change={handleChange}
    on:min={handleMin}
/>

<!-- Advanced usage with component reference -->
<script>
    import TouchSpinComponent from './TouchSpinComponent.svelte';
    
    let spinnerComponent;
    let currentValue = 0;
    
    function customIncrement() {
        spinnerComponent.setValue(currentValue + 10);
    }
</script>

<TouchSpinComponent
    bind:this={spinnerComponent}
    bind:value={currentValue}
    options={{ min: 0, max: 1000 }}
/>

<button on:click={customIncrement}>+10</button>
```

## Testing Framework Wrappers

### Angular Testing

```typescript
// touchspin.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TouchSpinComponent } from './touchspin.component';

describe('TouchSpinComponent', () => {
    let component: TouchSpinComponent;
    let fixture: ComponentFixture<TouchSpinComponent>;
    
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TouchSpinComponent],
            imports: [ReactiveFormsModule]
        });
        
        fixture = TestBed.createComponent(TouchSpinComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    
    it('should emit value changes', (done) => {
        component.valueChange.subscribe(value => {
            expect(value).toBe(1);
            done();
        });
        
        component.upOnce();
    });
    
    it('should integrate with reactive forms', () => {
        const form = new FormControl(5);
        component.registerOnChange(form.setValue.bind(form));
        
        component.upOnce();
        expect(form.value).toBe(6);
    });
});
```

### React Testing

```javascript
// TouchSpinComponent.test.jsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import TouchSpinComponent from './TouchSpinComponent';

test('emits value changes', async () => {
    const handleChange = jest.fn();
    
    const { container } = render(
        <TouchSpinComponent
            options={{ min: 0, max: 10 }}
            onChange={handleChange}
            testId="test-spinner"
        />
    );
    
    const upButton = container.querySelector('[data-testid="test-spinner-up"]');
    fireEvent.click(upButton);
    
    await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith(1);
    });
});

test('useRef API access', () => {
    const ref = React.createRef();
    
    render(
        <TouchSpinComponent
            ref={ref}
            options={{ min: 0, max: 10 }}
        />
    );
    
    expect(ref.current.getValue()).toBe(0);
    
    ref.current.setValue(5);
    expect(ref.current.getValue()).toBe(5);
});
```

### Vue Testing

```javascript
// TouchSpinComponent.spec.ts
import { mount } from '@vue/test-utils';
import TouchSpinComponent from './TouchSpinComponent.vue';

describe('TouchSpinComponent', () => {
    test('emits value changes', async () => {
        const wrapper = mount(TouchSpinComponent, {
            props: {
                options: { min: 0, max: 10 },
                testId: 'test-spinner'
            }
        });
        
        const upButton = wrapper.find('[data-testid="test-spinner-up"]');
        await upButton.trigger('click');
        
        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')[0]).toEqual([1]);
    });
    
    test('exposed methods work', () => {
        const wrapper = mount(TouchSpinComponent, {
            props: { options: { min: 0, max: 10 } }
        });
        
        expect(wrapper.vm.getValue()).toBe(0);
        
        wrapper.vm.setValue(5);
        expect(wrapper.vm.getValue()).toBe(5);
    });
});
```

## Best Practices

### 1. Lifecycle Management
- Always destroy TouchSpin instances when components unmount
- Handle option updates by recreating or updating settings
- Clean up event listeners properly

### 2. Event Integration
- Map TouchSpin events to framework-specific event patterns
- Provide both callback props and event emitters where appropriate
- Handle boundary events (min/max) meaningfully in the UI

### 3. Form Integration
- Implement proper form control interfaces (ControlValueAccessor, etc.)
- Support validation and error states
- Handle disabled/readonly states correctly

### 4. Performance
- Use refs/reactive references efficiently
- Avoid unnecessary re-initialization
- Debounce rapid setting updates if needed

### 5. TypeScript Support
- Provide comprehensive type definitions
- Export interfaces for options and events
- Use proper generic types for value types

### 6. Testing
- Test component lifecycle (mount/unmount)
- Test event emission and prop updates
- Test form integration scenarios
- Use framework-specific testing utilities

This guide provides complete, production-ready wrapper implementations for major JavaScript frameworks, demonstrating how TouchSpin's modular architecture enables seamless integration with modern development tools.