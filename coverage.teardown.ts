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

  // DEBUG: Log environment variables
  console.log(`🔧 Environment: TS_BUILD_TARGET=${process.env.TS_BUILD_TARGET}, PW_COVERAGE=${process.env.PW_COVERAGE}, COVERAGE=${process.env.COVERAGE}`);

  function toLocalPath(rawUrl: string): string | null {
    try {
      const u = new URL(rawUrl);
      let p = decodeURIComponent(u.pathname);         // e.g. /packages/jquery-plugin/src/index.js or /packages/jquery-plugin/dist/index.js

      // Ignore bundler/dev-server internals if present (none expected now)

      const ix = p.indexOf('/packages/');
      if (ix === -1) return null;

      p = p.slice(ix + 1);                            // drop leading slash before 'packages'
      p = p.replace(/\\/g, '/');

      let abs = path.join(process.cwd(), p);          // /repo/packages/…/index.js

      // Handle /src/…, /dist/…, and /devdist/… paths
      if (p.includes('/dist/') || p.includes('/devdist/')) {
        // For dist/devdist files, return the built file path as-is if it exists (we rely on sourcemaps)
        if (fs.existsSync(abs)) {
          return abs;
        }
        return null;
      }

      if (p.includes('/src/')) {
        // For src paths, prefer TS if JS doesn't exist
        if (!fs.existsSync(abs) && abs.endsWith('.js')) {
          const tsAbs = abs.replace(/\.js$/, '.ts');
          if (fs.existsSync(tsAbs)) abs = tsAbs;
        }
      }

      // only accept if it exists; otherwise skip
      if (!fs.existsSync(abs)) return null;
      return abs;
    } catch {
      return null;
    }
  }

  let filesProcessed = 0;
  const loggedUrls = new Set<string>();
  const loggedPaths = new Set<string>();
  const urlCounts = new Map<string, number>();
  const allRawUrls: string[] = [];
  const processedUrls: string[] = [];
  const skippedUrls: string[] = [];

  for (const file of coverageFiles) {
    const filePath = path.join(playwrightCoverageDir, file);

    try {
      const coverage = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      for (const entry of coverage) {
        // Collect ALL raw URLs for debugging
        allRawUrls.push(entry.url);

        const localPath = toLocalPath(entry.url);

        // Track URL frequency
        urlCounts.set(entry.url, (urlCounts.get(entry.url) || 0) + 1);

        // Only log unique URLs
        if (!loggedUrls.has(entry.url)) {
          const expectedTarget = entry.url.includes('/src/') ? 'SRC' :
                               entry.url.includes('/devdist/') ? 'DEVDIST' :
                               entry.url.includes('/dist/') ? 'DIST' : 'OTHER';
          console.log(`🔍 Processing URL [${expectedTarget}]: ${entry.url} → ${localPath || 'SKIPPED'}`);
          loggedUrls.add(entry.url);
        }

        if (!localPath) {
          // Track skipped URLs for debugging
          if (!skippedUrls.includes(entry.url)) {
            skippedUrls.push(entry.url);
          }
          continue;
        }

        // Skip external framework files (Bootstrap, jQuery, etc.) - we don't need coverage for third-party libs
        if (localPath.includes('/devdist/external/')) {
          if (!loggedPaths.has(localPath)) {
            console.log(`⏭️  Skipping external file: ${localPath}`);
            loggedPaths.add(localPath);
          }
          continue;
        }

        // Track processed URLs
        if (!processedUrls.includes(entry.url)) {
          processedUrls.push(entry.url);
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

          // Only log conversion success once per unique path
          if (!loggedPaths.has(localPath)) {
            console.log(`✅ Converted ${localPath}, got ${Object.keys(istanbulData).length} files`);
            loggedPaths.add(localPath);
          }

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

  // Comprehensive debug summary
  console.log(`\n📊 COVERAGE DEBUG SUMMARY:`);
  console.log(`   Total raw v8 URLs: ${allRawUrls.length}`);
  console.log(`   Unique URLs processed: ${processedUrls.length}`);
  console.log(`   Unique URLs skipped: ${skippedUrls.length}`);
  console.log(`   Istanbul files generated: ${filesProcessed}`);

  // Show core files specifically
  const coreIndexUrls = allRawUrls.filter(url => url.includes('/core/') && url.includes('index.js'));
  const rendererUrls = allRawUrls.filter(url => url.includes('/renderer') || url.includes('Renderer'));

  console.log(`\n🔍 KEY FILES ANALYSIS:`);
  console.log(`   Core index.js URLs: ${coreIndexUrls.length} → ${coreIndexUrls.join(', ')}`);
  console.log(`   Renderer URLs: ${rendererUrls.length} → ${rendererUrls.slice(0, 3).join(', ')}${rendererUrls.length > 3 ? '...' : ''}`);

  // Show devdist vs dist breakdown
  const devdistUrls = allRawUrls.filter(url => url.includes('/devdist/'));
  const distUrls = allRawUrls.filter(url => url.includes('/dist/'));

  console.log(`\n📁 BUILD TARGET ANALYSIS:`);
  console.log(`   DEVDIST URLs: ${devdistUrls.length} → ${devdistUrls.slice(0, 2).join(', ')}${devdistUrls.length > 2 ? '...' : ''}`);
  console.log(`   DIST URLs: ${distUrls.length} → ${distUrls.slice(0, 2).join(', ')}${distUrls.length > 2 ? '...' : ''}`);

  if (skippedUrls.length > 0) {
    console.log(`\n⚠️  SKIPPED URLs (first 5): ${skippedUrls.slice(0, 5).join(', ')}`);
  }

  if (filesProcessed > 0) {
    console.log(`\n✅ Successfully processed coverage for ${loggedUrls.size} unique source URLs`);
    console.log(`📁 Individual Istanbul JSON files saved to ${istanbulJsonDir}`);
    console.log('💡 Run "yarn coverage:merge && yarn coverage:report" to generate final reports');
  } else {
    console.log('\n❌ No source coverage collected - check if tests are running and importing project files');
  }
}

export default globalTeardown;
