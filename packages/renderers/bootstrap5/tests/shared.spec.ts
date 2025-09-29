import { sharedRendererSuite } from '@touchspin/core/test-helpers/renderers';
import { rendererClassUrlFor } from '@touchspin/core/test-helpers';

const BOOTSTRAP5_FIXTURE = '/packages/renderers/bootstrap5/tests/fixtures/bootstrap5-clean-fixture.html';

// Register the shared behavior suite explicitly for Bootstrap 5
sharedRendererSuite('bootstrap5', rendererClassUrlFor('bootstrap5'), BOOTSTRAP5_FIXTURE);
