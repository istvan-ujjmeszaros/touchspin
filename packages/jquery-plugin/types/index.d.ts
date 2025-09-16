import type { JQueryStatic } from 'jquery';
import type { TouchSpinCoreOptions } from '@touchspin/core';
import type { TSRenderer } from '@touchspin/core/renderer';

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

export {};
