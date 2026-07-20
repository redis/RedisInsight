import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeTree,
  buildReport,
  shouldPostSlack,
  buildStepSummary,
  slackColor,
  SLACK_COLOR_CRITICAL,
  SLACK_COLOR_HIGH,
} from './dependency-audit-core.mjs';

const FULL = {
  vulnerabilities: {
    protobufjs: {
      name: 'protobufjs',
      severity: 'critical',
      via: [
        {
          title: 'Arbitrary code execution in protobufjs',
          url: 'https://ghsa/xq3m',
          severity: 'critical',
          range: '<7.5.5',
        },
      ],
      range: '<=7.6.2',
      fixAvailable: true,
    },
    'shell-quote': {
      name: 'shell-quote',
      severity: 'critical',
      via: [
        {
          title: 'shell-quote newline injection',
          url: 'https://ghsa/g4rg',
          severity: 'critical',
          range: '<=1.8.3',
        },
      ],
      range: '1.1.0 - 1.8.3',
      fixAvailable: true,
    },
    lodash: {
      name: 'lodash',
      severity: 'moderate',
      via: [
        {
          title: 'prototype pollution',
          url: 'https://ghsa/lodash',
          severity: 'moderate',
          range: '*',
        },
      ],
      range: '*',
      fixAvailable: true,
    },
  },
  metadata: {
    vulnerabilities: {
      info: 0,
      low: 0,
      moderate: 1,
      high: 0,
      critical: 2,
      total: 3,
    },
  },
};
// Only protobufjs is a production dependency.
const PROD = {
  vulnerabilities: {
    protobufjs: FULL.vulnerabilities.protobufjs,
  },
  metadata: {
    vulnerabilities: {
      info: 0,
      low: 0,
      moderate: 0,
      high: 0,
      critical: 1,
      total: 1,
    },
  },
};

test('analyzeTree returns per-tree totals from metadata', () => {
  const r = analyzeTree({ tree: 'root', fullAudit: FULL, prodAudit: PROD });
  assert.deepEqual(r.totals, { critical: 2, high: 0, moderate: 1, low: 0 });
  assert.equal(r.tree, 'root');
});

test('analyzeTree emits only high/critical findings', () => {
  const r = analyzeTree({ tree: 'root', fullAudit: FULL, prodAudit: PROD });
  assert.equal(r.findings.length, 2); // lodash (moderate) excluded
  assert.ok(
    r.findings.every((f) => f.severity === 'critical' || f.severity === 'high'),
  );
});

test('analyzeTree tags prod vs dev via the prod audit', () => {
  const r = analyzeTree({ tree: 'root', fullAudit: FULL, prodAudit: PROD });
  const byName = Object.fromEntries(r.findings.map((f) => [f.name, f]));
  assert.equal(byName.protobufjs.scope, 'prod');
  assert.equal(byName['shell-quote'].scope, 'dev');
  assert.equal(
    byName.protobufjs.title,
    'Arbitrary code execution in protobufjs',
  );
  assert.equal(byName.protobufjs.url, 'https://ghsa/xq3m');
});

test('analyzeTree tolerates empty audit', () => {
  const empty = {
    vulnerabilities: {},
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 0,
        moderate: 0,
        high: 0,
        critical: 0,
        total: 0,
      },
    },
  };
  const r = analyzeTree({ tree: 'x', fullAudit: empty, prodAudit: empty });
  assert.deepEqual(r.findings, []);
  assert.deepEqual(r.totals, { critical: 0, high: 0, moderate: 0, low: 0 });
});

test('buildReport aggregates prod/dev counts and sorts findings', () => {
  const trees = [
    {
      tree: 'root',
      totals: { critical: 1, high: 1, moderate: 0, low: 0 },
      findings: [
        {
          name: 'protobufjs',
          severity: 'critical',
          tree: 'root',
          scope: 'prod',
          title: 't',
          url: 'u',
        },
        {
          name: 'form-data',
          severity: 'high',
          tree: 'root',
          scope: 'prod',
          title: 't',
          url: 'u',
        },
      ],
    },
    {
      tree: 'redisinsight/api',
      totals: { critical: 1, high: 0, moderate: 0, low: 0 },
      findings: [
        {
          name: 'shell-quote',
          severity: 'critical',
          tree: 'redisinsight/api',
          scope: 'dev',
          title: 't',
          url: 'u',
        },
      ],
    },
  ];
  const report = buildReport({ trees });
  assert.deepEqual(report.counts.prod, { critical: 1, high: 1 });
  assert.deepEqual(report.counts.dev, { critical: 1, high: 0 });
  assert.equal(report.findings[0].severity, 'critical'); // critical sorted first
  assert.equal(report.byTree.length, 2);
});

test('buildReport defaults warnings to [] when omitted', () => {
  const report = buildReport({ trees: [] });
  assert.deepEqual(report.warnings, []);
});

test('shouldPostSlack is true only with high/critical', () => {
  const none = {
    counts: { prod: { critical: 0, high: 0 }, dev: { critical: 0, high: 0 } },
  };
  const some = {
    counts: { prod: { critical: 0, high: 0 }, dev: { critical: 0, high: 1 } },
  };
  assert.equal(shouldPostSlack(none), false);
  assert.equal(shouldPostSlack(some), true);
});

test('buildStepSummary includes counts, findings, and per-tree table', () => {
  const report = {
    counts: { prod: { critical: 1, high: 0 }, dev: { critical: 1, high: 0 } },
    findings: [
      {
        name: 'protobufjs',
        severity: 'critical',
        tree: 'root',
        scope: 'prod',
        title: 'ACE',
        url: 'https://ghsa/x',
      },
      {
        name: 'shell-quote',
        severity: 'critical',
        tree: 'redisinsight/api',
        scope: 'dev',
        title: 'newline',
        url: 'https://ghsa/y',
      },
    ],
    byTree: [
      { tree: 'root', totals: { critical: 1, high: 0, moderate: 2, low: 0 } },
    ],
  };
  const md = buildStepSummary(report);
  assert.match(md, /Dependency Audit/);
  assert.match(md, /protobufjs/);
  assert.match(md, /shell-quote/);
  assert.match(md, /\| root \|/); // per-tree table row
  assert.match(md, /https:\/\/ghsa\/x/); // advisory link
});

test('buildStepSummary handles a clean report', () => {
  const md = buildStepSummary({
    counts: { prod: { critical: 0, high: 0 }, dev: { critical: 0, high: 0 } },
    findings: [],
    byTree: [],
  });
  assert.match(md, /No high or critical/);
});

test('buildStepSummary renders a Warnings section when present', () => {
  const md = buildStepSummary({
    counts: { prod: { critical: 0, high: 0 }, dev: { critical: 0, high: 0 } },
    findings: [],
    byTree: [],
    warnings: [
      'prod audit failed for redisinsight; prod/dev split may under-report',
    ],
  });
  assert.match(md, /## ⚠️ Warnings/);
  assert.match(md, /prod audit failed for redisinsight/);
});

test('slackColor is red when any critical present, orange when only high', () => {
  assert.equal(
    slackColor({
      counts: { prod: { critical: 1, high: 0 }, dev: { critical: 0, high: 0 } },
    }),
    SLACK_COLOR_CRITICAL,
  );
  assert.equal(
    slackColor({
      counts: { prod: { critical: 0, high: 2 }, dev: { critical: 0, high: 1 } },
    }),
    SLACK_COLOR_HIGH,
  );
});
