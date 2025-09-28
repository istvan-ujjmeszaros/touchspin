import { TouchSpinCore, getTouchSpin } from '@touchspin/core';
import Bootstrap5Renderer from './Bootstrap5Renderer.js';
declare function TouchSpin(element: HTMLInputElement, options?: Record<string, any>): import("@touchspin/core").TouchSpinCorePublicAPI | null;
declare namespace TouchSpin {
    var get: typeof getTouchSpin;
    var destroy: (element: HTMLInputElement) => boolean;
}
export { TouchSpin, TouchSpinCore, getTouchSpin, Bootstrap5Renderer };
//# sourceMappingURL=entry.d.ts.map