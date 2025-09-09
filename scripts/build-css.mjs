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

console.log('🎨 Building CSS for all packages...');

// Define the Bootstrap packages that have CSS builds
const packages = ['bootstrap3', 'bootstrap4', 'bootstrap5'];

// Determine output directory based on BUILD_INTEGRITY_CHECK environment variable
const distFolder = process.env.BUILD_INTEGRITY_CHECK === 'true' ? 'tmp-dist-integrity-check' : 'dist';

// Ensure output directory exists
if (!fs.existsSync(distFolder)) {
  fs.mkdirSync(distFolder, { recursive: true });
}

packages.forEach(packageName => {
  const cssPath = `packages/renderers/${packageName}/dist/touchspin-${packageName}.css`;
  
  // Check if the package CSS exists
  if (!fs.existsSync(cssPath)) {
    console.log(`⚠️  CSS not found for ${packageName}, skipping...`);
    return;
  }

  // Read the compiled CSS from the package
  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  const cssWithBanner = `${banner}\n${cssContent}`;

  // Write development version to main dist
  fs.writeFileSync(`./${distFolder}/touchspin-${packageName}.css`, cssWithBanner);
  console.log(`✅ Created ${distFolder}/touchspin-${packageName}.css`);

  // Create minified version
  const cleanCSS = new CleanCSS();
  const minifiedCSS = cleanCSS.minify(cssWithBanner);
  fs.writeFileSync(`./${distFolder}/touchspin-${packageName}.min.css`, minifiedCSS.styles);
  console.log(`✅ Created ${distFolder}/touchspin-${packageName}.min.css`);
});

console.log('🎨 CSS build completed!');