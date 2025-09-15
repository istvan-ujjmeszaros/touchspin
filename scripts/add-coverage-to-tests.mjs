#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testsDir = path.join(__dirname, '..', '__tests__');

// Find all test files
const testFiles = fs.readdirSync(testsDir)
  .filter(f => f.endsWith('.test.ts'))
  .map(f => path.join(testsDir, f));

let updated = 0;
let skipped = 0;

for (const testFile of testFiles) {
  const content = fs.readFileSync(testFile, 'utf-8');

  // Skip if already has coverage
  if (content.includes('startCoverage') || content.includes('collectCoverage')) {
    console.log(`✓ ${path.basename(testFile)} - already has coverage`);
    skipped++;
    continue;
  }

  // Skip visual tests
  if (testFile.includes('visual')) {
    console.log(`⊘ ${path.basename(testFile)} - skipping visual test`);
    skipped++;
    continue;
  }

  // Check if it imports touchspinHelpers
  const hasHelpers = content.includes('touchspinHelpers');

  let newContent = content;

  // Add import if missing
  if (!hasHelpers) {
    const importLine = "import touchspinHelpers from './helpers/touchspinHelpers';\n";
    // Add after other imports
    const lastImportMatch = content.match(/^import .* from .*;$/m);
    if (lastImportMatch) {
      const pos = content.indexOf(lastImportMatch[0]) + lastImportMatch[0].length;
      newContent = content.slice(0, pos) + '\n' + importLine + content.slice(pos);
    } else {
      newContent = importLine + '\n' + content;
    }
  }

  // Add coverage to beforeEach/afterEach
  const testDescribeMatch = newContent.match(/test\.describe\([^{]+\{/);
  if (testDescribeMatch) {
    const pos = newContent.indexOf(testDescribeMatch[0]) + testDescribeMatch[0].length;

    // Check if there's already a beforeEach
    const hasBeforeEach = newContent.includes('test.beforeEach');
    const hasAfterEach = newContent.includes('test.afterEach');

    let coverageCode = '\n';

    if (!hasBeforeEach) {
      coverageCode += `
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html'); // Update URL as needed
  });
`;
    } else {
      // Add to existing beforeEach
      const beforeEachMatch = newContent.match(/test\.beforeEach\(async \(\{ page \}\) => \{([^}]*)\}/);
      if (beforeEachMatch && !beforeEachMatch[1].includes('startCoverage')) {
        const beforeEachPos = newContent.indexOf(beforeEachMatch[0]);
        const insertPos = beforeEachPos + 'test.beforeEach(async ({ page }) => {'.length;
        newContent = newContent.slice(0, insertPos) +
          '\n    await touchspinHelpers.startCoverage(page);' +
          newContent.slice(insertPos);
      }
    }

    if (!hasAfterEach) {
      const testName = path.basename(testFile, '.test.ts');
      coverageCode += `
  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, '${testName}');
  });
`;
    } else {
      // Add to existing afterEach
      const testName = path.basename(testFile, '.test.ts');
      const afterEachMatch = newContent.match(/test\.afterEach\(async \(\{ page \}\) => \{([^}]*)\}/);
      if (afterEachMatch && !afterEachMatch[1].includes('collectCoverage')) {
        const afterEachPos = newContent.indexOf(afterEachMatch[0]);
        const insertPos = afterEachPos + afterEachMatch[0].length - 1; // Before closing }
        newContent = newContent.slice(0, insertPos) +
          `\n    await touchspinHelpers.collectCoverage(page, '${testName}');\n  ` +
          newContent.slice(insertPos);
      }
    }

    if (!hasBeforeEach || !hasAfterEach) {
      newContent = newContent.slice(0, pos) + coverageCode + newContent.slice(pos);
    }
  }

  // Write back if changed
  if (newContent !== content) {
    fs.writeFileSync(testFile, newContent);
    console.log(`✅ ${path.basename(testFile)} - added coverage collection`);
    updated++;
  } else {
    console.log(`⊘ ${path.basename(testFile)} - couldn't add coverage`);
    skipped++;
  }
}

console.log(`\n📊 Coverage Summary:`);
console.log(`   Updated: ${updated} files`);
console.log(`   Skipped: ${skipped} files`);
console.log(`   Total:   ${testFiles.length} files`);