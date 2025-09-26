#!/usr/bin/env node

/**
 * Guard script to prevent page.locator usage in test spec files
 *
 * This enforces the CLAUDE.md rule that test files should use helpers
 * like getTouchSpinElements() instead of raw page.locator() calls.
 *
 * Usage:
 *   node page-locator-guard.mjs                           # Scan all spec files
 *   node page-locator-guard.mjs packages/core/tests      # Scan specific directory
 *   node page-locator-guard.mjs "packages/core/tests"    # Scan specific path
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { basename, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

const HELP_TEXT = `
🚨 page.locator Usage Detected in Test Spec Files

The following test files contain page.locator() calls, which violates CLAUDE.md rules:

Instead of page.locator(), use the proper helpers:

✅ CORRECT:
  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
  await elements.upButton.click();

✅ ALTERNATIVE:
  await apiHelpers.clickUpButton(page, 'test-input');

❌ WRONG:
  const upButton = page.locator('[data-testid="test-input-up"]');

Available elements from getTouchSpinElements():
- wrapper: Root wrapper around TouchSpin
- input: The input element
- upButton: The "up" increment button
- downButton: The "down" decrement button
- prefix: Optional prefix element
- postfix: Optional postfix element

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

function findSpecFiles(targetPaths = []) {
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

    return [...new Set(files)]; // Remove duplicates
  }

  // Default behavior: scan all packages/*/tests/**/*.spec.ts
  const packagesDir = `${projectRoot}/packages`;
  try {
    const packages = readdirSync(packagesDir, { withFileTypes: true });

    for (const pkg of packages) {
      if (pkg.isDirectory()) {
        const testsDir = `${packagesDir}/${pkg.name}/tests`;
        try {
          if (statSync(testsDir).isDirectory()) {
            files.push(...walkDir(testsDir, '.spec.ts'));
          }
        } catch {
          // No tests directory, skip
        }

        // Also check nested packages (like packages/renderers/*/tests)
        const nestedDir = `${packagesDir}/${pkg.name}`;
        try {
          const nested = readdirSync(nestedDir, { withFileTypes: true });
          for (const nestedPkg of nested) {
            if (nestedPkg.isDirectory()) {
              const nestedTestsDir = `${nestedDir}/${nestedPkg.name}/tests`;
              try {
                if (statSync(nestedTestsDir).isDirectory()) {
                  files.push(...walkDir(nestedTestsDir, '.spec.ts'));
                }
              } catch {
                // No tests directory, skip
              }
            }
          }
        } catch {
          // Not a directory or can't read, skip
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read packages directory: ${error.message}`);
  }

  return [...new Set(files)]; // Remove duplicates
}

function scanFileForPageLocator(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const violations = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Look for page.locator calls
      if (line.includes('page.locator')) {
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
    console.log(`🛡️  Page Locator Guard: Checking for forbidden page.locator usage in: ${targetPaths.join(', ')}`);
  } else {
    console.log('🛡️  Page Locator Guard: Checking for forbidden page.locator usage in test spec files...');
  }

  const specFiles = findSpecFiles(targetPaths);
  console.log(`📁 Scanning ${specFiles.length} test spec files...`);

  const allViolations = [];

  for (const filePath of specFiles) {
    const violations = scanFileForPageLocator(filePath);
    if (violations.length > 0) {
      allViolations.push({ file: filePath, violations });
    }
  }

  if (allViolations.length === 0) {
    console.log('✅ Guard passed: No forbidden page.locator usage found in test spec files.');
    console.log(`🎯 All ${specFiles.length} test spec files follow proper helper patterns.`);
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

  console.log(`🚨 Found ${totalViolations} page.locator violations in ${allViolations.length} files.`);
  console.log('💡 Fix these by using getTouchSpinElements() or specific helper functions.');
  console.log('📖 See CLAUDE.md "Element Access Helper" section for guidance.');

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