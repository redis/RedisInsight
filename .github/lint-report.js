const fs = require('fs');

const FILENAME = process.env.FILENAME || 'lint.audit.json';
const WORKDIR = process.env.WORKDIR || '.';
const TARGET = process.env.TARGET || '';
const file = `${WORKDIR}/${FILENAME}`;
const outputFile = `${WORKDIR}/slack.${FILENAME}`;

function generateSlackMessage(summary) {
  const message = {
    text:
      `CODE SCAN: *${TARGET}* result (Branch: *${process.env.GITHUB_REF_NAME}*)` +
      `\n<https://github.com/Garnetinsight/Garnetinsight/actions/runs/${process.env.GITHUB_RUN_ID}|View on Github Actions>`,
    attachments: [],
  };

  if (summary.total) {
    if (summary.errors) {
      message.attachments.push({
        title: 'Errors',
        color: '#C0392B',
        text: `${summary.errors}`,
      });
    }
    if (summary.warnings) {
      message.attachments.push({
        title: 'Warnings',
        color: '#F5B041',
        text: `${summary.warnings}`,
      });
    }
  } else {
    message.attachments.push({
      title: 'No issues found',
      color: 'good',
    });
  }

  return message;
}

async function main() {
  const summary = {
    errors: 0,
    warnings: 0,
  };
  const scanResult = JSON.parse(fs.readFileSync(file));
  scanResult.forEach((fileResult) => {
    summary.errors += fileResult.errorCount;
    summary.warnings += fileResult.warningCount;
  });

  summary.total = summary.errors + summary.warnings;

  fs.writeFileSync(
    outputFile,
    JSON.stringify({
      channel: process.env.SLACK_AUDIT_REPORT_CHANNEL,
      ...generateSlackMessage(summary),
    }),
  );
}

main();
