#!/usr/bin/env node

/**
 * Guard script to prevent shared core fixture usage in framework renderer tests
 *
 * This enforces the rule that Bootstrap and Tailwind renderers must use their
 * own version-specific fixtures, not the shared core fixtures.
 *
 * Usage:
 *   node guard-no-shared-fixtures.mjs                           # Scan all framework renderer tests
 *   node guard-no-shared-fixtures.mjs packages/renderers       # Scan specific directory
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { basename, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

const HELP_TEXT = `
🚨 Shared Core Fixture Usage Detected in Framework Renderer Tests

The following Bootstrap/Tailwind renderer test files contain references to shared core fixtures:

Instead of shared core fixtures, use framework-specific fixtures:

✅ CORRECT (Bootstrap 5):
  await page.goto('../fixtures/bootstrap5-fixture.html');

✅ CORRECT (Bootstrap 4):
  await page.goto('../fixtures/bootstrap4-fixture.html');

✅ CORRECT (Bootstrap 3):
  await page.goto('../fixtures/bootstrap3-fixture.html');

✅ CORRECT (Tailwind):
  await page.goto('../fixtures/tailwind-fixture.html');

❌ WRONG:
  await page.goto('/packages/core/tests/fixtures/core-api-fixture.html');
  await page.goto('/packages/core/tests/fixtures/<anything>.html');

Why framework-specific fixtures are required:
- Proper CSS/JS dependencies for each framework version
- Isolated testing environment per framework
- Prevents cross-framework contamination
- Faster test execution (no external CSS loading)

`;

function walkDir(dir, pattern) {
  const files = [];

  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = `${dir}/${entry.name}`;

      if (entry.isDirectory()) {
        files.push(...walkDir(fullPath, pattern));
      } else if (entry.isFile() && entry.name.endsWith(pattern)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }

  return files;
}

function findFrameworkRendererTests(targetPaths = []) {
  const files = [];

  // If specific target paths provided, scan only those
  if (targetPaths.length > 0) {
    for (const targetPath of targetPaths) {
      const fullPath = targetPath.startsWith('/') ? targetPath : `${projectRoot}/${targetPath}`;

      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          files.push(...walkDir(fullPath, '.spec.ts'));
        } else if (stat.isFile() && fullPath.endsWith('.spec.ts')) {
          files.push(fullPath);
        }
      } catch (error) {
        console.warn(`Warning: Could not access target path ${targetPath}: ${error.message}`);
      }
    }

    // Filter to only framework renderer files
    return files.filter(file => isFrameworkRendererTest(file));
  }

  // Default behavior: scan bootstrap* and tailwind renderer tests
  const renderersDir = `${projectRoot}/packages/renderers`;
  try {
    const renderers = readdirSync(renderersDir, { withFileTypes: true });

    for (const renderer of renderers) {
      if (renderer.isDirectory()) {
        const rendererName = renderer.name;

        // Only check bootstrap* and tailwind renderers (not vanilla)
        if (rendererName.startsWith('bootstrap') || rendererName === 'tailwind') {
          const testsDir = `${renderersDir}/${rendererName}/tests`;
          try {
            if (statSync(testsDir).isDirectory()) {
              files.push(...walkDir(testsDir, '.spec.ts'));
            }
          } catch {
            // No tests directory, skip
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read renderers directory: ${error.message}`);
  }

  return [...new Set(files)]; // Remove duplicates
}

function isFrameworkRendererTest(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return (
    normalizedPath.includes('/packages/renderers/bootstrap') ||
    normalizedPath.includes('/packages/renderers/tailwind')
  ) && normalizedPath.includes('/tests/') && !normalizedPath.includes('/packages/renderers/vanilla');
}

function scanFileForSharedFixtures(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const violations = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Look for any reference to shared core fixtures
      if (line.includes('/packages/core/tests/fixtures/')) {
        violations.push({
          line: lineNum,
          content: line.trim(),
          file: relative(projectRoot, filePath)
        });
      }
    }

    return violations;
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
    return [];
  }
}

function main() {
  // Parse command line arguments for target paths
  const targetPaths = process.argv.slice(2);

  if (targetPaths.length > 0) {
    console.log(`🛡️  Shared Fixture Guard: Checking for shared core fixture usage in: ${targetPaths.join(', ')}`);
  } else {
    console.log('🛡️  Shared Fixture Guard: Checking for shared core fixture usage in framework renderer tests...');
  }

  const testFiles = findFrameworkRendererTests(targetPaths);
  console.log(`📁 Scanning ${testFiles.length} framework renderer test files...`);

  const allViolations = [];

  for (const filePath of testFiles) {
    const violations = scanFileForSharedFixtures(filePath);
    if (violations.length > 0) {
      allViolations.push({ file: filePath, violations });
    }
  }

  if (allViolations.length === 0) {
    console.log('✅ Guard passed: No shared core fixture usage found in framework renderer tests.');
    console.log(`🎯 All ${testFiles.length} framework renderer test files use proper version-specific fixtures.`);
    process.exit(0);
  }

  // Report violations
  console.log(HELP_TEXT);

  let totalViolations = 0;
  for (const { file, violations } of allViolations) {
    const relativeFile = relative(projectRoot, file);
    console.log(`❌ ${relativeFile}:`);

    for (const violation of violations) {
      console.log(`   Line ${violation.line}: ${violation.content}`);
      totalViolations++;
    }
    console.log();
  }

  console.log(`🚨 Found ${totalViolations} shared fixture violations in ${allViolations.length} files.`);
  console.log('💡 Fix these by using framework-specific fixtures from ../fixtures/ directory.');
  console.log('📖 Each renderer should use its own version-specific fixture with proper CSS/JS dependencies.');

  process.exit(1);
}

// Handle CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (error) {
    console.error('❌ Guard failed:', error.message);
    process.exit(1);
  }
}
