import { sharedRendererSuite } from '@touchspin/core/test-helpers/renderers';
import { rendererClassUrlFor } from '@touchspin/core/test-helpers';

const TAILWIND_FIXTURE = '/packages/renderers/tailwind/tests/fixtures/tailwind-clean-fixture.html';

sharedRendererSuite('tailwind', rendererClassUrlFor('tailwind'), TAILWIND_FIXTURE);
