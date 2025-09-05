# Future Framework Component Plans

This document outlines plans for implementing TouchSpin components across different frameworks, analyzing architectural compatibility and requirements.

## Current Architecture Analysis

The current TouchSpin architecture is well-positioned for framework integration:

### Core Design Strengths

**Framework-Agnostic Core** (`packages/core/`)
- Pure JavaScript implementation with no framework dependencies
- Element-attached instances using `_touchSpinCore` key
- Comprehensive public API for all TouchSpin operations
- Event system for component lifecycle and value changes
- Observer pattern for settings changes

**Renderer Abstraction** (`packages/renderers/`)
- Clean separation between logic and presentation
- AbstractRenderer base class with standard interface
- Data attribute-based event targeting (`data-touchspin-injected`)
- DOM structure generation with testid support
- Framework-specific styling (Bootstrap 3/4/5, Tailwind)

**Wrapper Pattern** (`packages/jquery-plugin/`)
- Demonstrates how to wrap core functionality
- Event bridging between framework and core events
- Lifecycle management with teardown callbacks
- Command API pattern for imperative operations

## Framework Implementation Plans

### 1. Web Components (Priority: High)

**Implementation Approach:**
```javascript
class TouchSpinElement extends HTMLElement {
  connectedCallback() {
    const input = this.querySelector('input');
    this.touchspin = TouchSpin(input, {
      renderer: this.getRenderer(),
      ...this.getAttributeSettings()
    });
  }
  
  disconnectedCallback() {
    if (this.touchspin) {
      this.touchspin.destroy();
    }
  }
}
```

**Architecture Compatibility:** ✅ **Excellent**
- Core's element-attached pattern maps perfectly to Custom Elements
- Native attribute observation for reactive updates
- Shadow DOM support for encapsulated styling
- Built-in lifecycle methods for initialization/cleanup

**Recommended Package Structure:**
```
packages/web-component/
├── src/
│   ├── TouchSpinElement.js     # Custom element class
│   ├── attribute-mapping.js    # data-* to settings conversion
│   └── index.js               # Registration and exports
├── dist/                      # Built files
└── package.json
```

**Key Implementation Details:**
- Use `observedAttributes` for reactive property updates
- Map HTML attributes to TouchSpin settings automatically
- Support both light DOM and Shadow DOM rendering
- Provide CSS custom properties for theming

### 2. Angular Component (Priority: High)

**Implementation Approach:**
```typescript
@Component({
  selector: 'touchspin-input',
  template: '<input #input [value]="value" />',
  providers: [TouchSpinService]
})
export class TouchSpinComponent implements OnInit, OnDestroy {
  private touchspin: TouchSpinAPI;
  
  ngOnInit() {
    this.touchspin = TouchSpin(this.inputRef.nativeElement, {
      renderer: this.getRenderer(),
      ...this.getSettings()
    });
  }
  
  ngOnDestroy() {
    this.touchspin?.destroy();
  }
}
```

**Architecture Compatibility:** ✅ **Excellent**
- Core's settings observer pattern integrates with Angular's change detection
- Event system maps cleanly to Angular EventEmitter
- Lifecycle hooks provide proper initialization/cleanup points
- Reactive forms compatibility through ControlValueAccessor

**Recommended Package Structure:**
```
packages/angular/
├── src/
│   ├── touchspin.component.ts      # Main component
│   ├── touchspin.service.ts        # Settings management
│   ├── touchspin.module.ts         # NgModule definition
│   └── index.ts                    # Public API
├── dist/                           # Built files
└── package.json
```

**Key Implementation Details:**
- Implement `ControlValueAccessor` for reactive forms
- Use Angular's dependency injection for renderer selection
- Leverage zone.js for change detection integration
- Support both template-driven and reactive forms

### 3. React Component (Priority: High)

**Implementation Approach:**
```jsx
function TouchSpinInput({ value, onChange, ...props }) {
  const inputRef = useRef();
  const touchspinRef = useRef();
  
  useEffect(() => {
    touchspinRef.current = TouchSpin(inputRef.current, {
      renderer: getRenderer(props),
      ...extractSettings(props)
    });
    
    return () => touchspinRef.current?.destroy();
  }, []);
  
  // Handle prop changes with core's updateSettings
  useUpdateSettings(touchspinRef.current, props);
  
  return <input ref={inputRef} defaultValue={value} />;
}
```

**Architecture Compatibility:** ✅ **Excellent**
- Core's imperative API works well with React's useEffect
- Settings observer pattern enables reactive prop updates
- Event system integrates cleanly with React synthetic events
- Ref pattern provides direct DOM access for initialization

**Recommended Package Structure:**
```
packages/react/
├── src/
│   ├── TouchSpinInput.jsx          # Main component
│   ├── hooks/
│   │   ├── useTouchSpin.js         # Core integration hook
│   │   └── useUpdateSettings.js    # Settings synchronization
│   ├── utils/
│   │   └── prop-mapping.js         # Props to settings conversion
│   └── index.js                    # Public exports
├── dist/                           # Built files
└── package.json
```

**Key Implementation Details:**
- Use `useImperativeHandle` for imperative API access
- Implement proper prop diffing for settings updates
- Support both controlled and uncontrolled patterns
- Provide TypeScript definitions for better DX

## Additional Framework Considerations

### Vue.js Component
**Implementation Complexity:** Medium
- Core's settings observer pattern works with Vue's reactivity
- Event system integrates with Vue's event handling
- Template refs provide DOM access for initialization
- Composition API enables clean lifecycle management

### Svelte Component
**Implementation Complexity:** Medium
- Core's imperative API integrates with Svelte actions
- Event system maps to Svelte's event forwarding
- Reactive statements enable settings synchronization
- Component lifecycle provides initialization/cleanup points

## Architectural Modifications Needed

The current architecture supports framework integration out-of-the-box with **minimal modifications**:

### Required Changes: None

The existing architecture is already framework-ready:
- ✅ Framework-agnostic core with element attachment pattern
- ✅ Settings observer pattern for reactive updates
- ✅ Event system for component communication
- ✅ Proper teardown/cleanup mechanisms
- ✅ Renderer abstraction for framework-specific DOM generation

### Optional Enhancements

These could improve framework integration but are not required:

1. **Enhanced TypeScript Support**
   - More comprehensive type definitions for framework-specific APIs
   - Generic types for better inference in TypeScript frameworks

2. **Universal Renderer Interface**
   - Common renderer interface that frameworks can extend
   - Shared utilities for DOM manipulation patterns

3. **Testing Utilities**
   - Framework-specific testing helpers
   - Shared test utilities for behavior verification

## Implementation Priority

1. **Web Components** - Standards-based, works everywhere
2. **React** - Large ecosystem, high demand
3. **Angular** - Enterprise adoption, TypeScript-first
4. **Vue** - Growing popularity, good developer experience
5. **Svelte** - Emerging framework, compile-time optimizations

## Conclusion

The current TouchSpin architecture is exceptionally well-suited for framework integration. The multi-package design with framework-agnostic core, renderer abstraction, and wrapper pattern provides all the necessary building blocks for clean, maintainable framework components.

No architectural changes are needed - the framework components can be built immediately using the existing core API and renderer system. Each framework package would focus solely on the framework-specific integration patterns while leveraging the battle-tested core functionality.