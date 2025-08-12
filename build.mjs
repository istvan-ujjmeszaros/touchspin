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

async function buildVersionSpecific(version) {
  const versionSuffix = version === 'universal' ? '' : `-bs${version}`;
  const fileName = `jquery.bootstrap-touchspin${versionSuffix}.js`;
  
  console.log(`🔨 Building ${version === 'universal' ? 'Universal' : `Bootstrap ${version}`} version...`);
  
  // Create version-specific renderer code as preamble (before main plugin)
  let rendererCode = '';
  if (version === 'universal') {
    // Include all renderers with detection
    rendererCode = `
// Include all renderer systems BEFORE main plugin
(function() {
  'use strict';
  ${fs.readFileSync('./src/renderers/BootstrapRenderer.js', 'utf-8')}
  ${fs.readFileSync('./src/renderers/Bootstrap3Renderer.js', 'utf-8')}
  ${fs.readFileSync('./src/renderers/Bootstrap4Renderer.js', 'utf-8')}
  ${fs.readFileSync('./src/renderers/Bootstrap5Renderer.js', 'utf-8')}
  ${fs.readFileSync('./src/renderers/RendererFactory.js', 'utf-8')}
})();

`;
  } else {
    // Include only specific renderer and dependencies
    const rendererFile = `Bootstrap${version}Renderer.js`;
    let rendererIncludes = '';
    
    // Always include base renderer
    rendererIncludes += fs.readFileSync('./src/renderers/BootstrapRenderer.js', 'utf-8') + '\n';
    
    // Include dependencies based on inheritance
    if (version === 5) {
      // Bootstrap5Renderer extends Bootstrap4Renderer
      rendererIncludes += fs.readFileSync('./src/renderers/Bootstrap4Renderer.js', 'utf-8') + '\n';
    }
    
    // Include the target renderer
    rendererIncludes += fs.readFileSync(`./src/renderers/${rendererFile}`, 'utf-8') + '\n';
    
    rendererCode = `
// Bootstrap ${version} specific build - BEFORE main plugin
(function() {
  'use strict';
  ${rendererIncludes}
  
  // Simple factory for single version
  class RendererFactory {
    static createRenderer($, settings, originalinput) {
      return new Bootstrap${version}Renderer($, settings, originalinput);
    }
    
    static detectBootstrapVersion() {
      return ${version};
    }
  }
  
  if (typeof window !== 'undefined') {
    window.BootstrapRenderer = BootstrapRenderer;
    if (typeof Bootstrap4Renderer !== 'undefined') window.Bootstrap4Renderer = Bootstrap4Renderer;
    window.Bootstrap${version}Renderer = Bootstrap${version}Renderer;
    window.RendererFactory = RendererFactory;
  }
})();

`;
  }
  
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
      outDir: 'dist',
      emptyOutDir: false,
      sourcemap: true,
      minify: false
    }
  });
  
  return fileName;
}

async function buildAll() {
  // Clean dist directory
  if (fs.existsSync('./dist')) {
    try {
      fs.rmSync('./dist', { recursive: true, force: true });
    } catch (e) {
      console.warn('Could not clean dist directory, continuing...');
    }
  }
  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist', { recursive: true });
  }

  console.log('🔨 Building JavaScript variants...');
  
  // Build all variants
  const builtFiles = [];
  
  // Build Bootstrap-specific versions
  for (const version of [3, 4, 5]) {
    const fileName = await buildVersionSpecific(version);
    builtFiles.push(fileName);
  }
  
  // Build universal version (temporarily with different name to avoid conflicts)
  try {
    const universalFile = await buildVersionSpecific('universal');
    builtFiles.push(universalFile);
  } catch (error) {
    console.warn('Failed to build universal version, skipping for now:', error.message);
  }

  console.log('🔄 Transpiling to ES5 with Babel...');
  
  // Process each built file
  const processedFiles = [];
  for (const fileName of builtFiles) {
    const jsContent = fs.readFileSync(`./dist/${fileName}`, 'utf-8');
  
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
    fs.writeFileSync(`./dist/${fileName}`, transpiledWithBanner);
    processedFiles.push(fileName);
  }

  console.log('🗜️ Minifying JavaScript...');
  
  // Minify each file
  for (const fileName of processedFiles) {
    const content = fs.readFileSync(`./dist/${fileName}`, 'utf-8');
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

    fs.writeFileSync(`./dist/${baseName}.min.js`, minified.code);
    if (minified.map) {
      fs.writeFileSync(`./dist/${baseName}.min.js.map`, minified.map);
    }
  }

  console.log('🎨 Processing CSS...');
  
  // Copy and process CSS
  const cssContent = fs.readFileSync('./src/jquery.bootstrap-touchspin.css', 'utf-8');
  const cssWithBanner = `${banner}\n${cssContent}`;
  
  // Write unminified CSS
  fs.writeFileSync('./dist/jquery.bootstrap-touchspin.css', cssWithBanner);
  
  // Minify CSS
  const cleanCSS = new CleanCSS({
    format: {
      breaks: { afterComment: true }
    }
  });
  const minifiedCSS = cleanCSS.minify(cssWithBanner);
  fs.writeFileSync('./dist/jquery.bootstrap-touchspin.min.css', minifiedCSS.styles);

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