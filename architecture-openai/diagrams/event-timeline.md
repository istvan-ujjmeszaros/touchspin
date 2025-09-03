```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant I as Input
  participant Btn as Button
  participant C as Core
  participant $ as jQuery Wrapper

  U->>Btn: mousedown
  Btn->>C: upOnce()
  C-->>$: emit('startspin'), emit('startupspin')
  loop delay then interval
    C->>C: _spinStep('up')
    alt hits max
      C-->>$: emit('max')
      C->>C: stopSpin()
      C-->>$: emit('stopupspin'), emit('stopspin')
    end
  end
  U->>Btn: mouseup
  C->>C: stopSpin()
  C-->>$: emit('stopupspin'), emit('stopspin')

  Note over I,C: Keyboard: ArrowUp/ArrowDown uses input keydown/keyup<br/>with same start/stop event ordering
```

