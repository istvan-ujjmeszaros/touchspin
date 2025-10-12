import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Recursively walk a directory and return the newest mtime (ms since epoch).
 * Hidden directories and node_modules are skipped; optionally ignore extensions.
 */
export function getNewestFileMtime(dirPath, options = {}) {
  const { ignoreExtensions = [] } = options;
  let newestMtime = 0;

  const stack = [dirPath];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
        continue;
      }

      const fullPath = join(current, entry.name);

      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (entry.isFile()) {
        if (ignoreExtensions.some((ext) => entry.name.endsWith(ext))) {
          continue;
        }

        try {
          const stat = statSync(fullPath);
          const mtime = stat.mtime.getTime();
          if (mtime > newestMtime) {
            newestMtime = mtime;
          }
        } catch {
          // Ignore unreadable files
        }
      }
    }
  }

  return newestMtime;
}
