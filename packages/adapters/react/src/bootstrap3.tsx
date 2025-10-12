/**
 * TouchSpin React - Bootstrap 3 Renderer
 */

import React, { forwardRef } from 'react';
import { Bootstrap3Renderer } from '@touchspin/renderer-bootstrap3';
import { TouchSpinComponent } from './TouchSpin.js';
import type { TouchSpinProps, TouchSpinHandle } from './types.js';

const TouchSpin = forwardRef<TouchSpinHandle, TouchSpinProps>((props, ref) => {
  return <TouchSpinComponent ref={ref} {...props} renderer={Bootstrap3Renderer} />;
});

TouchSpin.displayName = 'TouchSpin(Bootstrap3)';

export default TouchSpin;
export type { TouchSpinProps, TouchSpinHandle };
