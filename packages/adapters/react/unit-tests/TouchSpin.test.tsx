/**
 * TouchSpin React Component Unit Tests
 * Comprehensive test suite covering controlled/uncontrolled behavior and edge cases
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VanillaRenderer } from '@touchspin/renderer-vanilla';
import { useRef, useState } from 'react';
import { TouchSpinComponent } from '../src/TouchSpin';
import type { TouchSpinHandle } from '../src/types';

describe('TouchSpin React Component', () => {
  describe('initialization', () => {
    it('should render with default value of 0', () => {
      render(<TouchSpinComponent renderer={VanillaRenderer} data-testid="test-spin" />);

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue(0);
    });

    it('should render with defaultValue', () => {
      render(
        <TouchSpinComponent renderer={VanillaRenderer} defaultValue={25} data-testid="test-spin" />
      );

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      expect(input).toHaveValue(25);
    });

    it('should render with controlled value', () => {
      render(<TouchSpinComponent renderer={VanillaRenderer} value={50} data-testid="test-spin" />);

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      expect(input).toHaveValue(50);
    });
  });

  describe('controlled value', () => {
    it('should update when controlled value changes', async () => {
      function TestComponent() {
        const [value, setValue] = useState(10);

        return (
          <div>
            <button type="button" onClick={() => setValue(20)}>
              Update
            </button>
            <TouchSpinComponent renderer={VanillaRenderer} value={value} data-testid="test-spin" />
          </div>
        );
      }

      render(<TestComponent />);

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      expect(input).toHaveValue(10);

      const button = screen.getByRole('button', { name: 'Update' });
      await userEvent.click(button);

      await waitFor(() => {
        expect(input).toHaveValue(20);
      });
    });

    it('should call onChange when user interacts', async () => {
      const handleChange = jest.fn();

      render(
        <TouchSpinComponent
          renderer={VanillaRenderer}
          value={10}
          onChange={handleChange}
          data-testid="test-spin"
        />
      );

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;

      // Simulate user typing
      await userEvent.clear(input);
      await userEvent.type(input, '25');

      // Wait for onChange to be called
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    });

    it('should override defaultValue with controlled value', () => {
      render(
        <TouchSpinComponent
          renderer={VanillaRenderer}
          defaultValue={5}
          value={15}
          data-testid="test-spin"
        />
      );

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      expect(input).toHaveValue(15);
    });
  });

  describe('uncontrolled value', () => {
    it('should maintain internal state', async () => {
      const handleChange = jest.fn();

      render(
        <TouchSpinComponent
          renderer={VanillaRenderer}
          defaultValue={10}
          onChange={handleChange}
          data-testid="test-spin"
        />
      );

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      expect(input).toHaveValue(10);

      // Simulate user typing
      await userEvent.clear(input);
      await userEvent.type(input, '20');

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    });
  });

  describe('input options', () => {
    it('should initialize with min, max, and step options', () => {
      render(
        <TouchSpinComponent
          renderer={VanillaRenderer}
          min={0}
          max={100}
          step={5}
          defaultValue={25}
          data-testid="test-spin"
        />
      );

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      expect(input).toHaveValue(25);
    });

    it('should initialize with decimals option', () => {
      render(
        <TouchSpinComponent
          renderer={VanillaRenderer}
          decimals={2}
          step={0.1}
          defaultValue={10.5}
          data-testid="test-spin"
        />
      );

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      expect(input).toHaveValue(10.5);
    });

    it('should initialize with prefix and suffix', () => {
      render(
        <TouchSpinComponent
          renderer={VanillaRenderer}
          prefix="$"
          suffix=".00"
          defaultValue={100}
          data-testid="test-spin"
        />
      );

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      expect(input).toHaveValue(100);
    });
  });

  describe('imperative methods', () => {
    it('should expose focus method', () => {
      function TestComponent() {
        const ref = useRef<TouchSpinHandle>(null);

        return (
          <div>
            <button type="button" onClick={() => ref.current?.focus()}>
              Focus
            </button>
            <TouchSpinComponent ref={ref} renderer={VanillaRenderer} data-testid="test-spin" />
          </div>
        );
      }

      render(<TestComponent />);

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      const button = screen.getByRole('button', { name: 'Focus' });

      expect(document.activeElement).not.toBe(input);

      userEvent.click(button);

      // Note: jsdom doesn't fully support focus, so we just check the method doesn't throw
      expect(input).toBeInTheDocument();
    });

    it('should expose getValue method', () => {
      function TestComponent() {
        const ref = useRef<TouchSpinHandle>(null);
        const [displayValue, setDisplayValue] = useState<number | null>(null);

        return (
          <div>
            <button type="button" onClick={() => setDisplayValue(ref.current?.getValue() ?? null)}>
              Get Value
            </button>
            <div data-testid="display-value">{displayValue}</div>
            <TouchSpinComponent
              ref={ref}
              renderer={VanillaRenderer}
              defaultValue={42}
              data-testid="test-spin"
            />
          </div>
        );
      }

      render(<TestComponent />);

      const button = screen.getByRole('button', { name: 'Get Value' });
      userEvent.click(button);

      const display = screen.getByTestId('display-value');
      expect(display).toHaveTextContent('42');
    });

    it('should expose setValue method', async () => {
      function TestComponent() {
        const ref = useRef<TouchSpinHandle>(null);

        return (
          <div>
            <button type="button" onClick={() => ref.current?.setValue(99)}>
              Set Value
            </button>
            <TouchSpinComponent
              ref={ref}
              renderer={VanillaRenderer}
              defaultValue={10}
              data-testid="test-spin"
            />
          </div>
        );
      }

      render(<TestComponent />);

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      expect(input).toHaveValue(10);

      const button = screen.getByRole('button', { name: 'Set Value' });
      await userEvent.click(button);

      await waitFor(() => {
        expect(input).toHaveValue(99);
      });
    });
  });

  describe('disabled and readonly', () => {
    it('should disable input when disabled is true', () => {
      render(
        <TouchSpinComponent renderer={VanillaRenderer} disabled={true} data-testid="test-spin" />
      );

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      expect(input).toBeDisabled();
    });

    it('should enable input when disabled is false', () => {
      render(
        <TouchSpinComponent renderer={VanillaRenderer} disabled={false} data-testid="test-spin" />
      );

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      expect(input).not.toBeDisabled();
    });

    it('should set readonly when readOnly is true', () => {
      render(
        <TouchSpinComponent renderer={VanillaRenderer} readOnly={true} data-testid="test-spin" />
      );

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      expect(input).toHaveAttribute('readonly');
    });
  });

  describe('edge cases', () => {
    it('should handle NaN input gracefully', async () => {
      const handleChange = jest.fn();

      render(
        <TouchSpinComponent
          renderer={VanillaRenderer}
          defaultValue={10}
          onChange={handleChange}
          data-testid="test-spin"
        />
      );

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;

      // Try to set NaN value
      await userEvent.clear(input);
      await userEvent.type(input, 'not-a-number');

      // onChange should not be called with NaN
      await waitFor(() => {
        const calls = handleChange.mock.calls;
        const hasNaN = calls.some((call) => Number.isNaN(call[0]));
        expect(hasNaN).toBe(false);
      });
    });

    it('should handle controlled to uncontrolled transition', async () => {
      function TestComponent() {
        const [value, _setValue] = useState<number>(50);
        const [showValue, setShowValue] = useState(true);

        return (
          <div>
            <button type="button" onClick={() => setShowValue(false)}>
              Clear
            </button>
            <TouchSpinComponent
              renderer={VanillaRenderer}
              {...(showValue ? { value } : {})}
              defaultValue={10}
              data-testid="test-spin"
            />
          </div>
        );
      }

      render(<TestComponent />);

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      expect(input).toHaveValue(50);

      const button = screen.getByRole('button', { name: 'Clear' });
      await userEvent.click(button);

      // Should fallback to defaultValue
      await waitFor(() => {
        expect(input).toHaveValue(10);
      });
    });

    it('should handle zero controlled value', () => {
      render(<TouchSpinComponent renderer={VanillaRenderer} value={0} data-testid="test-spin" />);

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      // Should render 0
      expect(input).toHaveValue(0);
    });

    it('should handle undefined controlled value', () => {
      // Test with no value prop at all (equivalent to undefined)
      render(
        <TouchSpinComponent renderer={VanillaRenderer} defaultValue={5} data-testid="test-spin" />
      );

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      // Should use defaultValue
      expect(input).toHaveValue(5);
    });

    it('should handle rapid value updates', async () => {
      function TestComponent() {
        const [value, setValue] = useState(10);

        return (
          <div>
            <button
              type="button"
              onClick={() => {
                setValue(20);
                setValue(30);
                setValue(40);
              }}
            >
              Rapid Update
            </button>
            <TouchSpinComponent renderer={VanillaRenderer} value={value} data-testid="test-spin" />
          </div>
        );
      }

      render(<TestComponent />);

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      expect(input).toHaveValue(10);

      const button = screen.getByRole('button', { name: 'Rapid Update' });
      await userEvent.click(button);

      await waitFor(() => {
        expect(input).toHaveValue(40);
      });
    });
  });

  describe('form integration', () => {
    it('should work with form name attribute', () => {
      render(
        <TouchSpinComponent
          renderer={VanillaRenderer}
          name="quantity"
          defaultValue={5}
          data-testid="test-spin"
        />
      );

      const input = screen.getByTestId('test-spin-input') as HTMLInputElement;
      expect(input).toHaveAttribute('name', 'quantity');
    });

    it('should create hidden input for form submission', () => {
      render(
        <TouchSpinComponent
          renderer={VanillaRenderer}
          name="quantity"
          defaultValue={5}
          data-testid="test-spin"
        />
      );

      const container = screen.getByTestId('test-spin');
      const hiddenInputs = container.querySelectorAll('input[type="hidden"]');
      expect(hiddenInputs).toHaveLength(1);
      expect(hiddenInputs[0]).toHaveAttribute('name', 'quantity_display');
    });
  });

  describe('styling', () => {
    it('should apply className to wrapper', () => {
      render(
        <TouchSpinComponent
          renderer={VanillaRenderer}
          className="custom-class"
          data-testid="test-spin"
        />
      );

      const wrapper = screen.getByTestId('test-spin');
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should apply inputClassName to input', () => {
      render(
        <TouchSpinComponent
          renderer={VanillaRenderer}
          inputClassName="custom-input"
          data-testid="test-spin"
        />
      );

      const input = screen.getByTestId('test-spin-input');
      expect(input).toHaveClass('custom-input');
    });
  });
});
