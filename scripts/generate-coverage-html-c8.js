/**
 * Generate HTML Coverage Reports using c8
 * 
 * This script uses the c8 package to convert V8 coverage data to HTML reports.
 * c8 is a wrapper around v8-to-istanbul and istanbul-reports that handles the conversion.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class C8CoverageProcessor {
  constructor() {
    this.rawCoverageDir = path.join(process.cwd(), 'coverage', 'raw');
    this.tempV8Dir = path.join(process.cwd(), 'coverage', 'temp-v8');
    this.htmlOutputDir = path.join(process.cwd(), 'coverage', 'html');
  }

  async init() {
    // Clean and create temp V8 directory
    if (fs.existsSync(this.tempV8Dir)) {
      fs.rmSync(this.tempV8Dir, { recursive: true });
    }
    fs.mkdirSync(this.tempV8Dir, { recursive: true });

    // Ensure output directory exists
    if (!fs.existsSync(this.htmlOutputDir)) {
      fs.mkdirSync(this.htmlOutputDir, { recursive: true });
    }
  }

  /**
   * Convert our raw V8 coverage data to the format c8 expects
   */
  prepareV8CoverageData() {
    if (!fs.existsSync(this.rawCoverageDir)) {
      console.warn('⚠️  Raw coverage directory not found:', this.rawCoverageDir);
      return false;
    }

    const rawFiles = fs.readdirSync(this.rawCoverageDir).filter(file => file.endsWith('.json'));
    
    if (rawFiles.length === 0) {
      console.warn('⚠️  No raw coverage files found');
      return false;
    }

    console.log(`📊 Processing ${rawFiles.length} coverage files for c8...`);

    // Merge all coverage data
    const allCoverage = [];
    const processedScripts = new Set();

    for (const rawFile of rawFiles) {
      const rawPath = path.join(this.rawCoverageDir, rawFile);
      const rawCoverage = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
      
      // Each raw file contains an array of coverage entries
      for (const entry of rawCoverage) {
        // Avoid duplicates by using script URL as key
        if (!processedScripts.has(entry.url)) {
          allCoverage.push(entry);
          processedScripts.add(entry.url);
        }
      }
    }

    // Write the merged coverage to a file c8 can understand
    const v8CoverageFile = path.join(this.tempV8Dir, 'coverage.json');
    fs.writeFileSync(v8CoverageFile, JSON.stringify(allCoverage, null, 2));

    console.log(`📄 Prepared V8 coverage file: ${v8CoverageFile}`);
    return true;
  }

  /**
   * Use c8 to generate HTML reports
   */
  async generateHtmlWithC8() {
    return new Promise((resolve, reject) => {
      console.log('🎨 Generating HTML coverage reports with c8...');

      // Run c8 report command
      const c8Process = spawn('npx', [
        'c8',
        'report',
        '--temp-directory', this.tempV8Dir,
        '--reports-dir', this.htmlOutputDir,
        '--reporter=html',
        '--reporter=text',
        '--reporter=json'
      ], {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd()
      });

      c8Process.on('close', (code) => {
        if (code === 0) {
          console.log('✅ c8 HTML coverage reports generated successfully!');
          console.log(`📂 HTML Report: ${path.join(this.htmlOutputDir, 'index.html')}`);
          resolve();
        } else {
          reject(new Error(`c8 command failed with exit code ${code}`));
        }
      });

      c8Process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Alternative: Create Istanbul-format coverage and use nyc
   */
  async generateWithNyc() {
    return new Promise((resolve, reject) => {
      console.log('🎨 Attempting HTML generation with nyc...');

      // Use nyc to generate reports from coverage data
      const nycProcess = spawn('npx', [
        'nyc',
        'report',
        '--temp-dir', this.tempV8Dir,
        '--report-dir', this.htmlOutputDir,
        '--reporter=html',
        '--reporter=text'
      ], {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd()
      });

      nycProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ nyc HTML coverage reports generated successfully!');
          resolve();
        } else {
          reject(new Error(`nyc command failed with exit code ${code}`));
        }
      });

      nycProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Main processing function
   */
  async process() {
    try {
      console.log('🚀 Starting c8 coverage HTML generation...');
      console.log('=' .repeat(60));

      await this.init();
      
      const hasData = this.prepareV8CoverageData();
      if (!hasData) {
        console.warn('⚠️  No coverage data to process');
        return;
      }

      try {
        await this.generateHtmlWithC8();
      } catch (error) {
        console.warn('⚠️  c8 approach failed:', error.message);
        console.log('💡 Trying alternative approach with nyc...');
        
        try {
          await this.generateWithNyc();
        } catch (nycError) {
          console.error('❌ Both c8 and nyc approaches failed');
          console.error('c8 error:', error.message);
          console.error('nyc error:', nycError.message);
          throw error;
        }
      }

    } catch (error) {
      console.error('❌ Error generating coverage reports:', error.message);
      process.exit(1);
    } finally {
      // Clean up temp directory
      if (fs.existsSync(this.tempV8Dir)) {
        fs.rmSync(this.tempV8Dir, { recursive: true });
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  const processor = new C8CoverageProcessor();
  processor.process();
}

module.exports = C8CoverageProcessor;