/**
 * TouchSpin Event Types
 * Provides type safety for event names used throughout TouchSpin ecosystem
 */
/**
 * Callable events that can be triggered on TouchSpin jQuery instances
 * These events tell TouchSpin to perform an action
 */
export var TouchSpinCallableEvent;
(function (TouchSpinCallableEvent) {
    /** Update TouchSpin settings */
    TouchSpinCallableEvent["UPDATE_SETTINGS"] = "touchspin.updatesettings";
    /** Increment value by one step */
    TouchSpinCallableEvent["UP_ONCE"] = "touchspin.uponce";
    /** Decrement value by one step */
    TouchSpinCallableEvent["DOWN_ONCE"] = "touchspin.downonce";
    /** Start continuous upward spinning */
    TouchSpinCallableEvent["START_UP_SPIN"] = "touchspin.startupspin";
    /** Start continuous downward spinning */
    TouchSpinCallableEvent["START_DOWN_SPIN"] = "touchspin.startdownspin";
    /** Stop any continuous spinning */
    TouchSpinCallableEvent["STOP_SPIN"] = "touchspin.stopspin";
    /** Destroy the TouchSpin instance */
    TouchSpinCallableEvent["DESTROY"] = "touchspin.destroy";
})(TouchSpinCallableEvent || (TouchSpinCallableEvent = {}));
/**
 * Events emitted by TouchSpin during operation
 * These events notify when something has happened
 */
export var TouchSpinEmittedEvent;
(function (TouchSpinEmittedEvent) {
    /** Fired when minimum boundary is reached */
    TouchSpinEmittedEvent["ON_MIN"] = "touchspin.on.min";
    /** Fired when maximum boundary is reached */
    TouchSpinEmittedEvent["ON_MAX"] = "touchspin.on.max";
    /** Fired when any spinning starts */
    TouchSpinEmittedEvent["ON_START_SPIN"] = "touchspin.on.startspin";
    /** Fired when any spinning stops */
    TouchSpinEmittedEvent["ON_STOP_SPIN"] = "touchspin.on.stopspin";
    /** Fired when upward spinning starts */
    TouchSpinEmittedEvent["ON_START_UP_SPIN"] = "touchspin.on.startupspin";
    /** Fired when downward spinning starts */
    TouchSpinEmittedEvent["ON_START_DOWN_SPIN"] = "touchspin.on.startdownspin";
    /** Fired when upward spinning stops */
    TouchSpinEmittedEvent["ON_STOP_UP_SPIN"] = "touchspin.on.stopupspin";
    /** Fired when downward spinning stops */
    TouchSpinEmittedEvent["ON_STOP_DOWN_SPIN"] = "touchspin.on.stopdownspin";
})(TouchSpinEmittedEvent || (TouchSpinEmittedEvent = {}));
//# sourceMappingURL=events.js.map