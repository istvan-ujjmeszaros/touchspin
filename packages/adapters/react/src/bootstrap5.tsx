/**
 * TouchSpin React - Bootstrap 5 Renderer
 */

import React, { forwardRef } from 'react';
import { Bootstrap5Renderer } from '@touchspin/renderer-bootstrap5';
import { TouchSpinComponent } from './TouchSpin.js';
import type { TouchSpinProps, TouchSpinHandle } from './types.js';

/**
 * TouchSpin component with Bootstrap 5 renderer
 *
 * @example
 * ```tsx
 * import TouchSpin from '@touchspin/react/bootstrap5';
 *
 * function App() {
 *   const [value, setValue] = useState(50);
 *   return <TouchSpin value={value} onChange={setValue} min={0} max={100} />;
 * }
 * ```
 */
const TouchSpin = forwardRef<TouchSpinHandle, TouchSpinProps>((props, ref) => {
  return <TouchSpinComponent ref={ref} {...props} renderer={Bootstrap5Renderer} />;
});

TouchSpin.displayName = 'TouchSpin(Bootstrap5)';

export default TouchSpin;
export type { TouchSpinProps, TouchSpinHandle };
