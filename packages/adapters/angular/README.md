# @touchspin/angular

Angular adapter for [TouchSpin](https://github.com/istvan-ujjmeszaros/touchspin) - a modern, touch-friendly numeric spinner component with comprehensive form integration.

## Features

- ✅ **Standalone Component** - No NgModule required (Angular 17+)
- ✅ **Forms Integration** - Full ControlValueAccessor support for Template-driven and Reactive Forms
- ✅ **Multiple Renderers** - Bootstrap 3/4/5, Tailwind, and Vanilla CSS
- ✅ **Imperative API** - Programmatic control via component reference
- ✅ **SSR-Friendly** - Works with Angular Universal
- ✅ **TypeScript** - Full type safety
- ✅ **Accessibility** - ARIA-compliant with keyboard support

## Installation

```bash
npm install @touchspin/angular@alpha @touchspin/renderer-bootstrap5@alpha
```

Or with yarn:

```bash
yarn add @touchspin/angular@alpha @touchspin/renderer-bootstrap5@alpha
```

> **Note:** Install your preferred renderer package alongside the Angular adapter.

## Per-Renderer Imports

Import from the renderer-specific subpath for your chosen styling framework:

```typescript
// Bootstrap 5
import { TouchSpinBootstrap5Component } from '@touchspin/angular/bootstrap5';

// Bootstrap 4
import { TouchSpinBootstrap4Component } from '@touchspin/angular/bootstrap4';

// Bootstrap 3
import { TouchSpinBootstrap3Component } from '@touchspin/angular/bootstrap3';

// Tailwind CSS
import { TouchSpinTailwindComponent } from '@touchspin/angular/tailwind';

// Vanilla CSS (framework-agnostic)
import { TouchSpinVanillaComponent } from '@touchspin/angular/vanilla';
```

**Important:** Use only one renderer per application.

## Usage

### Template-Driven Forms

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TouchSpinBootstrap5Component } from '@touchspin/angular/bootstrap5';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [FormsModule, TouchSpinBootstrap5Component],
  template: `
    <touch-spin
      [(ngModel)]="quantity"
      [min]="0"
      [max]="100"
      [step]="1"
      name="quantity"
      class="my-spinner"
    />
    <p>Value: {{ quantity }}</p>
  `
})
export class ExampleComponent {
  quantity = 50;
}
```

### Reactive Forms

```typescript
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TouchSpinBootstrap5Component } from '@touchspin/angular/bootstrap5';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ReactiveFormsModule, TouchSpinBootstrap5Component],
  template: `
    <form [formGroup]="form">
      <touch-spin
        formControlName="quantity"
        [min]="0"
        [max]="100"
        [step]="5"
      />
    </form>
    <p>Value: {{ form.value.quantity }}</p>
    <p>Valid: {{ form.valid }}</p>
  `
})
export class ExampleComponent {
  form = new FormGroup({
    quantity: new FormControl(50)
  });
}
```

### Imperative API

```typescript
import { Component, ViewChild } from '@angular/core';
import { TouchSpinBootstrap5Component } from '@touchspin/angular/bootstrap5';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [TouchSpinBootstrap5Component],
  template: `
    <touch-spin
      #spinner
      [value]="value"
      (valueChange)="onValueChange($event)"
    />
    <button (click)="increment()">+1</button>
    <button (click)="decrement()">-1</button>
    <button (click)="reset()">Reset</button>
  `
})
export class ExampleComponent {
  @ViewChild('spinner') spinner!: TouchSpinBootstrap5Component;
  value = 50;

  onValueChange(newValue: number) {
    this.value = newValue;
  }

  increment() {
    this.spinner.increment();
  }

  decrement() {
    this.spinner.decrement();
  }

  reset() {
    this.spinner.setValue(0);
  }
}
```

## API Reference

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `value` | `number` | - | Current value (controlled mode) |
| `defaultValue` | `number` | `0` | Initial value (uncontrolled mode) |
| `min` | `number` | - | Minimum allowed value |
| `max` | `number` | - | Maximum allowed value |
| `step` | `number` | `1` | Increment/decrement step |
| `decimals` | `number` | - | Number of decimal places |
| `prefix` | `string` | - | Text/symbol prefix |
| `suffix` | `string` | - | Text/symbol suffix |
| `disabled` | `boolean` | `false` | Disabled state |
| `readOnly` | `boolean` | `false` | Read-only state |
| `name` | `string` | - | Form control name |
| `id` | `string` | - | Element ID |
| `class` | `string` | - | CSS class for wrapper |
| `inputClass` | `string` | - | CSS class for input element |
| `coreOptions` | `Partial<TouchSpinCoreOptions>` | - | Advanced core options |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `valueChange` | `EventEmitter<number>` | Emitted when value changes |

### Methods (via Component Reference)

| Method | Returns | Description |
|--------|---------|-------------|
| `focus()` | `void` | Focus the input |
| `blur()` | `void` | Blur the input |
| `increment()` | `void` | Increment value by step |
| `decrement()` | `void` | Decrement value by step |
| `getValue()` | `number` | Get current value |
| `setValue(value)` | `void` | Set value programmatically |
| `getCore()` | `TouchSpinCorePublicAPI \| null` | Access core API |

## SSR (Angular Universal)

TouchSpin is SSR-friendly and automatically detects server-side rendering. The component will safely skip browser-only initialization during server-side rendering.

```typescript
// Works automatically with Angular Universal
import { TouchSpinBootstrap5Component } from '@touchspin/angular/bootstrap5';

@Component({
  selector: 'app-ssr-example',
  standalone: true,
  imports: [TouchSpinBootstrap5Component],
  template: `<touch-spin [value]="42" />`
})
export class SsrExampleComponent {}
```

## Form Submission

TouchSpin includes a hidden input for natural form submission:

```html
<form action="/submit" method="POST">
  <touch-spin name="quantity" [value]="10" />
  <!-- Submits: quantity=10 -->
  <button type="submit">Submit</button>
</form>
```

## Styling

### Bootstrap Renderers

No additional CSS needed - uses Bootstrap's built-in styles.

```typescript
// Bootstrap 5
import { TouchSpinBootstrap5Component } from '@touchspin/angular/bootstrap5';

// Ensure Bootstrap CSS is loaded in your app
```

### Tailwind Renderer

Import the Tailwind renderer CSS in your global styles:

```css
/* src/styles.css */
@import '@touchspin/renderer-tailwind/css';
```

### Vanilla Renderer

Import the Vanilla CSS in your global styles:

```css
/* src/styles.css */
@import '@touchspin/renderer-vanilla/css';
/* Optional theme */
@import '@touchspin/renderer-vanilla/themes/vanilla';
```

## TypeScript Types

```typescript
import type {
  TouchSpinInputs,
  TouchSpinOutputs,
  TouchSpinHandle,
  TouchSpinChangeMeta
} from '@touchspin/angular/bootstrap5';
```

## Advanced: Core Options

Pass advanced options to the TouchSpin core:

```typescript
<touch-spin
  [coreOptions]="{
    forceStepDivisibility: 'round',
    mousewheel: true,
    buttonDownClass: 'btn-danger',
    buttonUpClass: 'btn-success'
  }"
/>
```

See [@touchspin/core documentation](https://github.com/istvan-ujjmeszaros/touchspin/tree/main/packages/core) for all available options.

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- iOS Safari (last 2 versions)
- Android Chrome (last 2 versions)

## License

MIT © [TouchSpin Contributors](https://github.com/istvan-ujjmeszaros/touchspin/graphs/contributors)

## Contributing

See [CONTRIBUTING.md](https://github.com/istvan-ujjmeszaros/touchspin/blob/main/CONTRIBUTING.md)

## Related Packages

- [@touchspin/core](https://www.npmjs.com/package/@touchspin/core) - Core TouchSpin engine
- [@touchspin/react](https://www.npmjs.com/package/@touchspin/react) - React adapter
- [@touchspin/renderer-bootstrap5](https://www.npmjs.com/package/@touchspin/renderer-bootstrap5) - Bootstrap 5 renderer
- [More renderers...](https://github.com/istvan-ujjmeszaros/touchspin/tree/main/packages/renderers)
