# TouchSpin React Adapter - Implementation Plan

## Status
🚧 **Placeholder** - Implementation scheduled for Phase 2

## Architecture

### Component Design
- Idiomatic React component wrapping `@touchspin/core` + `renderers/*`
- No direct DOM mutation outside React lifecycle
- Fully controlled/uncontrolled value support

### Per-Renderer Subpaths
```typescript
import TouchSpin from '@touchspin/react/bootstrap3';
import TouchSpin from '@touchspin/react/bootstrap4';
import TouchSpin from '@touchspin/react/bootstrap5';
import TouchSpin from '@touchspin/react/tailwind';
import TouchSpin from '@touchspin/react/vanilla';
```

### API Surface
- **Props:**
  - `value?: number` - Controlled value
  - `defaultValue?: number` - Uncontrolled initial value
  - `onChange?: (value: number, meta: ChangeMetadata) => void`
  - `min?: number`
  - `max?: number`
  - `step?: number`
  - `decimals?: number`
  - `prefix?: string`
  - `suffix?: string`
  - `disabled?: boolean`
  - `name?: string` - For form integration
  - `className?: string`
  - Standard input attributes

- **Spinbutton ARIA semantics**
  - `role="spinbutton"`
  - `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
  - `aria-label` / `aria-labelledby`

- **Keyboard support:**
  - `ArrowUp/ArrowDown` - Increment/decrement by step
  - `PageUp/PageDown` - Increment/decrement by larger step
  - `Home/End` - Jump to min/max

- **Imperative ref handle:**
  ```typescript
  interface TouchSpinHandle {
    focus(): void;
    blur(): void;
    increment(): void;
    decrement(): void;
    getValue(): number;
    setValue(value: number): void;
  }
  ```

### SSR/Hydration
- Safe for Next.js, Remix, etc.
- No top-level `window` access
- Hydration-friendly state management
- Ensure renderer initialization happens client-side only

### Testing Strategy
- **Playwright Component Tests** for user interactions
  - Click increment/decrement
  - Keyboard navigation
  - Form submission
  - Focus management

- **Unit tests** for:
  - Stepping/clamping logic
  - Controlled vs uncontrolled behavior
  - Meta information accuracy
  - Edge cases (NaN, Infinity, etc.)

- **Form integration tests:**
  - Native form submission
  - Validation
  - Reset behavior

### Documentation Requirements
- Quick start guide
- Per-renderer import examples
- Form integration patterns (native forms, React Hook Form, Formik)
- Controlled vs uncontrolled usage
- Migration guide from legacy jQuery version
- TypeScript examples
- SSR considerations

## Implementation Phases

### Phase 1: Core Component + Vanilla
- [ ] Base TouchSpin component structure
- [ ] Controlled/uncontrolled value management
- [ ] Vanilla renderer integration
- [ ] Basic props interface
- [ ] Unit tests for core logic

### Phase 2: Bootstrap Renderers
- [ ] Bootstrap 3 renderer integration
- [ ] Bootstrap 4 renderer integration
- [ ] Bootstrap 5 renderer integration
- [ ] Renderer-specific prop handling

### Phase 3: Additional Renderers
- [ ] Tailwind renderer integration
- [ ] Renderer-specific styling

### Phase 4: Advanced Features
- [ ] Imperative ref handle
- [ ] Keyboard navigation
- [ ] ARIA attributes
- [ ] Form integration (name prop, native validation)

### Phase 5: SSR/Hydration
- [ ] Client-side only renderer initialization
- [ ] Next.js compatibility testing
- [ ] Remix compatibility testing
- [ ] SSR documentation

### Phase 6: Testing
- [ ] Playwright component tests
- [ ] Unit test coverage
- [ ] Form integration tests
- [ ] SSR test scenarios

### Phase 7: Documentation
- [ ] API documentation
- [ ] Usage examples
- [ ] Migration guide
- [ ] TypeScript definitions
- [ ] Storybook/examples site

## Package Structure
```
packages/adapters/react/
├── src/
│   ├── index.ts                 # Main export
│   ├── TouchSpin.tsx            # Base component
│   ├── hooks/
│   │   ├── useTouchSpin.ts     # Core hook
│   │   └── useRenderer.ts      # Renderer initialization
│   ├── bootstrap3.tsx           # Bootstrap 3 entry
│   ├── bootstrap4.tsx           # Bootstrap 4 entry
│   ├── bootstrap5.tsx           # Bootstrap 5 entry
│   ├── tailwind.tsx             # Tailwind entry
│   ├── vanilla.tsx              # Vanilla entry
│   └── types.ts                 # TypeScript definitions
├── dist/
│   ├── index.js                 # ESM main
│   ├── bootstrap3.js            # Per-renderer subpaths
│   ├── bootstrap4.js
│   ├── bootstrap5.js
│   ├── tailwind.js
│   └── vanilla.js
└── tests/
    ├── TouchSpin.spec.tsx       # Component tests
    └── integration.spec.ts      # Integration tests
```

## Dependencies
- `@touchspin/core` - Core logic
- `@touchspin/renderer-bootstrap3` (peer, optional)
- `@touchspin/renderer-bootstrap4` (peer, optional)
- `@touchspin/renderer-bootstrap5` (peer, optional)
- `@touchspin/renderer-tailwind` (peer, optional)
- `@touchspin/renderer-vanilla` (peer, optional)
- `react` (peer, >=16.8.0)
- `react-dom` (peer, >=16.8.0)

## Notes
- One renderer per application (matches library invariant)
- No Shadow DOM usage
- CSS must be imported separately by consumer
- Tree-shakeable per-renderer builds
