#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const packagesJson = process.env.PUBLISHED_PACKAGES;

if (!packagesJson || packagesJson === '[]') {
  console.log('No published packages detected. Skipping release asset preparation.');
  process.exit(0);
}

const publishedPackages = JSON.parse(packagesJson);

if (!Array.isArray(publishedPackages) || publishedPackages.length === 0) {
  console.log('Parsed published packages are empty. Skipping release asset preparation.');
  process.exit(0);
}

const packageDirMap = new Map([
  ['@touchspin/jquery', 'packages/adapters/jquery'],
  ['@touchspin/standalone', 'packages/adapters/standalone'],
  ['@touchspin/webcomponent', 'packages/adapters/webcomponent'],
  ['@touchspin/renderer-bootstrap3', 'packages/renderers/bootstrap3'],
  ['@touchspin/renderer-bootstrap4', 'packages/renderers/bootstrap4'],
  ['@touchspin/renderer-bootstrap5', 'packages/renderers/bootstrap5'],
  ['@touchspin/renderer-tailwind', 'packages/renderers/tailwind'],
  ['@touchspin/renderer-vanilla', 'packages/renderers/vanilla'],
]);

const artifactsDir = path.resolve('release-artifacts');
await fs.mkdir(artifactsDir, { recursive: true });

const artifactPaths = [];

for (const pkg of publishedPackages) {
  const relPath = packageDirMap.get(pkg.name);
  if (!relPath) {
    continue;
  }

  const pkgDir = path.resolve(relPath);
  const distDir = path.join(pkgDir, 'dist');

  try {
    await fs.access(distDir);
  } catch {
    console.warn(`Skipping ${pkg.name}: dist directory not found at ${distDir}`);
    continue;
  }

  const slug = pkg.name.replace(/^@/, '').replace(/[\\/]/g, '-');
  const tarFile = path.join(artifactsDir, `${slug}-v${pkg.version}-dist.tar.gz`);

  await new Promise((resolve, reject) => {
    const tar = spawn('tar', ['-czf', tarFile, '-C', pkgDir, 'dist'], { stdio: 'inherit' });
    tar.on('close', (code) => {
      if (code === 0) {
        artifactPaths.push(tarFile);
        resolve();
      } else {
        reject(new Error(`tar exited with code ${code} while processing ${pkg.name}`));
      }
    });
  });
}

const releaseNotesLines = [
  '# Published packages',
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
