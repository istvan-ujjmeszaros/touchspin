const fs = require('fs');
const path = require('path');

async function generateCoverageReport() {
  console.log('🔍 Generating coverage report...');
  
  const coverageRawDir = 'coverage/raw';
  const coverageOutputDir = 'coverage';
  
  // Check if coverage data exists
  if (!fs.existsSync(coverageRawDir)) {
    console.log('⚠️  No coverage data found. Run tests with coverage collection first.');
    return;
  }
  
  // Ensure output directory exists
  if (!fs.existsSync(coverageOutputDir)) {
    fs.mkdirSync(coverageOutputDir, { recursive: true });
  }
  
  // Read all coverage files
  const coverageFiles = fs.readdirSync(coverageRawDir).filter(file => file.endsWith('.json'));
  
  if (coverageFiles.length === 0) {
    console.log('⚠️  No coverage files found in coverage/raw/');
    return;
  }
  
  console.log(`📊 Processing ${coverageFiles.length} coverage files...`);
  
  // Merge all coverage data
  const mergedCoverage = [];
  const urlMap = new Map();
  
  for (const file of coverageFiles) {
    const filePath = path.join(coverageRawDir, file);
    const coverageData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    for (const entry of coverageData) {
      if (entry.url && entry.url.includes('jquery.bootstrap-touchspin')) {
        const existingEntry = urlMap.get(entry.url);
        
        if (existingEntry) {
          // Merge coverage data for the same URL
          existingEntry.functions = mergeFunctionCoverage(existingEntry.functions, entry.functions);
        } else {
          urlMap.set(entry.url, entry);
          mergedCoverage.push(entry);
        }
      }
    }
  }
  
  if (mergedCoverage.length === 0) {
    console.log('⚠️  No TouchSpin coverage data found. Make sure the source file is loaded in tests.');
    return;
  }
  
  // Generate simple text report
  console.log('\n📈 Coverage Summary:');
  console.log('='.repeat(60));
  
  for (const entry of mergedCoverage) {
    const url = new URL(entry.url);
    const filename = path.basename(url.pathname);
    
    const { linesCovered, totalLines, functionsCovered, totalFunctions, branchesCovered, totalBranches } = calculateCoverage(entry);
    
    console.log(`\nFile: ${filename}`);
    console.log(`Lines: ${linesCovered}/${totalLines} (${((linesCovered/totalLines)*100).toFixed(1)}%)`);
    console.log(`Functions: ${functionsCovered}/${totalFunctions} (${((functionsCovered/totalFunctions)*100).toFixed(1)}%)`);
    if (totalBranches > 0) {
      console.log(`Branches: ${branchesCovered}/${totalBranches} (${((branchesCovered/totalBranches)*100).toFixed(1)}%)`);
    }
  }
  
  // Save merged coverage for further processing
  const outputFile = path.join(coverageOutputDir, 'merged-coverage.json');
  fs.writeFileSync(outputFile, JSON.stringify(mergedCoverage, null, 2));
  
  console.log(`\n✅ Coverage report generated: ${outputFile}`);
  console.log(`\n💡 Tip: For detailed HTML reports, consider integrating with c8 or istanbul in the future.`);
}

function mergeFunctionCoverage(functions1, functions2) {
  // Simple merge - in a real implementation, you'd want to properly merge coverage ranges
  return functions1.map((func1, index) => {
    const func2 = functions2[index];
    return {
      ...func1,
      count: Math.max(func1.count, func2?.count || 0)
    };
  });
}

function calculateCoverage(coverageEntry) {
  let linesCovered = 0;
  let totalLines = 0;
  let functionsCovered = 0;
  let totalFunctions = coverageEntry.functions.length;
  let branchesCovered = 0;
  let totalBranches = 0;
  
  // Calculate function coverage
  for (const func of coverageEntry.functions) {
    if (func.count > 0) {
      functionsCovered++;
    }
  }
  
  // Calculate line coverage from ranges
  const executedRanges = coverageEntry.functions
    .filter(func => func.count > 0)
    .flatMap(func => func.ranges)
    .filter(range => range.count > 0);
  
  // Simple line coverage calculation
  // This is a basic implementation - real coverage tools do more sophisticated analysis
  const lines = new Set();
  const executedLines = new Set();
  
  for (const func of coverageEntry.functions) {
    for (let i = func.startOffset; i <= func.endOffset; i++) {
      lines.add(i);
    }
    
    if (func.count > 0) {
      for (const range of func.ranges) {
        if (range.count > 0) {
          for (let i = range.startOffset; i <= range.endOffset; i++) {
            executedLines.add(i);
          }
        }
      }
    }
  }
  
  totalLines = lines.size;
  linesCovered = executedLines.size;
  
  return {
    linesCovered,
    totalLines,
    functionsCovered,
    totalFunctions,
    branchesCovered,
    totalBranches
  };
}

// Run the coverage report generation
generateCoverageReport().catch(error => {
  console.error('❌ Error generating coverage report:', error);
  process.exit(1);
});