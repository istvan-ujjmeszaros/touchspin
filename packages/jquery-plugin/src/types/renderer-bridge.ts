// jQuery-specific renderer bridge types relocated from core
export type TSJQueryElements = {
  input: JQuery<HTMLInputElement>;
  up: JQuery<HTMLButtonElement>;
  down: JQuery<HTMLButtonElement>;
};

export type TSJQueryRenderer = {
  buildInputGroup: () => JQuery<unknown>;
  buildAdvancedInputGroup: (originalinput: JQuery<unknown>) => JQuery<unknown>;
  initElements: (container: JQuery<unknown>) => TSJQueryElements;
  hideEmptyPrefixPostfix: () => {
    _detached_prefix: JQuery<unknown> | null;
    _detached_postfix: JQuery<unknown> | null;
  };
  updatePrefixPostfix: (
    newsettings: Partial<Record<string, unknown>>,
    detached: {
      _detached_prefix: JQuery<unknown> | null;
      _detached_postfix: JQuery<unknown> | null;
    }
  ) => void;
};

export type TSJQueryRendererFactory = (
  jQuery: JQueryStatic,
  settings: Record<string, unknown>,
  originalinput: JQuery<unknown>
) => TSJQueryRenderer;
