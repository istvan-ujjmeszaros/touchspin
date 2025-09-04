```mermaid
flowchart LR
  %% High-level call graph (selected paths)
  Start[TouchSpin(input, opts)] --> R[renderer.init()]
  R --> H[initDOMEventHandling]
  H --> KL[keydown/keyup/wheel]
  H --> CH[change capture]
  H --> BL[blur]

  KL --> SU[startUpSpin]
  KL --> SD[startDownSpin]
  SU --> _S[_startSpin]
  SD --> _S
  _S --> SS[_spinStep]
  SS --> UO[upOnce]
  SS --> DO[downOnce]
  UO --> NV[_nextValue]
  DO --> NV
  NV --> AC[_applyConstraints]
  AC --> FD[_forcestepdivisibility]
  UO --> SDIS[_setDisplay]
  DO --> SDIS
  SDIS --> UA[_updateAriaAttributes]

  BL --> CV[_checkValue]
  CH --> CV
  CV --> SDIS

  Stop[stopSpin] --> Round[round-on-release]
  Round --> SDIS
```
