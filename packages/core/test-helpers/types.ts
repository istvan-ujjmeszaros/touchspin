import type { Locator } from '@playwright/test';

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

/** TouchSpin Core API interface for better type safety */
export interface TouchSpinCore {
  setValue(value: number | string): void;
  upOnce(): void;
  downOnce(): void;
  startUpSpin(): void;
  startDownSpin(): void;
  stopSpin(): void;
  updateSettings(settings: Record<string, unknown>): void;
  toPublicApi(): unknown;
  initDOMEventHandling(): void;
  destroy(): void;
}

/** Injected element roles for renderer-agnostic selectors */
export type InjectedRole = 'up' | 'down' | 'prefix' | 'postfix';

/** Window interface augmentation for TouchSpin test environment */
declare global {
  interface Window {
    __tsLoggingSetup?: boolean;
    eventLog?: EventLogEntry[];
    logEvent?: (name: string, detail?: Partial<EventLogEntry>) => void;
    touchSpinReady?: boolean;
    createTestInput?: (id: string, opts?: Record<string, unknown>) => void;
    clearAdditionalInputs?: () => void;
    clearEventLog?: () => void;
  }
}

export {};