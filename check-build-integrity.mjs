import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const distFolder = 'dist/';
const tempDistFolder = 'tmp-dist-integrity-check/';

function calculateChecksum(folderPath) {
  const hasher = crypto.createHash('md5');

  // Get all files in folder, excluding source maps
  const files = [];
  function getAllFiles(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        getAllFiles(fullPath);
      } else {
        // Include all files including source maps now that paths are consistent
        files.push(fullPath);
      }
    }
  }

  getAllFiles(folderPath);
  files.sort(); // Ensure consistent order

  files.forEach(filePath => {
    if (fs.lstatSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath);
      hasher.update(content);
    }
  });

  return hasher.digest('hex');
}

function calculateFileChecksums(folderPath) {
  const fileChecksums = {};

  // Get all files in folder
  const files = [];
  function getAllFiles(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        getAllFiles(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  getAllFiles(folderPath);
  files.sort(); // Ensure consistent order

  files.forEach(filePath => {
    if (fs.lstatSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath);
      const fileHash = crypto.createHash('md5').update(content).digest('hex');
      // Store relative path for comparison
      const relativePath = path.relative(folderPath, filePath);
      fileChecksums[relativePath] = fileHash;
    }
  });

  return fileChecksums;
}

function checkBuildIntegrity() {
  console.log('🔍 Checking build integrity...');

  // Check if committed dist folder exists
  if (!fs.existsSync(distFolder)) {
    console.error('❌ Committed dist folder does not exist! Please run "npm run build" first.');
    process.exit(1);
  }

  // Calculate checksum of committed dist files
  const committedChecksum = calculateChecksum(distFolder);
  console.log('Committed dist checksum:', committedChecksum);

  // Clean temp dist folder
  if (fs.existsSync(tempDistFolder)) {
    fs.rmSync(tempDistFolder, { recursive: true });
  }

  try {
    // Build fresh dist files into temp folder using integrity check mode
    console.log(`🔨 Building fresh dist files into ${tempDistFolder} for comparison...`);
    execSync('npm run build', {
      stdio: 'inherit',
      env: { ...process.env, BUILD_INTEGRITY_CHECK: 'true' }
    });

    // Calculate checksum of freshly built files
    const freshChecksum = calculateChecksum(tempDistFolder);
    console.log('Fresh build checksum:', freshChecksum);

    if (committedChecksum !== freshChecksum) {
      console.error('❌ Checksums do not match! The committed dist files are outdated.');

      // Perform detailed file-by-file comparison
      console.log('\n🔍 Detailed file-by-file comparison:');
      const committedFiles = calculateFileChecksums(distFolder);
      const freshFiles = calculateFileChecksums(tempDistFolder);

      // Find all unique file names
      const allFiles = new Set([...Object.keys(committedFiles), ...Object.keys(freshFiles)]);
      let hasDifferences = false;

      for (const fileName of Array.from(allFiles).sort()) {
        const committedHash = committedFiles[fileName];
        const freshHash = freshFiles[fileName];

        if (!committedHash) {
          console.log(`❌ ${fileName}: missing in committed dist/`);
          hasDifferences = true;
        } else if (!freshHash) {
          console.log(`❌ ${fileName}: missing in fresh build`);
          hasDifferences = true;
        } else if (committedHash === freshHash) {
          console.log(`✅ ${fileName}: matches`);
        } else {
          console.log(`❌ ${fileName}: differs`);
          console.log(`   Committed: ${committedHash}`);
          console.log(`   Fresh:     ${freshHash}`);
          hasDifferences = true;
        }
      }

      if (hasDifferences) {
        console.error('\nPlease rebuild the dist files with "npm run build" and commit the changes.');
      }
      process.exit(1);
    } else {
      console.log('✅ Checksums match! The committed dist files are up-to-date.');
    }
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  } finally {
    // Clean up temp folder
    if (fs.existsSync(tempDistFolder)) {
      fs.rmSync(tempDistFolder, { recursive: true });
    }
  }
}

checkBuildIntegrity();
