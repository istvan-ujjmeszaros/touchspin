// /scripts/step-lexicon.mjs
// Generates a Step Lexicon markdown file from doc-comments above helper functions.
//
// Usage:
//   node scripts/step-lexicon.mjs                                  # scan default roots
//   node scripts/step-lexicon.mjs packages/foo/helpers packages/bar # scan specific roots
//
// Scans for TypeScript/JavaScript files containing 'export function' declarations,
// extracts step descriptions from preceding /** ... */ doc-comments,
// and generates a categorized markdown file at tests/STEP-LEXICON.md

import fs from "node:fs";
import path from "node:path";

const ROOTS = process.argv.slice(2);
const DEFAULT_ROOTS = ["packages/core/tests/__shared__/helpers"];
const START_DIRS = ROOTS.length ? ROOTS.map(p => path.resolve(p)) : expandGlobs(DEFAULT_ROOTS);
const FILE_REGEX = /\.(ts|tsx|js|jsx)$/i;
const OUTPUT_PATH = "tests/STEP-LEXICON.md";

// Common junk to skip while walking
const IGNORE_DIRS = new Set([
  "node_modules", ".git", "dist", "build", "coverage", ".next", "out",
  ".turbo", ".cache", ".yarn", ".pnpm", ".idea", ".vscode", "tmp"
]);

// ---------- fs helpers ----------
function expandGlobs(globs) {
  const dirs = [];
  for (const glob of globs) {
    // Simple glob expansion for packages/**/tests/__shared__/helpers/**
    const parts = glob.split('/');
    if (parts[0] === 'packages' && parts[1] === '**') {
      try {
        const packageDirs = fs.readdirSync('packages', { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => path.join('packages', d.name, ...parts.slice(2)))
          .filter(d => {
            try {
              return fs.existsSync(d) && fs.statSync(d).isDirectory();
            } catch {
              return false;
            }
          });
        dirs.push(...packageDirs);
      } catch {
        // packages directory might not exist, continue
      }
    } else {
      try {
        if (fs.existsSync(glob)) dirs.push(glob);
      } catch {
        // ignore invalid paths
      }
    }
  }
  return dirs.map(d => path.resolve(d));
}

function walk(dir, acc = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc; // unreadable dir
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!IGNORE_DIRS.has(e.name)) walk(full, acc);
    } else if (e.isFile() && FILE_REGEX.test(e.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function readFile(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

// ---------- parsing ----------
function extractExportedFunctions(src, filePath) {
  const functions = [];
  const lines = src.split(/\r?\n/);

  // Find all export function declarations
  const exportRegex = /^\s*export\s+(?:async\s+)?function\s+(\w+)\s*\([^)]*\)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(exportRegex);

    if (match) {
      const functionName = match[1];
      const signature = extractSignature(line);

      // Look for the closest preceding /** ... */ block
      const docComment = findPrecedingDocComment(lines, i);
      if (docComment) {
        const steps = extractStepsFromComment(docComment);
        if (steps.length > 0) {
          const notes = extractNotesFromComment(docComment);
          const category = getCategoryFromPath(filePath);

          for (const step of steps) {
            functions.push({
              step,
              functionName,
              signature,
              filePath: toRelativePath(filePath),
              category,
              notes
            });
          }
        }
      }
    }
  }

  return functions;
}

function extractSignature(line) {
  // Extract function name and parameters from the export line
  const match = line.match(/function\s+(\w+)\s*\(([^)]*)\)/);
  if (match) {
    const [, name, params] = match;
    // Clean up parameters - remove types and default values for simpler display
    const cleanParams = params
      .split(',')
      .map(p => p.trim().replace(/:\s*[^=,]+/g, '').replace(/\s*=\s*[^,]+/g, '').trim())
      .filter(p => p.length > 0)
      .join(', ');
    return `${name}(${cleanParams})`;
  }
  return '';
}

function findPrecedingDocComment(lines, functionLineIndex) {
  // Search backwards from the function line to find the nearest /** ... */ block
  let endIndex = -1;
  let startIndex = -1;

  for (let i = functionLineIndex - 1; i >= 0; i--) {
    const line = lines[i].trim();

    // Skip empty lines and single-line comments
    if (line === '' || line.startsWith('//')) continue;

    if (line.endsWith('*/')) {
      endIndex = i;
      continue;
    }

    if (line.startsWith('/**')) {
      startIndex = i;
      break;
    }

    // If we hit any other non-comment content, stop searching
    if (endIndex === -1 && !line.startsWith('*')) break;
  }

  if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
    return lines.slice(startIndex, endIndex + 1);
  }

  return null;
}

function extractStepsFromComment(commentLines) {
  const steps = [];

  for (const line of commentLines) {
    const cleaned = line.replace(/^\s*\/?\*+\s?/, '').replace(/\*\/\s*$/, '').trim();

    // Skip empty lines and @note lines
    if (cleaned === '' || cleaned.startsWith('@')) continue;

    // This is a step line
    if (cleaned.length > 0) {
      steps.push(cleaned);
    }
  }

  return steps;
}

function extractNotesFromComment(commentLines) {
  const notes = [];

  for (const line of commentLines) {
    const cleaned = line.replace(/^\s*\/?\*+\s?/, '').replace(/\*\/\s*$/, '').trim();

    if (cleaned.startsWith('@note ')) {
      notes.push(cleaned.substring(6)); // Remove '@note ' prefix
    }
  }

  return notes;
}

function getCategoryFromPath(filePath) {
  // Extract category from path like packages/core/tests/__shared__/helpers/interactions/buttons.ts
  const parts = filePath.split(path.sep);
  const helpersIndex = parts.findIndex(p => p === 'helpers');

  if (helpersIndex !== -1 && helpersIndex < parts.length - 1) {
    return parts[helpersIndex + 1]; // e.g., 'interactions', 'assertions'
  }

  return 'utils'; // default category
}

function toRelativePath(absolutePath) {
  return path.relative(process.cwd(), absolutePath).replace(/\\/g, '/');
}

// ---------- markdown generation ----------
function generateMarkdown(functionData) {
  const categories = new Map();

  // Group functions by category
  for (const func of functionData) {
    if (!categories.has(func.category)) {
      categories.set(func.category, []);
    }
    categories.get(func.category).push(func);
  }

  // Sort categories and functions within each category
  const sortedCategories = Array.from(categories.keys()).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  let markdown = `# Step Lexicon (generated)

> This file is auto-generated from doc-comments in helper functions.
> Run \`yarn lexicon:gen\` to regenerate.

`;

  for (const category of sortedCategories) {
    const functions = categories.get(category);

    // Sort functions by step description
    functions.sort((a, b) =>
      a.step.toLowerCase().localeCompare(b.step.toLowerCase())
    );

    markdown += `## ${category}\n\n`;

    for (const func of functions) {
      markdown += `- **${func.step}**\n`;
      markdown += `  - \`${func.signature}\`\n`;
      markdown += `  - File: \`${func.filePath}\`\n`;

      if (func.notes.length > 0) {
        for (const note of func.notes) {
          markdown += `  - Note: ${note}\n`;
        }
      }

      markdown += '\n';
    }
  }

  return markdown;
}

// ---------- main ----------
function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFileAtomically(filePath, content) {
  ensureDirectoryExists(filePath);
  const tempPath = filePath + '.tmp';
  fs.writeFileSync(tempPath, content, 'utf8');
  fs.renameSync(tempPath, filePath);
}

// Main execution
let totalFiles = 0;
let functionsFound = 0;
const allFunctions = [];

console.log('🔍 Scanning for helper functions...');

for (const root of START_DIRS) {
  const files = walk(root);
  totalFiles += files.length;

  for (const file of files) {
    const src = readFile(file);
    const functions = extractExportedFunctions(src, file);
    allFunctions.push(...functions);
    functionsFound += functions.length;

    if (functions.length > 0) {
      console.log(`  📄 ${toRelativePath(file)}: ${functions.length} step(s)`);
    }
  }
}

if (allFunctions.length === 0) {
  console.log('⚠️  No functions with step documentation found.');
  console.log('   Add /** step description */ comments above export functions.');
  process.exit(0);
}

const markdown = generateMarkdown(allFunctions);
writeFileAtomically(OUTPUT_PATH, markdown);

console.log(`\n✅ Generated ${OUTPUT_PATH}`);
console.log(`   📊 ${allFunctions.length} steps from ${functionsFound} functions in ${totalFiles} files`);
console.log(`   📁 Categories: ${new Set(allFunctions.map(f => f.category)).size}`);