/**
 * Generate HTML Coverage Reports from V8 Coverage Data
 * 
 * This script processes raw V8 coverage data collected by Playwright tests
 * and generates HTML coverage reports using the v8-to-istanbul conversion.
 */

const fs = require('fs');
const path = require('path');
const v8toIstanbul = require('v8-to-istanbul');
const libCoverage = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const reports = require('istanbul-reports');

class CoverageProcessor {
  constructor() {
    this.rawCoverageDir = path.join(process.cwd(), 'coverage', 'raw');
    this.htmlOutputDir = path.join(process.cwd(), 'coverage', 'html');
    this.mergedCoverageFile = path.join(process.cwd(), 'coverage', 'coverage-final.json');
  }

  async init() {
    // Ensure output directories exist
    if (!fs.existsSync(this.htmlOutputDir)) {
      fs.mkdirSync(this.htmlOutputDir, { recursive: true });
    }
  }

  /**
   * Get all raw coverage JSON files
   */
  getRawCoverageFiles() {
    if (!fs.existsSync(this.rawCoverageDir)) {
      console.warn('⚠️  Raw coverage directory not found:', this.rawCoverageDir);
      return [];
    }

    return fs.readdirSync(this.rawCoverageDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(this.rawCoverageDir, file));
  }

  /**
   * Convert V8 coverage entry to Istanbul format
   */
  async convertV8ToIstanbul(coverageEntry) {
    try {
      // Extract the actual file path from the URL
      const url = coverageEntry.url;
      let filePath;
      
      if (url.includes('dist/')) {
        // For URLs like "http://localhost:3000/dist/jquery.bootstrap-touchspin-bs4.js"
        const distIndex = url.indexOf('dist/');
        filePath = path.join(process.cwd(), url.substring(distIndex));
      } else {
        // Fallback: try to extract filename and assume it's in dist
        const filename = path.basename(url);
        filePath = path.join(process.cwd(), 'dist', filename);
      }

      // Normalize path separators for cross-platform compatibility
      filePath = path.resolve(filePath);

      console.log(`📁 Processing file: ${filePath}`);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  Source file not found: ${filePath}`);
        return null;
      }

      // Create v8-to-istanbul converter
      const converter = v8toIstanbul(filePath, 0, { source: coverageEntry.source });
      await converter.load();

      // Apply V8 coverage data
      converter.applyCoverage(coverageEntry.functions);

      // Convert to Istanbul format
      const istanbulCoverage = converter.toIstanbul();
      
      return istanbulCoverage;
    } catch (error) {
      console.error(`❌ Error converting coverage for ${coverageEntry.url}:`, error.message);
      return null;
    }
  }

  /**
   * Process all raw coverage files and merge them
   */
  async processAllCoverageFiles() {
    const rawFiles = this.getRawCoverageFiles();
    
    if (rawFiles.length === 0) {
      console.warn('⚠️  No raw coverage files found to process');
      return null;
    }

    console.log(`📊 Processing ${rawFiles.length} coverage files...`);

    // Create coverage map to merge all coverage data
    const coverageMap = libCoverage.createCoverageMap();

    for (const rawFile of rawFiles) {
      try {
        console.log(`📄 Processing: ${path.basename(rawFile)}`);
        
        const rawCoverage = JSON.parse(fs.readFileSync(rawFile, 'utf8'));
        
        // Each raw file contains an array of coverage entries
        for (const coverageEntry of rawCoverage) {
          const istanbulCoverage = await this.convertV8ToIstanbul(coverageEntry);
          
          if (istanbulCoverage) {
            // Merge into coverage map
            coverageMap.merge(istanbulCoverage);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing file ${rawFile}:`, error.message);
      }
    }

    return coverageMap;
  }

  /**
   * Generate HTML reports from coverage map
   */
  generateHtmlReports(coverageMap) {
    if (!coverageMap || coverageMap.files().length === 0) {
      console.warn('⚠️  No coverage data available for HTML report generation');
      return;
    }

    console.log('🎨 Generating HTML coverage reports...');

    try {
      // Save merged coverage data as JSON first
      const coverageData = coverageMap.toJSON();
      fs.writeFileSync(this.mergedCoverageFile, JSON.stringify(coverageData, null, 2));

      // Create report context - try with the coverage map in options
      const context = libReport.createContext({
        dir: this.htmlOutputDir,
        watermarks: {
          statements: [50, 80],
          functions: [50, 80],
          branches: [50, 80],
          lines: [50, 80]
        }
      });

      // Generate HTML report
      const htmlReport = reports.create('html', {
        skipEmpty: false,
        skipFull: false
      });

      htmlReport.execute(context, coverageMap);

      console.log('✅ HTML coverage reports generated successfully!');
      console.log(`📂 HTML Report: ${path.join(this.htmlOutputDir, 'index.html')}`);
      console.log(`📄 Coverage JSON: ${this.mergedCoverageFile}`);

    } catch (error) {
      console.error('❌ Error generating HTML reports:', error.message);
      console.log('📄 Coverage JSON saved successfully to:', this.mergedCoverageFile);
      console.log('💡 You can use other tools to generate HTML from the JSON file');
    }
  }

  /**
   * Generate coverage summary for console output
   */
  generateSummary(coverageMap) {
    if (!coverageMap || coverageMap.files().length === 0) {
      return;
    }

    const summary = coverageMap.getCoverageSummary();
    const files = coverageMap.files();

    console.log('\n📈 Coverage Summary:');
    console.log('='.repeat(60));
    console.log(`Files covered: ${files.length}`);
    console.log(`Lines: ${summary.lines.pct.toFixed(2)}% (${summary.lines.covered}/${summary.lines.total})`);
    console.log(`Functions: ${summary.functions.pct.toFixed(2)}% (${summary.functions.covered}/${summary.functions.total})`);
    console.log(`Branches: ${summary.branches.pct.toFixed(2)}% (${summary.branches.covered}/${summary.branches.total})`);
    console.log(`Statements: ${summary.statements.pct.toFixed(2)}% (${summary.statements.covered}/${summary.statements.total})`);
    console.log('='.repeat(60));

    // Per-file breakdown
    if (files.length > 0) {
      console.log('\n📁 Per-file Coverage:');
      files.forEach(file => {
        const fileCoverage = coverageMap.fileCoverageFor(file);
        const fileSummary = fileCoverage.toSummary();
        const relativePath = path.relative(process.cwd(), file);
        console.log(`  ${relativePath}: ${fileSummary.lines.pct.toFixed(1)}% lines, ${fileSummary.functions.pct.toFixed(1)}% functions`);
      });
    }
  }

  /**
   * Main processing function
   */
  async process() {
    try {
      console.log('🚀 Starting coverage HTML generation...');
      console.log('=' .repeat(60));

      await this.init();
      
      const coverageMap = await this.processAllCoverageFiles();
      
      if (coverageMap) {
        this.generateSummary(coverageMap);
        this.generateHtmlReports(coverageMap);
      } else {
        console.warn('⚠️  No coverage data processed. Check if tests have been run and coverage data exists.');
      }

    } catch (error) {
      console.error('❌ Error generating coverage reports:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const processor = new CoverageProcessor();
  processor.process();
}

module.exports = CoverageProcessor;