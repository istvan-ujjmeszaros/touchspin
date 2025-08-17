/**
 * Generate HTML reports from Istanbul coverage JSON
 * 
 * This script reads the converted Istanbul coverage JSON and generates HTML reports.
 */

const fs = require('fs');
const path = require('path');
const libCoverage = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const reports = require('istanbul-reports');

function generateHtmlFromJson() {
  const coverageFile = path.join(process.cwd(), 'coverage', 'coverage-final.json');
  const htmlOutputDir = path.join(process.cwd(), 'coverage', 'html');

  if (!fs.existsSync(coverageFile)) {
    console.error('❌ Coverage JSON file not found:', coverageFile);
    console.log('💡 Run the V8 to Istanbul conversion first: npm run coverage:convert');
    return false;
  }

  // Ensure output directory exists
  if (!fs.existsSync(htmlOutputDir)) {
    fs.mkdirSync(htmlOutputDir, { recursive: true });
  }

  try {
    console.log('🎨 Generating HTML reports from Istanbul coverage JSON...');

    // Read and parse coverage data
    const coverageData = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
    
    // Create coverage map from the data
    const coverageMap = libCoverage.createCoverageMap(coverageData);

    // Show summary
    const summary = coverageMap.getCoverageSummary();
    console.log('\n📈 Coverage Summary:');
    console.log('='.repeat(50));
    console.log(`Lines: ${summary.lines.pct.toFixed(2)}% (${summary.lines.covered}/${summary.lines.total})`);
    console.log(`Functions: ${summary.functions.pct.toFixed(2)}% (${summary.functions.covered}/${summary.functions.total})`);
    console.log(`Branches: ${summary.branches.pct.toFixed(2)}% (${summary.branches.covered}/${summary.branches.total})`);
    console.log(`Statements: ${summary.statements.pct.toFixed(2)}% (${summary.statements.covered}/${summary.statements.total})`);
    console.log('='.repeat(50));

    // Create context for report generation
    const context = libReport.createContext({
      dir: htmlOutputDir,
      defaultSummarizer: 'nested'
    });

    // Create and execute HTML report
    const htmlReport = reports.create('html', {
      skipEmpty: false,
      skipFull: false,
      linkMapper: {
        getPath: (node) => {
          // Convert absolute paths to relative for better display
          if (node.getFileCoverage) {
            const filePath = node.getFileCoverage().path;
            return path.relative(process.cwd(), filePath);
          }
          return node.getRelativeName();
        }
      }
    });

    htmlReport.execute(context, coverageMap);

    console.log('✅ HTML coverage reports generated successfully!');
    console.log(`📂 HTML Report: ${path.join(htmlOutputDir, 'index.html')}`);
    console.log(`📄 Coverage JSON: ${coverageFile}`);

    return true;

  } catch (error) {
    console.error('❌ Error generating HTML reports:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  generateHtmlFromJson();
}

module.exports = generateHtmlFromJson;