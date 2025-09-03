#!/usr/bin/env node

/**
 * Update TEST_EXECUTION_CHECKLIST.md with test results
 * Only updates tests that are present in the results file
 * Preserves checkbox state for tests not run
 * 
 * Usage:
 *   npx playwright test __tests__/basicOperations.test.ts --reporter=json > tmp/test-results.json
 *   node scripts/update-checklist.js tmp/test-results.json
 *
 *   npx playwright test --reporter=json > tmp/test-results.json  
 *   node scripts/update-checklist.js tmp/test-results.json
 */

import fs from 'fs';
import path from 'path';
import process from 'process';

const CHECKLIST_FILE = 'TEST_EXECUTION_CHECKLIST.md';

function parseTestResults(resultsData) {
  const results = JSON.parse(resultsData);
  
  const fileResults = {};
  const testResults = new Map(); // file -> Map(testTitle -> status)
  
  // Get stats from the results
  const stats = results.stats || {};
  const totalTests = stats.expected || 0;
  const unexpectedFailures = stats.unexpected || 0;
  const totalFlakyTests = stats.flaky || 0;
  const totalPassingTests = totalTests - unexpectedFailures;
  
  function processSuite(suite, fileName = null) {
    const currentFile = fileName || suite.file;
    
    if (suite.specs) {
      suite.specs.forEach(spec => {
        const file = currentFile || spec.file;
        if (!file) return;
        
        const cleanFileName = file.replace(process.cwd() + '/', '');
        
        if (!fileResults[cleanFileName]) {
          fileResults[cleanFileName] = { pass: 0, fail: 0, flaky: 0, total: 0 };
          testResults.set(cleanFileName, new Map());
        }
        
        const fileTestMap = testResults.get(cleanFileName);
        
        spec.tests?.forEach(test => {
          const status = test.status;
          let testStatus = 'fail';
          
          if (status === 'expected') {
            testStatus = 'pass';
            fileResults[cleanFileName].pass++;
          } else if (status === 'flaky') {
            testStatus = 'flaky';
            fileResults[cleanFileName].flaky++;
          } else {
            testStatus = 'fail';
            fileResults[cleanFileName].fail++;
          }
          
          fileResults[cleanFileName].total++;
          
          // Store the individual test result
          fileTestMap.set(spec.title, testStatus);
        });
      });
    }
    
    if (suite.suites) {
      suite.suites.forEach(nestedSuite => {
        processSuite(nestedSuite, currentFile);
      });
    }
  }
  
  if (results.suites) {
    results.suites.forEach(suite => {
      processSuite(suite);
    });
  }
  
  return {
    fileResults,
    testResults,
    totalTests,
    totalPassingTests,
    totalFlakyTests,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
}

function updateChecklist(checklistContent, testData) {
  let updatedContent = checklistContent;
  let updatedFiles = 0;
  let updatedTests = 0;
  
  // Update overview counters
  const overviewPattern = /## Test Suite Overview\n([\s\S]*?)(?=\n## )/;
  const overviewMatch = updatedContent.match(overviewPattern);
  
  if (overviewMatch) {
    let overviewSection = overviewMatch[1];
    
    // Count current status
    const currentFilesMatch = overviewSection.match(/- \*\*Files Passing\*\*: (\d+)\/(\d+)/);
    const currentTestsMatch = overviewSection.match(/- \*\*Tests Passing\*\*: (\d+)\/(\d+)/);
    
    if (currentFilesMatch && currentTestsMatch) {
      const currentPassingFiles = parseInt(currentFilesMatch[1]);
      const totalFiles = parseInt(currentFilesMatch[2]);
      const currentPassingTests = parseInt(currentTestsMatch[1]);
      const totalTests = parseInt(currentTestsMatch[2]);
      
      // Calculate new totals (replace with actual counts from results)
      const newPassingFiles = Object.values(testData.fileResults).filter(f => f.fail === 0).length;
      const newPassingTests = Object.values(testData.fileResults).reduce((sum, f) => sum + f.pass, 0);
      const newFlaky = Object.values(testData.fileResults).reduce((sum, f) => sum + f.flaky, 0);
      
      // Update with new values (replace, don't add)
      overviewSection = overviewSection.replace(
        /- \*\*Files Passing\*\*: \d+\/\d+/,
        `- **Files Passing**: ${newPassingFiles}/${totalFiles}`
      );
      overviewSection = overviewSection.replace(
        /- \*\*Tests Passing\*\*: \d+\/\d+/,
        `- **Tests Passing**: ${newPassingTests}/${totalTests}`
      );
      
      // Add or update flaky tests count
      if (newFlaky > 0) {
        if (overviewSection.includes('Flaky Tests')) {
          overviewSection = overviewSection.replace(
            /- \*\*Flaky Tests\*\*: \d+/,
            `- **Flaky Tests**: ${newFlaky}`
          );
        } else {
          overviewSection += `- **Flaky Tests**: ${newFlaky}\n`;
        }
      }
    }
    
    updatedContent = updatedContent.replace(overviewPattern, `## Test Suite Overview\n${overviewSection}\n## `);
  }
  
  // Update individual test results
  for (const [fileName, testMap] of testData.testResults) {
    const fileSection = `### __tests__/${fileName}`;
    const fileSectionRegex = new RegExp(`(### __tests__/${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n)((?:- \\[[\\sx~-]\\] .*\\n)*)`, 'g');
    
    const match = fileSectionRegex.exec(updatedContent);
    if (match) {
      const [fullMatch, header, testsSection] = match;
      let updatedTestsSection = testsSection;
      
      // Update each test that was run
      for (const [testTitle, testStatus] of testMap) {
        const escapedTitle = testTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const testRegex = new RegExp(`(- \\[[\\sx~-]\\] )(${escapedTitle})`, 'g');
        
        let checkbox;
        if (testStatus === 'pass') checkbox = '[x]';
        else if (testStatus === 'flaky') checkbox = '[~]';
        else checkbox = '[-]';
        
        const testMatch = testRegex.exec(updatedTestsSection);
        if (testMatch) {
          updatedTestsSection = updatedTestsSection.replace(testRegex, `- ${checkbox} $2`);
          updatedTests++;
        }
        
        // Reset regex lastIndex
        testRegex.lastIndex = 0;
      }
      
      updatedContent = updatedContent.replace(fullMatch, header + updatedTestsSection);
      updatedFiles++;
      
      // Reset regex lastIndex
      fileSectionRegex.lastIndex = 0;
    }
  }
  
  // Update history log
  const historyPattern = /(Date\/Time\s+\|\s+Tests\s+\|\s+Passing\s+\|\s+Failing\s+\|\s+Flaky\s+\|\s+Notes\n)/;
  const historyMatch = updatedContent.match(historyPattern);
  
  if (historyMatch) {
    const newEntry = `${testData.timestamp} | ${testData.totalTests.toString().padStart(5)} | ${testData.totalPassingTests.toString().padStart(7)} | ${(testData.totalTests - testData.totalPassingTests - testData.totalFlakyTests).toString().padStart(7)} | ${testData.totalFlakyTests.toString().padStart(5)} | Updated ${updatedFiles} files, ${updatedTests} tests\n`;
    
    updatedContent = updatedContent.replace(historyMatch[0], historyMatch[0] + newEntry);
  }
  
  return {
    content: updatedContent,
    updatedFiles,
    updatedTests
  };
}

async function main() {
  let resultsData;
  
  // Check if reading from file argument or stdin
  if (process.argv[2]) {
    const filePath = process.argv[2];
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File ${filePath} does not exist`);
      process.exit(1);
    }
    resultsData = fs.readFileSync(filePath, 'utf8');
  } else {
    console.error('Usage: node scripts/update-checklist.js <test-results.json>');
    process.exit(1);
  }
  
  if (!resultsData.trim()) {
    console.error('Error: No test results data provided');
    process.exit(1);
  }
  
  // Check if checklist file exists
  if (!fs.existsSync(CHECKLIST_FILE)) {
    console.error(`Error: ${CHECKLIST_FILE} not found`);
    process.exit(1);
  }
  
  try {
    // Parse test results
    const testData = parseTestResults(resultsData);
    
    // Read current checklist
    const currentContent = fs.readFileSync(CHECKLIST_FILE, 'utf8');
    
    // Create backup in tmp/ folder
    const backupFile = `tmp/${CHECKLIST_FILE}.backup.${Date.now()}`;
    fs.writeFileSync(backupFile, currentContent);
    console.log(`Created backup: ${backupFile}`);
    
    // Update checklist
    const { content: updatedContent, updatedFiles, updatedTests } = updateChecklist(currentContent, testData);
    
    // Write updated content
    fs.writeFileSync(CHECKLIST_FILE, updatedContent);
    
    console.log(`✅ Successfully updated ${CHECKLIST_FILE}`);
    console.log(`   Files updated: ${updatedFiles}`);
    console.log(`   Tests updated: ${updatedTests}`);
    console.log(`   Results from: ${Object.keys(testData.fileResults).length} test files`);
    
  } catch (error) {
    console.error('Error updating checklist:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});