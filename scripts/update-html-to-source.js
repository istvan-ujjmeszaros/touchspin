#!/usr/bin/env node

/**
 * Update HTML test files to load source files instead of built files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const htmlDir = path.join(__dirname, '..', '__tests__', 'html');

// Find all HTML files
const htmlFiles = fs.readdirSync(htmlDir).filter(file => file.endsWith('.html'));

console.log(`🔄 Updating ${htmlFiles.length} HTML files to use source files...`);

htmlFiles.forEach(filename => {
  const filePath = path.join(htmlDir, filename);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  console.log(`📄 Processing: ${filename}`);
  
  // Determine Bootstrap version from filename
  let bootstrapVersion = 4; // default
  if (filename.includes('bs3')) {
    bootstrapVersion = 3;
  } else if (filename.includes('bs5')) {
    bootstrapVersion = 5;
  }
  
  // Replace CSS link
  content = content.replace(
    /  <link href="\.\.\/\.\.\/dist\/jquery\.bootstrap-touchspin\.css"/g,
    '  <!-- Load source CSS -->\n  <link href="../../src/jquery.bootstrap-touchspin.css"'
  );
  
  // Replace JavaScript includes
  const jsReplacement = `  <!-- Load source renderer files -->
  <script src="../../src/renderers/AbstractRenderer.js"></script>
  <script src="../../src/renderers/Bootstrap${bootstrapVersion}Renderer.js"></script>
  
  <!-- Create Bootstrap ${bootstrapVersion} RendererFactory -->
  <script>
    window.RendererFactory = class {
      static createRenderer($, settings, originalinput) {
        return new Bootstrap${bootstrapVersion}Renderer($, settings, originalinput);
      }
      
      static getVersion() {
        return ${bootstrapVersion};
      }
    };
  </script>
  
  <!-- Load main TouchSpin source file -->
  <script src="../../src/jquery.bootstrap-touchspin.js"></script>`;
  
  // Replace built JS files
  content = content.replace(
    /  <script src="\.\.\/\.\.\/dist\/jquery\.bootstrap-touchspin-bs[345]\.js"><\/script>/g,
    jsReplacement
  );
  
  // Write updated content
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Updated: ${filename} (Bootstrap ${bootstrapVersion})`);
});

console.log('🎉 All HTML files updated to use source files!');