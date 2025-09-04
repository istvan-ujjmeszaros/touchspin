```mermaid
sequenceDiagram
  autonumber
  participant I as Input
  participant C as Core
  participant J as jQuery Wrapper

  Note over I,C: Increment to exact max boundary
  I->>C: upOnce()
  C->>C: compute next respecting step/decimals
  alt next == max
    C-->>J: emit max
    C->>I: setDisplay to max and emit native change
    opt holding
      C->>C: stopSpin()
      C-->>J: emit stopupspin and emit stopspin
    end
  else next < max
    C->>I: setDisplay(next) + native change
  end

  Note over I,C: Decrement to exact min boundary
  I->>C: downOnce()
  C->>C: compute next
  alt next == min
    C-->>J: emit min
    C->>I: setDisplay to min and emit native change
    opt holding
      C->>C: stopSpin()
      C-->>J: emit stopdownspin and emit stopspin
    end
  else next > min
    C->>I: setDisplay(next) + native change
  end
```

