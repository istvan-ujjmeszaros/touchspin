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

  // For dev builds, use single-root devdist at repo root
  // packages/core -> devdist/core
  // packages/renderers/bootstrap5 -> devdist/renderers/bootstrap5
  // packages/adapters/jquery -> devdist/adapters/jquery
  const devdistPath = packageSubPath.replace(/^packages\//, '');
  const manifestPath = isDevBuild
    ? path.resolve(repoRoot, 'devdist', devdistPath, 'artifacts.json')
    : path.resolve(repoRoot, packageSubPath, TARGET, 'artifacts.json');

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

function packageAssetUrl(packageSubPath: string, relativePath: string): string {
  // For dev builds, use single-root devdist structure
  if (isDevBuild) {
    const devdistPath = packageSubPath.replace(/^packages\//, '');
    return `/devdist/${devdistPath}/${relativePath}`;
  }
  return `/${packageSubPath}/${TARGET}/${relativePath}`;
}

export function artifactUrlFor(packageSubPath: string, key: string): string | null {
  const manifest = loadManifest(packageSubPath);
  const relativePath = manifest[key];
  return relativePath ? packageAssetUrl(packageSubPath, relativePath) : null;
}

const _coreManifest = loadManifest('packages/core');
export const coreUrl =
  artifactUrlFor('packages/core', 'esmEntry') ?? `/packages/core/${TARGET}/index.js`;

const vanillaManifest = loadManifest('packages/renderers/vanilla');
export const vanillaRendererUrl =
  artifactUrlFor('packages/renderers/vanilla', 'esmEntry') ??
  `/packages/renderers/vanilla/${TARGET}/${vanillaManifest.esmEntry ?? 'index.js'}`;
export const vanillaRendererClassUrl =
  artifactUrlFor('packages/renderers/vanilla', 'classModule') ?? vanillaRendererUrl;

function rendererManifest(name: string): ArtifactManifest {
  return loadManifest(`packages/renderers/${name}`);
}

export const rendererUrlFor = (name: string) => {
  const manifest = rendererManifest(name);
  return packageAssetUrl(`packages/renderers/${name}`, manifest.esmEntry ?? 'index.js');
};

export const rendererClassUrlFor = (name: string) => {
  const manifest = rendererManifest(name);
  const targetFile = manifest.classModule ?? manifest.esmEntry ?? 'index.js';
  return packageAssetUrl(`packages/renderers/${name}`, targetFile);
};

export const rendererArtifactUrlFor = (name: string, key: string) =>
  artifactUrlFor(`packages/renderers/${name}`, key);

export const rendererExternalUrlFor = (name: string, relativePath: string) =>
  packageAssetUrl(`packages/renderers/${name}`, `external/${relativePath}`);

export const packageExternalUrlFor = (packageSubPath: string, relativePath: string) =>
  packageAssetUrl(packageSubPath, `external/${relativePath}`);

let jqueryPluginUrlResolved: string | null = null;
try {
  const jqueryManifest = loadManifest('packages/adapters/jquery');
  jqueryPluginUrlResolved = isDevBuild
    ? `/devdist/adapters/jquery/${jqueryManifest.esmEntry ?? 'index.js'}`
    : `/packages/adapters/jquery/${TARGET}/${jqueryManifest.esmEntry ?? 'index.js'}`;
} catch {
  // Fallback to the historical static path when manifests are unavailable (e.g., legacy builds)
  jqueryPluginUrlResolved = isDevBuild
    ? `/devdist/adapters/jquery/index.js`
    : `/packages/adapters/jquery/${TARGET}/index.js`;
}

export const jqueryPluginUrl = jqueryPluginUrlResolved;
