const fs = require('fs');

const file = 'garnetinsight/api/test/test-runs/coverage/test-run-result.json';

const results = {
  message: {
    text:
      `*ITest - ${process.env.ITEST_NAME}* (Branch: *${process.env.GITHUB_REF_NAME}*)` +
      `\n<https://github.com/Vijay-Nirmal/Garnetinsight/actions/runs/${process.env.GITHUB_RUN_ID}|View on Github Actions>`,
    attachments: [],
  },
};

const result = JSON.parse(fs.readFileSync(file, 'utf-8'));
const testRunResult = {
  color: '#36a64f',
  title: `Started at: ${result.stats.start}`,
  text: `Executed ${result.stats.tests} in ${result.stats.duration / 1000}s`,
  fields: [
    {
      title: 'Passed',
      value: result.stats.passes,
      short: true,
    },
    {
      title: 'Skipped',
      value: result.stats.pending,
      short: true,
    },
  ],
};

if (result.stats.failures) {
  results.passed = false;
  testRunResult.color = '#cc0000';
  testRunResult.fields.push({
    title: 'Failed',
    value: result.stats.failures,
    short: true,
  });
}

results.message.attachments.push(testRunResult);

if (results.passed === false) {
  results.message.text = '<!here> ' + results.message.text;
}

fs.writeFileSync(
  'itests.report.json',
  JSON.stringify({
    channel: process.env.SLACK_TEST_REPORT_CHANNEL,
    ...results.message,
  }),
);
