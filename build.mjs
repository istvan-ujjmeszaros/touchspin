import { build } from 'vite';
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

  // Include only specific renderer and dependencies
  const rendererFile = `${rendererName}Renderer.js`;
  let rendererIncludes = '';

  // Always include base renderer
  rendererIncludes += fs.readFileSync('./src/renderers/AbstractRenderer.js', 'utf-8') + '\n';

  // Include the target renderer
  rendererIncludes += fs.readFileSync(`./src/renderers/${rendererFile}`, 'utf-8') + '\n';

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

  // Build with version-specific renderer
  await build({
    build: {
      lib: {
        entry: resolve('src/jquery.bootstrap-touchspin.js'),
        formats: ['umd'],
        name: 'TouchSpin',
        fileName: () => fileName
      },
      rollupOptions: {
        external: ['jquery'],
        output: {
          globals: { jquery: 'jQuery' },
          banner: banner + '\n' + rendererCode
        }
      },
      outDir: outputDir,
      emptyOutDir: false,
      sourcemap: true,
      minify: false
    }
  });

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
  for (const fileName of builtFiles) {
    const jsContent = fs.readFileSync(`./${outputDir}/${fileName}`, 'utf-8');

    // Remove Vite's banner temporarily
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

    const transpiledWithBanner = `${banner}\n${transpiled.code}`;
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
  await build({
    build: {
      lib: {
        entry: resolve('src/core/TouchSpinCore.js'),
        formats: ['es'],
        fileName: () => 'touchspin.js',
      },
      rollupOptions: {
        output: {
          banner
        }
      },
      outDir: esmOut,
      emptyOutDir: false,
      sourcemap: true,
      minify: false
    }
  });
}
