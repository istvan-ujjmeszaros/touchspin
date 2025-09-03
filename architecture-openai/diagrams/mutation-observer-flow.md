```mermaid
flowchart TD
  MO[MutationObserver] --> A{attribute}
  A -- disabled/readonly --> B[_updateButtonDisabledState]
  A -- min/max/step --> C[_syncSettingsFromNativeAttributes]
  C --> D[updateSettings(partial)]
  D --> E[_updateAriaAttributes]
```

