/**
 * Convert V8 Coverage to Istanbul Format
 * 
 * This script converts raw V8 coverage data to Istanbul format and saves it.
 * The Istanbul JSON can then be used by various tools to generate HTML reports.
 */

const fs = require('fs');
const path = require('path');
const v8toIstanbul = require('v8-to-istanbul');
const libCoverage = require('istanbul-lib-coverage');

async function convertV8ToIstanbul() {
  const rawCoverageDir = path.join(process.cwd(), 'coverage', 'raw');
  const outputFile = path.join(process.cwd(), 'coverage', 'coverage-final.json');

  if (!fs.existsSync(rawCoverageDir)) {
    console.warn('⚠️  Raw coverage directory not found:', rawCoverageDir);
    return false;
  }

  const rawFiles = fs.readdirSync(rawCoverageDir).filter(file => file.endsWith('.json'));
  
  if (rawFiles.length === 0) {
    console.warn('⚠️  No raw coverage files found');
    return false;
  }

  console.log(`📊 Converting ${rawFiles.length} V8 coverage files to Istanbul format...`);

  // Create coverage map to merge all coverage data
  const coverageMap = libCoverage.createCoverageMap();

  for (const rawFile of rawFiles) {
    try {
      console.log(`📄 Processing: ${rawFile}`);
      
      const rawPath = path.join(rawCoverageDir, rawFile);
      const rawCoverage = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
      
      // Each raw file contains an array of coverage entries
      for (const coverageEntry of rawCoverage) {
        const url = coverageEntry.url;
        let filePath;
        
        if (url.includes('src/')) {
          // For URLs like "http://localhost:3000/src/jquery.bootstrap-touchspin.js"
          const srcIndex = url.indexOf('src/');
          filePath = path.join(process.cwd(), url.substring(srcIndex));
        } else if (url.includes('dist/')) {
          // Legacy support for URLs like "http://localhost:3000/dist/jquery.bootstrap-touchspin-bs4.js"
          const distIndex = url.indexOf('dist/');
          filePath = path.join(process.cwd(), url.substring(distIndex));
        } else {
          // Fallback: try to extract filename and assume it's in src (since we're now using source files)
          const filename = path.basename(url);
          filePath = path.join(process.cwd(), 'src', filename);
        }

        // Normalize path separators for cross-platform compatibility
        filePath = path.resolve(filePath);

        console.log(`  📁 Converting: ${path.relative(process.cwd(), filePath)}`);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          console.warn(`  ⚠️  Source file not found: ${filePath}`);
          continue;
        }

        // Determine if we're processing a source file or built file
        const isSourceFile = filePath.includes(path.sep + 'src' + path.sep);
        let converter;
        
        if (isSourceFile) {
          // For source files, no source map is needed since they're already the original source
          console.log(`  📄 Processing source file directly: ${path.relative(process.cwd(), filePath)}`);
          
          // Create v8-to-istanbul converter for source file (no source map needed)
          converter = v8toIstanbul(filePath, 0, { 
            source: coverageEntry.source
          });
          await converter.load();
        } else {
          // For built files, check for source map file
          const sourceMapPath = filePath + '.map';
          const hasSourceMap = fs.existsSync(sourceMapPath);
          console.log(`  🗺️  Source map ${hasSourceMap ? 'found' : 'not found'}: ${path.relative(process.cwd(), sourceMapPath)}`);

          let sourceMapData = undefined;
          if (hasSourceMap) {
            try {
              sourceMapData = JSON.parse(fs.readFileSync(sourceMapPath, 'utf8'));
              console.log(`  📖 Source map loaded - sources: ${sourceMapData.sources ? sourceMapData.sources.join(', ') : 'none'}`);
            } catch (error) {
              console.warn(`  ⚠️  Error reading source map: ${error.message}`);
            }
          }

          // Create v8-to-istanbul converter with source map support for built files
          converter = v8toIstanbul(filePath, 0, { 
            source: coverageEntry.source,
            sourceMap: {
              sourcemap: sourceMapData
            }
          });
          await converter.load();

          // Log source map information after loading
          if (hasSourceMap) {
            console.log(`  ✅ Source map processing enabled for: ${path.relative(process.cwd(), filePath)}`);
          }
        }

        // Apply V8 coverage data
        converter.applyCoverage(coverageEntry.functions);

        // Convert to Istanbul format and merge
        const istanbulCoverage = converter.toIstanbul();
        coverageMap.merge(istanbulCoverage);
      }
    } catch (error) {
      console.error(`❌ Error processing file ${rawFile}:`, error.message);
    }
  }

  // Save the converted coverage data
  const coverageData = coverageMap.toJSON();
  fs.writeFileSync(outputFile, JSON.stringify(coverageData, null, 2));

  console.log('✅ V8 coverage converted to Istanbul format successfully!');
  console.log(`📄 Istanbul Coverage JSON: ${outputFile}`);

  // Generate summary
  const summary = coverageMap.getCoverageSummary();
  const files = coverageMap.files();

  console.log('\n📈 Coverage Summary:');
  console.log('='.repeat(60));
  console.log(`Files covered: ${files.length}`);
  
  // Show which files are in the coverage report
  console.log('\n📁 Files in coverage report:');
  files.forEach(file => {
    const relativePath = path.relative(process.cwd(), file);
    const fileCoverage = coverageMap.fileCoverageFor(file);
    const fileSummary = fileCoverage.toSummary();
    console.log(`  📄 ${relativePath} - ${fileSummary.lines.pct.toFixed(1)}% lines`);
  });
  
  console.log(`\nLines: ${summary.lines.pct.toFixed(2)}% (${summary.lines.covered}/${summary.lines.total})`);
  console.log(`Functions: ${summary.functions.pct.toFixed(2)}% (${summary.functions.covered}/${summary.functions.total})`);
  console.log(`Branches: ${summary.branches.pct.toFixed(2)}% (${summary.branches.covered}/${summary.branches.total})`);
  console.log(`Statements: ${summary.statements.pct.toFixed(2)}% (${summary.statements.covered}/${summary.statements.total})`);
  console.log('='.repeat(60));

  console.log('\n💡 To generate HTML reports, you can now use:');
  console.log(`   npx nyc report --reporter=html --temp-dir=coverage --report-dir=coverage/html`);
  console.log(`   or`);
  console.log(`   npx istanbul-reports html coverage/coverage-final.json`);

  return true;
}

// Run if called directly
if (require.main === module) {
  convertV8ToIstanbul().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = convertV8ToIstanbul;