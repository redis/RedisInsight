const fs = require('fs');
const { exec } = require('child_process');

const FILENAME = process.env.FILENAME;
const DEPS = process.env.DEPS || '';
const file = `${FILENAME}`;
const outputFile = `slack.${FILENAME}`;

function generateSlackMessage(summary) {
  const message = {
    text:
      `DEPS AUDIT: *${DEPS}* result (Branch: *${process.env.GITHUB_REF_NAME}*)` +
      `\nScanned ${summary.totalDependencies} dependencies` +
      `\n<https://github.com/Garnetinsight/Garnetinsight/actions/runs/${process.env.GITHUB_RUN_ID}|View on Github Actions>`,
    attachments: [],
  };

  if (summary.totalVulnerabilities) {
    if (summary.vulnerabilities.critical) {
      message.attachments.push({
        title: 'Critical',
        color: '#641E16',
        text: `${summary.vulnerabilities.critical}`,
      });
    }
    if (summary.vulnerabilities.high) {
      message.attachments.push({
        title: 'High',
        color: '#C0392B',
        text: `${summary.vulnerabilities.high}`,
      });
    }
    if (summary.vulnerabilities.moderate) {
      message.attachments.push({
        title: 'Moderate',
        color: '#F5B041',
        text: `${summary.vulnerabilities.moderate}`,
      });
    }
    if (summary.vulnerabilities.low) {
      message.attachments.push({
        title: 'Low',
        color: '#F9E79F',
        text: `${summary.vulnerabilities.low}`,
      });
    }
    if (summary.vulnerabilities.info) {
      message.attachments.push({
        title: 'Info',
        text: `${summary.vulnerabilities.info}`,
      });
    }
  } else {
    message.attachments.push({
      title: 'No vulnerabilities found',
      color: 'good',
    });
  }

  return message;
}

async function main() {
  const lastAuditLine = await new Promise((resolve, reject) => {
    exec(`tail -n 1 ${file}`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve(stdout);
    });
  });

  const { data: summary } = JSON.parse(`${lastAuditLine}`);
  const vulnerabilities = summary?.vulnerabilities || {};
  summary.totalVulnerabilities = Object.values(vulnerabilities).reduce(
    (totalVulnerabilities, val) => totalVulnerabilities + val,
  );
  fs.writeFileSync(
    outputFile,
    JSON.stringify({
      channel: process.env.SLACK_AUDIT_REPORT_CHANNEL,
      ...generateSlackMessage(summary),
    }),
  );
}

main();
