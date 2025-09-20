# TouchSpin Test Helpers

Shared test infrastructure for all TouchSpin packages.

## Coverage Switches

Set `PW_COVERAGE=1` to:
- Prefer `/devdist` URLs via runtime paths
- Enable CDP coverage collection
- Run coverage globalSetup/Teardown

## Usage

```typescript
import * as apiHelpers from '@touchspin/core/test-helpers';

// Initialize TouchSpin with jQuery plugin
await apiHelpers.initializeTouchspinJQuery(page, 'test-input', {
  step: 5,
  min: 0,
  max: 100
});

// Core-only initialization (no renderer)
import { initializeTouchspin } from '../test-helpers/core-adapter';
await initializeTouchspin(page, 'test-input', {
  step: 5,
  initval: 50
});
```

## Test Helpers Organization

- `core/` - Core initialization and API operations
- `events/` - Event logging and tracking
- `interactions/` - User interactions (clicks, keyboard, wheel)
- `assertions/` - Polled expectations and value checks
- `test-utilities/` - Coverage and test setup utilities
- `runtime/` - Runtime configuration and path resolution