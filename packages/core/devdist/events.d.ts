/**
 * TouchSpin Event Types
 * Provides type safety for event names used throughout TouchSpin ecosystem
 */
/**
 * Callable events that can be triggered on TouchSpin jQuery instances
 * These events tell TouchSpin to perform an action
 */
export declare enum TouchSpinCallableEvent {
    /** Update TouchSpin settings */
    UPDATE_SETTINGS = "touchspin.updatesettings",
    /** Increment value by one step */
    UP_ONCE = "touchspin.uponce",
    /** Decrement value by one step */
    DOWN_ONCE = "touchspin.downonce",
    /** Start continuous upward spinning */
    START_UP_SPIN = "touchspin.startupspin",
    /** Start continuous downward spinning */
    START_DOWN_SPIN = "touchspin.startdownspin",
    /** Stop any continuous spinning */
    STOP_SPIN = "touchspin.stopspin",
    /** Destroy the TouchSpin instance */
    DESTROY = "touchspin.destroy"
}
/**
 * Events emitted by TouchSpin during operation
 * These events notify when something has happened
 */
export declare enum TouchSpinEmittedEvent {
    /** Fired when minimum boundary is reached */
    ON_MIN = "touchspin.on.min",
    /** Fired when maximum boundary is reached */
    ON_MAX = "touchspin.on.max",
    /** Fired when any spinning starts */
    ON_START_SPIN = "touchspin.on.startspin",
    /** Fired when any spinning stops */
    ON_STOP_SPIN = "touchspin.on.stopspin",
    /** Fired when upward spinning starts */
    ON_START_UP_SPIN = "touchspin.on.startupspin",
    /** Fired when downward spinning starts */
    ON_START_DOWN_SPIN = "touchspin.on.startdownspin",
    /** Fired when upward spinning stops */
    ON_STOP_UP_SPIN = "touchspin.on.stopupspin",
    /** Fired when downward spinning stops */
    ON_STOP_DOWN_SPIN = "touchspin.on.stopdownspin"
}
/**
 * Type for update settings event data
 */
export interface TouchSpinUpdateSettingsData {
    [key: string]: unknown;
}
//# sourceMappingURL=events.d.ts.map