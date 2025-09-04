# Legacy Plugin — Key Methods (Pseudo‑code)

Note: Summarized from `src/jquery.bootstrap-touchspin.js`. Names trimmed for clarity.

- TouchSpin(optionsOrCommand)
  - if string command: iterate elements → get api from $.data('touchspinInternal') → switch(cmd) → call destroy/upOnce/downOnce/startUpSpin/startDownSpin/stopSpin/updateSettings/get/set.
  - else init:
    - merge defaults + data-bts-* + native attrs + options → settings; normalize numeric values.
    - if alreadyinitialized: trigger('touchspin.destroy') and proceed.
    - ensure element is input; cache DOM; add form-control.
    - choose renderer and call buildInputGroup()/buildAdvancedInputGroup().
    - init elements from renderer; cache up/down buttons.
    - set ARIA; hide empty prefix/postfix.
    - bind input + buttons + wheel handlers (jQuery + native); bind API interface events.
    - setup MutationObserver for disabled/readonly/min/max/step.
    - store internal API in $.data('touchspinInternal', api).

- upOnce()
  - if disabled/readonly: return.
  - v = get current; next = _next('up', v).
  - if v == max: trigger('min/max') if needed; stopSpin() if holding; return.
  - if next == max: trigger('max'); stopSpin() if holding.
  - setDisplay(next, true).

- downOnce(): symmetric to upOnce with 'min'.

- startUpSpin()/startDownSpin()
  - stopSpin(); if at boundary, return.
  - if direction changed: spinning=true; direction=up|down; spincount=0; trigger start events.
  - start delay timer; then interval timer: while spinning call _spinStep(dir).

- stopSpin()
  - clear timers; if spinning: emit stopupspin/stopdownspin then stopspin.
  - spinning=false; direction=false; spincount=0.

- _spinStep(dir)
  - spincount++;
  - if dir='up' call upOnce(); else downOnce().

- updateSettings(newsettings)
  - merge; normalize min/max/decimals/timings; ensure stepinterval/booster values sane.
  - if step|min|max changed: align bounds to step (max↓, min↑).
  - update prefix/postfix via renderer if changed; update ARIA+native attrs on change.
  - hideEmptyPrefixPostfix().

- _checkValue(mayTriggerChange)
  - prev = display value; val = before(value).
  - if empty: set replacementval or clear aria; if changed and mayTriggerChange → trigger('change'); return.
  - if decimals>0 and val=='.': return.
  - parsed = parseFloat(val); returnval = forcestepdivisibility(parsed).
  - clamp to min/max; set display; if display changed and mayTriggerChange → trigger('change').

- _forcestepdivisibility(value)
  - switch forcestepdivisibility: round|floor|ceil|none using settings.step; toFixed(decimals).

- _syncNativeAttributes()
  - set/remove min/max/step attributes on input.

- _updateAriaAttributes()
  - set role=spinbutton; update aria-valuenow/aria-valuetext; set aria-valuemin/max if present.

- _setupMutationObservers()
  - observe input attrs ['disabled','readonly','min','max','step']; update button disabled state; sync settings from native attrs on change.

- _bindEventsInterface()
  - $(input) on 'touchspin.destroy|uponce|downonce|startupspin|startdownspin|stopspin|updatesettings' → call corresponding methods.

