import { describe, it, deps, Joi, validateApiCall } from '../deps';
const { server, request } = deps;

// endpoint to test
const endpoint = () => request(server).get('/info/cli-unsupported-commands');

const responseSchema = Joi.array().items(Joi.string());

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    await validateApiCall({
      endpoint,
      ...testCase,
    });
  });
};

describe('GET /info/cli-unsupported-commands', () => {
  [
    {
      name: 'Should return array with unsupported commands for CLI tool',
      statusCode: 200,
      responseSchema,
      responseBody: [
        'monitor',
        'subscribe',
        'psubscribe',
        'ssubscribe',
        'sync',
        'psync',
        'script debug',
        'hello 3',
      ],
    },
  ].map(mainCheckFn);
});
