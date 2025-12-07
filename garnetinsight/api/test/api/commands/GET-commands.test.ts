import { expect, describe, it, deps, Joi, fs, validateApiCall } from '../deps';
const { server, request } = deps;

// endpoint to test
const endpoint = () => request(server).get('/commands');

const responseSchema = Joi.object().required();

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    await validateApiCall({
      endpoint,
      ...testCase,
    });
  });
};

describe('GET /commands', () => {
  [
    {
      name: 'Should return merged config',
      statusCode: 200,
      responseSchema,
      checkFn: ({ body }) => {
        expect(body['GET']).to.be.an('object');
        expect(body['FT.CREATE']).to.be.an('object');
        expect(body['JSON.GET']).to.be.an('object');
        expect(body['RG.PYEXECUTE']).to.be.an('object');
        expect(body['BF.RESERVE']).to.be.an('object');
      },
    },
  ].map(mainCheckFn);
});
