#!/usr/bin/env node

/**
 * Guard Script: No querySelector in Test Helpers
 *
 * Prevents usage of document.querySelector, document.getElementById, and other
 * direct DOM manipulation methods in test helper files.
 *
 * This enforces the use of proper Playwright locators and helper functions.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Patterns to detect forbidden DOM manipulation
const FORBIDDEN_PATTERNS = [
  /document\.querySelector\s*\(/,
  /document\.getElementById\s*\(/,
  /document\.getElementsByClassName\s*\(/,
  /document\.getElementsByTagName\s*\(/,
  /document\.querySelectorAll\s*\(/,
  /document\.getElementsByName\s*\(/,
  /\.querySelector\s*\(/,
  /\.getElementById\s*\(/,
  /\.getElementsByClassName\s*\(/,
  /\.querySelectorAll\s*\(/,
];

// Exceptions for specific patterns that are allowed
const ALLOWED_EXCEPTIONS = [
  // Allow in page.evaluate() contexts where we can't use Playwright locators
  /page\.evaluate\s*\(/,
  // Allow in page.waitForFunction() contexts (browser execution context)
  /page\.waitForFunction\s*\(/,
  // Allow in installDomHelpers.ts which is a runtime utility
  /installDomHelpers\.ts$/,
  // Allow in event setup files that need DOM access for runtime functionality
  /events\/setup\.ts$/,
  /events\/log\.ts$/,
  // Allow in deprecated files (marked for removal)
  /deprecated\//,
  // Allow in bootstrap-shared.suite.ts (renderer test suite)
  /bootstrap-shared\.suite\.ts$/,
  // Allow runtime helper functions (these run in browser context, not test context)
  /runtime\//,
];

// Directories to scan for test helper files
const TEST_HELPER_DIRS = [
  'packages/core/test-helpers',
  'packages/core/tests/__shared__/helpers',
  'packages/jquery-plugin/test-helpers',
  'packages/web-components/test-helpers',
];

// File extensions to check
const EXTENSIONS = ['.ts', '.js', '.mjs'];

function findTestHelperFiles() {
  const files = [];

  for (const dir of TEST_HELPER_DIRS) {
    const fullDir = join(projectRoot, dir);
    try {
      scanDirectory(fullDir, files);
    } catch (_error) {
    }
  }

  return files;
}

function scanDirectory(dir, files) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath, files);
    } else if (stat.isFile() && EXTENSIONS.includes(extname(entry))) {
      files.push(fullPath);
    }
  }
}

function checkFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Check each forbidden pattern
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(line)) {
        // Check if this line is covered by an allowed exception
        const isException = ALLOWED_EXCEPTIONS.some((exception) => {
          // Check the file path itself for pattern matches
          const filePathMatch = exception.test(filePath);
          if (filePathMatch) return true;

          // For page.evaluate and page.waitForFunction, we need special handling
          // because the block can be very large (30+ lines)
          if (
            exception.source.includes('page\\.evaluate') ||
            exception.source.includes('page\\.waitForFunction')
          ) {
            // Check if we're inside a page.evaluate or page.waitForFunction block
            // by looking for the pattern and tracking braces/parentheses
            const isInsidePageEvaluate = isInsideEvaluateBlock(lines, i);
            if (isInsidePageEvaluate) return true;
          }

          // For other exceptions, look at broader context (up to 15 lines before/after)
          const contextStart = Math.max(0, i - 15);
          const contextEnd = Math.min(lines.length, i + 15);
          const context = lines.slice(contextStart, contextEnd).join('\n');
          const contextMatch = exception.test(context);

          return contextMatch;
        });

        if (!isException) {
          violations.push({
            line: lineNumber,
            content: line.trim(),
            pattern: pattern.source,
          });
        }
      }
    }
  }

  return violations;
}

// Helper function to check if a line is inside a page.evaluate or page.waitForFunction block
function isInsideEvaluateBlock(lines, targetLineIndex) {
  // Search backwards for page.evaluate or page.waitForFunction
  for (let i = targetLineIndex; i >= Math.max(0, targetLineIndex - 50); i--) {
    const line = lines[i];

    // Check if this line contains page.evaluate or page.waitForFunction
    if (/page\.(evaluate|waitForFunction)\s*\(/.test(line)) {
      // Now we need to check if targetLineIndex is inside this block
      // We'll track parentheses and braces to determine the block scope
      let depth = 0;
      let inBlock = false;
      let foundAsync = false;

      for (let j = i; j < Math.min(lines.length, i + 100); j++) {
        const checkLine = lines[j];

        // Look for the async function start
        if (!foundAsync && /async\s*\(/.test(checkLine)) {
          foundAsync = true;
          inBlock = true;
        }

        // Track depth with parentheses and braces
        for (const char of checkLine) {
          if (char === '(' || char === '{') {
            depth++;
            if (foundAsync) inBlock = true;
          } else if (char === ')' || char === '}') {
            depth--;
            if (depth <= 0 && j > i) {
              // We've exited the evaluate block
              return j >= targetLineIndex;
            }
          }
        }

        // If we've reached our target line and we're in the block, return true
        if (j === targetLineIndex && inBlock) {
          return true;
        }
      }
    }
  }

  return false;
}

function main() {
  console.log('🛡️ Guard: Checking for forbidden querySelector usage in test helpers...');

  const files = findTestHelperFiles();
  let totalViolations = 0;
  let violationFiles = 0;

  console.log(`📁 Scanning ${files.length} test helper files...`);

  for (const file of files) {
    const violations = checkFile(file);

    if (violations.length > 0) {
      violationFiles++;
      totalViolations += violations.length;

      const relativePath = file.replace(`${projectRoot}/`, '');
      console.log(`\n❌ ${relativePath}`);

      for (const violation of violations) {
        console.log(`   Line ${violation.line}: ${violation.content}`);
        console.log(`   Pattern: ${violation.pattern}`);
      }
    }
  }

  if (totalViolations > 0) {
    console.log(
      `\n💥 GUARD FAILED: Found ${totalViolations} forbidden querySelector usage(s) in ${violationFiles} file(s)`
    );
    console.log(`\n🚨 CRITICAL RULE VIOLATION:`);
    console.log(`   Test helpers MUST use Playwright locators and helper functions.`);
    console.log(`   NEVER use document.querySelector() or similar DOM methods.`);
    console.log(`\n✅ Fix by using these instead:`);
    console.log(`   • inputById(page, testId) - for input elements`);
    console.log(`   • wrapperById(page, testId) - for wrapper elements`);
    console.log(`   • input.evaluate((el) => { ... }) - for element-specific evaluation`);
    console.log(`   • Existing helper functions from the test-helpers package`);
    console.log(
      `\n📖 See CLAUDE.md section "🚨 CRITICAL: NO DIRECT DOM MANIPULATION" for details.`
    );
    process.exit(1);
  }

  console.log(`✅ Guard passed: No forbidden querySelector usage found in test helpers.`);
  console.log(`🎯 All ${files.length} test helper files follow proper Playwright patterns.`);
}

main();
