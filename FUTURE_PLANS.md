# TouchSpin Future Plans — Framework Components

Goal
Design first‑class components for modern frameworks while preserving the behavior guarantees of TouchSpin v5. Lead with a raw Web Component, then provide Angular and React wrappers. Keep the behavioral contract identical to today’s jQuery wrapper: same event timing, boundary rules, and native `change` emission semantics.

Principles
- Behavior‑first: end‑to‑end tests define correctness. Internals may vary.
- Thin wrappers: keep framework components small; core owns behavior.
- Clear contracts: roles, test ids, event ordering stay stable across integrations.

Current Architecture Fit
- Works out of the box: The core (`packages/core/`) is framework‑agnostic and imperative; it returns a public API and emits internal events. Renderers build DOM and call `core.attachUpEvents/attachDownEvents`. No jQuery dependency.
- No core changes required to build Web Component / Angular / React wrappers.
- Helpful enhancements (non‑blocking):
  - Export TypeScript type declarations from core and renderer packages.
  - Publish a small helper like `createTouchSpin(inputEl, opts)` that wraps existing `TouchSpin()` for tree‑shaken ESM usage (already effectively available via exports).
  - Provide event name constants for wrappers (already exported as `CORE_EVENTS`).

1) Web Component (Custom Element)

Approach
- Implement `<touch-spin>` as a custom element class. Internally, render a native `<input>` and instantiate the core on that input in `connectedCallback()`.
- Reflect attributes → options; observe attribute changes and call `api.updateSettings()`.
- Bridge core events to DOM CustomEvents (and optionally legacy `touchspin.on.*` for compatibility).
- Use light DOM by default so framework CSS (Bootstrap/Tailwind) applies without extra work. If Shadow DOM is desired later, ship renderer‑local styles or adopt CSSStyleSheet APIs per renderer.

Sketch
```ts
// packages/web-component/src/TouchSpinElement.ts
export class TouchSpinElement extends HTMLElement {
  private input!: HTMLInputElement;
  private api: any | null = null;

  static get observedAttributes() {
    return [
      'min','max','step','decimals','stepinterval','stepintervaldelay',
      'forcestepdivisibility','booster','boostat','maxboostedstep',
      'mousewheel','prefix','postfix','verticalbuttons'
    ];
  }

  connectedCallback() {
    if (!this.input) {
      this.input = document.createElement('input');
      this.input.type = this.getAttribute('type') || 'text';
      // Pass through data-testid if present on host
      const testid = this.getAttribute('data-testid');
      if (testid) this.input.setAttribute('data-testid', testid);
      this.appendChild(this.input);
    }
    this.initCore();
  }

  disconnectedCallback() {
    this.api?.destroy?.();
    this.api = null;
  }

  attributeChangedCallback(name: string) {
    if (!this.api) return;
    const partial = this.readOptions([name]);
    this.api.updateSettings(partial);
  }

  private initCore() {
    // Read all options from attributes
    const opts = this.readOptions();
    // Instantiate core (uses current renderer via settings)
    // import { TouchSpin } from '@touchspin/core';
    this.api = (window as any).TouchSpin(this.input, opts);
    // Bridge core events to CustomEvents
    const bridge = (evt: string) => this.api.on(evt, (detail: any) => {
      this.dispatchEvent(new CustomEvent(`touchspin:${evt}`, { detail }));
    });
    ['min','max','startspin','startupspin','startdownspin','stopupspin','stopdownspin','stopspin','boostchange']
      .forEach(bridge);
  }

  private readOptions(only?: string[]) {
    const a = (n: string) => this.getAttribute(n);
    const parse = (v: string | null) => (v == null ? undefined : isFinite(+v) ? +v : v);
    const all = {
      min: parse(a('min')), max: parse(a('max')), step: parse(a('step')),
      decimals: parse(a('decimals')), stepinterval: parse(a('stepinterval')),
      stepintervaldelay: parse(a('stepintervaldelay')),
      forcestepdivisibility: a('forcestepdivisibility') as any,
      booster: a('booster') === 'true', boostat: parse(a('boostat')),
      maxboostedstep: parse(a('maxboostedstep')),
      mousewheel: a('mousewheel') === 'true',
      prefix: a('prefix') || undefined, postfix: a('postfix') || undefined,
      verticalbuttons: a('verticalbuttons') === 'true'
    };
    if (!only) return all;
    return Object.fromEntries(only.map(k => [k, (all as any)[k]]));
  }
}

customElements.define('touch-spin', TouchSpinElement);
```

Notes
- Styling: default to light DOM so Bootstrap/Tailwind styles apply. For Shadow DOM support, renderers would need an opt‑in style injection strategy.
- Events: prefer `touchspin:*` CustomEvents; optionally mirror legacy jQuery names when used inside jQuery apps.
- Forms: expose a `value` property and reflect to the inner input’s value; support form participation via the inner input.

2) Angular Component

Approach
- Wrap the core in an Angular component and implement `ControlValueAccessor` for seamless forms integration. Use `AfterViewInit` to initialize on the inner input element and `OnDestroy` to clean up. Inputs map to core settings; Outputs re‑emit core events as Angular `EventEmitter`s.
- Consider `NgZone.runOutsideAngular()` to avoid excessive change detection during spin timers; reenter the zone on relevant value changes if needed.

Sketch
```ts
@Component({
  selector: 'ts-touchspin',
  template: '<input #inp [attr.data-testid]="testId" [attr.type]="type || 'text'" />',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TouchSpinComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @ViewChild('inp', { static: true }) inp!: ElementRef<HTMLInputElement>;
  @Input() options: any = {};
  @Input() testId?: string;
  @Input() type: 'text'|'number' = 'text';

  @Output() min = new EventEmitter<any>();
  @Output() max = new EventEmitter<any>();
  @Output() changeEvent = new EventEmitter<Event>();

  private api: any | null = null;
  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit() {
    // TouchSpin imported from core package
    this.api = (window as any).TouchSpin(this.inp.nativeElement, this.options);
    ['min','max','startspin','startupspin','startdownspin','stopupspin','stopdownspin','stopspin','boostchange']
      .forEach(evt => this.api.on(evt, (detail: any) => this[evt]?.emit?.(detail)));
    this.inp.nativeElement.addEventListener('change', e => {
      this.onChange(this.inp.nativeElement.value);
      this.changeEvent.emit(e);
    });
  }

  writeValue(v: any) { if (this.inp) this.inp.nativeElement.value = v ?? ''; }
  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean) { this.inp.nativeElement.disabled = isDisabled; }

  ngOnDestroy() { this.api?.destroy?.(); this.api = null; }
}
```

Notes
- No core changes required. The imperative API and event emitter are sufficient.
- For SSR/hydration, guard access to `document` and delay initialization to `ngAfterViewInit`.
- Provide `@Inputs()` that map to individual options and call `api.updateSettings()` on `ngOnChanges` for reactive settings.

3) React Component

Approach
- Provide a headless React component that manages a native `<input>` with a `ref`. Initialize the core in `useEffect`, clean up on unmount. Offer controlled and uncontrolled modes. Re‑emit core events via callbacks.

Sketch
```tsx
type Props = {
  options?: any;
  testId?: string;
  type?: 'text'|'number';
  value?: string;
  defaultValue?: string;
  onChange?: (v: string, e: Event) => void;
  onMin?: (d: any) => void;
  onMax?: (d: any) => void;
};

export function TouchSpinInput({ options, testId, type='text', value, defaultValue, onChange, onMin, onMax }: Props) {
  const ref = React.useRef<HTMLInputElement>(null);
  const apiRef = React.useRef<any>(null);

  React.useEffect(() => {
    const el = ref.current!;
    apiRef.current = (window as any).TouchSpin(el, options || {});
    if (onMin) apiRef.current.on('min', onMin);
    if (onMax) apiRef.current.on('max', onMax);
    const handle = (e: Event) => onChange?.(el.value, e);
    el.addEventListener('change', handle);
    return () => { el.removeEventListener('change', handle); apiRef.current?.destroy?.(); apiRef.current = null; };
  }, []);

  React.useEffect(() => {
    if (apiRef.current && options) apiRef.current.updateSettings(options);
  }, [JSON.stringify(options)]);

  // Controlled vs uncontrolled
  React.useEffect(() => {
    if (value !== undefined && ref.current) ref.current.value = value;
  }, [value]);

  return <input ref={ref} data-testid={testId} type={type} defaultValue={defaultValue} />;
}
```

Notes
- React StrictMode double‑invokes effects in dev; the cleanup path (`destroy`) makes init idempotent.
- No core changes required. The imperative API is a natural fit for React refs.
- For controlled usage, keep the source of truth in React state and call `api.updateSettings()` for dynamic option changes.

Gaps and Nice‑to‑Haves
- TypeScript typings: publish `.d.ts` from core/renderers for DX in Angular/React projects.
- SSR guards: document that initialization is client‑only; add no‑DOM guards in wrappers.
- Event constants: ensure `CORE_EVENTS` stays exported and stable to avoid stringly‑typed bridges.
- Renderer CSS in Shadow DOM: if a Web Component uses shadow DOM, provide renderer‑scoped CSS or recommend light DOM.

Verification Plan
- Add example pages for Web Component, Angular, and React under `demo/` (or separate examples repo) that reuse the existing Playwright E2E tests where possible.
- Extend the inspect script to support non‑jQuery pages (it already targets URLs) and report TouchSpin init status in each context.

