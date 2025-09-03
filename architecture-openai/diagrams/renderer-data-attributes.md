```mermaid
flowchart LR
  I[(input[data-testid="id"]) ] --> W[wrapper div]
  W --> U[button up]
  W --> D[button down]
  W --> P1[prefix]
  W --> P2[postfix]

  W ---|data-touchspin-injected="wrapper"| W
  U ---|data-touchspin-injected="up"| U
  D ---|data-touchspin-injected="down"| D
  P1 ---|data-touchspin-injected="prefix"| P1
  P2 ---|data-touchspin-injected="postfix"| P2

  W ---|data-testid="id-wrapper"| W
  U ---|data-testid="id-up"| U
  D ---|data-testid="id-down"| D
  P1 ---|data-testid="id-prefix"| P1
  P2 ---|data-testid="id-postfix"| P2
```

