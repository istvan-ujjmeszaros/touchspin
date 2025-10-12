/**
 * TouchSpin React - Vanilla Renderer
 */

import { VanillaRenderer } from '@touchspin/renderer-vanilla';
import React, { forwardRef } from 'react';
import { TouchSpinComponent } from './TouchSpin.js';
import type { TouchSpinHandle, TouchSpinProps } from './types.js';

const TouchSpin = forwardRef<TouchSpinHandle, TouchSpinProps>((props, ref) => {
  return <TouchSpinComponent ref={ref} {...props} renderer={VanillaRenderer} />;
});

TouchSpin.displayName = 'TouchSpin(Vanilla)';

export default TouchSpin;
export type { TouchSpinProps, TouchSpinHandle };
