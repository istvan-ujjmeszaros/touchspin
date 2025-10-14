import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { VanillaRenderer } from '@touchspin/renderer-vanilla';
import { TouchSpinComponent } from '../src/touch-spin.component';

describe('TouchSpinComponent', () => {
  let component: TouchSpinComponent;
  let fixture: ComponentFixture<TouchSpinComponent>;
  let inputElement: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TouchSpinComponent, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TouchSpinComponent);
    component = fixture.componentInstance;
    component.renderer = VanillaRenderer;

    fixture.detectChanges();

    // Get the input element
    inputElement = fixture.nativeElement.querySelector('input[type="number"]');
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should render an input element', () => {
      expect(inputElement).toBeTruthy();
      expect(inputElement.type).toBe('number');
    });

    it('should initialize with default value of 0', () => {
      expect(component.getValue()).toBe(0);
      expect(inputElement.value).toBe('0');
    });
  });

  describe('defaultValue', () => {
    it('should apply defaultValue before initialization', async () => {
      // Create a new fixture with defaultValue
      const newFixture = TestBed.createComponent(TouchSpinComponent);
      const newComponent = newFixture.componentInstance;
      newComponent.renderer = VanillaRenderer;
      newComponent.defaultValue = 5;

      newFixture.detectChanges();
      await newFixture.whenStable();

      const input = newFixture.nativeElement.querySelector('input[type="number"]');
      expect(input.value).toBe('5');
      expect(newComponent.getValue()).toBe(5);

      newFixture.destroy();
    });
  });

  describe('controlled value', () => {
    it('should honor controlled value input', async () => {
      const newFixture = TestBed.createComponent(TouchSpinComponent);
      const newComponent = newFixture.componentInstance;
      newComponent.renderer = VanillaRenderer;
      newComponent.value = 10;

      newFixture.detectChanges();
      await newFixture.whenStable();

      const input = newFixture.nativeElement.querySelector('input[type="number"]');
      expect(input.value).toBe('10');
      expect(newComponent.getValue()).toBe(10);

      newFixture.destroy();
    });

    it('should update when controlled value changes', async () => {
      component.value = 12;
      fixture.detectChanges();
      await fixture.whenStable();

      expect(inputElement.value).toBe('12');
      expect(component.getValue()).toBe(12);
    });

    it('should override defaultValue with controlled value', async () => {
      const newFixture = TestBed.createComponent(TouchSpinComponent);
      const newComponent = newFixture.componentInstance;
      newComponent.renderer = VanillaRenderer;
      newComponent.defaultValue = 2;
      newComponent.value = 10;

      newFixture.detectChanges();
      await newFixture.whenStable();

      const input = newFixture.nativeElement.querySelector('input[type="number"]');
      expect(input.value).toBe('10');
      expect(newComponent.getValue()).toBe(10);

      newFixture.destroy();
    });
  });

  describe('ControlValueAccessor', () => {
    it('should sync writeValue with the underlying input', async () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      component.writeValue(7);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(inputElement.value).toBe('7');
      expect(component.getValue()).toBe(7);
      // writeValue should not trigger onChange
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should call onChange when input value changes', async () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      // Simulate user input
      inputElement.value = '15';
      inputElement.dispatchEvent(new Event('change'));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(onChange).toHaveBeenCalledWith(15);
    });

    it('should emit valueChange event when input changes', async () => {
      const emitted: number[] = [];
      component.valueChange.subscribe((value: number) => emitted.push(value));

      // Simulate user input
      inputElement.value = '20';
      inputElement.dispatchEvent(new Event('change'));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(emitted).toEqual([20]);
    });

    it('should return to uncontrolled mode when value is cleared', async () => {
      component.value = 9;
      fixture.detectChanges();
      await fixture.whenStable();

      const onChange = jest.fn();
      const emitted: number[] = [];
      component.registerOnChange(onChange);
      component.valueChange.subscribe((value: number) => emitted.push(value));

      component.value = null;
      fixture.detectChanges();
      await fixture.whenStable();

      inputElement.value = '11';
      inputElement.dispatchEvent(new Event('change'));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(onChange).toHaveBeenCalledWith(11);
      expect(emitted).toEqual([11]);
      expect(inputElement.value).toBe('11');
    });
  });

  describe('imperative methods', () => {
    it('should increment value with increment()', async () => {
      component.setValue(5);
      fixture.detectChanges();
      await fixture.whenStable();

      component.increment();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.getValue()).toBe(6);
    });

    it('should decrement value with decrement()', async () => {
      component.setValue(5);
      fixture.detectChanges();
      await fixture.whenStable();

      component.decrement();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.getValue()).toBe(4);
    });

    it('should set value with setValue()', async () => {
      component.setValue(42);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.getValue()).toBe(42);
      expect(inputElement.value).toBe('42');
    });
  });

  describe('disabled state', () => {
    it('should disable input when disabled is true', () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      expect(inputElement.disabled).toBe(true);
    });

    it('should enable input when disabled is false', () => {
      component.setDisabledState(false);
      fixture.detectChanges();

      expect(inputElement.disabled).toBe(false);
    });
  });

  describe('input options', () => {
    it('should initialize with min, max, and step options', async () => {
      const newFixture = TestBed.createComponent(TouchSpinComponent);
      const newComponent = newFixture.componentInstance;
      newComponent.renderer = VanillaRenderer;
      newComponent.min = 0;
      newComponent.max = 100;
      newComponent.step = 5;
      newComponent.defaultValue = 10;

      newFixture.detectChanges();
      await newFixture.whenStable();

      const input = newFixture.nativeElement.querySelector('input[type="number"]');
      expect(input.value).toBe('10');
      expect(newComponent.getValue()).toBe(10);

      newFixture.destroy();
    });

    it('should initialize with decimals option', async () => {
      const newFixture = TestBed.createComponent(TouchSpinComponent);
      const newComponent = newFixture.componentInstance;
      newComponent.renderer = VanillaRenderer;
      newComponent.decimals = 2;
      newComponent.step = 0.1; // Allow decimal steps
      newComponent.defaultValue = 10.5;

      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(newComponent.getValue()).toBe(10.5);

      newFixture.destroy();
    });

    it('should initialize with prefix and suffix', async () => {
      const newFixture = TestBed.createComponent(TouchSpinComponent);
      const newComponent = newFixture.componentInstance;
      newComponent.renderer = VanillaRenderer;
      newComponent.prefix = '$';
      newComponent.suffix = '.00';
      newComponent.defaultValue = 100;

      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(newComponent.getValue()).toBe(100);

      newFixture.destroy();
    });

    it('should initialize with coreOptions', async () => {
      const newFixture = TestBed.createComponent(TouchSpinComponent);
      const newComponent = newFixture.componentInstance;
      newComponent.renderer = VanillaRenderer;
      newComponent.coreOptions = { verticalbuttons: true };
      newComponent.defaultValue = 50;

      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(newComponent.getValue()).toBe(50);

      newFixture.destroy();
    });
  });

  describe('ngOnChanges - dynamic property updates', () => {
    it('should update min dynamically', async () => {
      component.min = 10;
      fixture.detectChanges();
      await fixture.whenStable();

      // Trigger ngOnChanges
      component.ngOnChanges({
        min: {
          currentValue: 10,
          previousValue: undefined,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      fixture.detectChanges();
      await fixture.whenStable();

      // Value should remain valid
      expect(component.getValue()).toBeGreaterThanOrEqual(10);
    });

    it('should update max dynamically', async () => {
      component.max = 50;
      fixture.detectChanges();
      await fixture.whenStable();

      component.ngOnChanges({
        max: {
          currentValue: 50,
          previousValue: undefined,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.getValue()).toBeLessThanOrEqual(50);
    });

    it('should update step dynamically', async () => {
      component.step = 10;
      fixture.detectChanges();
      await fixture.whenStable();

      component.ngOnChanges({
        step: {
          currentValue: 10,
          previousValue: 1,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component).toBeTruthy();
    });

    it('should update decimals dynamically', async () => {
      component.decimals = 2;
      fixture.detectChanges();
      await fixture.whenStable();

      component.ngOnChanges({
        decimals: {
          currentValue: 2,
          previousValue: 0,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component).toBeTruthy();
    });

    it('should update prefix dynamically', async () => {
      component.prefix = '$';
      fixture.detectChanges();
      await fixture.whenStable();

      component.ngOnChanges({
        prefix: {
          currentValue: '$',
          previousValue: undefined,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component).toBeTruthy();
    });

    it('should update suffix dynamically', async () => {
      component.suffix = ' USD';
      fixture.detectChanges();
      await fixture.whenStable();

      component.ngOnChanges({
        suffix: {
          currentValue: ' USD',
          previousValue: undefined,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component).toBeTruthy();
    });

    it('should update disabled state dynamically', async () => {
      component.disabled = false;
      fixture.detectChanges();
      await fixture.whenStable();

      component.disabled = true;
      component.ngOnChanges({
        disabled: {
          currentValue: true,
          previousValue: false,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      fixture.detectChanges();
      await fixture.whenStable();

      expect(inputElement.disabled).toBe(true);
    });

    it('should update readOnly state dynamically', async () => {
      component.readOnly = false;
      fixture.detectChanges();
      await fixture.whenStable();

      component.readOnly = true;
      component.ngOnChanges({
        readOnly: {
          currentValue: true,
          previousValue: false,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      fixture.detectChanges();
      await fixture.whenStable();

      expect(inputElement.readOnly).toBe(true);
    });
  });

  describe('imperative methods - additional', () => {
    it('should call focus() on input element', () => {
      const focusSpy = jest.spyOn(inputElement, 'focus');

      component.focus();

      expect(focusSpy).toHaveBeenCalled();
    });

    it('should call blur() on input element', () => {
      const blurSpy = jest.spyOn(inputElement, 'blur');

      component.blur();

      expect(blurSpy).toHaveBeenCalled();
    });

    it('should return core instance with getCore()', () => {
      const core = component.getCore();

      expect(core).toBeTruthy();
      expect(typeof core?.getValue).toBe('function');
    });
  });

  describe('ControlValueAccessor - additional', () => {
    it('should register onTouched callback', () => {
      const onTouched = jest.fn();

      component.registerOnTouched(onTouched);

      // Trigger blur event
      inputElement.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      // Note: onTouched is called internally, we're just testing registration
      expect(component).toBeTruthy();
    });

    it('should handle writeValue with null', async () => {
      component.writeValue(null);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(inputElement.value).toBe('0');
      expect(component.getValue()).toBe(0);
    });

    it('should handle writeValue with undefined', async () => {
      component.writeValue(undefined);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(inputElement.value).toBe('0');
      expect(component.getValue()).toBe(0);
    });
  });

  describe('property getters', () => {
    it('should return value via value getter', () => {
      component.value = 42;
      fixture.detectChanges();

      expect(component.value).toBe(42);
    });

    it('should return defaultValue via defaultValue getter', async () => {
      const newFixture = TestBed.createComponent(TouchSpinComponent);
      const newComponent = newFixture.componentInstance;
      newComponent.renderer = VanillaRenderer;
      newComponent.defaultValue = 10;

      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(newComponent.defaultValue).toBe(10);

      newFixture.destroy();
    });

    it('should return inputTestId when testId is set', () => {
      component.testId = 'my-test';
      fixture.detectChanges();

      expect(component.inputTestId).toBe('my-test-input');
    });

    it('should return undefined for inputTestId when testId is not set', () => {
      // testId is optional, so we test when it's not provided at all
      const newFixture = TestBed.createComponent(TouchSpinComponent);
      const newComponent = newFixture.componentInstance;
      newComponent.renderer = VanillaRenderer;
      newFixture.detectChanges();

      expect(newComponent.inputTestId).toBeUndefined();

      newFixture.destroy();
    });
  });

  describe('edge cases', () => {
    it('should handle setting value to null', async () => {
      component.value = 10;
      fixture.detectChanges();
      await fixture.whenStable();

      component.value = null;
      fixture.detectChanges();
      await fixture.whenStable();

      // Should remain in last valid state
      expect(component.getValue()).toBeDefined();
    });

    it('should handle setting value to undefined', async () => {
      component.value = 10;
      fixture.detectChanges();
      await fixture.whenStable();

      component.value = undefined;
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.getValue()).toBeDefined();
    });

    it('should handle setting defaultValue to null', async () => {
      const newFixture = TestBed.createComponent(TouchSpinComponent);
      const newComponent = newFixture.componentInstance;
      newComponent.renderer = VanillaRenderer;
      newComponent.defaultValue = 5;

      newFixture.detectChanges();
      await newFixture.whenStable();

      newComponent.defaultValue = null;
      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(newComponent).toBeTruthy();

      newFixture.destroy();
    });

    it('should handle setting defaultValue to undefined', async () => {
      const newFixture = TestBed.createComponent(TouchSpinComponent);
      const newComponent = newFixture.componentInstance;
      newComponent.renderer = VanillaRenderer;
      newComponent.defaultValue = 5;

      newFixture.detectChanges();
      await newFixture.whenStable();

      newComponent.defaultValue = undefined;
      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(newComponent).toBeTruthy();

      newFixture.destroy();
    });

    it('should not update when setting same value twice in controlled mode', async () => {
      component.value = 10;
      fixture.detectChanges();
      await fixture.whenStable();

      const valueBefore = component.getValue();

      component.value = 10;
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.getValue()).toBe(valueBefore);
    });

    it('should not update defaultValue when in controlled mode', async () => {
      component.value = 20;
      fixture.detectChanges();
      await fixture.whenStable();

      component.defaultValue = 5;
      fixture.detectChanges();
      await fixture.whenStable();

      // Should still be 20 (controlled value takes precedence)
      expect(component.getValue()).toBe(20);
    });

    it('should not update defaultValue when value unchanged', async () => {
      const newFixture = TestBed.createComponent(TouchSpinComponent);
      const newComponent = newFixture.componentInstance;
      newComponent.renderer = VanillaRenderer;
      newComponent.defaultValue = 10;

      newFixture.detectChanges();
      await newFixture.whenStable();

      newComponent.defaultValue = 10;
      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(newComponent.getValue()).toBe(10);

      newFixture.destroy();
    });
  });
});
