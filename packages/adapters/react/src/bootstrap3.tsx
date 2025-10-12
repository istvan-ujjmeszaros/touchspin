/**
 * TouchSpin React - Bootstrap 3 Renderer
 */

import { Bootstrap3Renderer } from '@touchspin/renderer-bootstrap3';
import { forwardRef } from 'react';
import { TouchSpinComponent } from './TouchSpin.js';
import type { TouchSpinHandle, TouchSpinProps } from './types.js';

const TouchSpin = forwardRef<TouchSpinHandle, TouchSpinProps>((props, ref) => {
  return <TouchSpinComponent ref={ref} {...props} renderer={Bootstrap3Renderer} />;
});

TouchSpin.displayName = 'TouchSpin(Bootstrap3)';

export default TouchSpin;
export type { TouchSpinProps, TouchSpinHandle };
