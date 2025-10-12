/**
 * TouchSpin React - Bootstrap 4 Renderer
 */

import React, { forwardRef } from 'react';
import { Bootstrap4Renderer } from '@touchspin/renderer-bootstrap4';
import { TouchSpinComponent } from './TouchSpin.js';
import type { TouchSpinProps, TouchSpinHandle } from './types.js';

const TouchSpin = forwardRef<TouchSpinHandle, TouchSpinProps>((props, ref) => {
  return <TouchSpinComponent ref={ref} {...props} renderer={Bootstrap4Renderer} />;
});

TouchSpin.displayName = 'TouchSpin(Bootstrap4)';

export default TouchSpin;
export type { TouchSpinProps, TouchSpinHandle };
