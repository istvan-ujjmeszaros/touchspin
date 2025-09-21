const isDevBuild = typeof process !== 'undefined' && process && process.env && (process.env.TS_BUILD_TARGET === 'dev' || process.env.PW_COVERAGE === '1');
const TARGET = isDevBuild ? 'devdist' : 'dist';

export const coreUrl = `/packages/core/${TARGET}/index.js`;
export const vanillaRendererUrl = `/packages/vanilla-renderer/${TARGET}/index.js`;
export const vanillaRendererClassUrl = TARGET === 'devdist'
  ? `/packages/vanilla-renderer/${TARGET}/VanillaRenderer.js`
  : `/packages/vanilla-renderer/${TARGET}/index.js`;
export const rendererUrlFor = (name: string) => `/packages/renderers/${name}/${TARGET}/index.js`;
export const rendererClassUrlFor = (name: string) => {
  if (TARGET === 'devdist') {
    // devdist builds to individual class files
    const className = name === 'bootstrap5' ? 'Bootstrap5Renderer' : name === 'tailwind' ? 'TailwindRenderer' : 'Renderer';
    return `/packages/renderers/${name}/${TARGET}/${className}.js`;
  } else {
    // dist builds to bundled index.js
    return `/packages/renderers/${name}/${TARGET}/index.js`;
  }
};
export const jqueryPluginUrl = `/packages/jquery-plugin/${TARGET}/index.js`;
