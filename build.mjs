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

async function buildAll() {
  // Clean dist directory
  if (fs.existsSync('./dist')) {
    fs.rmSync('./dist', { recursive: true });
  }
  fs.mkdirSync('./dist', { recursive: true });

  console.log('🔨 Building JavaScript...');
  
  // Build unminified JS
  await build({
    build: {
      lib: {
        entry: resolve('src/jquery.bootstrap-touchspin.js'),
        formats: ['umd'],
        name: 'TouchSpin',
        fileName: () => 'jquery.bootstrap-touchspin.js'
      },
      rollupOptions: {
        external: ['jquery'],
        output: {
          globals: { jquery: 'jQuery' },
          banner,
          intro: `
// Include renderer classes
${fs.readFileSync('./src/renderers/BootstrapRenderer.js', 'utf-8')}
${fs.readFileSync('./src/renderers/Bootstrap3Renderer.js', 'utf-8')}
${fs.readFileSync('./src/renderers/Bootstrap4Renderer.js', 'utf-8')}
${fs.readFileSync('./src/renderers/Bootstrap5Renderer.js', 'utf-8')}
${fs.readFileSync('./src/renderers/RendererFactory.js', 'utf-8')}
`
        }
      },
      outDir: 'dist',
      emptyOutDir: false,
      sourcemap: true,
      minify: false
    }
  });

  console.log('🔄 Transpiling to ES5 with Babel...');
  
  // Read the built JS and transpile to ES5
  const jsContent = fs.readFileSync('./dist/jquery.bootstrap-touchspin.js', 'utf-8');
  
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
  fs.writeFileSync('./dist/jquery.bootstrap-touchspin.js', transpiledWithBanner);

  console.log('🗜️ Minifying JavaScript...');
  
  const minified = await minify(transpiledWithBanner, {
    format: {
      comments: (node, comment) => {
        return comment.value.includes(pkg.name) || comment.value.includes('License');
      },
      preamble: banner
    },
    sourceMap: {
      filename: 'jquery.bootstrap-touchspin.min.js',
      url: 'jquery.bootstrap-touchspin.min.js.map'
    }
  });

  fs.writeFileSync('./dist/jquery.bootstrap-touchspin.min.js', minified.code);
  if (minified.map) {
    fs.writeFileSync('./dist/jquery.bootstrap-touchspin.min.js.map', minified.map);
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