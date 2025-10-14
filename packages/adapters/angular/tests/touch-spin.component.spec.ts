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
});
