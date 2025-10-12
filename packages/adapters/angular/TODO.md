# TouchSpin Angular Adapter - Implementation Plan

## Status
🚧 **Placeholder** - Implementation scheduled for Phase 2

## Architecture

### Component Design
- Angular library wrapping `@touchspin/core` + `renderers/*`
- `ControlValueAccessor` implementation for forms integration
- Standalone component (Angular 14+) + optional NgModule wrapper

### Per-Renderer Subpaths
```typescript
import { TouchSpinComponent } from '@touchspin/angular/bootstrap3';
import { TouchSpinComponent } from '@touchspin/angular/bootstrap4';
import { TouchSpinComponent } from '@touchspin/angular/bootstrap5';
import { TouchSpinComponent } from '@touchspin/angular/tailwind';
import { TouchSpinComponent } from '@touchspin/angular/vanilla';
```

### API Surface

#### Template-Driven Forms
```html
<touchspin-input
  [(ngModel)]="value"
  [min]="0"
  [max]="100"
  [step]="1"
  (valueChange)="onValueChange($event)"
></touchspin-input>
```

#### Reactive Forms
```html
<touchspin-input
  [formControl]="myControl"
  [min]="0"
  [max]="100"
></touchspin-input>
```

#### Component Inputs
- `@Input() value?: number`
- `@Input() min?: number`
- `@Input() max?: number`
- `@Input() step?: number`
- `@Input() decimals?: number`
- `@Input() prefix?: string`
- `@Input() suffix?: string`
- `@Input() disabled?: boolean`
- `@Input() name?: string`

#### Component Outputs
- `@Output() valueChange: EventEmitter<number>`
- `@Output() change: EventEmitter<ChangeEvent>`
- `@Output() blur: EventEmitter<void>`
- `@Output() focus: EventEmitter<void>`

#### Spinbutton ARIA
- `role="spinbutton"`
- `[attr.aria-valuenow]`, `[attr.aria-valuemin]`, `[attr.aria-valuemax]`
- `[attr.aria-label]` / `[attr.aria-labelledby]`

#### Keyboard Support
- `ArrowUp/ArrowDown` - Increment/decrement by step
- `PageUp/PageDown` - Larger increments
- `Home/End` - Jump to min/max

### SSR Compatibility
- Angular Universal friendly
- Browser-only renderer initialization in `ngAfterViewInit`
- No top-level browser globals
- Platform checks using `PLATFORM_ID`

### Testing Strategy

#### Unit Tests (Jasmine/Karma or Jest)
- Component initialization
- ControlValueAccessor implementation
- Value changes and validation
- Disabled state handling
- Min/max clamping

#### Integration Tests (TestBed)
- Template-driven forms
- Reactive forms
- Form validation
- Custom validators

#### E2E Tests (Playwright)
- User interactions
- Keyboard navigation
- Form submission
- Focus management

### Documentation Requirements
- Quick start guide
- Template-driven forms examples
- Reactive forms examples
- Per-renderer setup
- Custom validation examples
- Migration guide from legacy versions
- Angular Universal (SSR) setup
- Standalone vs NgModule usage

## Implementation Phases

### Phase 1: Core Component + ControlValueAccessor
- [ ] Standalone component structure
- [ ] ControlValueAccessor implementation
- [ ] Basic inputs/outputs
- [ ] Vanilla renderer integration

### Phase 2: Forms Integration
- [ ] Template-driven forms support
- [ ] Reactive forms support
- [ ] Form validation integration
- [ ] Disabled state handling

### Phase 3: Bootstrap Renderers
- [ ] Bootstrap 3 renderer integration
- [ ] Bootstrap 4 renderer integration
- [ ] Bootstrap 5 renderer integration

### Phase 4: Additional Renderers
- [ ] Tailwind renderer integration
- [ ] Renderer-specific features

### Phase 5: Advanced Features
- [ ] Keyboard navigation
- [ ] ARIA attributes
- [ ] Custom validators
- [ ] OnPush change detection optimization

### Phase 6: NgModule Wrapper
- [ ] Optional NgModule for compatibility
- [ ] Exports configuration
- [ ] Provider setup if needed

### Phase 7: SSR/Universal
- [ ] Platform ID checks
- [ ] Browser-only initialization
- [ ] Angular Universal testing
- [ ] SSR documentation

### Phase 8: Testing
- [ ] Unit test coverage
- [ ] TestBed integration tests
- [ ] Playwright E2E tests
- [ ] SSR test scenarios

### Phase 9: Documentation
- [ ] API documentation
- [ ] Usage examples
- [ ] Migration guide
- [ ] Stackblitz demos

## Package Structure
```
packages/adapters/angular/
├── src/
│   ├── lib/
│   │   ├── touchspin.component.ts       # Main component
│   │   ├── touchspin.component.html     # Template
│   │   ├── touchspin.module.ts          # Optional NgModule
│   │   ├── touchspin.tokens.ts          # DI tokens
│   │   └── renderer-registry.ts         # Renderer management
│   ├── bootstrap3.ts                     # Bootstrap 3 entry
│   ├── bootstrap4.ts                     # Bootstrap 4 entry
│   ├── bootstrap5.ts                     # Bootstrap 5 entry
│   ├── tailwind.ts                       # Tailwind entry
│   ├── vanilla.ts                        # Vanilla entry
│   └── public-api.ts                     # Public exports
├── dist/
│   ├── fesm2022/                        # ESM builds
│   ├── esm2022/                         # ESM builds
│   └── types/                           # Type definitions
└── tests/
    ├── touchspin.component.spec.ts      # Component tests
    └── integration.spec.ts              # Integration tests
```

## Angular Version Support
- **Primary:** Angular 17+ (standalone components)
- **Compatibility:** Angular 14+ (with NgModule wrapper)
- Leverage Ivy compilation features
- Optimize for OnPush change detection

## Dependencies
- `@touchspin/core` - Core logic
- `@touchspin/renderer-bootstrap3` (peer, optional)
- `@touchspin/renderer-bootstrap4` (peer, optional)
- `@touchspin/renderer-bootstrap5` (peer, optional)
- `@touchspin/renderer-tailwind` (peer, optional)
- `@touchspin/renderer-vanilla` (peer, optional)
- `@angular/common` (peer, >=17.0.0)
- `@angular/core` (peer, >=17.0.0)
- `@angular/forms` (peer, >=17.0.0)
- `tslib` (^2.3.0)

## Build Configuration
- Angular CLI library project
- Ng-packagr for building
- Proper package.json exports
- Tree-shakeable per-renderer builds

## Notes
- One renderer per application (matches library invariant)
- No Shadow DOM usage
- CSS must be imported separately in angular.json or component styles
- Standalone-first approach with NgModule fallback
- SSR-safe initialization patterns
