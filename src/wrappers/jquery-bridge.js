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
      function getInternal() { return $input.data('touchspinInternal'); }
      const facade = {
        destroy() {
          const i = getInternal();
          if (i && typeof i.destroy === 'function') return i.destroy();
          $input.trigger('touchspin.destroy');
        },
        getValue() {
          const i = getInternal();
          if (i && typeof i.getValue === 'function') return i.getValue();
          const raw = String($input.val() ?? '');
          const n = parseFloat(raw);
          return Number.isFinite(n) ? n : NaN;
        },
        setValue(v) {
          const i = getInternal();
          if (i && typeof i.setValue === 'function') return i.setValue(v);
          // Fallback: trigger updatesettings then set input
          $input.val(v).trigger('change');
        },
        upOnce() {
          const i = getInternal();
          if (i && typeof i.upOnce === 'function') return i.upOnce();
          $input.trigger('touchspin.uponce');
        },
        downOnce() {
          const i = getInternal();
          if (i && typeof i.downOnce === 'function') return i.downOnce();
          $input.trigger('touchspin.downonce');
        },
        startUpSpin() {
          const i = getInternal();
          if (i && typeof i.startUpSpin === 'function') return i.startUpSpin();
          $input.trigger('touchspin.startupspin');
        },
        startDownSpin() {
          const i = getInternal();
          if (i && typeof i.startDownSpin === 'function') return i.startDownSpin();
          $input.trigger('touchspin.startdownspin');
        },
        stopSpin() {
          const i = getInternal();
          if (i && typeof i.stopSpin === 'function') return i.stopSpin();
          $input.trigger('touchspin.stopspin');
        },
        updateSettings(opts) {
          const i = getInternal();
          if (i && typeof i.updateSettings === 'function') return i.updateSettings(opts || {});
          $input.trigger('touchspin.updatesettings', [opts || {}]);
        },
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
