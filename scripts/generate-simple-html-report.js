/**
 * Generate Simple HTML Coverage Report
 * 
 * This script creates a simple but functional HTML coverage report
 * from the Istanbul coverage JSON data.
 */

const fs = require('fs');
const path = require('path');
const libCoverage = require('istanbul-lib-coverage');

function generateSimpleHtmlReport() {
  const coverageFile = path.join(process.cwd(), 'reports', 'coverage', 'coverage-final.json');
  const htmlOutputDir = path.join(process.cwd(), 'reports', 'coverage', 'html');

  if (!fs.existsSync(coverageFile)) {
    console.error('❌ Coverage JSON file not found:', coverageFile);
    console.log('💡 Run the V8 to Istanbul conversion first: node scripts/convert-v8-coverage.js');
    return false;
  }

  // Ensure output directory exists
  if (!fs.existsSync(htmlOutputDir)) {
    fs.mkdirSync(htmlOutputDir, { recursive: true });
  }

  try {
    console.log('🎨 Generating simple HTML coverage report...');

    // Read and parse coverage data
    const coverageData = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
    
    // Create coverage map from the data
    const coverageMap = libCoverage.createCoverageMap(coverageData);

    // Generate the HTML content
    const htmlContent = generateHtmlContent(coverageMap);
    
    // Write the HTML file
    const indexFile = path.join(htmlOutputDir, 'index.html');
    fs.writeFileSync(indexFile, htmlContent);

    // Copy CSS file for better styling
    const cssContent = generateCssContent();
    const cssFile = path.join(htmlOutputDir, 'coverage.css');
    fs.writeFileSync(cssFile, cssContent);

    // Generate per-file reports
    generateFileReports(coverageMap, htmlOutputDir);

    console.log('✅ Simple HTML coverage report generated successfully!');
    console.log(`📂 HTML Report: ${indexFile}`);

    return true;

  } catch (error) {
    console.error('❌ Error generating HTML report:', error.message);
    console.error(error.stack);
    return false;
  }
}

function generateHtmlContent(coverageMap) {
  const summary = coverageMap.getCoverageSummary();
  const files = coverageMap.files();

  const fileRows = files.map(file => {
    const fileCoverage = coverageMap.fileCoverageFor(file);
    const fileSummary = fileCoverage.toSummary();
    const relativePath = path.relative(process.cwd(), file);
    const fileName = path.basename(file);
    
    return `
      <tr>
        <td><a href="${fileName}.html">${relativePath}</a></td>
        <td class="coverage-cell ${getCoverageClass(fileSummary.statements.pct)}">
          ${fileSummary.statements.pct.toFixed(2)}% (${fileSummary.statements.covered}/${fileSummary.statements.total})
        </td>
        <td class="coverage-cell ${getCoverageClass(fileSummary.branches.pct)}">
          ${fileSummary.branches.pct.toFixed(2)}% (${fileSummary.branches.covered}/${fileSummary.branches.total})
        </td>
        <td class="coverage-cell ${getCoverageClass(fileSummary.functions.pct)}">
          ${fileSummary.functions.pct.toFixed(2)}% (${fileSummary.functions.covered}/${fileSummary.functions.total})
        </td>
        <td class="coverage-cell ${getCoverageClass(fileSummary.lines.pct)}">
          ${fileSummary.lines.pct.toFixed(2)}% (${fileSummary.lines.covered}/${fileSummary.lines.total})
        </td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bootstrap TouchSpin - Coverage Report</title>
    <link rel="stylesheet" href="coverage.css">
</head>
<body>
    <div class="container">
        <h1>📊 Bootstrap TouchSpin - Coverage Report</h1>
        <p class="timestamp">Generated on: ${new Date().toLocaleString()}</p>
        
        <div class="summary">
            <h2>📈 Overall Coverage Summary</h2>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-label">Statements</div>
                    <div class="summary-value ${getCoverageClass(summary.statements.pct)}">
                        ${summary.statements.pct.toFixed(2)}%
                    </div>
                    <div class="summary-detail">${summary.statements.covered}/${summary.statements.total}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Branches</div>
                    <div class="summary-value ${getCoverageClass(summary.branches.pct)}">
                        ${summary.branches.pct.toFixed(2)}%
                    </div>
                    <div class="summary-detail">${summary.branches.covered}/${summary.branches.total}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Functions</div>
                    <div class="summary-value ${getCoverageClass(summary.functions.pct)}">
                        ${summary.functions.pct.toFixed(2)}%
                    </div>
                    <div class="summary-detail">${summary.functions.covered}/${summary.functions.total}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Lines</div>
                    <div class="summary-value ${getCoverageClass(summary.lines.pct)}">
                        ${summary.lines.pct.toFixed(2)}%
                    </div>
                    <div class="summary-detail">${summary.lines.covered}/${summary.lines.total}</div>
                </div>
            </div>
        </div>

        <div class="file-list">
            <h2>📁 File Coverage Details</h2>
            <table>
                <thead>
                    <tr>
                        <th>File</th>
                        <th>Statements</th>
                        <th>Branches</th>
                        <th>Functions</th>
                        <th>Lines</th>
                    </tr>
                </thead>
                <tbody>
                    ${fileRows}
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p>🎭 Generated from Playwright V8 coverage data</p>
            <p>🔧 Processing pipeline: V8 → Istanbul → Simple HTML Report</p>
        </div>
    </div>
</body>
</html>`;
}

function generateFileReports(coverageMap, outputDir) {
  const files = coverageMap.files();
  
  files.forEach(file => {
    const fileCoverage = coverageMap.fileCoverageFor(file);
    const fileName = path.basename(file);
    const htmlFile = path.join(outputDir, `${fileName}.html`);
    
    const fileHtml = generateFileHtmlContent(file, fileCoverage);
    fs.writeFileSync(htmlFile, fileHtml);
  });
}

function generateFileHtmlContent(filePath, fileCoverage) {
  const fileName = path.basename(filePath);
  const relativePath = path.relative(process.cwd(), filePath);
  const summary = fileCoverage.toSummary();
  
  // Get line coverage information
  const lines = fileCoverage.getLineCoverage();
  const source = fileCoverage.s; // Statement coverage
  
  // Read the actual source file for display
  let sourceLines = [];
  try {
    if (fs.existsSync(filePath)) {
      sourceLines = fs.readFileSync(filePath, 'utf8').split('\n');
    }
  } catch (error) {
    sourceLines = ['// Source file not available for display'];
  }

  const sourceHtml = sourceLines.map((line, index) => {
    const lineNumber = index + 1;
    const lineCount = lines[lineNumber];
    const coverageClass = lineCount === undefined ? '' : 
                         lineCount > 0 ? 'covered' : 'uncovered';
    
    return `
      <tr class="source-line ${coverageClass}">
        <td class="line-number">${lineNumber}</td>
        <td class="line-count">${lineCount !== undefined ? lineCount : ''}</td>
        <td class="source-code"><pre>${escapeHtml(line)}</pre></td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coverage: ${fileName}</title>
    <link rel="stylesheet" href="coverage.css">
</head>
<body>
    <div class="container">
        <div class="breadcrumb">
            <a href="index.html">← Back to Coverage Report</a>
        </div>
        
        <h1>📄 ${relativePath}</h1>
        
        <div class="file-summary">
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-label">Statements</div>
                    <div class="summary-value ${getCoverageClass(summary.statements.pct)}">
                        ${summary.statements.pct.toFixed(2)}%
                    </div>
                    <div class="summary-detail">${summary.statements.covered}/${summary.statements.total}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Branches</div>
                    <div class="summary-value ${getCoverageClass(summary.branches.pct)}">
                        ${summary.branches.pct.toFixed(2)}%
                    </div>
                    <div class="summary-detail">${summary.branches.covered}/${summary.branches.total}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Functions</div>
                    <div class="summary-value ${getCoverageClass(summary.functions.pct)}">
                        ${summary.functions.pct.toFixed(2)}%
                    </div>
                    <div class="summary-detail">${summary.functions.covered}/${summary.functions.total}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Lines</div>
                    <div class="summary-value ${getCoverageClass(summary.lines.pct)}">
                        ${summary.lines.pct.toFixed(2)}%
                    </div>
                    <div class="summary-detail">${summary.lines.covered}/${summary.lines.total}</div>
                </div>
            </div>
        </div>

        <div class="source-view">
            <h2>📋 Source Code with Coverage</h2>
            <div class="legend">
                <span class="legend-item covered">✅ Covered</span>
                <span class="legend-item uncovered">❌ Uncovered</span>
                <span class="legend-item neutral">⚪ Not executable</span>
            </div>
            <table class="source-table">
                <thead>
                    <tr>
                        <th>Line</th>
                        <th>Hits</th>
                        <th>Source</th>
                    </tr>
                </thead>
                <tbody>
                    ${sourceHtml}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`;
}

function generateCssContent() {
  return `
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h1 {
  color: #2c3e50;
  border-bottom: 3px solid #3498db;
  padding-bottom: 10px;
  margin-bottom: 30px;
}

h2 {
  color: #34495e;
  margin-top: 40px;
  margin-bottom: 20px;
}

.timestamp {
  color: #7f8c8d;
  font-style: italic;
  margin-bottom: 30px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
  text-align: center;
  border: 1px solid #e9ecef;
}

.summary-label {
  font-weight: bold;
  color: #495057;
  margin-bottom: 10px;
}

.summary-value {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 5px;
}

.summary-detail {
  color: #6c757d;
  font-size: 0.9em;
}

.high { color: #28a745; }
.medium { color: #fd7e14; }
.low { color: #dc3545; }

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

th {
  background-color: #e9ecef;
  font-weight: bold;
  color: #495057;
}

.coverage-cell {
  text-align: center;
  font-weight: bold;
}

.breadcrumb {
  margin-bottom: 20px;
}

.breadcrumb a {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.file-summary {
  margin-bottom: 30px;
}

.source-view {
  margin-top: 30px;
}

.legend {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.legend-item {
  margin-right: 20px;
  font-weight: bold;
}

.source-table {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
}

.source-line.covered {
  background-color: #d4edda;
}

.source-line.uncovered {
  background-color: #f8d7da;
}

.line-number {
  background-color: #e9ecef;
  color: #6c757d;
  text-align: right;
  width: 60px;
  font-weight: bold;
}

.line-count {
  text-align: center;
  width: 60px;
  color: #495057;
  font-weight: bold;
}

.source-code {
  width: 100%;
}

.source-code pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #dee2e6;
  color: #6c757d;
  text-align: center;
}

.footer p {
  margin: 5px 0;
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .container {
    padding: 15px;
  }
  
  table {
    font-size: 0.9em;
  }
}
`;
}

function getCoverageClass(percentage) {
  if (percentage >= 80) return 'high';
  if (percentage >= 50) return 'medium';
  return 'low';
}

function escapeHtml(text) {
  const div = { innerHTML: '' };
  div.textContent = text;
  return div.innerHTML || text.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}

// Run if called directly
if (require.main === module) {
  generateSimpleHtmlReport();
}

module.exports = generateSimpleHtmlReport;