import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const isDevBuild =
  typeof process !== 'undefined' &&
  process &&
  process.env &&
  (process.env.TS_BUILD_TARGET === 'dev' || process.env.PW_COVERAGE === '1');
const TARGET = isDevBuild ? 'devdist' : 'dist';

type ArtifactManifest = Record<string, string>;
const manifestCache = new Map<string, ArtifactManifest>();

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(runtimeDir, '../../../../../..');

function loadManifest(packageSubPath: string): ArtifactManifest {
  const cacheKey = `${packageSubPath}:${TARGET}`;
  const cached = manifestCache.get(cacheKey);
  if (cached) return cached;

  const manifestPath = path.resolve(repoRoot, packageSubPath, TARGET, 'artifacts.json');

  try {
    const raw = readFileSync(manifestPath, 'utf8');
    const parsed = JSON.parse(raw) as ArtifactManifest;
    manifestCache.set(cacheKey, parsed);
    return parsed;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Unable to load artifacts manifest at ${manifestPath}: ${reason}\nDid you run the package build for ${packageSubPath}?`
    );
  }
}

const coreManifest = loadManifest('packages/core');
export const coreUrl = `/packages/core/${TARGET}/${coreManifest.esmEntry ?? 'index.js'}`;

const vanillaManifest = loadManifest('packages/renderers/vanilla');
export const vanillaRendererUrl = `/packages/renderers/vanilla/${TARGET}/${vanillaManifest.esmEntry ?? 'index.js'}`;
export const vanillaRendererClassUrl = `/packages/renderers/vanilla/${TARGET}/${vanillaManifest.classModule ?? vanillaManifest.esmEntry ?? 'index.js'}`;

function rendererManifest(name: string): ArtifactManifest {
  return loadManifest(`packages/renderers/${name}`);
}

export const rendererUrlFor = (name: string) => {
  const manifest = rendererManifest(name);
  return `/packages/renderers/${name}/${TARGET}/${manifest.esmEntry ?? 'index.js'}`;
};

export const rendererClassUrlFor = (name: string) => {
  const manifest = rendererManifest(name);
  const targetFile = manifest.classModule ?? manifest.esmEntry ?? 'index.js';
  return `/packages/renderers/${name}/${TARGET}/${targetFile}`;
};

let jqueryPluginUrlResolved: string | null = null;
try {
  const jqueryManifest = loadManifest('packages/jquery-plugin');
  jqueryPluginUrlResolved = `/packages/jquery-plugin/${TARGET}/${jqueryManifest.esmEntry ?? 'index.js'}`;
} catch {
  // Fallback to the historical static path when manifests are unavailable (e.g., legacy builds)
  jqueryPluginUrlResolved = `/packages/jquery-plugin/${TARGET}/index.js`;
}

export const jqueryPluginUrl = jqueryPluginUrlResolved;
