import type { Page } from '@playwright/test';

/**
 * Capture console warnings from a Playwright page
 * Returns an array that will be populated with warning messages
 *
 * Usage:
 * const warnings = captureConsoleWarnings(page);
 * // Perform actions that may trigger warnings
 * expect(warnings).toContainEqual(expect.stringContaining('warning message'));
 */
export function captureConsoleWarnings(page: Page): string[] {
  const warnings: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'warning') {
      warnings.push(msg.text());
    }
  });
  return warnings;
}

/**
 * Capture console errors from a Playwright page
 * Returns an array that will be populated with error messages
 */
export function captureConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

/**
 * Capture console logs from a Playwright page
 * Returns an array that will be populated with log messages
 */
export function captureConsoleLogs(page: Page): string[] {
  const logs: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'log') {
      logs.push(msg.text());
    }
  });
  return logs;
}

/**
 * Capture all console output from a Playwright page
 * Returns an object with arrays for warnings, errors, and logs
 *
 * Usage:
 * const console = captureConsole(page);
 * // Perform actions
 * expect(console.warnings).toHaveLength(2);
 * expect(console.errors).toHaveLength(0);
 */
export function captureConsole(page: Page): {
  warnings: string[];
  errors: string[];
  logs: string[];
} {
  const consoleOutput = {
    warnings: [] as string[],
    errors: [] as string[],
    logs: [] as string[]
  };

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();

    if (type === 'warning') {
      consoleOutput.warnings.push(text);
    } else if (type === 'error') {
      consoleOutput.errors.push(text);
    } else if (type === 'log') {
      consoleOutput.logs.push(text);
    }
  });

  return consoleOutput;
}

/**
 * Helper to check if a warning contains specific text
 *
 * Usage:
 * const warnings = captureConsoleWarnings(page);
 * // ...perform actions...
 * expect(hasWarningContaining(warnings, 'callback_before_calculation')).toBe(true);
 */
export function hasWarningContaining(warnings: string[], text: string): boolean {
  return warnings.some(warning => warning.includes(text));
}

/**
 * Helper to check if multiple warning texts are present
 *
 * Usage:
 * const warnings = captureConsoleWarnings(page);
 * // ...perform actions...
 * expect(hasWarningsContaining(warnings, ['callback_before', 'missing'])).toBe(true);
 */
export function hasWarningsContaining(warnings: string[], texts: string[]): boolean {
  return warnings.some(warning =>
    texts.every(text => warning.includes(text))
  );
}