#!/usr/bin/env node
/*
 * Yarn -> npm migration helper: detect dependencies that would be REMOVED
 * (or drift) when moving from yarn.lock to package-lock.json.
 *
 * Usage:
 *   node scripts/lock-diff.js <yarn.lock> <package-lock.json> [--all]
 *
 * Compares the flat set of every `name@version` resolved by each lockfile.
 * By default it reports the genuine removals — packages yarn had that npm
 * lacks — after filtering two expected-noise categories:
 *   (a) platform/arch optional native binaries for OTHER OSes/arches
 *   (b) version-only drift (same name, different version)
 * Pass --all to see the unfiltered lists (incl. added + drift counts).
 *
 * Requires @yarnpkg/lockfile (a repo devDependency). Run from the repo root,
 * or set NODE_PATH=./node_modules.
 */
const fs = require('fs');
const yarnLockfile = require('@yarnpkg/lockfile');

const [, , yarnPath, npmPath, ...flags] = process.argv;
const showAll = flags.includes('--all');

if (!yarnPath || !npmPath) {
  console.error('Usage: node scripts/lock-diff.js <yarn.lock> <package-lock.json> [--all]');
  process.exit(2);
}

// Platform/arch optional native binaries — present as a full matrix in yarn.lock
// but omitted by npm on the current machine. Not real removals.
const PLATFORM_RE =
  /-(darwin|linux|win32|android|freebsd|netbsd|openbsd|sunos|openharmony|aix)(-|$)|-(gnu|musl|msvc|eabi|eabihf)(-|$)/;
const PLATFORM_SCOPE_RE =
  /^@(esbuild|rollup|swc|sentry|msgpackr-extract|napi-rs|node-rs|parcel|tauri-apps|libsql|next|img)\//;

const isPlatform = (name) => PLATFORM_SCOPE_RE.test(name) || PLATFORM_RE.test(name);

function nameFromKey(key) {
  const at = key.lastIndexOf('@');
  return at <= 0 ? key : key.slice(0, at);
}

function parseYarn(p) {
  const obj = yarnLockfile.parse(fs.readFileSync(p, 'utf8')).object;
  const names = new Set();
  const nv = new Set();
  for (const [key, val] of Object.entries(obj)) {
    if (!val.version) continue;
    const name = nameFromKey(key);
    names.add(name);
    nv.add(`${name}@${val.version}`);
  }
  return { names, nv };
}

function parseNpm(p) {
  const lock = JSON.parse(fs.readFileSync(p, 'utf8'));
  const names = new Set();
  const nv = new Set();
  const add = (name, version) => {
    if (name && version) {
      names.add(name);
      nv.add(`${name}@${version}`);
    }
  };
  if (lock.packages && Object.keys(lock.packages).length) {
    for (const [path, info] of Object.entries(lock.packages)) {
      if (!path) continue; // root project entry
      add(info.name || path.split('node_modules/').pop(), info.version);
    }
  }
  (function walk(deps) {
    if (!deps) return;
    for (const [name, info] of Object.entries(deps)) {
      add(name, info.version);
      walk(info.dependencies);
    }
  })(lock.dependencies);
  return { names, nv };
}

const diff = (a, b) => [...a].filter((x) => !b.has(x)).sort();

const yarn = parseYarn(yarnPath);
const npm = parseNpm(npmPath);

const removedNames = diff(yarn.names, npm.names);
const addedNames = diff(npm.names, yarn.names);
const realRemovals = removedNames.filter((n) => !isPlatform(n));

console.log(`yarn: ${yarn.names.size} names / ${yarn.nv.size} name@version`);
console.log(`npm:  ${npm.names.size} names / ${npm.nv.size} name@version`);

console.log(`\n### REMOVED — genuine (excludes platform binaries) — ${realRemovals.length}`);
console.log(realRemovals.join('\n') || '(none) ✅');

if (showAll) {
  console.log(`\n### REMOVED — all (incl. platform noise) — ${removedNames.length}`);
  console.log(removedNames.join('\n'));
  console.log(`\n### ADDED (only npm) — ${addedNames.length}`);
  console.log(addedNames.join('\n') || '(none)');
  console.log(`\n(name@version differences incl. drift: ${diff(yarn.nv, npm.nv).length})`);
}

// Non-zero exit if any genuine removal is found — usable as a CI gate.
process.exit(realRemovals.length ? 1 : 0);
