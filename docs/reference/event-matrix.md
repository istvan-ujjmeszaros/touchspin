# Event Matrix

- Core → Wrapper (jQuery)
  - min → touchspin.on.min
  - max → touchspin.on.max
  - startspin → touchspin.on.startspin
  - startupspin → touchspin.on.startupspin
  - startdownspin → touchspin.on.startdownspin
  - stopupspin → touchspin.on.stopupspin
  - stopdownspin → touchspin.on.stopdownspin
  - stopspin → touchspin.on.stopspin
  - boostchange → touchspin.on.boostchange (payload: { level, step, capped })

- Emit timing
  - startspin then startupspin|startdownspin at spin start
  - min/max BEFORE setting display when reaching boundary via single step
  - stopupspin|stopdownspin then stopspin at spin end

- Change events
  - Core dispatches native change when display actually changes via _setDisplay()
  - Core intercepts native change in capture to prevent propagation of unsanitized values; blur/Enter apply sanitization and emit final change


