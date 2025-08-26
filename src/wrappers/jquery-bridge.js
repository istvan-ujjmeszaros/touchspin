// Lightweight jQuery bridge that adds a method facade to the existing
// TouchSpin jQuery plugin without changing its internals.
//
// Usage: load the classic plugin first, then include this file as a
// <script type="module"> so it runs after the plugin is available.

/* global window */

function installBridge($) {
  if (!$ || !$.fn || typeof $.fn.TouchSpin !== 'function') return;

  const original = $.fn.TouchSpin;

  $.fn.TouchSpin = function patchedTouchSpin() {
    const ret = original.apply(this, arguments);
    this.each(function () {
      const $input = $(this);
      // Attach a simple facade that re-triggers callable events.
      const facade = {
        upOnce() { $input.trigger('touchspin.uponce'); },
        downOnce() { $input.trigger('touchspin.downonce'); },
        startUpSpin() { $input.trigger('touchspin.startupspin'); },
        startDownSpin() { $input.trigger('touchspin.startdownspin'); },
        stopSpin() { $input.trigger('touchspin.stopspin'); },
        updateSettings(opts) { $input.trigger('touchspin.updatesettings', [opts || {}]); },
      };
      $input.data('touchspin', facade);

      // Clean up facade reference on explicit destroy trigger
      $input.on('touchspin.destroy.bridge', function () {
        $input.removeData('touchspin');
      });
    });
    return ret;
  };
}

// Auto-install when jQuery + plugin is present on window
if (typeof window !== 'undefined' && window.jQuery) {
  try { installBridge(window.jQuery); } catch {}
}

export default installBridge;

