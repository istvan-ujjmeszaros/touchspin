#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function renameIifeBundles() {
  const distDir = join(projectRoot, 'dist');

  try {
    const files = await fs.readdir(distDir);

    for (const file of files) {
      if (file.startsWith('jquery-touchspin-bs') && file.endsWith('.js')) {
        const oldPath = join(distDir, file);
        const newFile = file.replace('jquery-touchspin-bs', 'jquery.bootstrap-touchspin-bs');
        const newPath = join(distDir, newFile);

        await fs.rename(oldPath, newPath);
        console.log(`Renamed ${file} to ${newFile}`);
      }

      // Also rename source maps if they exist
      if (file.startsWith('jquery-touchspin-bs') && file.endsWith('.js.map')) {
        const oldPath = join(distDir, file);
        const newFile = file.replace('jquery-touchspin-bs', 'jquery.bootstrap-touchspin-bs');
        const newPath = join(distDir, newFile);

        await fs.rename(oldPath, newPath);
        console.log(`Renamed ${file} to ${newFile}`);
      }
    }
  } catch (error) {
    console.error('Error renaming files:', error);
    process.exit(1);
  }
}

renameIifeBundles();