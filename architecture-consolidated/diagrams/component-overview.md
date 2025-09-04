```mermaid
graph TB
    %% Original Architecture
    subgraph "Original Architecture (Monolithic)"
        OrigJQ["jQuery Plugin<br/>$.fn.TouchSpin"]
        OrigCore["Monolithic Core<br/>(1500+ lines)"]
        OrigRenderer["External Renderers<br/>(Bootstrap 3/4/5)"]
        
        OrigJQ --> OrigCore
        OrigCore --> OrigRenderer
    end

    %% New Architecture
    subgraph "New Architecture (Modular)"
        subgraph "packages/core/"
            NewCore["TouchSpinCore<br/>(Framework Agnostic)"]
            AbstractRend["AbstractRenderer<br/>(Base Class)"]
            Factory["Factory Functions<br/>(TouchSpin, getTouchSpin)"]
        end
        
        subgraph "packages/jquery-plugin/"
            JQWrapper["jQuery Wrapper<br/>(Minimal Bridge)"]
        end
        
        subgraph "packages/renderers/"
            BS5["Bootstrap5Renderer"]
            BS4["Bootstrap4Renderer"] 
            BS3["Bootstrap3Renderer"]
            TW["TailwindRenderer"]
        end
    end

    %% External Dependencies
    subgraph "External Dependencies"
        jQuery["jQuery<br/>(Optional)"]
        Bootstrap["Bootstrap<br/>(CSS Framework)"]
        Tailwind["Tailwind CSS<br/>(CSS Framework)"]
        Browser["Browser APIs<br/>(DOM, Events)"]
    end

    %% Application Layer
    subgraph "Application Code"
        UserApp["User Application"]
        Tests["Test Suite"]
        Examples["Demo Pages"]
    end

    %% Relationships - New Architecture
    JQWrapper --> Factory
    Factory --> NewCore
    NewCore --> AbstractRend
    AbstractRend <-- BS5
    AbstractRend <-- BS4
    AbstractRend <-- BS3
    AbstractRend <-- TW
    
    %% External Dependencies - New
    JQWrapper -.-> jQuery
    BS5 -.-> Bootstrap
    BS4 -.-> Bootstrap  
    BS3 -.-> Bootstrap
    TW -.-> Tailwind
    NewCore --> Browser
    
    %% Application Usage - New
    UserApp --> JQWrapper
    UserApp --> Factory
    Tests --> NewCore
    Examples --> JQWrapper

    %% External Dependencies - Original
    OrigJQ --> jQuery
    OrigRenderer -.-> Bootstrap
    OrigCore --> Browser

    %% Application Usage - Original  
    UserApp --> OrigJQ
    Tests --> OrigCore
    Examples --> OrigJQ

    %% Styling
    classDef original fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef newCore fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef renderer fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef wrapper fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef external fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef app fill:#f1f8e9,stroke:#558b2f,stroke-width:2px

    class OrigJQ,OrigCore,OrigRenderer original
    class NewCore,AbstractRend,Factory newCore
    class BS5,BS4,BS3,TW renderer
    class JQWrapper wrapper
    class jQuery,Bootstrap,Tailwind,Browser external
    class UserApp,Tests,Examples app

    %% Notes
    note1["Key Transformation:<br/>• Monolithic → Modular<br/>• jQuery-dependent → Framework-agnostic<br/>• Closure-based → Class-based<br/>• Single file → Multi-package"]
    note1 -.-> NewCore
```

