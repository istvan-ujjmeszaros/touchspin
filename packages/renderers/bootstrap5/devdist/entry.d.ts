import { TouchSpinCore, getTouchSpin } from '@touchspin/core';
import Bootstrap5Renderer from './Bootstrap5Renderer';
declare function TouchSpin(element: HTMLInputElement, options?: Record<string, any>): any;
declare namespace TouchSpin {
    var get: any;
    var destroy: (element: HTMLInputElement) => boolean;
}
export { TouchSpin, TouchSpinCore, getTouchSpin, Bootstrap5Renderer };
//# sourceMappingURL=entry.d.ts.map