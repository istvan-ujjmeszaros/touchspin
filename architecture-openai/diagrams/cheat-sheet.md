```mermaid
flowchart LR
  subgraph User
    U1[$(input).TouchSpin(opts)]
    U2[trigger('touchspin.*')]
    U3[native interaction]
  end

  subgraph Wrapper
    W1[parse opts/commands]
    W2[bridge core events -> jQuery]
  end

  subgraph Core
    C1[TouchSpin(input,opts)]
    C2[Value pipeline<br/>before->parse->forcestep->decimals->after]
    C3[Spin logic<br/>start/stop/upOnce/downOnce]
    C4[Settings
        sanitize/align/notify]
    C5[ARIA + Native attrs]
  end

  subgraph Renderer
    R1[Build DOM + testids]
    R2[attachUp/DownEvents]
    R3[observeSetting]
  end

  U1 --> W1 --> C1 --> R1
  R1 --> R2 --> C3
  U2 --> W1 --> C3
  U3 --> C3
  C3 --> C2 --> C5
  C4 --> C5
  C3 --> W2
```

