```mermaid
flowchart TB
  subgraph Tailwind Wrapper
    direction LR
    P1([prefix]):::prefix
    D1([button down]):::down
    I([input]):::input
    U1([button up]):::up
    P2([postfix]):::postfix
  end

  classDef input fill:#eef,stroke:#88f
  classDef up fill:#efe,stroke:#4b4
  classDef down fill:#fee,stroke:#b44
  classDef prefix fill:#ffd,stroke:#cc4
  classDef postfix fill:#dff,stroke:#4cc

  %% Data roles & testids
  P1 ---|data-touchspin-injected=prefix and data-testid={id}-prefix| P1
  P2 ---|data-touchspin-injected=postfix and data-testid={id}-postfix| P2
  U1 ---|data-touchspin-injected=up and data-testid={id}-up| U1
  D1 ---|data-touchspin-injected=down and data-testid={id}-down| D1

  P1 -.-> I
  D1 -.-> I
  U1 -.-> I
  P2 -.-> I
```
