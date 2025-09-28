import { TouchSpin as CoreTouchSpin, TouchSpinCore, getTouchSpin } from '@touchspin/core';
import TailwindRenderer from './TailwindRenderer.js';
declare function TouchSpin(element: HTMLInputElement, options?: Record<string, any>): ReturnType<typeof CoreTouchSpin>;
declare namespace TouchSpin {
    var get: typeof getTouchSpin;
    var destroy: (element: HTMLInputElement) => boolean;
}
export { TouchSpin, TouchSpinCore, getTouchSpin, TailwindRenderer };
//# sourceMappingURL=entry.d.ts.map