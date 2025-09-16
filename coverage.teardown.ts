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

  // Create output directory for individual Istanbul JSON files
  const istanbulJsonDir = path.join(process.cwd(), 'reports', 'istanbul-json');
  fs.mkdirSync(istanbulJsonDir, { recursive: true });

  function toLocalPath(rawUrl: string): string | null {
    try {
      const u = new URL(rawUrl);
      let p = decodeURIComponent(u.pathname);         // e.g. /packages/jquery-plugin/src/index.js
      const ix = p.indexOf('/packages/');
      if (ix === -1) return null;

      p = p.slice(ix + 1);                            // drop leading slash before 'packages'
      p = p.replace(/\\/g, '/');

      // remove dev-server query params (already gone via URL), keep extension
      let abs = path.join(process.cwd(), p);          // /repo/packages/…/index.js

      // prefer TS if JS isn't present
      if (!fs.existsSync(abs) && abs.endsWith('.js')) {
        const tsAbs = abs.replace(/\.js$/, '.ts');
        if (fs.existsSync(tsAbs)) abs = tsAbs;
      }

      // only accept if it exists; otherwise skip
      if (!fs.existsSync(abs)) return null;
      return abs;
    } catch {
      return null;
    }
  }

  let filesProcessed = 0;

  for (const file of coverageFiles) {
    const filePath = path.join(playwrightCoverageDir, file);

    try {
      const coverage = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      for (const entry of coverage) {
        const localPath = toLocalPath(entry.url);
        console.log(`🔍 Processing URL: ${entry.url} → ${localPath || 'SKIPPED'}`);
        if (!localPath) {
          // skip non-project modules (vite deps, etc.)
          continue;
        }

        try {
          // Create converter for the local file path.
          // Let v8-to-istanbul load the file & sourcemap by itself.
          const converter = v8toIstanbul(localPath, 0, {});

          // Important: await load so sourcemap can be read from disk
          await converter.load();

          // Apply the raw V8 function ranges
          converter.applyCoverage(entry.functions);

          // Convert to Istanbul and write ONE .istanbul.json PER INPUT COVERAGE FILE
          const istanbulData = converter.toIstanbul();
          console.log(`✅ Converted ${localPath}, got ${Object.keys(istanbulData).length} files`);

          fs.mkdirSync(istanbulJsonDir, { recursive: true });

          // Create unique output file name for each source file
          const base = path.basename(file, '.json');
          // Create a unique identifier from the path to avoid collisions
          const relativePath = path.relative(process.cwd(), localPath);
          const uniqueId = relativePath.replace(/[/\\]/g, '_').replace(/\./g, '_');
          const outFile = path.join(istanbulJsonDir, `${base}_${uniqueId}.istanbul.json`);

          fs.writeFileSync(outFile, JSON.stringify(istanbulData));
          filesProcessed++;
        } catch (conversionError) {
          console.warn(`❌ Failed to convert ${localPath}:`, conversionError.message);
        }
      }
    } catch (error) {
      console.warn(`Failed to process ${file}:`, error);
    }
  }

  if (filesProcessed > 0) {
    console.log(`✅ Processed coverage for ${filesProcessed} source files`);
    console.log(`📁 Individual Istanbul JSON files saved to ${istanbulJsonDir}`);
    console.log('💡 Run "yarn coverage:merge && yarn coverage:report" to generate final reports');
  } else {
    console.log('⚠️  No source coverage collected');
  }
}

export default globalTeardown;