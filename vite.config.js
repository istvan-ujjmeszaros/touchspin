import { defineConfig } from 'vite';
import { resolve } from 'path';
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

export default defineConfig({
  build: {
    lib: {
      entry: {
        'jquery.bootstrap-touchspin': resolve(__dirname, 'src/jquery.bootstrap-touchspin.js')
      },
      formats: ['umd'],
      name: 'TouchSpin',
      fileName: (format, entryName) => `${entryName}.js`
    },
    rollupOptions: {
      external: ['jquery'],
      output: {
        globals: {
          jquery: 'jQuery'
        },
        banner
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false, // We handle minification separately
    target: 'es2015' // Support modern browsers, we'll use Babel for ES5
  },
  css: {
    postcss: {
      plugins: [
        require('autoprefixer')
      ]
    }
  }
});