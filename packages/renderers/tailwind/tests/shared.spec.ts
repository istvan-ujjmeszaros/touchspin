import { rendererClassUrlFor } from '@touchspin/core/test-helpers';
import { sharedRendererSuite } from '@touchspin/core/test-helpers/renderers';
import { ensureTailwindGlobals } from './helpers/tailwind-globals';

const TAILWIND_FIXTURE = '/packages/renderers/tailwind/tests/fixtures/tailwind-fixture.html';

sharedRendererSuite('tailwind', rendererClassUrlFor('tailwind'), TAILWIND_FIXTURE, {
  setupGlobals: ensureTailwindGlobals,
  ignoreTests: ['horizontal: buttons/prefix/postfix render with texts/classes and focusability'],
});
