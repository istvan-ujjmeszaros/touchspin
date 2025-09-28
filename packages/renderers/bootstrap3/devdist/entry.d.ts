import { TouchSpinCore, getTouchSpin } from '@touchspin/core';
import Bootstrap3Renderer from './Bootstrap3Renderer.js';
declare function TouchSpin(element: HTMLInputElement, options?: Record<string, any>): import("@touchspin/core").TouchSpinCorePublicAPI | null;
declare namespace TouchSpin {
    var get: typeof getTouchSpin;
    var destroy: (element: HTMLInputElement) => boolean;
}
export { TouchSpin, TouchSpinCore, getTouchSpin, Bootstrap3Renderer };
//# sourceMappingURL=entry.d.ts.map