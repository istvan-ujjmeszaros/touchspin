// Custom Babel plugin to strip .js extensions from imports
function stripJsExtensions() {
  return {
    visitor: {
      'ImportDeclaration|ExportDeclaration'(path) {
        const node = path.node;
        if (node.source && typeof node.source.value === 'string') {
          const value = node.source.value;
          if (value.endsWith('.js')) {
            node.source.value = value.slice(0, -3);
          }
        }
      },
    },
  };
}

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [
    stripJsExtensions,
    [
      'module-resolver',
      {
        alias: {
          '^@touchspin/react$': './src/index',
          '^@touchspin/core$': '../../../packages/core/src/index',
          '^@touchspin/core/(.+)$': '../../../packages/core/src/\\1',
          '^@touchspin/renderer-vanilla$':
            '../../../packages/renderers/vanilla/src/VanillaRenderer',
          '^@touchspin/renderer-(.+)$': '../../../packages/renderers/\\1/src/\\1Renderer',
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    ],
  ],
};
