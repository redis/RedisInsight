import { expect, describe, it, deps, Joi, validateApiCall } from '../deps';
const { server, request } = deps;

// endpoint to test
const endpoint = () => request(server).get('/info');

const responseSchema = Joi.object()
  .keys({
    id: Joi.string().required(),
    createDateTime: Joi.date().required(),
    appVersion: Joi.string().required(),
    osPlatform: Joi.string().required(),
    buildType: Joi.string()
      .valid('ELECTRON', 'DOCKER_ON_PREMISE', 'REDIS_STACK')
      .required(),
    appType: Joi.string()
      .valid('ELECTRON', 'DOCKER', 'REDIS_STACK_WEB', 'UNKNOWN')
      .required(),
    encryptionStrategies: Joi.array().items(Joi.string()),
    sessionId: Joi.number().required(),
  })
  .required();

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    await validateApiCall({
      endpoint,
      ...testCase,
    });
  });
};

describe('GET /info', () => {
  [
    {
      name: 'Should return server info',
      statusCode: 200,
      responseSchema,
      checkFn: ({ body }) => {
        expect(body.osPlatform).to.eql(process.platform);
      },
    },
  ].map(mainCheckFn);
});
