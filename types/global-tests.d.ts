declare global {
  // Allow direct `$` usage in fixtures without importing jQuery types.
  var $: unknown;
}

declare module '@touchspin/web-component' {
  export const TouchSpinInput: CustomElementConstructor;
  const TouchSpinElement: CustomElementConstructor;
  export default TouchSpinElement;
}

declare module '/packages/web-component/dist/index.js' {
  export const TouchSpinInput: CustomElementConstructor;
  const TouchSpinElement: CustomElementConstructor;
  export default TouchSpinElement;
}

declare module '@touchspin/webcomponent' {
  export const TouchSpinInput: CustomElementConstructor;
  const TouchSpinElement: CustomElementConstructor;
  export default TouchSpinElement;
}

export {};
