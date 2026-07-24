// Pure helpers for the dependency-drift report. No I/O, no shelling out.
// The lockfile directory list is owned by the audit core so both reports scan
// the same trees.
export { AUDIT_DIRS } from './dependency-audit-core.mjs';

// A dependency's bucket is decided by WHAT IT IS, not how far it has drifted,
// so importance drives the report ahead of version distance. Edit these two
// lists to change what you track. Entries are exact names or scope globs
// (a trailing `/*` matches the whole scope). IGNORED wins over CORE.

// CORE — the build/runtime spine worth standing upgrade tasks for.
export const CORE = [
  // Build
  'vite',
  'webpack',
  'esbuild',
  'electron',
  'typescript',
  // Framework
  'react',
  'react-dom',
  '@reduxjs/toolkit',
  '@nestjs/*',
  // Test / tooling
  'jest',
  '@playwright/test',
  'storybook',
  'eslint',
];

// IGNORED — deps we deliberately do not track (being removed, or too niche to
// plan upgrades around). Kept out of the Core/Other signal.
export const IGNORED = [
  '@elastic/*', // migrating off EUI — see the EUI removal effort
];

const SEVERITY_RANK = { major: 3, minor: 2, patch: 1, none: 0 };

function matches(name, patterns) {
  for (const pattern of patterns) {
    if (pattern.endsWith('/*')) {
      if (name.startsWith(pattern.slice(0, -1))) return true;
    } else if (name === pattern) {
      return true;
    }
  }
  return false;
}

// 'ignored' | 'core' | 'other'. IGNORED takes precedence over CORE.
export function classify(name) {
  if (matches(name, IGNORED)) return 'ignored';
  if (matches(name, CORE)) return 'core';
  return 'other';
}

// A version we can compare on the registry semver line: digits and dots only at
// the front. `git:`/`file:`/`workspace:`/`link:` specs and blanks return null.
function parseVersion(spec) {
  if (typeof spec !== 'string') return null;
  const cleaned = spec.trim().replace(/^[\^~>=<v\s]+/, '');
  const match = cleaned.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export function majorsBehind(current, latest) {
  const c = parseVersion(current);
  const l = parseVersion(latest);
  if (!c || !l) return 0;
  return Math.max(0, l.major - c.major);
}

export function driftSeverity(current, latest) {
  const c = parseVersion(current);
  const l = parseVersion(latest);
  if (!c || !l) return 'none';
  if (l.major > c.major) return 'major';
  if (l.major < c.major) return 'none';
  if (l.minor > c.minor) return 'minor';
  if (l.minor < c.minor) return 'none';
  if (l.patch > c.patch) return 'patch';
  return 'none';
}

// Resolved versions of the top-level dependencies from a parsed package-lock
// (lockfileVersion 3). Used as the `current` fallback so the report works
// without `node_modules` — `npm outdated` only fills `current` from an
// installed tree, but the committed lockfile always has it.
const TOP_LEVEL_KEY = /^node_modules\/(@[^/]+\/[^/]+|[^/]+)$/;
export function topLevelVersions(lockfile) {
  const packages = lockfile?.packages ?? {};
  const versions = {};
  for (const [key, entry] of Object.entries(packages)) {
    const match = key.match(TOP_LEVEL_KEY);
    if (match && entry?.version) versions[match[1]] = entry.version;
  }
  return versions;
}

// Map one `npm outdated --json` object to normalised drift records. npm reports
// each package as an object, or occasionally an array of locations — take the
// first either way. `currentVersions` (from the lockfile) backfills `current`
// when npm omits it.
export function analyzeTree({ tree, outdated, currentVersions = {} }) {
  const deps = Object.entries(outdated || {}).map(([name, info]) => {
    const rec = Array.isArray(info) ? info[0] : info;
    const current = rec?.current ?? currentVersions[name] ?? null;
    const wanted = rec?.wanted ?? null;
    const latest = rec?.latest ?? null;
    return {
      tree,
      name,
      current,
      wanted,
      latest,
      majorsBehind: majorsBehind(current, latest),
      severity: driftSeverity(current, latest),
      bucket: classify(name),
    };
  });
  return { tree, deps };
}

function sortDrift(a, b) {
  if (b.majorsBehind !== a.majorsBehind) return b.majorsBehind - a.majorsBehind;
  const rank = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
  if (rank !== 0) return rank;
  if (a.tree !== b.tree) return a.tree.localeCompare(b.tree);
  return a.name.localeCompare(b.name);
}

function countSeverities(deps) {
  const counts = { major: 0, minor: 0, patch: 0 };
  for (const d of deps) {
    if (d.severity !== 'none') counts[d.severity] += 1;
  }
  return counts;
}

export function buildReport({ trees }) {
  const flat = trees.flatMap((t) => t.deps);
  const drifting = flat.filter((d) => d.severity !== 'none');
  const inBucket = (bucket) =>
    drifting.filter((d) => d.bucket === bucket).sort(sortDrift);
  const core = inBucket('core');
  const other = inBucket('other');
  const ignored = inBucket('ignored');
  // Records we could not compare on the semver line (non-registry specs or an
  // unknown current version) — surfaced as a count so the report never reads as
  // "everything checked" when some entries were skipped.
  const skipped = flat.length - drifting.length;
  return {
    core,
    other,
    ignored,
    skipped,
    treesScanned: trees.length,
    summary: {
      core: countSeverities(core),
      other: countSeverities(other),
      ignored: countSeverities(ignored),
    },
  };
}

function driftLabel(dep) {
  if (dep.severity === 'major') return `${dep.majorsBehind} major`;
  return dep.severity;
}

function formatRows(deps) {
  const cols = deps.map((d) => [
    d.tree,
    d.name,
    d.current ?? '—',
    d.latest ?? '—',
    driftLabel(d),
  ]);
  const widths = [0, 1, 2, 3].map((i) =>
    cols.reduce((w, row) => Math.max(w, row[i].length), 0),
  );
  return cols
    .map(
      (row) =>
        `  ${row[0].padEnd(widths[0])}  ${row[1].padEnd(widths[1])}  ` +
        `${row[2].padEnd(widths[2])} → ${row[3].padEnd(widths[3])}  ${row[4]}`,
    )
    .join('\n');
}

// Condense the ignored bucket to `name ×treeCount` pairs, worst drift first.
function summariseIgnored(ignored) {
  const byName = new Map();
  for (const d of ignored) {
    const entry = byName.get(d.name) || { count: 0, majorsBehind: 0 };
    entry.count += 1;
    entry.majorsBehind = Math.max(entry.majorsBehind, d.majorsBehind);
    byName.set(d.name, entry);
  }
  return [...byName.entries()]
    .sort((a, b) => b[1].majorsBehind - a[1].majorsBehind)
    .map(([name, e]) => (e.count > 1 ? `${name} ×${e.count}` : name));
}

function severityPhrase(counts) {
  return `${counts.major} major, ${counts.minor} minor, ${counts.patch} patch`;
}

export function formatTable(report, { showIgnored = false } = {}) {
  const lines = [];
  lines.push('Core dependencies behind latest:');
  lines.push(report.core.length ? formatRows(report.core) : '  (none)');
  lines.push('');
  lines.push('Other outdated direct dependencies:');
  lines.push(report.other.length ? formatRows(report.other) : '  (none)');
  lines.push('');
  if (showIgnored) {
    lines.push('Ignored / low-priority (not tracked):');
    lines.push(report.ignored.length ? formatRows(report.ignored) : '  (none)');
  } else {
    const names = summariseIgnored(report.ignored);
    lines.push(
      report.ignored.length
        ? `Ignored / low-priority (not tracked): ${report.ignored.length} behind — ${names.join(', ')}  [--show-ignored to list]`
        : 'Ignored / low-priority (not tracked): none behind',
    );
  }
  lines.push('');
  lines.push(
    `Summary: Core — ${severityPhrase(report.summary.core)} · ` +
      `other — ${severityPhrase(report.summary.other)} · ` +
      `ignored — ${severityPhrase(report.summary.ignored)} · ` +
      `${report.skipped} uncomparable · scanned ${report.treesScanned} trees`,
  );
  return lines.join('\n');
}
