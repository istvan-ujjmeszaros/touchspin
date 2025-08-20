/**
 * Bootstrap TouchSpin Renderers
 * Entry point for all renderer classes
 */

// Load all renderer classes
if (typeof require !== 'undefined') {
  // CommonJS/Node.js environment
  global.BootstrapRenderer = require('./BootstrapRenderer');
  global.Bootstrap3Renderer = require('./Bootstrap3Renderer');
  global.Bootstrap4Renderer = require('./Bootstrap4Renderer');
  global.Bootstrap5Renderer = require('./Bootstrap5Renderer');
  global.TailwindRenderer = require('./TailwindRenderer');
  global.RendererFactory = require('./RendererFactory');

  module.exports = {
    BootstrapRenderer: global.BootstrapRenderer,
    Bootstrap3Renderer: global.Bootstrap3Renderer,
    Bootstrap4Renderer: global.Bootstrap4Renderer,
    Bootstrap5Renderer: global.Bootstrap5Renderer,
    TailwindRenderer: global.TailwindRenderer,
    RendererFactory: global.RendererFactory
  };
} else if (typeof window !== 'undefined') {
  // Browser environment - classes are already loaded via script tags
  // or will be loaded by the build system

  if (typeof window.TouchSpinRenderers === 'undefined') {
    window.TouchSpinRenderers = {
      BootstrapRenderer: window.BootstrapRenderer,
      Bootstrap3Renderer: window.Bootstrap3Renderer,
      Bootstrap4Renderer: window.Bootstrap4Renderer,
      Bootstrap5Renderer: window.Bootstrap5Renderer,
      TailwindRenderer: window.TailwindRenderer,
      RendererFactory: window.RendererFactory
    };
  }
}