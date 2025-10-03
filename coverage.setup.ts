import fs from 'fs';
import path from 'path';

async function globalSetup() {
  // Clean up old coverage data
  const coverageDir = path.join(process.cwd(), '.nyc_output');
  const playwrightCoverageDir = path.join(process.cwd(), 'reports', 'playwright-coverage');
  const htmlCoverageDir = path.join(process.cwd(), 'reports', 'coverage');
  const istanbulJsonDir = path.join(process.cwd(), 'reports', 'istanbul-json');

  // Clean all coverage directories
  [coverageDir, playwrightCoverageDir, htmlCoverageDir, istanbulJsonDir].forEach((dir) => {
    if (fs.existsSync(dir)) {
      // Remove all files in the directory
      fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          fs.rmSync(filePath, { recursive: true });
        } else {
          fs.unlinkSync(filePath);
        }
      });
    }
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  console.log('✅ Coverage directories cleaned and prepared');
}

export default globalSetup;
