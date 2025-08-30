import fs from 'fs';
import CleanCSS from 'clean-css';

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

console.log('🎨 Building CSS...');

// Read source CSS
const cssContent = fs.readFileSync('src/jquery.bootstrap-touchspin.css', 'utf-8');
const cssWithBanner = `${banner}\n${cssContent}`;

// Write development version
fs.writeFileSync('./dist/jquery.bootstrap-touchspin.css', cssWithBanner);
console.log('✅ Created dist/jquery.bootstrap-touchspin.css');

// Create minified version
const cleanCSS = new CleanCSS();
const minifiedCSS = cleanCSS.minify(cssWithBanner);
fs.writeFileSync('./dist/jquery.bootstrap-touchspin.min.css', minifiedCSS.styles);
console.log('✅ Created dist/jquery.bootstrap-touchspin.min.css');

console.log('🎨 CSS build completed!');