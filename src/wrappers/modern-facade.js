// Modern facade wrapper - exposes clean TouchSpin API globally
// This is appended to UMD builds to provide modern vanilla JS API

(function() {
  'use strict';

  if (typeof window === 'undefined') return;

  // Helper to normalize selector inputs
  function normalizeTargets(target, root = document) {
    if (target instanceof Element) return [target];
    if (typeof target === 'string') return Array.from(root.querySelectorAll(target));
    if (target?.jquery) return target.toArray();
    return Array.from(target || []);
  }

  // Simple storage for instances (for legacy builds that don't have the modern core)
  const instances = new WeakMap();

  // Get TouchSpin instance from element
  function getTouchSpin(el) {
    if (!(el instanceof Element)) return undefined;

    // Check if we have modern core with element-attached instances
    if (typeof window.getTouchSpin === 'function') {
      return window.getTouchSpin(el);
    }

    // Fallback to local instance storage (for legacy builds)
    return instances.get(el) || null;
  }

  // Main TouchSpin function - element-attached initialization
  function TouchSpin(inputEl, options = {}) {
    if (!(inputEl instanceof Element)) {
      throw new TypeError('TouchSpin expects an HTMLElement');
    }

    // Check if we have the modern core available (standalone builds)
    if (typeof window.TouchSpinCore !== 'undefined') {
      // Add the baked-in renderer if not provided
      if (!options.renderer) {
        // Find the available renderer from the build (e.g., Bootstrap5Renderer, TailwindRenderer)
        const rendererClasses = ['Bootstrap3Renderer', 'Bootstrap4Renderer', 'Bootstrap5Renderer', 'TailwindRenderer'];
        for (const rendererName of rendererClasses) {
          if (typeof window[rendererName] !== 'undefined') {
            options.renderer = window[rendererName];
            break;
          }
        }
      }

      // Use modern core directly (from packages/core)
      const coreInstance = new window.TouchSpinCore(inputEl, options);
      const api = coreInstance.toPublicApi();
      instances.set(inputEl, api);
      return api;
    }

    // Fallback to jQuery if available (legacy or jQuery builds)
    if (typeof $ !== 'undefined') {
      const $input = $(inputEl);

      // Initialize with jQuery plugin and return a simple API wrapper
      $input.TouchSpin(options);

      // Create a simple API wrapper
      const api = {
        upOnce: () => $input.trigger('touchspin.uponce'),
        downOnce: () => $input.trigger('touchspin.downonce'),
        startUpSpin: () => $input.trigger('touchspin.startupspin'),
        startDownSpin: () => $input.trigger('touchspin.startdownspin'),
        stopSpin: () => $input.trigger('touchspin.stopspin'),
        updateSettings: (newSettings) => $input.trigger('touchspin.updatesettings', [newSettings]),
        destroy: () => $input.trigger('touchspin.destroy'),
        getValue: () => $input.val(),
        setValue: (value) => $input.val(value)
      };

      // Store the API wrapper
      instances.set(inputEl, api);
      return api;
    }

    throw new Error('TouchSpin: Neither modern core nor jQuery is available');
  }

  // Single-element methods on TouchSpin namespace
  TouchSpin.get = (el) => (el instanceof Element ? getTouchSpin(el) : undefined);

  TouchSpin.destroy = (el) => {
    const inst = TouchSpin.get(el);
    if (!inst) return false;
    inst.destroy();
    instances.delete(el);
    return true;
  };

  // Multi-element methods (always return clean arrays)
  TouchSpin.initAll = (targets, opts, root) =>
    normalizeTargets(targets, root).map(el => TouchSpin(el, opts));

  TouchSpin.getAll = (targets, root) =>
    normalizeTargets(targets, root)
      .map(getTouchSpin)
      .filter(inst => inst !== null && inst !== undefined);  // Clean array, no undefined

  TouchSpin.destroyAll = (targets, root) =>
    normalizeTargets(targets, root).reduce((n, el) =>
      (TouchSpin.destroy(el) ? n + 1 : n), 0);

  // Expose as global
  window.TouchSpin = TouchSpin;
})();
