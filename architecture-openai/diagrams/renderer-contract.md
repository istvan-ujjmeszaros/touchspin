```mermaid
flowchart LR
  R[Renderer.init()] --> B[Build DOM wrapper]
  B --> P1[Prefix element]
  B --> P2[Postfix element]
  B --> U[Up button]
  B --> D[Down button]
  B --> W[Wrapper testid: {input}-wrapper]
  U -->|data-testid {input}-up| U
  D -->|data-testid {input}-down| D
  P1 -->|data-testid {input}-prefix| P1
  P2 -->|data-testid {input}-postfix| P2
  U --> AE[core.attachUpEvents(U)]
  D --> AD[core.attachDownEvents(D)]
  subgraph Reactive
    O1[core.observeSetting('prefix', cb)]
    O2[core.observeSetting('postfix', cb)]
    O3[core.observeSetting('button*', cb)]
  end
```

