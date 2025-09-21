# Shared Test Fixtures

This directory contains HTML fixtures that are shared across all TouchSpin package tests.

## Available Fixtures

- **minimal.html** - Simplest possible fixture with a single input
- **multi.html** - Multiple inputs for testing multiple instances
- **test-fixture.html** - Standard test fixture with event logging
- **ab-compare.html** - A/B comparison fixture for testing different configurations

## Usage

### From any test file:

```typescript
import { fixtureUrl, FixtureUrls } from '@touchspin/core/tests/__shared__/fixtures';

// Using the helper function
await page.goto(fixtureUrl('minimal'));

// Using pre-defined URLs
await page.goto(FixtureUrls.testFixture);
```

### From package.json exports:

```typescript
import { fixtureUrl } from '@touchspin/core/tests/__shared__/fixtures';
```

## Guidelines

1. Keep fixtures minimal - only include what's necessary for testing
2. Use data-testid attributes for reliable selection
3. Avoid package-specific markup in shared fixtures
4. Document any special requirements or behaviors