const TARGET = (typeof process !== 'undefined' && process && process.env && process.env.TS_BUILD_TARGET === 'dev')
  ? 'devdist'
  : 'dist';

export const coreUrl = `/packages/core/${TARGET}/index.js`;
export const vanillaRendererUrl = `/packages/vanilla-renderer/${TARGET}/index.js`;
export const vanillaRendererClassUrl = `/packages/vanilla-renderer/${TARGET}/VanillaRenderer.js`;
export const rendererUrlFor = (name: string) => `/packages/renderers/${name}/${TARGET}/index.js`;
export const rendererClassUrlFor = (name: string) => {
  const className = name === 'bootstrap5' ? 'Bootstrap5Renderer' : name === 'tailwind' ? 'TailwindRenderer' : 'Renderer';
  return `/packages/renderers/${name}/${TARGET}/${className}.js`;
};
export const jqueryPluginUrl = `/packages/jquery-plugin/${TARGET}/index.js`;
