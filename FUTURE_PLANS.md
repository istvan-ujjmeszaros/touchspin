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

## VanillaRenderer Foundation (Completed ✅)

The **VanillaRenderer** serves as the framework-agnostic foundation for all framework wrappers. It provides:

### Key Features
- **Framework-agnostic** - Works with any wrapper (React, Angular, Vue, etc.)
- **CSS Custom Properties** for comprehensive theming
- **Modern CSS Features** - `:has()` pseudo-class, logical properties for RTL
- **Zero dependencies** - Pure CSS, no Bootstrap/Tailwind requirement
- **Semantic HTML** with ARIA attributes handled by core
- **Theme customization** via CSS variables and interactive theme editor
- **Built-in RTL support** using CSS logical properties

### Current Implementation
The VanillaRenderer is implemented at `packages/vanilla-renderer/` with:
- Modern CSS variables for all styling properties
- Interactive theme editor with live preview
- Support for horizontal and vertical button layouts
- Framework-agnostic design ready for wrapper integration

### CSS Architecture
The VanillaRenderer uses a clean CSS variable architecture:
- All colors, spacing, and sizing controlled via CSS custom properties
- `:has()` pseudo-class for state-based styling (disabled, readonly)
- Flexbox layout with proper focus management
- Theme editor provides live customization of all variables

### Package Structure
```
packages/vanilla-renderer/
├── src/
│   ├── VanillaRenderer.js         # Renderer implementation
│   ├── themes/
│   │   └── vanilla.css            # CSS variables theme
│   └── index.js                   # Exports
├── dist/
│   └── touchspin-vanilla.css      # Compiled CSS
├── example/
│   └── index.html                 # Interactive theme editor
└── package.json
```

### Theming API
```javascript
// Theme customization through VanillaRenderer's setTheme method
const touchspin = TouchSpin(input, { renderer: VanillaRenderer });
touchspin.renderer.setTheme({
  'wrapper-border-color': '#3b82f6',
  'button-background-color': '#f0f9ff',
  'button-min-width': '3rem'
});

// Or directly via CSS variables
document.documentElement.style.setProperty('--ts-button-background-color', '#3b82f6');
```

## Renderer Configuration Patterns

The architecture already supports global default renderers via `globalThis.TouchSpinDefaultRenderer`. Each framework wrapper will provide idiomatic configuration:

### Global Configuration (Works Everywhere)
```javascript
import { setDefaultRenderer } from '@touchspin/core';
import { VanillaRenderer } from '@touchspin/vanilla-renderer';

// One-liner that works in any framework
setDefaultRenderer(VanillaRenderer);
```

### Framework-Specific Configurations

#### React Configuration
```javascript
// main.jsx - App initialization
import { configureTouchSpin } from '@touchspin/react';
import { VanillaRenderer } from '@touchspin/vanilla-renderer';

// One-liner configuration
configureTouchSpin({ defaultRenderer: VanillaRenderer });

// Or Context Provider approach
<TouchSpinProvider renderer={VanillaRenderer}>
  <App />
</TouchSpinProvider>
```

#### Angular Configuration
```typescript
// app.module.ts
import { TouchSpinModule } from '@touchspin/angular';
import { VanillaRenderer } from '@touchspin/vanilla-renderer';

@NgModule({
  imports: [
    // One-liner configuration
    TouchSpinModule.forRoot({ defaultRenderer: VanillaRenderer })
  ]
})

// Or standalone (Angular 14+)
bootstrapApplication(AppComponent, {
  providers: [
    provideTouchSpin({ defaultRenderer: VanillaRenderer })
  ]
});
```

#### Vue Configuration
```javascript
// main.js
import TouchSpinPlugin from '@touchspin/vue';
import { VanillaRenderer } from '@touchspin/vanilla-renderer';

// One-liner configuration
app.use(TouchSpinPlugin, { defaultRenderer: VanillaRenderer });
```

#### Web Components Configuration
```javascript
// Set default via class property
class TouchSpinElement extends HTMLElement {
  static defaultRenderer = VanillaRenderer;
  
  // Usage: <touchspin-element> automatically uses VanillaRenderer
}
```

### Renderer Selection Precedence
1. **Instance-level** - Explicitly passed: `<TouchSpinInput renderer={CustomRenderer} />`
2. **Component-level** - Via props/attributes: `<touchspin-element renderer="bootstrap5" />`
3. **Context-level** - From Provider/Module: `TouchSpinProvider` or `TouchSpinModule.forRoot()`
4. **Global-level** - `globalThis.TouchSpinDefaultRenderer`
5. **Package-level** - Built-in default (VanillaRenderer)
6. **None** - Core works without renderer (keyboard/wheel only)

## Wrapper-Renderer Interoperability

The key architectural insight: **Any wrapper works with any renderer** because:

### Separation of Concerns
- **Wrappers** (React, Angular, Vue, Web Components) handle framework integration
- **Renderers** (Modern, Bootstrap5, Tailwind) handle DOM structure and styling  
- **Core** coordinates between them without coupling

### Example Combinations
```javascript
// React component + Bootstrap5 styling
<TouchSpinInput renderer={Bootstrap5Renderer} min={0} max={100} />

// Angular component + Modern styling
<touchspin-input [renderer]="VanillaRenderer" [min]="0" [max]="100">

// Web Component + Tailwind styling
<touchspin-element renderer="tailwind" min="0" max="100">

// Vue component + Custom styling
<TouchSpinInput :renderer="MyCustomRenderer" :min="0" :max="100" />
```

### Implementation Flow
1. Framework wrapper creates TouchSpin instance: `TouchSpin(input, { renderer: SelectedRenderer })`
2. Core instantiates renderer: `new SelectedRenderer(input, settings, coreInstance)`
3. Renderer builds DOM structure and calls core attachment methods
4. Core manages all business logic and coordinates events
5. Framework wrapper bridges framework events ↔ core events

This design provides complete flexibility - developers choose their framework AND styling independently.

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

### Framework Event Integration Planning

Event handlers like `onChange`, `onMin`, `onMax` will **not** work automatically. Each framework wrapper must explicitly bridge TouchSpin's core events to framework-native patterns:

#### Core Events Available
TouchSpin core provides these events via the observer pattern:
```javascript
// Core events (from packages/core/src/index.js)
CORE_EVENTS = {
  MIN: 'min',                    // Reached minimum value
  MAX: 'max',                    // Reached maximum value  
  START_SPIN: 'startspin',       // Started spinning
  START_UP: 'startupspin',       // Started spinning up
  START_DOWN: 'startdownspin',   // Started spinning down
  STOP_SPIN: 'stopspin',         // Stopped spinning
  STOP_UP: 'stopupspin',         // Stopped spinning up
  STOP_DOWN: 'stopdownspin',     // Stopped spinning down
};

// Plus the native input 'change' event for value changes
```

#### Framework-Specific Event Bridging

**React Implementation:**
```jsx
function TouchSpinInput({ 
  onChange,     // Native input change
  onMin,        // TouchSpin min event
  onMax,        // TouchSpin max event
  onStartSpin,  // TouchSpin startspin event
  onStopSpin,   // TouchSpin stopspin event
  ...props 
}) {
  useEffect(() => {
    const touchspin = TouchSpin(inputRef.current, settings);
    
    // Bridge core events to React props
    const unsubscribers = [
      touchspin.on('min', () => onMin?.(touchspin.getValue())),
      touchspin.on('max', () => onMax?.(touchspin.getValue())),
      touchspin.on('startspin', () => onStartSpin?.(touchspin.getValue())),
      touchspin.on('stopspin', () => onStopSpin?.(touchspin.getValue()))
    ];
    
    // Handle native change events
    const handleChange = (e) => onChange?.(e.target.value, e);
    inputRef.current.addEventListener('change', handleChange);
    
    return () => {
      unsubscribers.forEach(unsub => unsub());
      inputRef.current?.removeEventListener('change', handleChange);
    };
  }, [onChange, onMin, onMax, onStartSpin, onStopSpin]);
}

// Usage
<TouchSpinInput 
  onChange={(value) => console.log('Value changed:', value)}
  onMin={(value) => console.log('Reached minimum:', value)}
  onMax={(value) => console.log('Reached maximum:', value)}
/>
```

**Angular Implementation:**
```typescript
@Component({
  selector: 'touchspin-input',
  template: '<input #input>'
})
export class TouchSpinComponent {
  @Output() valueChange = new EventEmitter<number>();
  @Output() min = new EventEmitter<number>();
  @Output() max = new EventEmitter<number>();
  @Output() startSpin = new EventEmitter<number>();
  @Output() stopSpin = new EventEmitter<number>();
  
  ngAfterViewInit() {
    this.touchspin = TouchSpin(this.inputRef.nativeElement, this.settings);
    
    // Bridge core events to Angular outputs
    this.touchspin.on('min', (value) => this.min.emit(value));
    this.touchspin.on('max', (value) => this.max.emit(value));
    this.touchspin.on('startspin', (value) => this.startSpin.emit(value));
    this.touchspin.on('stopspin', (value) => this.stopSpin.emit(value));
    
    // Handle native change events
    fromEvent(this.inputRef.nativeElement, 'change')
      .subscribe((event: Event) => {
        const value = (event.target as HTMLInputElement).value;
        this.valueChange.emit(Number(value));
      });
  }
}

// Usage
<touchspin-input 
  (valueChange)="handleValueChange($event)"
  (min)="handleMinReached($event)"
  (max)="handleMaxReached($event)">
```

**Vue Implementation:**
```vue
<script setup>
import { onMounted, ref } from 'vue';

const props = defineProps({
  modelValue: Number
});

const emit = defineEmits([
  'update:modelValue',  // v-model support
  'min',               // TouchSpin events
  'max', 
  'start-spin',
  'stop-spin'
]);

onMounted(() => {
  const touchspin = TouchSpin(inputRef.value, settings);
  
  // Bridge core events to Vue emits
  touchspin.on('min', (value) => emit('min', value));
  touchspin.on('max', (value) => emit('max', value));
  touchspin.on('startspin', (value) => emit('start-spin', value));
  touchspin.on('stopspin', (value) => emit('stop-spin', value));
  
  // Handle v-model
  inputRef.value.addEventListener('change', (e) => {
    emit('update:modelValue', Number(e.target.value));
  });
});
</script>

<!-- Usage -->
<TouchSpinInput 
  v-model="value"
  @min="handleMin"
  @max="handleMax"
  @start-spin="handleStartSpin" />
```

**Web Components Implementation:**
```javascript
class TouchSpinElement extends HTMLElement {
  connectedCallback() {
    this.touchspin = TouchSpin(this.input, settings);
    
    // Bridge core events to CustomEvents
    this.touchspin.on('min', (value) => {
      this.dispatchEvent(new CustomEvent('min', { 
        detail: { value }, 
        bubbles: true 
      }));
    });
    
    this.touchspin.on('max', (value) => {
      this.dispatchEvent(new CustomEvent('max', { 
        detail: { value }, 
        bubbles: true 
      }));
    });
    
    // Handle input changes
    this.input.addEventListener('change', (e) => {
      this.dispatchEvent(new CustomEvent('change', {
        detail: { value: e.target.value },
        bubbles: true
      }));
    });
  }
}

// Usage
<touchspin-element></touchspin-element>
<script>
  document.querySelector('touchspin-element')
    .addEventListener('min', (e) => console.log('Min reached:', e.detail.value));
</script>
```

### Enhanced Framework Integration Features

These could improve framework integration:

1. **Enhanced TypeScript Support**
   - Comprehensive event handler type definitions
   - Generic types for better inference in TypeScript frameworks
   - Event payload type safety

2. **Universal Renderer Interface**  
   - **VanillaRenderer as base class** for framework-specific extensions
   - **Renderer theme API** - standardized theming across all renderers
   - **Renderer plugin system** - extend renderers with custom behaviors

3. **Event System Enhancements**
   - **Debounced events** - `onValueChangeDebounced` for performance
   - **Validation events** - `onInvalidValue`, `onValidValue` 
   - **Lifecycle events** - `onInitialized`, `onDestroyed`
   - **Custom event support** - Allow wrappers to define additional events

4. **Testing Utilities**
   - **Framework-specific testing helpers** for event simulation
   - **Mock renderers** for unit testing without DOM
   - **Event assertion utilities** for testing event handlers

5. **Future Renderer Possibilities**
   VanillaRenderer's CSS variable approach makes it easy to create design system themes:
   - **Design system themes** via CSS variable overrides
   - **Accessibility enhancements** through variable-based contrast adjustments
   - **Custom styling** through CSS variable customization

## Interactive Example Projects

Each framework package will include a comprehensive example project showcasing all TouchSpin features with interactive demonstrations.

### Common Example Features (All Frameworks)

#### Interactive Playground Section
- **Real-time configuration editor** with form controls for all TouchSpin options
- **Live preview** updating as settings change
- **Theme customization** with CSS variable controls
- **Renderer switching** to demo interoperability
- **Reset to defaults** and **Export configuration** as JSON
- **URL sharing** of configurations

#### Code Display Section  
- **Tabbed interface** showing HTML, JavaScript/TypeScript, and CSS
- **Syntax highlighting** using Prism.js or framework-native solutions
- **Copy button** for each code block
- **"Open in CodeSandbox/StackBlitz"** button for live editing
- **Framework-specific examples** (React hooks, Angular services, Vue composables)

#### Event Monitor Section
- **Real-time event log** showing all TouchSpin events (`min`, `max`, `startspin`, etc.)
- **Event details** with timestamps and payload data
- **Event filtering** by type
- **Clear log** functionality
- **Event count statistics**

#### API Methods Section
- **Interactive buttons** for testing each method:
  - `upOnce()` / `downOnce()` 
  - `startUpSpin()` / `startDownSpin()` / `stopSpin()`
  - `getValue()` / `setValue(randomValue)`
  - `updateSettings(newConfig)`
  - `destroy()` / recreate cycle
- **Method result display** showing return values
- **Generated code snippet** for each method call

### Framework-Specific Example Structures

#### Web Components Example
```
packages/web-component/example/
├── index.html                      # Main demo page
├── src/
│   ├── demo-app.js                 # Demo orchestration
│   ├── components/
│   │   ├── playground-panel.js     # Configuration controls
│   │   ├── code-viewer.js          # Syntax-highlighted source
│   │   ├── event-monitor.js        # Event logging
│   │   └── method-tester.js        # API method buttons
│   ├── examples/
│   │   ├── basic-usage.js          # Simple examples
│   │   ├── advanced-config.js      # Complex configurations
│   │   └── renderer-showcase.js    # Multiple renderers
│   └── styles/
│       ├── demo.css                # Demo page styling
│       └── syntax-highlight.css    # Code highlighting
├── package.json                    # npm install && npm run dev
└── README.md
```

#### React Example  
```
packages/react/example/
├── src/
│   ├── App.tsx                     # Main demo app
│   ├── components/
│   │   ├── Playground.tsx          # Interactive controls
│   │   ├── CodeViewer.tsx          # Highlighted source
│   │   ├── EventLog.tsx            # Event monitoring  
│   │   └── MethodTester.tsx        # API testing
│   ├── examples/
│   │   ├── BasicExamples.tsx       # Simple usage patterns
│   │   ├── ControlledUncontrolled.tsx  # State management
│   │   ├── FormIntegration.tsx     # React Hook Form
│   │   ├── RendererShowcase.tsx    # Multiple renderers
│   │   └── CustomHooks.tsx         # useTouchSpin examples
│   └── hooks/
│       └── useCodeExample.ts       # Code generation utility
├── public/                         # Static assets
├── package.json                    # Vite + React + TS
├── vite.config.ts                  # Dev server config
└── README.md
```

#### Angular Example
```  
packages/angular/example/
├── src/
│   ├── app/
│   │   ├── app.component.ts        # Main demo component
│   │   ├── playground/
│   │   │   ├── playground.component.ts     # Configuration panel
│   │   │   ├── playground.component.html   # Template
│   │   │   └── playground.component.scss   # Styling
│   │   ├── examples/
│   │   │   ├── reactive-forms.component.ts    # Reactive forms integration
│   │   │   ├── template-driven.component.ts   # Template-driven forms  
│   │   │   ├── renderer-demo.component.ts     # Multiple renderers
│   │   │   └── service-integration.component.ts # Dependency injection
│   │   ├── shared/
│   │   │   ├── code-viewer.component.ts    # Reusable code display
│   │   │   ├── event-monitor.component.ts  # Event logging
│   │   │   └── method-tester.component.ts  # API method testing
│   │   └── services/
│   │       └── demo-config.service.ts      # Configuration management
│   └── main.ts
├── angular.json                    # Angular CLI config
├── package.json                    # ng serve
└── README.md
```

#### Vue Example
```
packages/vue/example/
├── src/
│   ├── App.vue                     # Main demo app  
│   ├── components/
│   │   ├── Playground.vue          # Configuration controls
│   │   ├── CodeViewer.vue          # Source code display
│   │   ├── EventMonitor.vue        # Event logging
│   │   └── MethodTester.vue        # API testing
│   ├── examples/  
│   │   ├── BasicUsage.vue          # Simple examples
│   │   ├── CompositionAPI.vue      # Composition API patterns
│   │   ├── OptionsAPI.vue          # Options API patterns
│   │   ├── VModelIntegration.vue   # v-model two-way binding
│   │   └── PiniaIntegration.vue    # State management
│   ├── composables/
│   │   └── useCodeGeneration.ts    # Code example utility
│   └── main.ts
├── package.json                    # Vite + Vue + TS
├── vite.config.ts
└── README.md
```

### Example Development Experience
Each example project provides:
- **One-command setup**: `npm install && npm run dev`
- **Hot Module Replacement** for instant updates
- **TypeScript support** with proper type definitions
- **Mobile-responsive** design for testing on devices
- **Accessibility testing** with built-in screen reader simulation
- **Performance monitoring** with bundle size analysis

## Revised Implementation Stages

### Stage 1: VanillaRenderer Foundation
**Status: Completed ✅**
- ✅ Created `packages/vanilla-renderer/` with CSS-variable-based styling
- ✅ Comprehensive example project with interactive theme editor
- ✅ CSS custom properties for all styling aspects
- ✅ Theme customization via CSS variables

### Stage 2: Web Components Package
**Priority: High** 
- Standards-based Custom Elements implementation
- Works with any renderer (default: VanillaRenderer)
- Shadow DOM encapsulation option
- Interactive example project with renderer switching
- Framework-agnostic usage patterns

### Stage 3: React Package  
**Priority: High**
- TypeScript-first implementation with proper types
- Hooks-based API (`useTouchSpin`, `useUpdateSettings`)
- React Context for default configuration
- Storybook integration for component documentation
- React Hook Form and popular form library examples

### Stage 4: Angular Package
**Priority: High** 
- `ControlValueAccessor` for reactive forms integration
- Dependency injection for renderer configuration  
- Angular Material compatibility examples
- Standalone component support (Angular 14+)
- Compodoc integration for API documentation

### Stage 5: Vue Package  
**Priority: Medium**
- Composition API and Options API support
- `v-model` directive integration
- Plugin-based configuration
- Pinia/Vuex state management examples  
- VitePress documentation site

### Stage 6: Svelte Package
**Priority: Medium**
- Svelte actions for DOM integration
- Store integration examples
- SvelteKit SSR compatibility
- Compile-time optimizations
- Component library best practices

## Conclusion

The current TouchSpin architecture is exceptionally well-suited for framework integration. The multi-package design with framework-agnostic core, renderer abstraction, and wrapper pattern provides all the necessary building blocks for clean, maintainable framework components.

### Architectural Readiness

**No architectural changes are needed** - the existing foundation supports:
- ✅ **Any wrapper + any renderer** combinations through clean separation of concerns
- ✅ **Global default configuration** via `globalThis.TouchSpinDefaultRenderer`
- ✅ **Framework-specific configuration** patterns for idiomatic setup
- ✅ **Event system** ready for framework-specific bridging
- ✅ **Settings observer pattern** enabling reactive updates
- ✅ **Complete lifecycle management** with proper cleanup

### Implementation Approach

The **VanillaRenderer-first strategy** provides the optimal foundation:

1. **VanillaRenderer** establishes modern CSS patterns and theming standards
2. **Framework wrappers** focus on integration patterns rather than styling
3. **Interactive examples** demonstrate capabilities and serve as documentation  
4. **Any combination works** - developers choose framework AND styling independently

### Event Integration

Event handlers require **explicit bridging** in each framework wrapper:
- Core provides `min`, `max`, `startspin`, `stopspin` events plus native `change`
- Framework wrappers translate these to idiomatic patterns (`onChange`, `onMin`, etc.)
- Type-safe event handling with proper TypeScript definitions
- Examples show complete event bridging implementations

### Developer Experience

The staged implementation ensures excellent DX:
- **One-command setup** for all example projects
- **Interactive playgrounds** with live configuration
- **Complete documentation** via working examples
- **Framework-idiomatic patterns** for each wrapper
- **Zero-config defaults** with easy customization

This comprehensive plan transforms TouchSpin into a universal component system while maintaining the proven architecture and expanding capabilities across the modern framework ecosystem.