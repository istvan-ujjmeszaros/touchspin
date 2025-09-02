#!/usr/bin/env node

/**
 * Parse Playwright test results and generate checklist update information
 * 
 * Usage:
 *   npx playwright test --reporter=json > test-results.json
 *   node scripts/parse-test-results.js test-results.json
 *
 * Or run tests and parse in one command:
 *   npx playwright test --reporter=json | node scripts/parse-test-results.js
 */

import fs from 'fs';
import process from 'process';

function parseTestResults(resultsData) {
  const results = JSON.parse(resultsData);
  
  // Extract results by file
  const fileResults = {};
  let totalTests = 0;
  let totalPassingTests = 0;
  let totalFlakyTests = 0;
  
  // Get stats from the results
  const stats = results.stats || {};
  totalTests = stats.expected || 0;
  const unexpectedFailures = stats.unexpected || 0;
  totalFlakyTests = stats.flaky || 0;
  totalPassingTests = totalTests - unexpectedFailures;
  
  function processSuite(suite, fileName = null) {
    // Use the file from the suite if not provided
    const currentFile = fileName || suite.file;
    
    // Process specs in this suite
    if (suite.specs) {
      suite.specs.forEach(spec => {
        const file = currentFile || spec.file;
        if (!file) return;
        
        const cleanFileName = file.replace(process.cwd() + '/', '');
        if (!fileResults[cleanFileName]) {
          fileResults[cleanFileName] = { pass: 0, fail: 0, flaky: 0, total: 0, tests: [] };
        }
        
        // Each spec has tests (one per project/browser)
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
          
          // Only add the test title once (avoid duplicates for multiple browsers)
          const existingTest = fileResults[cleanFileName].tests.find(t => t.title === spec.title);
          if (!existingTest) {
            fileResults[cleanFileName].tests.push({
              title: spec.title,
              status: testStatus
            });
          } else if (testStatus === 'fail' && existingTest.status !== 'fail') {
            // Update to fail if any browser fails
            existingTest.status = 'fail';
          }
        });
      });
    }
    
    // Process nested suites
    if (suite.suites) {
      suite.suites.forEach(nestedSuite => {
        processSuite(nestedSuite, currentFile);
      });
    }
  }
  
  // Process all suites
  if (results.suites) {
    results.suites.forEach(suite => {
      processSuite(suite);
    });
  }
  
  return {
    fileResults,
    totalFiles: Object.keys(fileResults).length,
    totalPassingFiles: Object.values(fileResults).filter(f => f.fail === 0).length,
    totalTests,
    totalPassingTests,
    totalFlakyTests,
    stats
  };
}

function generateChecklistUpdate(data) {
  console.log('='.repeat(60));
  console.log('TEST EXECUTION CHECKLIST UPDATE');
  console.log('='.repeat(60));
  
  console.log('\n## OVERVIEW COUNTERS UPDATE:');
  console.log(`- **Files Passing**: ${data.totalPassingFiles}/${data.totalFiles}`);
  console.log(`- **Tests Passing**: ${data.totalPassingTests}/${data.totalTests}`);
  if (data.totalFlakyTests > 0) {
    console.log(`- **Flaky Tests**: ${data.totalFlakyTests}`);
  }
  
  console.log('\n## HISTORY LOG ENTRY:');
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`${now} | Tests: ${data.totalTests} | Passing: ${data.totalPassingTests} | Failing: ${data.totalTests - data.totalPassingTests - data.totalFlakyTests} | Flaky: ${data.totalFlakyTests}`);
  
  console.log('\n## FILE STATUS UPDATE:');
  console.log('Copy and paste these into your checklist:\n');
  
  // Sort files alphabetically
  const sortedFiles = Object.entries(data.fileResults).sort(([a], [b]) => a.localeCompare(b));
  
  sortedFiles.forEach(([file, stats]) => {
    const status = stats.fail === 0 ? '[x]' : '[ ]';
    let statusDetail = `${stats.pass}`;
    if (stats.fail > 0) statusDetail += ` fail:${stats.fail}`;
    if (stats.flaky > 0) statusDetail += ` flaky:${stats.flaky}`;
    statusDetail += `/${stats.total}`;
    
    console.log(`${status} ${file} (${statusDetail})`);
  });
  
  console.log('\n## DETAILED TEST RESULTS:');
  sortedFiles.forEach(([file, stats]) => {
    if (stats.tests.length > 0) {
      console.log(`\n### ${file}`);
      stats.tests.forEach(test => {
        let checkbox;
        if (test.status === 'pass') checkbox = '[x]';
        else if (test.status === 'flaky') checkbox = '[~]';
        else checkbox = '[-]';
        
        console.log(`- ${checkbox} ${test.title}`);
      });
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('Update TEST_EXECUTION_CHECKLIST.md with the above information');
  console.log('='.repeat(60));
}

// Main execution
async function main() {
  let resultsData;
  
  // Check if reading from file argument or stdin
  if (process.argv[2]) {
    // Read from file
    const filePath = process.argv[2];
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File ${filePath} does not exist`);
      console.error('Usage: node scripts/parse-test-results.js test-results.json');
      process.exit(1);
    }
    resultsData = fs.readFileSync(filePath, 'utf8');
  } else {
    // Read from stdin
    const chunks = [];
    process.stdin.setEncoding('utf8');
    
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    
    resultsData = chunks.join('');
  }
  
  if (!resultsData.trim()) {
    console.error('Error: No test results data provided');
    console.error('Usage examples:');
    console.error('  npx playwright test --reporter=json > results.json && node scripts/parse-test-results.js results.json');
    console.error('  npx playwright test --reporter=json | node scripts/parse-test-results.js');
    process.exit(1);
  }
  
  try {
    const parsedData = parseTestResults(resultsData);
    generateChecklistUpdate(parsedData);
  } catch (error) {
    console.error('Error parsing test results:', error.message);
    console.error('Make sure the input is valid Playwright JSON output');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});