import { TouchSpin, getTouchSpin, TouchSpinCallableEvent } from '@touchspin/core';
// Re-export event types for external use
export { TouchSpinCallableEvent, TouchSpinEmittedEvent } from '@touchspin/core';
/**
 * Install a minimal jQuery plugin wrapper that just forwards everything to core.
 * Contains NO logic - only forwards commands and events.
 * Core manages its own instance lifecycle on the input element.
 * @param {import('jquery').JQueryStatic} $
 */
export function installJqueryTouchSpin($) {
    // Define the plugin with typed params and jQuery context
    $.fn.TouchSpin = function (options, arg) {
        // Command API - forward to core (core manages instance lifecycle)
        if (typeof options === 'string') {
            const cmd = String(options).toLowerCase();
            let ret;
            this.each(function () {
                const inputEl = this;
                const api = getTouchSpin(inputEl);
                // Handle get/getvalue specially - fall back to raw input value if no instance
                if ((cmd === 'getvalue' || cmd === 'get') && ret === undefined) {
                    if (api) {
                        ret = api.getValue();
                    }
                    else {
                        // No TouchSpin instance - return raw input value
                        ret = inputEl.value;
                    }
                    return; // Skip other commands if no instance
                }
                if (!api)
                    return; // No instance exists - other commands ignored
                switch (cmd) {
                    case 'destroy':
                        api.destroy();
                        break; // Core removes instance from element
                    case 'uponce':
                        api.upOnce();
                        break;
                    case 'downonce':
                        api.downOnce();
                        break;
                    case 'startupspin':
                        api.startUpSpin();
                        break;
                    case 'startdownspin':
                        api.startDownSpin();
                        break;
                    case 'stopspin':
                        api.stopSpin();
                        break;
                    case 'updatesettings':
                        api.updateSettings(arg || {});
                        break;
                    case 'setvalue':
                    case 'set':
                        api.setValue(arg);
                        break;
                }
            });
            return ret === undefined ? this : ret;
        }
        // Initialize - forward to core
        return this.each(function () {
            const $input = $(this);
            const inputEl = this;
            // Create TouchSpin instance (core handles non-input validation)
            const inst = TouchSpin(inputEl, options || {});
            // If TouchSpin returned null (non-input element), skip jQuery setup
            if (!inst) {
                return;
            }
            // Define jQuery teardown function that cleans up jQuery-specific resources
            const jqueryTeardown = () => {
                // Clean up ONLY the jQuery events that THIS plugin explicitly added
                // Based on the callable events below: UP_ONCE, DOWN_ONCE, START_UP_SPIN, START_DOWN_SPIN, STOP_SPIN, UPDATE_SETTINGS, DESTROY, blur.touchspin
                $input.off(`${TouchSpinCallableEvent.UP_ONCE} ${TouchSpinCallableEvent.DOWN_ONCE} ${TouchSpinCallableEvent.START_UP_SPIN} ${TouchSpinCallableEvent.START_DOWN_SPIN} ${TouchSpinCallableEvent.STOP_SPIN} ${TouchSpinCallableEvent.UPDATE_SETTINGS} ${TouchSpinCallableEvent.DESTROY} blur.touchspin`);
            };
            // Register teardown with core so it's called on core destroy too
            inst.registerTeardown(jqueryTeardown);
            // Callable events - forward to core (core manages lifecycle)
            $input.on(TouchSpinCallableEvent.UP_ONCE, () => {
                const api = getTouchSpin(inputEl);
                if (api)
                    api.upOnce();
            });
            $input.on(TouchSpinCallableEvent.DOWN_ONCE, () => {
                const api = getTouchSpin(inputEl);
                if (api)
                    api.downOnce();
            });
            $input.on(TouchSpinCallableEvent.START_UP_SPIN, () => {
                const api = getTouchSpin(inputEl);
                if (api)
                    api.startUpSpin();
            });
            $input.on(TouchSpinCallableEvent.START_DOWN_SPIN, () => {
                const api = getTouchSpin(inputEl);
                if (api)
                    api.startDownSpin();
            });
            $input.on(TouchSpinCallableEvent.STOP_SPIN, () => {
                const api = getTouchSpin(inputEl);
                if (api)
                    api.stopSpin();
            });
            $input.on(TouchSpinCallableEvent.UPDATE_SETTINGS, (_e, o) => {
                const api = getTouchSpin(inputEl);
                if (api)
                    api.updateSettings(o || {});
            });
            $input.on(TouchSpinCallableEvent.DESTROY, () => {
                // Forward destroy to core (core will call registered teardown callbacks)
                const api = getTouchSpin(inputEl);
                if (api)
                    api.destroy();
            });
            // Handle jQuery-triggered blur events for backward compatibility
            // jQuery's .trigger('blur') doesn't fire native addEventListener('blur')
            $input.on('blur.touchspin', () => {
                const core = inputEl['_touchSpinCore'];
                core?._checkValue?.(true);
            });
        });
    };
}
export function installWithRenderer(renderer) {
    // Set the global default renderer consumed by core if no renderer is provided in options
    globalThis.TouchSpinDefaultRenderer = renderer;
    const $ = globalThis.jQuery;
    if ($) {
        installJqueryTouchSpin($);
    }
    else {
        console.warn('installWithRenderer: jQuery not found on window. Call installJqueryTouchSpin($) manually.');
    }
}
//# sourceMappingURL=index.js.map