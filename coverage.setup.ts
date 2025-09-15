import fs from 'fs';
import path from 'path';

async function globalSetup() {
  // Clean up old coverage data
  const coverageDir = path.join(process.cwd(), '.nyc_output');
  const playwrightCoverageDir = path.join(process.cwd(), 'reports', 'playwright-coverage');

  // Create directories if they don't exist
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }

  if (!fs.existsSync(playwrightCoverageDir)) {
    fs.mkdirSync(playwrightCoverageDir, { recursive: true });
  }

  // Clean existing coverage files
  const files = fs.readdirSync(coverageDir);
  for (const file of files) {
    if (file.endsWith('.json')) {
      fs.unlinkSync(path.join(coverageDir, file));
    }
  }

  console.log('✅ Coverage directories prepared');
}

export default globalSetup;