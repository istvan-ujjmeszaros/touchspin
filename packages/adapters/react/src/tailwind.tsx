/**
 * TouchSpin React - Tailwind Renderer
 */

import { TailwindRenderer } from '@touchspin/renderer-tailwind';
import React, { forwardRef } from 'react';
import { TouchSpinComponent } from './TouchSpin.js';
import type { TouchSpinHandle, TouchSpinProps } from './types.js';

const TouchSpin = forwardRef<TouchSpinHandle, TouchSpinProps>((props, ref) => {
  return <TouchSpinComponent ref={ref} {...props} renderer={TailwindRenderer} />;
});

TouchSpin.displayName = 'TouchSpin(Tailwind)';

export default TouchSpin;
export type { TouchSpinProps, TouchSpinHandle };
