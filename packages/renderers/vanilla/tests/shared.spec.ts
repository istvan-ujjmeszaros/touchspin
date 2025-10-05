import { vanillaRendererClassUrl } from '@touchspin/core/test-helpers';
import { sharedRendererSuite } from '@touchspin/core/test-helpers/renderers';
import { ensureVanillaGlobals } from './helpers/vanilla-globals';

const VANILLA_FIXTURE = '/packages/renderers/vanilla/tests/fixtures/vanilla-fixture.html';

sharedRendererSuite('vanilla', vanillaRendererClassUrl, VANILLA_FIXTURE, {
  setupGlobals: ensureVanillaGlobals,
});
