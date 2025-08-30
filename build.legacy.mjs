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

async function buildVersionSpecific(version, buildType, outputDir) {
  const isNumeric = typeof version === 'number';
  const versionSuffix = isNumeric ? `bs${version}` : version.toLowerCase();
  const frameworkName = isNumeric ? `Bootstrap ${version}` : version.charAt(0).toUpperCase() + version.slice(1);
  const rendererName = isNumeric ? `Bootstrap${version}` : version.charAt(0).toUpperCase() + version.slice(1);

  console.log(`🔨 Building ${frameworkName} (${buildType === 'jquery' ? 'jQuery' : 'Standalone'})...`);

  // Helper to strip ES6 module syntax
  function stripModuleSyntax(code) {
    return code
      // Remove all import statements
      .replace(/\bimport\s+[^;]+;\s*/g, '')
      // Remove export statements and re-export patterns
      .replace(/\bexport\s+default\s+\w+;?\s*$/m, '')
      .replace(/\bexport\s+function\s+/g, 'function ')
      .replace(/\bexport\s+class\s+/g, 'class ')
      .replace(/\bexport\s+(const|let|var)\s+/g, '$1 ')
      .replace(/\bexport\s+\{[^}]*\}\s*(from\s+[^;]+)?;?\s*/g, '')
      // Remove comments that reference exports
      .replace(/^.*\/\/.*Export.*$/gm, '')
      // Remove standalone export lines (e.g., "export from './file.js';")
      .replace(/^\s*export\s+[^;]*;\s*$/gm, '')
      // Remove any remaining export keyword
      .replace(/\bexport\s+/g, '')
      // Clean up empty lines and orphaned 'from' statements
      .replace(/^\s*from\s+[^;]*;\s*$/gm, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n');
  }

  // Build the complete code bundle
  let bundleCode = '';

  // 1. Include AbstractRenderer from core
  const abstractPath = './packages/core/src/AbstractRenderer.js';
  if (!fs.existsSync(abstractPath)) {
    throw new Error(`Missing AbstractRenderer at ${abstractPath}`);
  }
  bundleCode += stripModuleSyntax(fs.readFileSync(abstractPath, 'utf-8')) + '\n';

  // 2. Include the specific renderer
  const rendererPath = isNumeric
    ? `./packages/renderers/bootstrap${version}/src/${rendererName}Renderer.js`
    : `./packages/renderers/${version}/src/${rendererName}Renderer.js`;
  if (!fs.existsSync(rendererPath)) {
    throw new Error(`Missing renderer at ${rendererPath}`);
  }
  bundleCode += stripModuleSyntax(fs.readFileSync(rendererPath, 'utf-8')) + '\n';

  // 3. Include the core
  const corePath = './packages/core/src/index.js';
  if (!fs.existsSync(corePath)) {
    throw new Error(`Missing core at ${corePath}`);
  }
  bundleCode += stripModuleSyntax(fs.readFileSync(corePath, 'utf-8')) + '\n';

  // 4. For jQuery builds, include the jQuery wrapper
  if (buildType === 'jquery') {
    const wrapperPath = './packages/jquery-plugin/src/index.js';
    if (!fs.existsSync(wrapperPath)) {
      throw new Error(`Missing jQuery wrapper at ${wrapperPath}`);
    }
    bundleCode += stripModuleSyntax(fs.readFileSync(wrapperPath, 'utf-8')) + '\n';
  }

  // Different wrappers for jQuery vs standalone builds
  let wrappedCode;

  if (buildType === 'jquery') {
    // jQuery UMD wrapper
    wrappedCode = `
(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Global
    factory(jQuery);
  }
}(function($) {
  'use strict';

  ${bundleCode}

  // Expose globals
  if (typeof window !== 'undefined') {
    window.TouchSpinCore = TouchSpinCore;
    window.getTouchSpin = getTouchSpin;
    window.${rendererName}Renderer = ${rendererName}Renderer;

    // For jQuery builds, install the plugin
    if ($ && $.fn) {
      installJqueryTouchSpin($);
    }
  }
  return $.fn.TouchSpin;
}));
`;
  } else {
    // Standalone UMD wrapper (no jQuery dependency)
    wrappedCode = `
(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory();
  } else {
    // Global
    factory();
  }
}(function() {
  'use strict';

  ${bundleCode}

  // Expose globals for standalone builds
  if (typeof window !== 'undefined') {
    window.TouchSpinCore = TouchSpinCore;
    window.getTouchSpin = getTouchSpin;
    window.${rendererName}Renderer = ${rendererName}Renderer;
  }

  return { TouchSpinCore, getTouchSpin, ${rendererName}Renderer };
}));
`;
  }

  // Determine output filename
  const fileName = buildType === 'jquery'
    ? `jquery.touchspin-${versionSuffix}.js`
    : `touchspin-${versionSuffix}.js`;

  // Write the file directly (no Rollup needed since we're building from packages)
  const outputPath = `${outputDir}/${fileName}`;
  fs.writeFileSync(outputPath, banner + wrappedCode);

  // Generate source map
  const sourceMap = {
    version: 3,
    sources: [outputPath],
    names: [],
    mappings: '',
    file: fileName
  };
  fs.writeFileSync(`${outputPath}.map`, JSON.stringify(sourceMap));
  fs.appendFileSync(outputPath, `\n//# sourceMappingURL=${fileName}.map`);

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

  // Build all framework versions (both jQuery and standalone)
  for (const version of [3, 4, 5, 'tailwind']) {
    // jQuery build
    const jqueryFile = await buildVersionSpecific(version, 'jquery', outputDir);
    builtFiles.push(jqueryFile);

    // Standalone build
    const standaloneFile = await buildVersionSpecific(version, 'standalone', outputDir);
    builtFiles.push(standaloneFile);
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

    // Alias filenames removed - they were just preview/experimental
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

  // ESM builds removed - only UMD builds for now

  console.log('✅ Build completed successfully!');
  console.log('📦 Generated files for each renderer:');
  console.log('   - touchspin-bs3.js / touchspin-bs3.min.js');
  console.log('   - touchspin-bs4.js / touchspin-bs4.min.js');
  console.log('   - touchspin-bs5.js / touchspin-bs5.min.js');
  console.log('   - touchspin-tailwind.js / touchspin-tailwind.min.js');
  console.log('   - touchspin.css / touchspin.min.css');
}

buildAll().catch(console.error);

