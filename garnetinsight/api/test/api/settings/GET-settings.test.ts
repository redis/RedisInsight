import {
  describe,
  it,
  deps,
  Joi,
  validateApiCall,
  expect,
  after,
} from '../deps';
import {
  applyEulaAgreement,
  initSettings,
  resetSettings,
} from '../../helpers/local-db';
const { server, request, constants } = deps;

// endpoint to test
const endpoint = () => request(server).get('/settings');

const responseSchema = Joi.object()
  .keys({
    theme: Joi.string().allow(null).required(),
    scanThreshold: Joi.number().required(),
    batchSize: Joi.number().required(),
    dateFormat: Joi.string().allow(null),
    timezone: Joi.string().allow(null),
    acceptTermsAndConditionsOverwritten: Joi.bool().required(),
    agreements: Joi.object()
      .keys({
        version: Joi.string().required(),
        eula: Joi.bool().required(),
        encryption: Joi.bool(),
      })
      .allow(null)
      .required(),
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

describe('GET /settings', () => {
  after(initSettings);

  [
    {
      name: 'Should return default settings',
      statusCode: 200,
      responseSchema,
      before: resetSettings,
      checkFn: ({ body }) => {
        expect(body).to.eql(constants.APP_DEFAULT_SETTINGS);
      },
    },
    {
      name: 'Should return settings with applied EULA agreement',
      statusCode: 200,
      responseSchema,
      before: applyEulaAgreement,
      checkFn: ({ body }) => {
        expect(body)
          .to.have.nested.property('agreements.eula')
          .that.deep.equals(true);
        expect(body)
          .to.have.nested.property('agreements.encryption')
          .that.deep.equals(true);
      },
      after: async () => initSettings(),
    },
  ].map(mainCheckFn);
});
