import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const distFolder = 'dist/';

function calculateChecksum(folderPath) {
  const hasher = crypto.createHash('md5');
  
  // Get all files in dist folder
  const files = [];
  function getAllFiles(dirPath) {
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
  
  if (fs.existsSync(folderPath)) {
    getAllFiles(folderPath);
    files.sort(); // Ensure consistent order
    
    files.forEach(filePath => {
      if (fs.lstatSync(filePath).isFile()) {
        const content = fs.readFileSync(filePath);
        hasher.update(content);
      }
    });
  }
  
  return hasher.digest('hex');
}

function checkBuildIntegrity() {
  console.log('🔍 Checking build integrity...');
  
  // Calculate initial checksum
  const initialChecksum = calculateChecksum(distFolder);
  console.log('Initial checksum:', initialChecksum);
  
  // Clean dist folder
  if (fs.existsSync(distFolder)) {
    fs.rmSync(distFolder, { recursive: true });
  }
  
  // Rebuild
  console.log('🔨 Rebuilding...');
  try {
    execSync('node build.mjs', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
  
  // Calculate final checksum
  const finalChecksum = calculateChecksum(distFolder);
  console.log('Final checksum:', finalChecksum);
  
  if (initialChecksum !== finalChecksum) {
    console.error('❌ Checksums do not match! Please rebuild the dist files with "npm run build"');
    process.exit(1);
  } else {
    console.log('✅ Checksums match! The dist folder is up-to-date.');
  }
}

checkBuildIntegrity();