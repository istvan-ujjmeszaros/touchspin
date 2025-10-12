import { rendererClassUrlFor } from '@touchspin/core/test-helpers';
import { sharedRendererSuite } from '@touchspin/core/test-helpers/renderers';
import { ensureBootstrap5Globals } from './helpers/bootstrap5-globals';

const BOOTSTRAP5_FIXTURE = '/packages/renderers/bootstrap5/tests/fixtures/bootstrap5-fixture.html';

// Register the shared behavior suite explicitly for Bootstrap 5
sharedRendererSuite('bootstrap5', rendererClassUrlFor('bootstrap5'), BOOTSTRAP5_FIXTURE, {
  setupGlobals: ensureBootstrap5Globals,
});
