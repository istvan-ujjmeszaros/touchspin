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

          // Properly merge coverage data instead of overwriting
          Object.keys(istanbulData).forEach(file => {
            if (istanbulCoverage[file]) {
              // Merge coverage for existing file
              const existing = istanbulCoverage[file];
              const newData = istanbulData[file];

              // Merge statement counts
              Object.keys(newData.s).forEach(stmt => {
                existing.s[stmt] = (existing.s[stmt] || 0) + (newData.s[stmt] || 0);
              });

              // Merge branch counts
              Object.keys(newData.b).forEach(branch => {
                if (!existing.b[branch]) {
                  existing.b[branch] = [...newData.b[branch]];
                } else {
                  // Ensure branch arrays are the same length
                  const maxLength = Math.max(existing.b[branch].length, newData.b[branch].length);
                  for (let i = 0; i < maxLength; i++) {
                    if (i >= existing.b[branch].length) {
                      existing.b[branch][i] = 0;
                    }
                    if (i >= newData.b[branch].length) {
                      // Don't add anything
                      continue;
                    }
                    existing.b[branch][i] = (existing.b[branch][i] || 0) + (newData.b[branch][i] || 0);
                  }
                }
              });

              // Merge function counts
              Object.keys(newData.f).forEach(func => {
                existing.f[func] = (existing.f[func] || 0) + (newData.f[func] || 0);
              });

              // Merge branch maps (metadata)
              Object.keys(newData.branchMap || {}).forEach(branch => {
                if (!existing.branchMap) existing.branchMap = {};
                if (!existing.branchMap[branch]) {
                  existing.branchMap[branch] = newData.branchMap[branch];
                }
              });

              // Merge statement maps (metadata)
              Object.keys(newData.statementMap || {}).forEach(stmt => {
                if (!existing.statementMap) existing.statementMap = {};
                if (!existing.statementMap[stmt]) {
                  existing.statementMap[stmt] = newData.statementMap[stmt];
                }
              });

              // Merge function maps (metadata)
              Object.keys(newData.fnMap || {}).forEach(func => {
                if (!existing.fnMap) existing.fnMap = {};
                if (!existing.fnMap[func]) {
                  existing.fnMap[func] = newData.fnMap[func];
                }
              });
            } else {
              // Add new file
              istanbulCoverage[file] = istanbulData[file];
            }
          });
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