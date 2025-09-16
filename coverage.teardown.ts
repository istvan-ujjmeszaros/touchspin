import fs from 'fs';
import path from 'path';
import v8toIstanbul from 'v8-to-istanbul';

async function globalTeardown() {
  const playwrightCoverageDir = path.join(process.cwd(), 'reports', 'playwright-coverage');
  const nycOutputDir = path.join(process.cwd(), '.nyc_output');

  // Check if we have any coverage files
  if (!fs.existsSync(playwrightCoverageDir)) {
    console.log('No Playwright coverage to process');
    return;
  }

  const coverageFiles = fs.readdirSync(playwrightCoverageDir)
    .filter(f => f.endsWith('.json'));

  if (coverageFiles.length === 0) {
    console.log('No coverage files found in', playwrightCoverageDir);

    // Check old location
    const oldCoverageDir = path.join(process.cwd(), 'reports', 'coverage');
    if (fs.existsSync(oldCoverageDir)) {
      const oldFiles = fs.readdirSync(oldCoverageDir).filter(f => f.endsWith('.json') && f !== 'coverage-final.json');
      if (oldFiles.length > 0) {
        console.log(`Found ${oldFiles.length} old coverage files in ${oldCoverageDir} - these are being incorrectly counted!`);
      }
    }
    return;
  }

  console.log(`\n📊 Processing ${coverageFiles.length} coverage files from ${playwrightCoverageDir}...`);

  const istanbulCoverage: Record<string, any> = {};
  let filesProcessed = 0;

  for (const file of coverageFiles) {
    const filePath = path.join(playwrightCoverageDir, file);

    try {
      const coverage = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      for (const entry of coverage) {
        // Skip non-source files
        if (!entry.url || !entry.url.includes('/packages/') || entry.url.includes('node_modules')) {
          continue;
        }

        // Extract the file path from URL
        const match = entry.url.match(/packages\/(.+\.(?:js|ts))$/);
        if (!match) continue;

        const relativePath = match[0];
        const absolutePath = path.join(process.cwd(), relativePath);

        // Map to source file if it's a JS file from a TS source
        const sourcePath = absolutePath.replace(/\.js$/, '.ts');
        const finalPath = fs.existsSync(sourcePath) ? sourcePath : absolutePath;

        if (fs.existsSync(finalPath)) {
          const converter = v8toIstanbul(finalPath, 0, { source: entry.source });
          await converter.load();
          converter.applyCoverage(entry.functions);

          const istanbulData = converter.toIstanbul();
          Object.assign(istanbulCoverage, istanbulData);
          filesProcessed++;
        }
      }
    } catch (error) {
      console.warn(`Failed to process ${file}:`, error);
    }
  }

  // Save merged coverage
  if (Object.keys(istanbulCoverage).length > 0) {
    const outputFile = path.join(nycOutputDir, 'coverage.json');
    fs.writeFileSync(outputFile, JSON.stringify(istanbulCoverage, null, 2));
    console.log(`✅ Processed coverage for ${filesProcessed} source files`);
    console.log(`📁 Coverage saved to ${outputFile}`);

    // Generate HTML report automatically
    console.log('\n📊 Generating HTML coverage report...');
    const { execSync } = await import('child_process');
    try {
      const output = execSync('yarn nyc report --reporter=html --reporter=text', {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe']
      });
      console.log(output);
      console.log('📈 HTML coverage report generated at reports/coverage/index.html');
    } catch (error: any) {
      // NYC exits with non-zero if coverage thresholds aren't met, but report is still generated
      if (error.stdout) {
        console.log(error.stdout);
        console.log('📈 HTML coverage report generated at reports/coverage/index.html');
      } else {
        console.error('Failed to generate coverage report:', error.message);
      }
    }
  } else {
    console.log('⚠️  No source coverage collected');
  }
}

export default globalTeardown;