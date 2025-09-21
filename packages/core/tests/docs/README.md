# Core TouchSpin Tests

This directory contains behavioral tests for the TouchSpin core package. These tests focus on the core logic and functionality, independent of any UI framework integration.

## Test Structure

### Test Files

- **`value-operations.spec.ts`** - Boundary enforcement, step calculations, value normalization
- **`forcestepdivisibility.spec.ts`** - Step divisibility options (round, floor, ceil, none)
- **`decimal-precision.spec.ts`** - Decimal handling and floating-point precision
- **`spinning.spec.ts`** - Continuous spinning behavior, speed ramping, state management
- **`events.spec.ts`** - Core event system, timing, data, and integration
- **`configuration.spec.ts`** - Settings validation, precedence, and dynamic updates

### Test Fixture

- **`__shared__/fixtures/test-fixture.html`** - Minimal HTML fixture for core testing (no jQuery dependency)

## Implementation Status

⚠️ **These tests are currently placeholders.** They demonstrate the intended structure and coverage but contain TODO comments instead of actual test implementations.

### Why Placeholders?

The core package tests are designed to test TouchSpin's core logic directly, without going through the jQuery plugin wrapper. This requires either:

1. A direct JavaScript API for the core package, or
2. A minimal test harness that can instantiate and interact with core functionality

Currently, TouchSpin's core is primarily accessed through the jQuery plugin, so these tests await the development of a direct core API.

## Test Philosophy

These tests follow the clean testing principles from CLAUDE.md:

### Human-Readable Tests
- **Direct assertions** - No hiding expectations behind variables
- **Clear expected values** - Comments explain calculations like `'55' // 50 + 5`
- **One behavior per test** - Test names clearly describe what's being tested

### Comprehensive Coverage
- **All core behaviors** - Value operations, boundaries, steps, precision
- **Edge cases** - Floating-point issues, large numbers, boundary conditions
- **Error handling** - Invalid inputs, configuration errors
- **Performance** - Memory leaks, long-running operations

### Event Log Integration
- Uses the same event logging system as jQuery plugin tests
- Consistent verification approach across all test suites
- Clear audit trail of all operations and events

## Future Implementation

When implementing these tests:

1. **Replace placeholders** with actual test implementations
2. **Create core API** or test harness for direct core access
3. **Follow naming patterns** established in jQuery plugin tests
4. **Use event log** for all verification
5. **Test real edge cases** not just happy paths

## Test Categories

### Functional Tests
- Value calculation accuracy
- Boundary enforcement
- Step divisibility logic
- Event emission timing

### Quality Tests
- Precision handling
- Memory management
- Error recovery
- Performance under load

### Integration Tests
- Settings interaction
- Event system integration
- Lifecycle management

## Running Tests

```bash
# Run all core tests (when implemented)
yarn exec playwright test packages/core/tests/

# Run specific test file
yarn exec playwright test packages/core/tests/value-operations.spec.ts

# Run with coverage
COVERAGE=1 yarn exec playwright test --config=playwright-coverage.config.ts packages/core/tests/
```

## Coverage Goals

These tests are designed to achieve **100% coverage** of core TouchSpin functionality:

- **Statements**: Every line of core logic executed
- **Branches**: Every conditional path taken
- **Functions**: Every core method called
- **Lines**: Complete line coverage

The core tests will complement the jQuery plugin tests to ensure comprehensive coverage across the entire TouchSpin system.
