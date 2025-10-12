/**
 * TouchSpin React - Tailwind Renderer
 */

import React, { forwardRef } from 'react';
import { TailwindRenderer } from '@touchspin/renderer-tailwind';
import { TouchSpinComponent } from './TouchSpin.js';
import type { TouchSpinProps, TouchSpinHandle } from './types.js';

const TouchSpin = forwardRef<TouchSpinHandle, TouchSpinProps>((props, ref) => {
  return <TouchSpinComponent ref={ref} {...props} renderer={TailwindRenderer} />;
});

TouchSpin.displayName = 'TouchSpin(Tailwind)';

export default TouchSpin;
export type { TouchSpinProps, TouchSpinHandle };
