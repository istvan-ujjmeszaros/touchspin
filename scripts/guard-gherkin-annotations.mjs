#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

function walkDir(dir, pattern) {
  const files = [];

  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = `${dir}/${entry.name}`;
      if (entry.isDirectory()) {
        files.push(...walkDir(fullPath, pattern));
      } else if (entry.isFile() && entry.name.endsWith(pattern)) {
        files.push(fullPath);
      }
    }
  } catch {
    // ignore unreadable dirs
  }

  return files;
}

function findSpecFiles(targetPaths = []) {
  const files = [];

  if (targetPaths.length > 0) {
    for (const targetPath of targetPaths) {
      const fullPath = targetPath.startsWith('/') ? targetPath : `${projectRoot}/${targetPath}`;
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          files.push(...walkDir(fullPath, '.spec.ts'));
        } else if (stat.isFile() && fullPath.endsWith('.spec.ts')) {
          files.push(fullPath);
        }
      } catch {
        // ignore missing paths
      }
    }
    return [...new Set(files)];
  }

  const packagesDir = `${projectRoot}/packages`;
  try {
    const packages = readdirSync(packagesDir, { withFileTypes: true });
    for (const pkg of packages) {
      if (!pkg.isDirectory()) continue;
      const base = `${packagesDir}/${pkg.name}`;

      const directTests = `${base}/tests`;
      try {
        if (statSync(directTests).isDirectory()) {
          files.push(...walkDir(directTests, '.spec.ts'));
        }
      } catch {
        // no direct tests
      }

      try {
        const nested = readdirSync(base, { withFileTypes: true });
        for (const nestedPkg of nested) {
          if (!nestedPkg.isDirectory()) continue;
          const nestedTests = `${base}/${nestedPkg.name}/tests`;
          try {
            if (statSync(nestedTests).isDirectory()) {
              files.push(...walkDir(nestedTests, '.spec.ts'));
            }
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore missing packages dir
  }

  return [...new Set(files)];
}

function countTests(content) {
  const matches = content.match(/\btest(?:\.(?:skip|only|fixme))?\s*\(/g);
  return matches ? matches.length : 0;
}

function countAnnotatedTests(content) {
  const matches = content.match(
    /\/\*\*[\s\S]*?Scenario:[\s\S]*?\*\/\s*test(?:\.(?:skip|only|fixme))?\s*\(/g
  );
  return matches ? matches.length : 0;
}

function hasChecklist(content) {
  return /\*\s*CHECKLIST\s*—/.test(content);
}

function main() {
  const targetPaths = process.argv.slice(2);
  const specFiles = findSpecFiles(targetPaths);

  const missingChecklist = [];
  const missingAnnotations = [];

  for (const filePath of specFiles) {
    const fileId = relative(projectRoot, filePath);
    const lowerPath = fileId.toLowerCase();
    if (!lowerPath.includes('coverage')) {
      continue;
    }

    let content;
    try {
      content = readFileSync(filePath, 'utf8');
    } catch {
      continue;
    }

    if (!hasChecklist(content)) {
      missingChecklist.push(fileId);
    }

    const testCount = countTests(content);
    if (testCount === 0) continue;
    const annotatedCount = countAnnotatedTests(content);
    if (annotatedCount !== testCount) {
      missingAnnotations.push({
        file: fileId,
        expected: testCount,
        found: annotatedCount,
      });
    }
  }

  if (missingChecklist.length === 0 && missingAnnotations.length === 0) {
    console.log('✅ Gherkin checklist guard passed');
    process.exit(0);
  }

  console.error('❌ Playwright spec annotation guard failed');
  if (missingChecklist.length > 0) {
    console.error('\nThe following spec files are missing the required checklist header:\n');
    for (const file of missingChecklist) {
      console.error(` - ${file}`);
    }
    console.error(
      '\nAdd a block such as:\n/*\n * CHECKLIST — Scenarios in this spec\n * [x] first scenario\n * [x] second scenario\n */\n'
    );
  }

  if (missingAnnotations.length > 0) {
    console.error('\nThe following spec files have tests missing Gherkin scenario docblocks:\n');
    for (const { file, expected, found } of missingAnnotations) {
      console.error(` - ${file} (found ${found} scenario annotations for ${expected} tests)`);
    }
    console.error(
      '\nEvery test must be preceded by a /** ... Scenario: ... */ comment describing Given/When/Then steps.'
    );
  }

  process.exit(1);
}

main();
