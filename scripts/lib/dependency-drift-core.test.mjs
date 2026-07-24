import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  majorsBehind,
  driftSeverity,
  classify,
  analyzeTree,
  buildReport,
  formatTable,
  topLevelVersions,
} from './dependency-drift-core.mjs';

test('majorsBehind counts whole majors, tolerating range prefixes', () => {
  assert.equal(majorsBehind('6.4.3', '8.1.5'), 2);
  assert.equal(majorsBehind('^6.4.3', '8.1.5'), 2);
  assert.equal(majorsBehind('10.4.1', '11.0.2'), 1);
  assert.equal(majorsBehind('8.1.5', '8.1.5'), 0);
  assert.equal(majorsBehind('1.0.0-beta.1', '1.0.0'), 0); // same major
});

test('majorsBehind returns 0 for uncomparable specs', () => {
  assert.equal(majorsBehind('git+https://x/y.git', '1.0.0'), 0);
  assert.equal(majorsBehind('file:../local', '1.0.0'), 0);
  assert.equal(majorsBehind('workspace:*', '1.0.0'), 0);
  assert.equal(majorsBehind('', '1.0.0'), 0);
  assert.equal(majorsBehind(undefined, '1.0.0'), 0);
  assert.equal(majorsBehind('1.0.0', undefined), 0);
});

test('driftSeverity classifies major/minor/patch/none', () => {
  assert.equal(driftSeverity('6.4.3', '8.1.5'), 'major');
  assert.equal(driftSeverity('6.4.3', '6.6.0'), 'minor');
  assert.equal(driftSeverity('6.4.3', '6.4.9'), 'patch');
  assert.equal(driftSeverity('6.4.3', '6.4.3'), 'none');
  assert.equal(driftSeverity('git:x', '1.0.0'), 'none');
});

test('classify buckets into core, ignored, and other; ignored wins', () => {
  assert.equal(classify('vite'), 'core');
  assert.equal(classify('react'), 'core');
  assert.equal(classify('@playwright/test'), 'core');
  assert.equal(classify('@nestjs/core'), 'core'); // scope glob
  assert.equal(classify('@nestjs/anything'), 'core');
  assert.equal(classify('@elastic/eui'), 'ignored'); // scope glob
  assert.equal(classify('@elastic/datemath'), 'ignored');
  assert.equal(classify('lodash'), 'other');
  assert.equal(classify('googleapis'), 'other');
});

test('analyzeTree normalises npm outdated output', () => {
  const outdated = {
    vite: { current: '6.4.3', wanted: '6.4.3', latest: '8.1.5' },
    lodash: { current: '4.17.20', wanted: '4.17.21', latest: '4.17.21' },
    '@elastic/eui': { current: '34.6.0', wanted: '34.6.0', latest: '117.1.0' },
  };
  const { tree, deps } = analyzeTree({ tree: 'root', outdated });
  assert.equal(tree, 'root');
  const byName = Object.fromEntries(deps.map((d) => [d.name, d]));
  assert.deepEqual(
    { ...byName.vite },
    {
      tree: 'root',
      name: 'vite',
      current: '6.4.3',
      wanted: '6.4.3',
      latest: '8.1.5',
      majorsBehind: 2,
      severity: 'major',
      bucket: 'core',
    },
  );
  assert.equal(byName.lodash.bucket, 'other');
  assert.equal(byName['@elastic/eui'].bucket, 'ignored');
});

test('analyzeTree accepts array-form entries and missing current', () => {
  const outdated = {
    esbuild: [{ current: '0.25.11', wanted: '0.28.1', latest: '0.28.1' }],
    typescript: { wanted: '5.9.0', latest: '5.9.0' }, // current absent
  };
  const { deps } = analyzeTree({ tree: 'root', outdated });
  const byName = Object.fromEntries(deps.map((d) => [d.name, d]));
  assert.equal(byName.esbuild.current, '0.25.11');
  assert.equal(byName.typescript.current, null);
  assert.equal(byName.typescript.severity, 'none'); // uncomparable → skipped later
});

test('analyzeTree tolerates empty/missing outdated', () => {
  assert.deepEqual(analyzeTree({ tree: 'x', outdated: {} }).deps, []);
  assert.deepEqual(analyzeTree({ tree: 'x', outdated: null }).deps, []);
});

test('topLevelVersions extracts direct-dep versions from a v3 lockfile', () => {
  const lock = {
    lockfileVersion: 3,
    packages: {
      '': { name: 'root' },
      'node_modules/react': { version: '18.3.1' },
      'node_modules/@nestjs/core': { version: '11.1.18' },
      'node_modules/react/node_modules/scheduler': { version: '0.23.0' }, // nested, skipped
    },
  };
  assert.deepEqual(topLevelVersions(lock), {
    react: '18.3.1',
    '@nestjs/core': '11.1.18',
  });
  assert.deepEqual(topLevelVersions(null), {});
  assert.deepEqual(topLevelVersions({}), {});
});

test('analyzeTree backfills current from lockfile versions when npm omits it', () => {
  // npm outdated without node_modules omits `current`; the lockfile supplies it.
  const outdated = { vite: { wanted: '8.1.5', latest: '8.1.5' } };
  const { deps } = analyzeTree({
    tree: 'root',
    outdated,
    currentVersions: { vite: '6.4.3' },
  });
  assert.equal(deps[0].current, '6.4.3');
  assert.equal(deps[0].majorsBehind, 2);
  assert.equal(deps[0].severity, 'major');
});

test('buildReport splits by bucket, sorts by drift, and counts', () => {
  const trees = [
    analyzeTree({
      tree: 'root',
      outdated: {
        vite: { current: '6.4.3', latest: '8.1.5' }, // core major x2
        storybook: { current: '9.1.19', latest: '10.5.3' }, // core major x1
        eslint: { current: '9.0.0', latest: '9.1.0' }, // core minor
        lodash: { current: '4.17.20', latest: '4.17.21' }, // other patch
        got: { current: '11.0.0', latest: '14.0.0' }, // other major x3
        '@elastic/eui': { current: '34.6.0', latest: '117.1.0' }, // ignored
        linked: { latest: '2.0.0' }, // uncomparable → skipped
      },
    }),
  ];
  const report = buildReport({ trees });
  assert.deepEqual(
    report.core.map((d) => d.name),
    ['vite', 'storybook', 'eslint'],
  );
  assert.equal(report.other[0].name, 'got'); // biggest drift first
  assert.deepEqual(
    report.ignored.map((d) => d.name),
    ['@elastic/eui'],
  );
  assert.equal(report.skipped, 1); // linked
  assert.deepEqual(report.summary.core, { major: 2, minor: 1, patch: 0 });
  assert.deepEqual(report.summary.other, { major: 1, minor: 0, patch: 1 });
  assert.deepEqual(report.summary.ignored, { major: 1, minor: 0, patch: 0 });
  assert.equal(report.treesScanned, 1);
});

test('formatTable condenses ignored to a count line by default', () => {
  const report = buildReport({
    trees: [
      analyzeTree({
        tree: 'root',
        outdated: {
          vite: { current: '6.4.3', latest: '8.1.5' },
          '@elastic/eui': { current: '34.6.0', latest: '117.1.0' },
        },
      }),
      analyzeTree({
        tree: 'redisinsight/ui/src/packages/redisearch',
        outdated: {
          '@elastic/eui': { current: '34.6.0', latest: '117.1.0' },
        },
      }),
    ],
  });
  const out = formatTable(report);
  assert.match(out, /Core dependencies behind latest:/);
  assert.match(out, /vite/);
  assert.match(out, /2 major/);
  assert.match(out, /Ignored \/ low-priority .*: 2 behind — @elastic\/eui ×2/);
  assert.doesNotMatch(out, /34\.6\.0/); // ignored rows not expanded
  assert.match(out, /Summary: Core/);
});

test('formatTable expands ignored rows with showIgnored', () => {
  const report = buildReport({
    trees: [
      analyzeTree({
        tree: 'root',
        outdated: {
          '@elastic/eui': { current: '34.6.0', latest: '117.1.0' },
        },
      }),
    ],
  });
  const out = formatTable(report, { showIgnored: true });
  assert.match(out, /Ignored \/ low-priority \(not tracked\):/);
  assert.match(out, /34\.6\.0 → 117\.1\.0/); // full row shown
});
