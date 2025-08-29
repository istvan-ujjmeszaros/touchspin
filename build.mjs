import { rollup } from 'rollup';
import { resolve } from 'path';
import fs from 'fs';
import { minify } from 'terser';
import CleanCSS from 'clean-css';
import { transformSync } from '@babel/core';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

const banner = `/*
 *  ${pkg.title || pkg.name} - v${pkg.version}
 *  ${pkg.description}
 *  ${pkg.homepage}
 *
 *  Made by ${pkg.author.name}
 *  Under ${pkg.license} License
 */`;

async function buildVersionSpecific(version, outputDir) {
  const isNumeric = typeof version === 'number';
  const versionSuffix = isNumeric ? `bs${version}` : version.toLowerCase();
  const fileName = `jquery.bootstrap-touchspin-${versionSuffix}.js`;
  const frameworkName = isNumeric ? `Bootstrap ${version}` : version;
  const rendererName = isNumeric ? `Bootstrap${version}` : version.charAt(0).toUpperCase() + version.slice(1);

  console.log(`🔨 Building ${frameworkName} version...`);

  // Include only specific renderer and dependencies (from packages/renderers/*)
  const rendererFile = `${rendererName}Renderer.js`;
  let rendererIncludes = '';

  // Determine package base directory for the chosen renderer
  const pkgBase = isNumeric
    ? `./packages/renderers/bootstrap${version}/src`
    : `./packages/renderers/${version}/src`;

  // Always include base renderer from package
  const abstractPath = `${pkgBase}/AbstractRenderer.js`;
  if (!fs.existsSync(abstractPath)) {
    throw new Error(`Missing AbstractRenderer at ${abstractPath} for ${frameworkName}`);
  }
  rendererIncludes += fs.readFileSync(abstractPath, 'utf-8') + '\n';

  // Include the target renderer from package
  const rendererPath = `${pkgBase}/${rendererFile}`;
  if (!fs.existsSync(rendererPath)) {
    throw new Error(`Missing ${rendererFile} at ${rendererPath} for ${frameworkName}`);
  }
  rendererIncludes += fs.readFileSync(rendererPath, 'utf-8') + '\n';

  const frameworkId = isNumeric ? `bootstrap${version}` : version;
  const rendererCode = `
// ${frameworkName} specific build - BEFORE main plugin
(function() {
  'use strict';
  ${rendererIncludes}
  
  // Simple factory for single version - no auto-detection needed
  class RendererFactory {
    static createRenderer($, settings, originalinput) {
      return new ${rendererName}Renderer($, settings, originalinput);
    }
    
    static getFrameworkId() {
      return '${frameworkId}';
    }
  }
  
  if (typeof window !== 'undefined') {
    window.AbstractRenderer = AbstractRenderer;
    window.${rendererName}Renderer = ${rendererName}Renderer;
    window.RendererFactory = RendererFactory;
  }
})();

`;

  // Optional: build using jQuery wrapper instead of legacy plugin
  const useWrapper = String(process.env.USE_JQUERY_WRAPPER || '').toLowerCase() === 'true';
  let wrapperPrelude = '';
  if (useWrapper) {
    // Read core migrated initializer and wrapper installer, strip ESM exports/imports
    function readAsScript(p) {
      let code = fs.readFileSync(p, 'utf-8');
      // Strip all import statements
      code = code.replace(/\bimport\s+[^;]+;\s*/g, '');
      // Strip export function declarations
      code = code.replace(/\bexport\s+function\s+/g, 'function ');
      // Strip export class declarations  
      code = code.replace(/\bexport\s+class\s+/g, 'class ');
      // Strip export const/let/var declarations
      code = code.replace(/\bexport\s+(const|let|var)\s+/g, '$1 ');
      // Strip export default statements
      code = code.replace(/\bexport\s+default\b[\s\S]*?;\s*$/m, '');
      // Strip export { ... } blocks
      code = code.replace(/\bexport\s+\{[\s\S]*?\};?/g, '');
      return code;
    }
    const coreInitPath = './packages/core/src/index.js';
    const wrapperPath = './packages/jquery-plugin/src/index.js';
    if (!fs.existsSync(coreInitPath) || !fs.existsSync(wrapperPath)) {
      throw new Error('Wrapper build requested but required sources are missing');
    }
    const coreInit = readAsScript(coreInitPath);
    const wrapperInstall = readAsScript(wrapperPath);
    wrapperPrelude = `\n// Wrapper-based plugin registration (core initializer + wrapper)\n(function(){\n'use strict';\n${coreInit}\n${wrapperInstall}\nif (typeof window !== 'undefined' && window.jQuery) { installJqueryTouchSpin(window.jQuery); }\n})();\n`;
  }

  // Build with Rollup (UMD) and inject renderer + optional wrapper prelude
  const bundle = await rollup({
    input: resolve(useWrapper ? 'src/entry-wrapper.js' : 'src/jquery.bootstrap-touchspin.js'),
    external: ['jquery']
  });
  await bundle.write({
    file: `${outputDir}/${fileName}`,
    format: 'umd',
    name: 'TouchSpin',
    sourcemap: true,
    globals: { jquery: 'jQuery' },
    banner: `${rendererCode}${useWrapper ? wrapperPrelude : ''}`
  });
  await bundle.close();

  return fileName;
}

async function buildAll() {
  // Determine build mode and output directory
  const isIntegrityCheck = process.env.BUILD_INTEGRITY_CHECK === 'true';
  const outputDir = isIntegrityCheck ? 'tmp-dist-integrity-check' : 'dist';

  if (isIntegrityCheck) {
    console.log('🔍 Running integrity check build...');
  }

  // Clean output directory
  if (fs.existsSync(`./${outputDir}`)) {
    try {
      fs.rmSync(`./${outputDir}`, { recursive: true, force: true });
    } catch {
      console.warn(`Could not clean ${outputDir} directory, continuing...`);
    }
  }
  if (!fs.existsSync(`./${outputDir}`)) {
    fs.mkdirSync(`./${outputDir}`, { recursive: true });
  }

  console.log('🔨 Building JavaScript variants...');

  // Build all variants
  const builtFiles = [];

  // Build all framework versions
  for (const version of [3, 4, 5, 'tailwind']) {
    const fileName = await buildVersionSpecific(version, outputDir);
    builtFiles.push(fileName);
  }

  // Universal build removed - impossible to use multiple Bootstrap versions on same page

  console.log('🔄 Transpiling to ES5 with Babel...');

  // Process each built file
  const processedFiles = [];
  // Optional: which wrappers to append after bundle (disabled by default)
  // e.g., APPEND_WRAPPERS=modern-facade or APPEND_WRAPPERS=jquery-bridge,modern-facade
  const appendWrappersEnv = (process.env.APPEND_WRAPPERS || '').trim();
  let wrappersToAppend = [];
  if (appendWrappersEnv) {
    const v = appendWrappersEnv.toLowerCase();
    if (v !== 'none' && v !== '0' && v !== 'false' && v !== 'no') {
      wrappersToAppend = v.split(',').map(s => s.trim()).filter(Boolean);
    }
  } else {
    // Default from LGTM-8: include modern facade to preserve prior inline behavior
    wrappersToAppend = ['modern-facade'];
  }

  function readWrapperSource(kind) {
    const map = {
      'modern': 'src/wrappers/modern-facade.js',
      'modern-facade': 'src/wrappers/modern-facade.js',
      'jquery-bridge': 'src/wrappers/jquery-bridge.js',
      'bridge': 'src/wrappers/jquery-bridge.js',
    };
    const p = map[kind];
    if (!p || !fs.existsSync(p)) return '';
    let code = fs.readFileSync(p, 'utf-8');
    // Convert simple ESM exports to plain script for UMD footer use
    code = code.replace(/\bexport\s+default\b[\s\S]*?;\s*$/m, (m) => {
      // Drop default export line entirely
      return '';
    });
    code = code.replace(/\bexport\s+function\s+/g, 'function ');
    code = code.replace(/\bexport\s+\{[\s\S]*?\};?/g, '');
    code = code.replace(/\bimport\s+[^;]+;\s*/g, '');
    const header = `\n/* Appended wrapper: ${p} (via APPEND_WRAPPERS) */\n`;
    return header + code + '\n/* End appended wrapper */\n';
  }

  for (const fileName of builtFiles) {
    const jsContent = fs.readFileSync(`./${outputDir}/${fileName}`, 'utf-8');

  // Remove leading banner comment temporarily (we will re-apply our header)
    const jsWithoutBanner = jsContent.replace(/^\/\*[\s\S]*?\*\/\n?/, '');

    const transpiled = transformSync(jsWithoutBanner, {
      presets: [['@babel/preset-env', {
        targets: {
          browsers: ['> 1%', 'last 2 versions', 'ie >= 9']
        }
      }]],
      plugins: [
        '@babel/plugin-transform-block-scoping',
        '@babel/plugin-transform-arrow-functions'
      ]
    });

    let transpiledWithBanner = `${banner}\n${transpiled.code}`;

    if (wrappersToAppend.length) {
      let footer = '';
      for (const kind of wrappersToAppend) {
        footer += readWrapperSource(kind);
      }
      if (footer.trim()) {
        transpiledWithBanner += `\n${footer}`;
      }
    }
    fs.writeFileSync(`./${outputDir}/${fileName}`, transpiledWithBanner);
    processedFiles.push(fileName);
  }

  console.log('🗜️ Minifying JavaScript...');

  // Minify each file
  for (const fileName of processedFiles) {
    const content = fs.readFileSync(`./${outputDir}/${fileName}`, 'utf-8');
    const baseName = fileName.replace('.js', '');

    const minified = await minify(content, {
      format: {
        comments: (node, comment) => {
          return comment.value.includes(pkg.name) || comment.value.includes('License');
        },
        preamble: banner
      },
      sourceMap: {
        filename: `${baseName}.min.js`,
        url: `${baseName}.min.js.map`
      }
    });

    fs.writeFileSync(`./${outputDir}/${baseName}.min.js`, minified.code);
    if (minified.map) {
      fs.writeFileSync(`./${outputDir}/${baseName}.min.js.map`, minified.map);
    }

    // Write alias filenames with the future naming scheme
    // Example: jquery.bootstrap-touchspin-bs5.js -> touchspin.jquery.bs5.js
    try {
      const m = /jquery\.bootstrap-touchspin-(bs\d+|tailwind)$/i.exec(baseName);
      if (m) {
        const suffix = m[1];
        const aliasBase = `touchspin.jquery.${suffix}`;
        fs.writeFileSync(`./${outputDir}/${aliasBase}.js`, content);
        fs.writeFileSync(`./${outputDir}/${aliasBase}.min.js`, minified.code);
        if (minified.map) {
          fs.writeFileSync(`./${outputDir}/${aliasBase}.min.js.map`, minified.map);
        }
      }
    } catch {}
  }

  console.log('🎨 Processing CSS...');

  // Copy and process CSS
  const cssContent = fs.readFileSync('./src/jquery.bootstrap-touchspin.css', 'utf-8');
  const cssWithBanner = `${banner}\n${cssContent}`;

  // Write unminified CSS
  fs.writeFileSync(`./${outputDir}/jquery.bootstrap-touchspin.css`, cssWithBanner);

  // Minify CSS
  const cleanCSS = new CleanCSS({
    format: {
      breaks: { afterComment: true }
    }
  });
  const minifiedCSS = cleanCSS.minify(cssWithBanner);
  fs.writeFileSync(`./${outputDir}/jquery.bootstrap-touchspin.min.css`, minifiedCSS.styles);

  // Build ESM core bundle alongside UMD variants
  console.log('📦 Building ESM core bundle...');
  await buildEsmCore(outputDir);
  console.log('✅ ESM core built at', `${outputDir}/esm/touchspin.js`);
  // Alias ESM core for future naming (touchspin-core.js)
  try {
    const src = `${outputDir}/esm/touchspin.js`;
    const dst = `${outputDir}/esm/touchspin-core.js`;
    if (fs.existsSync(src)) fs.copyFileSync(src, dst);
  } catch {}

  console.log('✅ Build completed successfully!');
  console.log('📦 Generated files:');
  console.log('   - jquery.bootstrap-touchspin.js');
  console.log('   - jquery.bootstrap-touchspin.js.map');
  console.log('   - jquery.bootstrap-touchspin.min.js');
  console.log('   - jquery.bootstrap-touchspin.min.js.map');
  console.log('   - jquery.bootstrap-touchspin.css');
  console.log('   - jquery.bootstrap-touchspin.min.css');
}

buildAll().catch(console.error);

// Build ESM core bundle function
async function buildEsmCore(outputDir) {
  const esmOut = `${outputDir}/esm`;
  if (!fs.existsSync(esmOut)) fs.mkdirSync(esmOut, { recursive: true });
  const bundle = await rollup({ input: resolve('packages/core/src/index.js') });
  await bundle.write({
    file: `${esmOut}/touchspin.js`,
    format: 'es',
    sourcemap: true,
    banner
  });
  await bundle.close();
}
