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

// Determine output directory based on BUILD_INTEGRITY_CHECK environment variable
const distFolder = process.env.BUILD_INTEGRITY_CHECK === 'true' ? 'tmp-dist-integrity-check' : 'dist';

// Ensure output directory exists
if (!fs.existsSync(distFolder)) {
  fs.mkdirSync(distFolder, { recursive: true });
}

// Read source CSS
const cssContent = fs.readFileSync('src/jquery.bootstrap-touchspin.css', 'utf-8');
const cssWithBanner = `${banner}\n${cssContent}`;

// Write development version
fs.writeFileSync(`./${distFolder}/jquery.bootstrap-touchspin.css`, cssWithBanner);
console.log(`✅ Created ${distFolder}/jquery.bootstrap-touchspin.css`);

// Create minified version
const cleanCSS = new CleanCSS();
const minifiedCSS = cleanCSS.minify(cssWithBanner);
fs.writeFileSync(`./${distFolder}/jquery.bootstrap-touchspin.min.css`, minifiedCSS.styles);
console.log(`✅ Created ${distFolder}/jquery.bootstrap-touchspin.min.css`);

console.log('🎨 CSS build completed!');