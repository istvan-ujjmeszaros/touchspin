export {};

declare global {
  interface Window {
    __tsLoggingSetup?: boolean;
    eventLog?: Array<{ type: 'native' | 'touchspin'; event: string; target?: string; value?: string }>
    logEvent?: (name: string, detail?: Record<string, unknown>) => void;
    touchSpinReady?: boolean;
    createTestInput?: (id: string, opts?: Record<string, unknown>) => void;
    clearAdditionalInputs?: () => void;
  }
}

