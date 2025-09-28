import type { TouchSpinCoreOptions } from './index';
import type { Renderer } from './renderer';
export type RendererOptionKind = 'string' | 'boolean' | 'number' | 'enum';
type RendererOptionDefinition = {
    kind: 'string';
} | {
    kind: 'boolean';
} | {
    kind: 'number';
} | {
    kind: 'enum';
    values: readonly string[];
};
export type RendererOptionDef = RendererOptionDefinition;
export type RendererOptionSchema = Readonly<Record<string, RendererOptionDefinition>>;
type RendererOptionValue<Definition extends RendererOptionDefinition> = Definition extends {
    kind: 'string';
} ? string | undefined : Definition extends {
    kind: 'boolean';
} ? boolean | undefined : Definition extends {
    kind: 'number';
} ? number | undefined : Definition extends {
    kind: 'enum';
    values: readonly (infer Option)[];
} ? Option | undefined : unknown;
export type InferOptionsFromSchema<Schema extends RendererOptionSchema> = {
    [Key in keyof Schema]: RendererOptionValue<Schema[Key]>;
};
type RendererCoreBridge = {
    attachUpEvents: (element: HTMLElement | null) => void;
    attachDownEvents: (element: HTMLElement | null) => void;
    observeSetting: <Key extends keyof TouchSpinCoreOptions>(key: Key, listener: (value: NonNullable<TouchSpinCoreOptions[Key]>) => void) => () => void;
};
type SettingsRecord = Record<string, unknown>;
declare abstract class AbstractRenderer implements Renderer {
    protected readonly input: HTMLInputElement;
    protected readonly settings: Readonly<TouchSpinCoreOptions>;
    protected readonly core: RendererCoreBridge;
    protected wrapper: HTMLElement | null;
    protected wrapperType: string;
    constructor(input: HTMLInputElement, settings: Readonly<TouchSpinCoreOptions>, core: RendererCoreBridge);
    abstract init(): void;
    teardown(): void;
    removeInjectedElements(): void;
    finalizeWrapperAttributes(): void;
    getUpButtonTestId(): string;
    getDownButtonTestId(): string;
    getPrefixTestId(): string;
    getPostfixTestId(): string;
    protected extractRendererSettings<Schema extends RendererOptionSchema>(schema: Schema, sourceSettings?: SettingsRecord): Readonly<Partial<InferOptionsFromSchema<Schema>>>;
    protected projectRendererOptions<Schema extends RendererOptionSchema>(schema: Schema, from?: Record<string, unknown>): Readonly<Partial<InferOptionsFromSchema<Schema>>>;
    private removeInjectedNodesWithinWrapper;
    private removeNearbyInjectedNodes;
    private isNodeRelatedToInput;
    private buildDataTestId;
}
export default AbstractRenderer;
//# sourceMappingURL=AbstractRenderer.d.ts.map