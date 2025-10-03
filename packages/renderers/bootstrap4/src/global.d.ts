import type Bootstrap4Renderer from './Bootstrap4Renderer';

declare global {
  interface Window {
    TouchSpin: typeof import('@touchspin/core').TouchSpin;
    TouchSpinCore: typeof import('@touchspin/core').TouchSpinCore;
    getTouchSpin: typeof import('@touchspin/core').getTouchSpin;
    Bootstrap4Renderer: typeof Bootstrap4Renderer;
  }
}
