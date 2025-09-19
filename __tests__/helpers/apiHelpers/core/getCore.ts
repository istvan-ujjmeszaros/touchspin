import type { TouchSpinCorePublicAPI } from '../../../../packages/core/test-helpers/types';

type WithCore = HTMLInputElement & { _touchSpinCore?: TouchSpinCorePublicAPI };

export function hasCore(input: HTMLInputElement): input is WithCore {
  return Boolean((input as WithCore)._touchSpinCore);
}

export function getCoreFromInput(input: HTMLInputElement): TouchSpinCorePublicAPI {
  const core = (input as WithCore)._touchSpinCore;
  if (!core) throw new Error('TouchSpinCore not found on input');
  return core;
}

