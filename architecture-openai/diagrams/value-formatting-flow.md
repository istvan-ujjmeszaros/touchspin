```mermaid
flowchart TD
  A[raw input value (string)] --> B[callback_before_calculation]
  B --> C[parseFloat]
  C -->|NaN| D[empty / replacementval]
  C -->|number| E[forcestepdivisibility]
  E --> F[decimals toFixed]
  F --> G[callback_after_calculation]
  G --> H[display value]
  D --> H
```

