// Pure helpers for the dependency-audit report. No I/O, no shelling out.

// The 12 independent lockfile directories (relative to repo root).
export const AUDIT_DIRS = [
  '.',
  'redisinsight',
  'redisinsight/api',
  'tests/e2e-playwright',
  'redisinsight/ui/src/packages',
  'redisinsight/ui/src/packages/clients-list',
  'redisinsight/ui/src/packages/geodata',
  'redisinsight/ui/src/packages/redisearch',
  'redisinsight/ui/src/packages/redisgraph',
  'redisinsight/ui/src/packages/redisinsight-plugin-sdk',
  'redisinsight/ui/src/packages/redistimeseries-app',
  'redisinsight/ui/src/packages/ri-explain',
];

const HIGH_CRITICAL = new Set(['high', 'critical']);

function firstAdvisory(vuln) {
  const via = (vuln.via || []).find((v) => typeof v === 'object');
  return via || { title: '(transitive)', url: '' };
}

export function analyzeTree({ tree, fullAudit, prodAudit }) {
  const meta = (fullAudit.metadata && fullAudit.metadata.vulnerabilities) || {};
  const totals = {
    critical: meta.critical || 0,
    high: meta.high || 0,
    moderate: meta.moderate || 0,
    low: meta.low || 0,
  };
  const prodVulns = (prodAudit && prodAudit.vulnerabilities) || {};
  const findings = [];
  for (const [name, vuln] of Object.entries(fullAudit.vulnerabilities || {})) {
    if (!HIGH_CRITICAL.has(vuln.severity)) continue;
    const adv = firstAdvisory(vuln);
    findings.push({
      name,
      severity: vuln.severity,
      tree,
      scope: prodVulns[name] ? 'prod' : 'dev',
      title: adv.title,
      url: adv.url,
    });
  }
  return { tree, totals, findings };
}

const SEVERITY_RANK = { critical: 0, high: 1 };

export function buildReport({ trees, warnings }) {
  const counts = {
    prod: { critical: 0, high: 0 },
    dev: { critical: 0, high: 0 },
  };
  const findings = [];
  const byTree = [];
  for (const t of trees) {
    byTree.push({ tree: t.tree, totals: t.totals });
    for (const f of t.findings) {
      counts[f.scope][f.severity] += 1;
      findings.push(f);
    }
  }
  findings.sort(
    (a, b) =>
      SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
      a.name.localeCompare(b.name),
  );
  return {
    counts,
    findings,
    byTree,
    warnings: warnings || [],
  };
}

export function shouldPostSlack(report) {
  const { prod, dev } = report.counts;
  return prod.critical + prod.high + dev.critical + dev.high > 0;
}

export function buildStepSummary(report) {
  const { counts, findings, byTree, warnings } = report;
  const lines = [];
  lines.push('# Dependency Audit');
  lines.push('');
  lines.push(
    `**Prod:** ${counts.prod.critical} critical, ${counts.prod.high} high · ` +
      `**Dev/all:** ${counts.dev.critical} critical, ${counts.dev.high} high`,
  );
  lines.push('');

  if (warnings?.length) {
    lines.push('## ⚠️ Warnings');
    for (const w of warnings) lines.push(`- ${w}`);
    lines.push('');
  }

  lines.push('## Per-tree totals');
  lines.push('| Tree | Critical | High | Moderate | Low |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const { tree, totals } of byTree) {
    lines.push(
      `| ${tree} | ${totals.critical} | ${totals.high} | ${totals.moderate} | ${totals.low} |`,
    );
  }
  lines.push('');

  lines.push('## High & critical advisories');
  if (findings.length === 0) {
    lines.push('_No high or critical advisories._');
  } else {
    lines.push('| Severity | Scope | Package | Tree | Advisory |');
    lines.push('| --- | --- | --- | --- | --- |');
    for (const f of findings) {
      const link = f.url ? `[${f.title}](${f.url})` : f.title;
      lines.push(
        `| ${f.severity} | ${f.scope} | ${f.name} | ${f.tree} | ${link} |`,
      );
    }
  }
  lines.push('');
  return lines.join('\n');
}

export const SLACK_COLOR_CRITICAL = '#cc0000';
export const SLACK_COLOR_HIGH = '#d29922';

// The Slack message is built inline in the workflow; expose only its colour.
export function slackColor(report) {
  const { prod, dev } = report.counts;
  return prod.critical + dev.critical > 0
    ? SLACK_COLOR_CRITICAL
    : SLACK_COLOR_HIGH;
}
