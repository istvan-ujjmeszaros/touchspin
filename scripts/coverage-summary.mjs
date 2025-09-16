#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

function formatPercent(value) {
  return `${value.toFixed(2)}%`;
}

function getStatusIcon(percent) {
  if (percent >= 80) return '✅';
  if (percent >= 60) return '⚠️';
  return '❌';
}

async function generateCoverageSummary() {
  const coverageFile = path.join(rootDir, 'reports', 'coverage', 'coverage-final.json');

  if (!fs.existsSync(coverageFile)) {
    console.error('❌ Coverage report not found. Run "yarn coverage" first.');
    process.exit(1);
  }

  const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));

  // Calculate overall metrics
  const packages = {};
  let totalStatements = 0;
  let coveredStatements = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;
  let totalLines = 0;
  let coveredLines = 0;

  for (const [filePath, data] of Object.entries(coverage)) {
    // Extract package name
    const match = filePath.match(/packages\/([^/]+)\//);
    const packageName = match ? match[1] : 'root';

    if (!packages[packageName]) {
      packages[packageName] = {
        statements: { total: 0, covered: 0 },
        branches: { total: 0, covered: 0 },
        functions: { total: 0, covered: 0 },
        lines: { total: 0, covered: 0 },
        files: []
      };
    }

    const s = data.s || {};
    const b = data.b || {};
    const f = data.f || {};
    const l = data.statementMap ? Object.keys(data.statementMap).length : 0;

    const statementTotal = Object.keys(s).length;
    const statementCovered = Object.values(s).filter(v => v > 0).length;

    const branchTotal = Object.values(b).flat().length;
    const branchCovered = Object.values(b).flat().filter(v => v > 0).length;

    const functionTotal = Object.keys(f).length;
    const functionCovered = Object.values(f).filter(v => v > 0).length;

    // Count actual lines
    const linesCovered = new Set();
    const linesTotal = new Set();

    if (data.statementMap) {
      Object.values(data.statementMap).forEach(loc => {
        const start = loc.start.line;
        const end = loc.end.line;
        for (let line = start; line <= end; line++) {
          linesTotal.add(line);
        }
      });
    }

    Object.entries(s).forEach(([key, count]) => {
      if (count > 0 && data.statementMap && data.statementMap[key]) {
        const loc = data.statementMap[key];
        const start = loc.start.line;
        const end = loc.end.line;
        for (let line = start; line <= end; line++) {
          linesCovered.add(line);
        }
      }
    });

    packages[packageName].statements.total += statementTotal;
    packages[packageName].statements.covered += statementCovered;
    packages[packageName].branches.total += branchTotal;
    packages[packageName].branches.covered += branchCovered;
    packages[packageName].functions.total += functionTotal;
    packages[packageName].functions.covered += functionCovered;
    packages[packageName].lines.total += linesTotal.size;
    packages[packageName].lines.covered += linesCovered.size;

    totalStatements += statementTotal;
    coveredStatements += statementCovered;
    totalBranches += branchTotal;
    coveredBranches += branchCovered;
    totalFunctions += functionTotal;
    coveredFunctions += functionCovered;
    totalLines += linesTotal.size;
    coveredLines += linesCovered.size;

    const fileName = path.basename(filePath);
    const lineCoverage = linesTotal.size > 0 ? (linesCovered.size / linesTotal.size) * 100 : 0;

    if (lineCoverage < 80) {
      packages[packageName].files.push({
        name: fileName,
        coverage: lineCoverage
      });
    }
  }

  // Calculate percentages
  const stmtPercent = totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0;
  const branchPercent = totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0;
  const funcPercent = totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0;
  const linePercent = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;

  // Print summary
  console.log('\n📊 Coverage Report Summary\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('│ Metric      │ Coverage │ Status │ Covered/Total            │');
  console.log('├─────────────┼──────────┼────────┼──────────────────────────┤');
  console.log(`│ Statements  │ ${formatPercent(stmtPercent).padEnd(8)} │   ${getStatusIcon(stmtPercent)}   │ ${coveredStatements}/${totalStatements}`.padEnd(63) + '│');
  console.log(`│ Branches    │ ${formatPercent(branchPercent).padEnd(8)} │   ${getStatusIcon(branchPercent)}   │ ${coveredBranches}/${totalBranches}`.padEnd(63) + '│');
  console.log(`│ Functions   │ ${formatPercent(funcPercent).padEnd(8)} │   ${getStatusIcon(funcPercent)}   │ ${coveredFunctions}/${totalFunctions}`.padEnd(63) + '│');
  console.log(`│ Lines       │ ${formatPercent(linePercent).padEnd(8)} │   ${getStatusIcon(linePercent)}   │ ${coveredLines}/${totalLines}`.padEnd(63) + '│');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Print package breakdown
  console.log('📦 Package Breakdown (<80% line coverage):\n');

  const sortedPackages = Object.entries(packages).sort((a, b) => {
    const aPercent = a[1].lines.total > 0 ? (a[1].lines.covered / a[1].lines.total) * 100 : 0;
    const bPercent = b[1].lines.total > 0 ? (b[1].lines.covered / b[1].lines.total) * 100 : 0;
    return aPercent - bPercent;
  });

  for (const [packageName, data] of sortedPackages) {
    const linePercent = data.lines.total > 0 ? (data.lines.covered / data.lines.total) * 100 : 0;

    if (linePercent < 80) {
      console.log(`${getStatusIcon(linePercent)} ${packageName}: ${formatPercent(linePercent)}`);

      if (data.files.length > 0) {
        const topFiles = data.files
          .sort((a, b) => a.coverage - b.coverage)
          .slice(0, 3);

        topFiles.forEach(file => {
          console.log(`   └─ ${file.name}: ${formatPercent(file.coverage)}`);
        });
      }
    }
  }

  console.log('\n📁 Coverage Reports:');
  console.log('   • HTML Report: reports/coverage/index.html');
  console.log('   • LCOV Report: reports/coverage/lcov.info');
  console.log('   • JSON Report: reports/coverage/coverage-final.json\n');

  // Return status code based on thresholds
  const allMet = stmtPercent >= 80 && branchPercent >= 80 && funcPercent >= 80 && linePercent >= 80;

  if (!allMet) {
    console.log('⚠️  Coverage thresholds not met (80% required)\n');
    process.exit(1);
  } else {
    console.log('✅ All coverage thresholds met!\n');
  }
}

generateCoverageSummary().catch(console.error);