/**
 * TouchSpin React - Vanilla Renderer
 */

import React, { forwardRef } from 'react';
import { VanillaRenderer } from '@touchspin/renderer-vanilla';
import { TouchSpinComponent } from './TouchSpin.js';
import type { TouchSpinProps, TouchSpinHandle } from './types.js';

const TouchSpin = forwardRef<TouchSpinHandle, TouchSpinProps>((props, ref) => {
  return <TouchSpinComponent ref={ref} {...props} renderer={VanillaRenderer} />;
});

TouchSpin.displayName = 'TouchSpin(Vanilla)';

export default TouchSpin;
export type { TouchSpinProps, TouchSpinHandle };
