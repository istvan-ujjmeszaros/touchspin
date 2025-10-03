import type { JQueryStatic } from 'jquery';
import type {
  TouchSpinCoreOptions,
  TouchSpinCallableEvent,
  TouchSpinEmittedEvent,
  TouchSpinUpdateSettingsData,
} from '@touchspin/core';
import type { TSRenderer } from '@touchspin/core/renderer';

// Re-export event types from core
export { TouchSpinCallableEvent, TouchSpinEmittedEvent } from '@touchspin/core';
export type { TouchSpinUpdateSettingsData } from '@touchspin/core';

declare namespace TouchSpinJQuery {
  type Options = Partial<TouchSpinCoreOptions>;
  type Command =
    | 'destroy'
    | 'uponce'
    | 'downonce'
    | 'startupspin'
    | 'startdownspin'
    | 'stopspin'
    | 'updatesettings'
    | 'setvalue'
    | 'set'
    | 'getvalue'
    | 'get';
}

export declare function installJqueryTouchSpin($: JQueryStatic): void;
export declare function installWithRenderer(renderer: TSRenderer): void;

declare module 'jquery' {
  interface JQuery {
    TouchSpin(options?: TouchSpinJQuery.Options): JQuery;
    TouchSpin(command: TouchSpinJQuery.Command, arg?: unknown): unknown;
  }
}
