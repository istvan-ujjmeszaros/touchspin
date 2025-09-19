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