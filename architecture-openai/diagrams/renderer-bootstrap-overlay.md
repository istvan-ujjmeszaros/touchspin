```mermaid
flowchart TB
  subgraph Bootstrap Input Group
    direction LR
    P1([input-group-prepend<br/>prefix]):::prefix
    D1([input-group-prepend<br/>button down]):::down
    I([input.form-control]):::input
    U1([input-group-append<br/>button up]):::up
    P2([input-group-append<br/>postfix]):::postfix
  end

  classDef input fill:#eef,stroke:#88f
  classDef up fill:#efe,stroke:#4b4
  classDef down fill:#fee,stroke:#b44
  classDef prefix fill:#ffd,stroke:#cc4
  classDef postfix fill:#dff,stroke:#4cc

  %% Data roles & testids added: prefix, postfix, up, down with {id}-* testids
  P1 -.-> I
  D1 -.-> I
  U1 -.-> I
  P2 -.-> I

  %% Wrapper
  %% Wrapper is the input-group container

