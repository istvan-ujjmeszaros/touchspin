#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';

const USAGE = 'create-umd-alias --source <path> --target <path>';

function parseArgs(argv) {
  const args = { source: undefined, target: undefined };
  for (let i = 2; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (flag === '--source') {
      args.source = value;
      i += 1;
    } else if (flag === '--target') {
      args.target = value;
      i += 1;
    } else if (flag === '--help' || flag === '-h') {
      console.log(USAGE);
      process.exit(0);
    } else {
      console.error(`Unknown flag: ${flag}`);
      console.error(USAGE);
      process.exit(1);
    }
  }
  return args;
}

async function main() {
  const { source, target } = parseArgs(process.argv);
  if (!source || !target) {
    console.error('Both --source and --target are required.');
    console.error(USAGE);
    process.exit(1);
  }

  const resolvedSource = resolve(process.cwd(), source);
  const resolvedTarget = resolve(process.cwd(), target);

  try {
    const data = await fs.readFile(resolvedSource);
    await fs.mkdir(dirname(resolvedTarget), { recursive: true });
    await fs.writeFile(resolvedTarget, data);
    const mapSource = `${resolvedSource}.map`;
    const mapTarget = `${resolvedTarget}.map`;
    try {
      const mapData = await fs.readFile(mapSource);
      await fs.writeFile(mapTarget, mapData);
    } catch (mapErr) {
      if (mapErr.code !== 'ENOENT') {
        throw mapErr;
      }
    }
    console.log(`Created alias ${target} -> ${source}`);
  } catch (error) {
    console.error(`Failed to alias ${target} from ${source}`);
    console.error(error);
    process.exit(1);
  }
}

main();
