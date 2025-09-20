import { sharedRendererSuite } from '@touchspin/core/test-helpers/renderers';
import { rendererClassUrlFor } from '@touchspin/core/test-helpers';

// Register the shared behavior suite explicitly for Bootstrap 5
sharedRendererSuite('bootstrap5', rendererClassUrlFor('bootstrap5'));