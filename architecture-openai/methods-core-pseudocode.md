# Core — Key Methods (Pseudo‑code)

Note: Summarized from `packages/core/src/index.js`.

- constructor(inputEl, opts)
  - parse data-bts-* and native attrs → dataAttrs
  - settings = {DEFAULTS, ...dataAttrs, ...opts}; sanitize
  - choose renderer (global default if not specified)
  - init input (ARIA/native sync; sanitize value)
  - new Renderer(input, settings, core).init()
  - setup mutation observer (disabled/readonly|min|max|step)

- initDOMEventHandling()
  - find wrapper; attach input listeners (change capture, blur, keydown/up, wheel)

- getValue()
  - raw = input.value; if empty with replacementval → use; before(raw) → parseFloat → number/NaN

- setValue(v)
  - if enabled and finite: _applyConstraints(v) → _setDisplay(adjusted, true)

- upOnce()/downOnce()
  - if disabled/readonly return
  - v = getValue(); next = _nextValue(dir, v)
  - if at boundary before step: emit boundary; stop if holding; return
  - if reaching boundary on next: emit boundary; stop if holding
  - _setDisplay(next, true)

- _nextValue(dir, current)
  - base = step; boostat; stepUnclamped = 2^level * base; cap to maxboostedstep if set (no mid‑spin grid alignment)
  - add/subtract step; clamp with _applyConstraints

- _startSpin(dir)
  - stopSpin(); guard boundaries; if direction change → spinning=true; direction=dir; spincount=0; emit startspin + startupspin|startdownspin
  - start timers: after delay → setInterval → _spinStep(dir)

- _spinStep(dir)
  - spincount++
  - emit 'boostchange' when level increments
  - dir==='up'? upOnce(): downOnce()

- stopSpin()
  - clear timers
  - compute boostedStep at current level; if >=10 → grid=10^floor(log10(boostedStep)); round current to grid; clamp min/max; _setDisplay(aligned, true)
  - if spinning: emit stopupspin|stopdownspin, then stopspin; reset flags/spincount

- updateSettings(partial)
  - sanitize partial pre‑merge; merge; full sanitize post‑merge
  - if step/min/max changed and step!=1: align bounds (max↓, min↑)
  - notify observers only on effective differences

- _applyConstraints(v)
  - _forcestepdivisibility(v); clamp min/max

- _forcestepdivisibility(val)
  - mode round|floor|ceil|none relative to step; toFixed(decimals)

- _syncNativeAttributes()
  - for type="number": set/remove min/max/step

- _updateAriaAttributes()
  - keep aria roles and valuemin/valuemax/valuenow/valuetext in sync

- destroy()
  - stopSpin; renderer.teardown(); detach input listeners; run teardowns; clear observers; delete instance

- Events
  - emits: 'min', 'max', 'startspin', 'startupspin', 'startdownspin', 'stopspin', 'stopupspin', 'stopdownspin', 'boostchange'
