import type TailwindRenderer from './TailwindRenderer';

declare global {
  interface Window {
    TouchSpin: typeof import('@touchspin/core').TouchSpin;
    TouchSpinCore: typeof import('@touchspin/core').TouchSpinCore;
    getTouchSpin: typeof import('@touchspin/core').getTouchSpin;
    TailwindRenderer: typeof TailwindRenderer;
  }
}

export {};

