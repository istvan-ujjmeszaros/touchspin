#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

// Helper function to find files matching a pattern in a directory
async function findFiles(baseDir, pattern) {
  const files = [];
  try {
    // Simple glob implementation for our patterns
    const patternParts = pattern.split('/');
    const searchDir = path.resolve(baseDir, ...patternParts.slice(0, -1));
    const filePattern = patternParts[patternParts.length - 1];

    const entries = await fs.readdir(searchDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        const fileName = entry.name;
        // Simple wildcard matching with end anchor
        const regexPattern = `${filePattern.replace(/\*/g, '.*')}$`;
        const regex = new RegExp(regexPattern);
        if (regex.test(fileName)) {
          files.push(path.join(searchDir, fileName));
        }
      }
    }
  } catch (error) {
    console.warn(`Error reading directory for pattern ${pattern}:`, error.message);
  }
  return files;
}

const packagesJson = process.env.PUBLISHED_PACKAGES;

if (!packagesJson || packagesJson === '[]') {
  console.log('No published packages detected. Skipping release asset preparation.');
  process.exit(0);
}

// Build release assets first - minified versions without source maps
async function buildReleaseAssets() {
  console.log('Building minified release assets...');

  // Build dependencies in correct order to avoid circular dependencies
  console.log('Building core dependencies...');
  await runCommand('yarn workspace @touchspin/core run build');

  console.log('Building renderer dependencies...');
  await runCommand('yarn workspaces foreach -pt -A --include "@touchspin/renderer-*" run build');

  console.log('Building adapter dependencies...');
  await runCommand('yarn workspaces foreach -pt -A --include "@touchspin/standalone" run build');

  // Build jQuery release assets
  console.log('Building jQuery release assets...');
  await runCommand('yarn workspace @touchspin/jquery run build:umd-release-bootstrap3');
  await runCommand('yarn workspace @touchspin/jquery run build:umd-release-bootstrap4');
  await runCommand('yarn workspace @touchspin/jquery run build:umd-release-bootstrap5');
  await runCommand('yarn workspace @touchspin/jquery run build:umd-release-tailwind');
  await runCommand('yarn workspace @touchspin/jquery run build:umd-release-vanilla');

  // Build webcomponent release assets
  console.log('Building webcomponent release assets...');
  await runCommand('yarn workspace @touchspin/webcomponent run build:umd-release-bootstrap3');
  await runCommand('yarn workspace @touchspin/webcomponent run build:umd-release-bootstrap4');
  await runCommand('yarn workspace @touchspin/webcomponent run build:umd-release-bootstrap5');
  await runCommand('yarn workspace @touchspin/webcomponent run build:umd-release-tailwind');
  await runCommand('yarn workspace @touchspin/webcomponent run build:umd-release-vanilla');

  console.log('Release assets built successfully');
}

async function runCommand(cmd) {
  const { spawn } = await import('node:child_process');
  const [command, ...args] = cmd.split(' ');

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: true });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed: ${cmd}`));
      }
    });

    child.on('error', reject);
  });
}

const publishedPackages = JSON.parse(packagesJson);

if (!Array.isArray(publishedPackages) || publishedPackages.length === 0) {
  console.log('Parsed published packages are empty. Skipping release asset preparation.');
  process.exit(0);
}

// Map package names to their directory and asset handling config
const packageConfigMap = new Map([
  [
    '@touchspin/jquery',
    {
      dir: 'packages/adapters/jquery',
      assets: [
        {
          pattern: 'dist/umd/jquery.touchspin-*.umd.js',
          rename: (filename) => filename.replace(/^jquery\.touchspin-/, 'touchspin-jquery-'),
        },
      ],
    },
  ],
  [
    '@touchspin/standalone',
    {
      dir: 'packages/adapters/standalone',
      assets: [
        { pattern: 'dist/bootstrap3.js', rename: (filename) => `touchspin-standalone-${filename}` },
        { pattern: 'dist/bootstrap4.js', rename: (filename) => `touchspin-standalone-${filename}` },
        { pattern: 'dist/bootstrap5.js', rename: (filename) => `touchspin-standalone-${filename}` },
        { pattern: 'dist/tailwind.js', rename: (filename) => `touchspin-standalone-${filename}` },
        { pattern: 'dist/vanilla.js', rename: (filename) => `touchspin-standalone-${filename}` },
      ],
    },
  ],
  [
    '@touchspin/webcomponent',
    {
      dir: 'packages/adapters/webcomponent',
      assets: [
        {
          pattern: 'dist/umd/*.touchspin.umd.js',
          rename: (filename) => `touchspin-webcomponent-${filename.replace('.touchspin', '')}`,
        },
      ],
    },
  ],
  [
    '@touchspin/renderer-bootstrap3',
    {
      dir: 'packages/renderers/bootstrap3',
      assets: [
        {
          pattern: 'dist/touchspin-bootstrap3.css',
          rename: (filename) => filename.replace(/^touchspin-/, 'touchspin-renderer-'),
        },
      ],
    },
  ],
  [
    '@touchspin/renderer-bootstrap4',
    {
      dir: 'packages/renderers/bootstrap4',
      assets: [
        {
          pattern: 'dist/touchspin-bootstrap4.css',
          rename: (filename) => filename.replace(/^touchspin-/, 'touchspin-renderer-'),
        },
      ],
    },
  ],
  [
    '@touchspin/renderer-bootstrap5',
    {
      dir: 'packages/renderers/bootstrap5',
      assets: [
        {
          pattern: 'dist/touchspin-bootstrap5.css',
          rename: (filename) => filename.replace(/^touchspin-/, 'touchspin-renderer-'),
        },
      ],
    },
  ],
  [
    '@touchspin/renderer-tailwind',
    {
      dir: 'packages/renderers/tailwind',
      assets: [
        {
          pattern: 'dist/touchspin-tailwind.css',
          rename: (filename) => filename.replace(/^touchspin-/, 'touchspin-renderer-'),
        },
      ],
    },
  ],
  [
    '@touchspin/renderer-vanilla',
    {
      dir: 'packages/renderers/vanilla',
      assets: [
        {
          pattern: 'dist/touchspin-vanilla.css',
          rename: (filename) => filename.replace(/^touchspin-/, 'touchspin-renderer-'),
        },
      ],
    },
  ],
]);

// Build minified release assets first
await buildReleaseAssets();

const artifactsDir = path.resolve('release-artifacts');
await fs.mkdir(artifactsDir, { recursive: true });

const artifactPaths = [];

for (const pkg of publishedPackages) {
  const config = packageConfigMap.get(pkg.name);
  if (!config) {
    console.log(`No asset configuration found for ${pkg.name}, skipping`);
    continue;
  }

  const pkgDir = path.resolve(config.dir);

  for (const asset of config.assets) {
    const files = await findFiles(pkgDir, asset.pattern);
    console.log(`Found ${files.length} files for ${pkg.name} pattern ${asset.pattern}`);

    for (const filePath of files) {
      const fileName = path.basename(filePath);
      const newFileName = asset.rename(fileName);
      const destFile = path.join(artifactsDir, newFileName);
      await fs.copyFile(filePath, destFile);
      artifactPaths.push(destFile);
      console.log(`  → ${newFileName}`);
    }
  }
}

const releaseNotesLines = [
  '# TouchSpin Release Assets',
  '',
  'This release includes minified, production-ready assets for various integration methods.',
  'All JavaScript assets are minified and do not include source maps.',
  '',
  '## jQuery Adapter (@touchspin/jquery)',
  'Minified UMD bundles for script-tag integration with jQuery:',
  '- `touchspin-jquery-bootstrap3.umd.js` - Bootstrap 3 theme',
  '- `touchspin-jquery-bootstrap4.umd.js` - Bootstrap 4 theme',
  '- `touchspin-jquery-bootstrap5.umd.js` - Bootstrap 5 theme',
  '- `touchspin-jquery-tailwind.umd.js` - Tailwind CSS theme',
  '- `touchspin-jquery-vanilla.umd.js` - Vanilla CSS theme',
  '',
  '## Standalone Adapter (@touchspin/standalone)',
  'ESM bundles for modern bundlers (no jQuery required):',
  '- `touchspin-standalone-bootstrap3.js` - Bootstrap 3 theme',
  '- `touchspin-standalone-bootstrap4.js` - Bootstrap 4 theme',
  '- `touchspin-standalone-bootstrap5.js` - Bootstrap 5 theme',
  '- `touchspin-standalone-tailwind.js` - Tailwind CSS theme',
  '- `touchspin-standalone-vanilla.js` - Vanilla CSS theme',
  '',
  '## Web Component (@touchspin/webcomponent)',
  'Minified UMD bundles exposing <touchspin-input> custom element:',
  '- `touchspin-webcomponent-bootstrap3.umd.js` - Bootstrap 3 theme',
  '- `touchspin-webcomponent-bootstrap4.umd.js` - Bootstrap 4 theme',
  '- `touchspin-webcomponent-bootstrap5.umd.js` - Bootstrap 5 theme',
  '- `touchspin-webcomponent-tailwind.umd.js` - Tailwind CSS theme',
  '- `touchspin-webcomponent-vanilla.umd.js` - Vanilla CSS theme',
  '',
  '## CSS Stylesheets',
  'Theme stylesheets (pair with corresponding JS bundles):',
  '- `touchspin-renderer-bootstrap3.css` - Bootstrap 3 styles',
  '- `touchspin-renderer-bootstrap4.css` - Bootstrap 4 styles',
  '- `touchspin-renderer-bootstrap5.css` - Bootstrap 5 styles',
  '- `touchspin-renderer-tailwind.css` - Tailwind CSS styles',
  '- `touchspin-renderer-vanilla.css` - Vanilla CSS styles',
  '',
  '## Published Packages',
  '',
  ...publishedPackages.map((pkg) => `- ${pkg.name}@${pkg.version}`),
];

const notesFile = path.join(artifactsDir, 'release-notes.md');
await fs.writeFile(notesFile, `${releaseNotesLines.join('\n')}\n`, 'utf8');

const primaryPackage = publishedPackages[0];
const releaseVersion = primaryPackage?.version ?? new Date().toISOString();
const releaseTag = `touchspin-${releaseVersion}`;
const releaseName = `TouchSpin ${releaseVersion}`;

const output = [];
output.push(`release_tag=${releaseTag}`);
output.push(`release_name=${releaseName}`);
output.push(`notes_file=${notesFile}`);
output.push('artifact_paths<<EOF');
if (artifactPaths.length > 0) {
  output.push(...artifactPaths);
}
output.push('EOF');
const outputPayload = `${output.join('\n')}\n`;

if (process.env.GITHUB_OUTPUT) {
  await fs.appendFile(process.env.GITHUB_OUTPUT, outputPayload, 'utf8');
} else {
  console.log('--- Outputs ---');
  console.log(outputPayload);
}

console.log('Prepared release notes at:', notesFile);
if (artifactPaths.length > 0) {
  console.log('Prepared artifact archives:');
  artifactPaths.forEach((file) => console.log(` - ${file}`));
} else {
  console.log('No artifacts were prepared (no matching packages were published).');
}
