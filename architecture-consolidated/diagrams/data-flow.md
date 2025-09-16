```mermaid
flowchart TD
    %% User Interactions
    subgraph "User Interactions"
        UI_Button["Button Click<br/>(Up/Down)"]
        UI_Input["Direct Input<br/>(Typing)"]
        UI_Wheel["Mouse Wheel<br/>(Focused)"]
        UI_Key["Keyboard<br/>(Arrow Keys)"]
        UI_API["API Call<br/>(setValue)"]
    end
    
    %% Input Processing
    subgraph "Input Processing"
        Capture["Input Capture<br/>(Native Events)"]
        Parse["Value Parsing<br/>(parseFloat)"]
        Validate["Input Validation<br/>(Sanitize)"]
    end
    
    %% Core Processing Pipeline
    subgraph "Core Value Pipeline"
        Current["Get Current Value<br/>(getValue)"]
        Calculate["Calculate Next Value<br/>(±step, booster)"]
        Boundary["Boundary Check<br/>(Proactive)"]
        Constraint["Apply Constraints<br/>(min/max/step)"]
        Format["Format Value<br/>(decimals, divisibility)"]
    end
    
    %% Event System
    subgraph "Event System"
        Emit["Emit Core Events<br/>(min/max/change)"]
        Bridge["jQuery Bridge<br/>(touchspin.on.*)"]
        Listen["Event Listeners<br/>(User Callbacks)"]
    end
    
    %% Display System
    subgraph "Display Update"
        SetDisplay["Set Display Value<br/>(_setDisplay)"]
        UpdateDOM["Update DOM<br/>(input.value)"]
        UpdateARIA["Update ARIA<br/>(valuenow, valuetext)"]
        NativeSync["Sync Native Attrs<br/>(type=number only)"]
        TriggerChange["Trigger Native<br/>(change event)"]
    end
    
    %% Renderer Integration
    subgraph "Renderer System"
        PrefixUpdate["Update Prefix<br/>(observeSetting)"]
        PostfixUpdate["Update Postfix<br/>(observeSetting)"]
        ButtonState["Update Button States<br/>(disabled at boundary)"]
        Visual["Visual Feedback<br/>(CSS classes)"]
    end
    
    %% Settings Management
    subgraph "Settings Pipeline"
        SettingsInput["Settings Update<br/>(updateSettings)"]
        PartialSanitize["Partial Sanitization<br/>(Pre-merge)"]
        Merge["Merge Settings<br/>({...old, ...new})"]
        FullSanitize["Full Sanitization<br/>(Post-merge)"]
        AlignBounds["Align Boundaries<br/>(Step alignment)"]
        NotifyObservers["Notify Observers<br/>(Renderers)"]
    end
    
    %% Data Flow Connections
    
    %% User Input Flows
    UI_Button --> Capture
    UI_Wheel --> Capture
    UI_Key --> Capture
    UI_Input --> Parse
    UI_API --> Current
    
    %% Input Processing Flow
    Capture --> Current
    Parse --> Validate
    Validate --> Current
    
    %% Core Pipeline Flow
    Current --> Calculate
    Calculate --> Boundary
    Boundary -->|"At Boundary"| Emit
    Boundary -->|"Within Range"| Constraint
    Constraint --> Format
    Format --> SetDisplay
    
    %% Event Flow
    Emit --> Bridge
    Bridge --> Listen
    SetDisplay --> Emit
    
    %% Display Flow
    SetDisplay --> UpdateDOM
    SetDisplay --> UpdateARIA
    SetDisplay --> NativeSync
    SetDisplay --> TriggerChange
    UpdateDOM --> Visual
    
    %% Renderer Flow
    SetDisplay --> PrefixUpdate
    SetDisplay --> PostfixUpdate
    SetDisplay --> ButtonState
    Boundary --> ButtonState
    
    %% Settings Flow
    SettingsInput --> PartialSanitize
    PartialSanitize --> Merge
    Merge --> FullSanitize
    FullSanitize --> AlignBounds
    AlignBounds --> NotifyObservers
    NotifyObservers --> PrefixUpdate
    NotifyObservers --> PostfixUpdate
    
    %% Feedback Loops
    TriggerChange -.->|"User Event"| Listen
    ButtonState -.->|"Visual Feedback"| UI_Button
    Visual -.->|"State Indication"| UI_Input
    
    %% Data Labels
    Capture -.- |"Raw Events"| Parse
    Parse -.- |"String Value"| Validate
    Validate -.- |"Sanitized String"| Current
    Current -.- |"Numeric Value"| Calculate
    Calculate -.- |"Next Value"| Boundary
    Boundary -.- |"Validated Value"| Constraint
    Constraint -.- |"Constrained Value"| Format
    Format -.- |"Formatted Value"| SetDisplay
    SetDisplay -.- |"Display String"| UpdateDOM
    
    %% Styling
    classDef userStyle fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef processStyle fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef coreStyle fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef eventStyle fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef displayStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef rendererStyle fill:#fff8e1,stroke:#f57f17,stroke-width:2px
    classDef settingsStyle fill:#e0f2f1,stroke:#00695c,stroke-width:2px
    
    %% Apply Styles
    class UI_Button,UI_Input,UI_Wheel,UI_Key,UI_API userStyle
    class Capture,Parse,Validate processStyle
    class Current,Calculate,Boundary,Constraint,Format coreStyle
    class Emit,Bridge,Listen eventStyle
    class SetDisplay,UpdateDOM,UpdateARIA,NativeSync,TriggerChange displayStyle
    class PrefixUpdate,PostfixUpdate,ButtonState,Visual rendererStyle
    class SettingsInput,PartialSanitize,Merge,FullSanitize,AlignBounds,NotifyObservers settingsStyle
```

## Data Flow Explanation

This diagram shows how data flows through the TouchSpin system from user input to display update.

### Primary Data Paths

**1. User Interaction → Display Update**
- User clicks button or types value
- Input captured and parsed
- Core pipeline processes value
- Display updated with new value

**2. API Call → Display Update**
- External code calls `setValue()`
- Value goes through constraint pipeline
- Display updated if value changed

**3. Settings Update → Renderer Update**
- Settings changed via `updateSettings()`
- Sanitization and validation applied
- Observers notified of changes
- Renderers update visual elements

### Key Processing Stages

**Input Processing:**
- Raw input captured from various sources
- String values parsed to numbers
- Basic validation and sanitization

**Core Value Pipeline:**
- Current value retrieved
- Next value calculated (with booster logic)
- Proactive boundary checking
- Constraints applied (min/max/step)
- Value formatted for display

**Event System:**
- Core events emitted at key points
- jQuery bridge translates to legacy events
- User callbacks invoked

**Display System:**
- Input field value updated
- ARIA attributes updated for accessibility
- Native attributes synced (type="number" only)
- Native change event triggered

**Renderer Integration:**
- Visual elements updated (prefix/postfix)
- Button states managed (disabled at boundaries)
- CSS classes applied for feedback

### Data Validation Points

**1. Input Validation**
- String sanitization
- Number parsing
- Basic format checks

**2. Boundary Validation (Proactive)**
- Check before operation
- Prevent unnecessary calculations
- Emit boundary events

**3. Constraint Application**
- Min/max enforcement
- Step alignment
- Decimal precision

**4. Settings Sanitization**
- Pre-merge partial validation
- Post-merge full validation
- Boundary alignment
- Observer notification

### Event Flow

**Core Events:**
- `change` - Value changed
- `min`/`max` - Boundary reached
- `startspin`/`stopspin` - Spinning state
- `boostchange` - Acceleration changed

**jQuery Bridge Events:**
- `touchspin.on.change`
- `touchspin.on.min`/`touchspin.on.max`
- `touchspin.on.startspin`/`touchspin.on.stopspin`

### Feedback Loops

**Visual Feedback:**
- Button states reflect current boundaries
- CSS classes indicate spinner state
- ARIA attributes provide accessibility info

**Event Feedback:**
- Native change events trigger user handlers
- Button visual feedback affects user interaction
- State indication guides user behavior

This data flow ensures consistent, predictable behavior while maintaining separation of concerns between input processing, core logic, event handling, and display management.