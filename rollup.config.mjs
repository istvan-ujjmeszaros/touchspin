import resolve from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import fs from 'fs';

// Read package.json for banner
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

const banner = `/*
 *  ${pkg.title || pkg.name} - v${pkg.version}
 *  ${pkg.description}
 *  ${pkg.homepage}
 *
 *  Made by ${pkg.author.name}
 *  Under ${pkg.license} License
 */`;

// Build configurations for each variant
const variants = [
  { name: 'touchspin-bs3', entry: 'src/entries/standalone-bs3.js', external: [] },
  { name: 'touchspin-bs4', entry: 'src/entries/standalone-bs4.js', external: [] },
  { name: 'touchspin-bs5', entry: 'src/entries/standalone-bs5.js', external: [] },
  { name: 'touchspin-tailwind', entry: 'src/entries/standalone-tailwind.js', external: [] },
  { name: 'jquery.touchspin-bs3', entry: 'src/entries/jquery-bs3.js', external: ['jquery'] },
  { name: 'jquery.touchspin-bs4', entry: 'src/entries/jquery-bs4.js', external: ['jquery'] },
  { name: 'jquery.touchspin-bs5', entry: 'src/entries/jquery-bs5.js', external: ['jquery'] },
  { name: 'jquery.touchspin-tailwind', entry: 'src/entries/jquery-tailwind.js', external: ['jquery'] }
];

// Helper to create a single build configuration
function createConfig(variant, minified = false) {
  const isJQuery = variant.name.startsWith('jquery.');
  const isStandalone = !isJQuery;
  const distFolder = process.env.BUILD_INTEGRITY_CHECK === 'true' ? 'tmp-dist-integrity-check' : 'dist';
  const outputFile = minified
    ? `${distFolder}/${variant.name}.min.js`
    : `${distFolder}/${variant.name}.js`;

  return {
    input: variant.entry,
    external: variant.external,
    output: {
      file: outputFile,
      // Use IIFE for standalone builds (cleaner globals), UMD for jQuery builds (compatibility)
      format: isStandalone ? 'iife' : 'umd',
      name: isStandalone ? undefined : 'TouchSpin', // IIFE doesn't need a name
      globals: isJQuery ? { jquery: 'jQuery' } : {},
      banner,
      sourcemap: true
    },
    plugins: [
      resolve(),
      babel({
        babelHelpers: 'bundled',
        presets: [
          ['@babel/preset-env', {
            targets: {
              browsers: ['> 1%', 'last 2 versions', 'ie >= 9']
            }
          }]
        ],
        plugins: [
          '@babel/plugin-transform-block-scoping',
          '@babel/plugin-transform-arrow-functions'
        ],
        exclude: 'node_modules/**'
      }),
      ...(minified ? [terser({
        format: {
          preamble: banner,
          comments: false
        }
      })] : [])
    ]
  };
}

// Create all build configurations (development + production for each variant)
export default [
  ...variants.map(variant => createConfig(variant, false)), // Development builds
  ...variants.map(variant => createConfig(variant, true))   // Production builds
];