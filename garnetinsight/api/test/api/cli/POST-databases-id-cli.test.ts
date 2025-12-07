import {
  describe,
  it,
  before,
  Joi,
  deps,
  validateApiCall,
  requirements,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/cli`);

const responseSchema = Joi.object()
  .keys({
    uuid: Joi.string().required(),
  })
  .required();

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    // additional checks before test run
    if (testCase.before) {
      await testCase.before();
    }

    await validateApiCall({
      endpoint,
      ...testCase,
    });

    // additional checks after test pass
    if (testCase.after) {
      await testCase.after();
    }
  });
};

describe('POST /databases/:id/cli', () => {
  requirements('rte.type=STANDALONE');

  before(rte.data.truncate);

  describe('Common', () => {
    [
      {
        name: 'Should create new cli client',
        statusCode: 201,
        responseSchema,
      },
    ].map(mainCheckFn);
  });
});
