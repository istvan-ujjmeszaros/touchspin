// Modern facade wrapper for Bootstrap TouchSpin.
//
// Purpose: Provide a method-only API without requiring callers to use jQuery
// directly. This wrapper installs on top of the classic jQuery plugin without
// changing its internals or behavior. It mirrors the inline facade currently
// present in the UMD plugin so we can later move/trim that inline code.
//
// Usage in dev/manual pages only (LGTM-7a):
//   1) Load the classic plugin first (src/jquery.bootstrap-touchspin.js or dist/*)
//   2) Then load this file (as a module or classic script).
//
// Notes:
// - Idempotent: If the facade is already installed (by the plugin), this is a no-op.
// - No behavior change: Methods delegate to the plugin’s internal API exposed
//   via $(el).data('touchspinInternal').

/* global window */

export function installModernFacade($) {
  try {
    if (typeof window === 'undefined') return;
    // Require jQuery + plugin present
    if (!$ || !$.fn || typeof $.fn.TouchSpin !== 'function') return;

    // If already installed by the plugin or a previous load, skip.
    const _Element = (typeof globalThis !== 'undefined' && /** @type {any} */ (globalThis).Element) || undefined;
    const hasElementProto = !!(_Element && _Element.prototype && _Element.prototype.TouchSpin);
    const hasGlobal = !!(window.TouchSpin && typeof window.TouchSpin.attach === 'function');
    if (hasElementProto && hasGlobal) return;

    // Install global facade
    window.TouchSpin = window.TouchSpin || {};
    window.TouchSpin.attach = function (input, opts) {
      const el = (input && input.nodeType === 1) ? input : document.querySelector(input);
      if (!el) throw new Error('TouchSpin.attach: invalid element');
      const $el = $(el);
      $el.TouchSpin(opts);
      const api = $el.data('touchspinInternal');
      if (!api) throw new Error('TouchSpin failed to initialize');
      return {
        upOnce: api.upOnce,
        downOnce: api.downOnce,
        startUpSpin: api.startUpSpin,
        startDownSpin: api.startDownSpin,
        stopSpin: api.stopSpin,
        updateSettings: api.updateSettings,
        getValue: api.getValue,
        setValue: api.setValue,
        destroy: api.destroy
      };
    };

    // Add convenience on Element.prototype
    if (_Element && _Element.prototype && !_Element.prototype.TouchSpin) {
      Object.defineProperty(_Element.prototype, 'TouchSpin', {
        configurable: true,
        writable: true,
        value: function (opts) { return window.TouchSpin.attach(this, opts); }
      });
    }
  } catch (e) {
    // Silently ignore to avoid breaking manual pages
  }
}

// Auto-install if jQuery is on window (manual pages only)
try {
  if (typeof window !== 'undefined' && window.jQuery) {
    installModernFacade(window.jQuery);
  }
} catch {}

export default installModernFacade;

