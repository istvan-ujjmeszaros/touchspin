import type { Locator } from '@playwright/test';
import type { TouchSpinCoreOptions, TouchSpinCorePublicAPI } from '@touchspin/core';

/** Event log entry shape emitted by test fixtures */
export type EventLogType = 'native' | 'touchspin';

export interface EventLogEntry {
  type: EventLogType;
  event: string;
  target?: string;
  value?: string;
}

/** Structured locators for a single TouchSpin instance identified by a testId. */
export interface TouchSpinElements {
  /** Root wrapper around the TouchSpin input and controls. */
  wrapper: Locator;
  /** Underlying input element with the given data-testid. */
  input: Locator;
  /** The "up" button (increment). */
  upButton: Locator;
  /** The "down" button (decrement). */
  downButton: Locator;
  /** Optional prefix element rendered before the input. */
  prefix: Locator;
  /** Optional postfix element rendered after the input. */
  postfix: Locator;
}

// Re-export Core types for test helpers to use
export type { TouchSpinCoreOptions, TouchSpinCorePublicAPI };

export interface TouchSpinTestNamespace {
  requireInputByTestId(id: string): HTMLInputElement;
  requireCoreByTestId(id: string): TouchSpinCorePublicAPI;
  byId?(id: string): Element | null;
  require?(id: string): Element;
}

/** Injected element roles for renderer-agnostic selectors */
export type InjectedRole = 'up' | 'down' | 'prefix' | 'postfix';

/** Window interface augmentation for TouchSpin test environment */
declare global {
  interface Window {
    __ts?: TouchSpinTestNamespace;
    __tsLoggingSetup?: boolean;
    eventLog?: EventLogEntry[];
    logEvent?: (name: string, detail?: Partial<EventLogEntry>) => void;
    touchSpinReady?: boolean;
    createTestInput?: (id: string, opts?: Partial<TouchSpinCoreOptions>) => void;
    clearAdditionalInputs?: () => void;
    clearEventLog?: () => void;
    /** Optional readiness flag used by wait helpers */
    testPageReady?: boolean;
    __eventLog?: EventLogEntry[];
    jQuery?: unknown;
    $?: unknown;
  }
}
