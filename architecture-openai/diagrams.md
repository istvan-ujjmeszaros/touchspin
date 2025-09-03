# Diagrams (Mermaid)

## Class Overview
```mermaid
classDiagram
  class TouchSpinCore {
    +constructor(inputEl, opts)
    +getValue()
    +setValue(v)
    +upOnce()
    +downOnce()
    +startUpSpin()
    +startDownSpin()
    +stopSpin()
    +updateSettings(partial)
    +initDOMEventHandling()
    +destroy()
    +on(event, handler)
    +off(event, handler?)
    +observeSetting(name, cb)
    +attachUpEvents(el)
    +attachDownEvents(el)
  }

  class JQueryWrapper {
    +installJqueryTouchSpin($)
    +$(...).TouchSpin(opts|command)
  }

  class Renderer <<abstract>> {
    +init()
    +teardown()
  }
  class Bootstrap3Renderer
  class Bootstrap4Renderer
  class Bootstrap5Renderer
  class TailwindRenderer

  JQueryWrapper --> TouchSpinCore : forwards commands
  JQueryWrapper ..> TouchSpinCore : bridges events
  TouchSpinCore <|.. Bootstrap3Renderer
  TouchSpinCore <|.. Bootstrap4Renderer
  TouchSpinCore <|.. Bootstrap5Renderer
  TouchSpinCore <|.. TailwindRenderer
```

## Init Sequence (Wrapper + Core + Renderer)
```mermaid
sequenceDiagram
  participant U as User Code
  participant $ as jQuery Wrapper
  participant C as Core
  participant R as Renderer

  U->>$: $(input).TouchSpin(options)
  $->>$: create or reuse instance
  $->>C: TouchSpin(input, options)
  C->>R: new Renderer(input, settings, core)
  R->>R: init() build DOM (+ testids)
  R->>C: attachUpEvents/attachDownEvents
  C->>C: initDOMEventHandling (input listeners, observers)
  C-->>$: public API
```

## Spin Sequence (Hold Up)
```mermaid
sequenceDiagram
  participant Btn as Up Button
  participant C as Core

  Btn->>C: mousedown (via attachUpEvents)
  C->>C: upOnce()
  C->>C: startUpSpin()
  loop after delay then interval
    C->>C: _spinStep('up')
    alt reached max
      C->>C: emit('max') and stopSpin()
    end
  end
```

## Destroy Sequence
```mermaid
sequenceDiagram
  participant $ as jQuery Wrapper
  participant C as Core
  participant R as Renderer

  $->>C: destroy()
  C->>R: teardown() (remove injected elements)
  C->>C: detach input listeners, stop timers
  C->>C: run registered teardowns (wrapper cleanup)
  C->>C: delete input._touchSpinCore
```

