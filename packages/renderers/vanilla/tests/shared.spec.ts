import { sharedRendererSuite } from '@touchspin/core/test-helpers/renderers';
import { vanillaRendererClassUrl } from '@touchspin/core/test-helpers';

const VANILLA_FIXTURE = '/packages/renderers/vanilla/tests/fixtures/vanilla-clean-fixture.html';

sharedRendererSuite('vanilla', vanillaRendererClassUrl, VANILLA_FIXTURE);
