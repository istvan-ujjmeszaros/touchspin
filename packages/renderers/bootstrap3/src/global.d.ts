import type Bootstrap3Renderer from './Bootstrap3Renderer';

declare global {
  interface Window {
    TouchSpin: typeof import('@touchspin/core').TouchSpin;
    TouchSpinCore: typeof import('@touchspin/core').TouchSpinCore;
    getTouchSpin: typeof import('@touchspin/core').getTouchSpin;
    Bootstrap3Renderer: typeof Bootstrap3Renderer;
  }
}
