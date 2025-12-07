import { describe, it, deps, Joi, validateApiCall } from '../deps';
const { server, request } = deps;

// endpoint to test
const endpoint = () => request(server).get('/info/cli-blocking-commands');

const responseSchema = Joi.array().items(Joi.string());

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    await validateApiCall({
      endpoint,
      ...testCase,
    });
  });
};

describe('GET /info/cli-blocking-commands', () => {
  [
    {
      name: 'Should return array with blocking Redis commands',
      statusCode: 200,
      responseSchema,
      responseBody: [
        'blpop',
        'brpop',
        'blmove',
        'brpoplpush',
        'bzpopmin',
        'bzpopmax',
        'xread',
        'xreadgroup',
      ],
    },
  ].map(mainCheckFn);
});
