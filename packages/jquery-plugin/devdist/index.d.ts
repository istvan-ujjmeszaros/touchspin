type JQueryInst = {
    each: (cb: (this: Element) => void) => JQueryInst;
    on: (...args: unknown[]) => JQueryInst;
    off: (...args: unknown[]) => JQueryInst;
    trigger: (...args: unknown[]) => JQueryInst;
};
type JQueryStatic = {
    fn: Record<string, unknown> & {
        TouchSpin?: (options?: unknown, arg?: unknown) => unknown;
    };
    (selector: Element | string): JQueryInst;
};
export { TouchSpinCallableEvent, TouchSpinEmittedEvent } from '@touchspin/core';
export type { TouchSpinUpdateSettingsData } from '@touchspin/core';
/**
 * Install a minimal jQuery plugin wrapper that just forwards everything to core.
 * Contains NO logic - only forwards commands and events.
 * Core manages its own instance lifecycle on the input element.
 * @param {import('jquery').JQueryStatic} $
 */
export declare function installJqueryTouchSpin($: JQueryStatic): void;
export declare function installWithRenderer(renderer: unknown): void;
//# sourceMappingURL=index.d.ts.map