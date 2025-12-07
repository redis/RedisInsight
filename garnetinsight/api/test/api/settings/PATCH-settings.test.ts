import * as AGREEMENTS_SPEC from 'src/constants/agreements-spec.json';
import {
  describe,
  it,
  deps,
  Joi,
  validateApiCall,
  expect,
  after,
  before,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
} from '../deps';
import { initSettings, resetSettings } from '../../helpers/local-db';
const { server, request, constants } = deps;

// endpoint to test
const endpoint = () => request(server).patch('/settings');

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
      .pattern(/./, Joi.boolean())
      .allow(null)
      .required(),
  })
  .required();

// input data schema
const dataSchema = Joi.object({
  theme: Joi.string().allow(null).optional(),
  scanThreshold: Joi.number().allow(null).min(500).optional(),
  dateFormat: Joi.string().allow(null),
  timezone: Joi.string().allow(null),
  agreements: Joi.object()
    .keys({
      eula: Joi.boolean().label('.eula').optional(),
      encryption: Joi.boolean().label('.encryption').optional(),
    })
    .allow(null)
    .optional()
    .messages({
      'boolean.base': 'each value in agreements must be a boolean value',
      'object.base': 'agreements must be an instance of Map',
    }),
}).strict();

const validInputData = {
  theme: 'DARK',
  scanThreshold: 100000,
  batchSize: 5,
  dateFormat: null,
  timezone: null,
  agreements: {
    eula: true,
    analytics: false,
    encryption: false,
    notifications: false,
  },
};

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    await validateApiCall({
      endpoint,
      ...testCase,
    });
  });
};

describe('PATCH /settings', () => {
  after(initSettings);

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('settings', () => {
    before(resetSettings);

    return [
      {
        name: 'Should update only scanThreshold value',
        statusCode: 200,
        data: { scanThreshold: 10000000, batchSize: 5 },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body).to.include({
            ...constants.APP_DEFAULT_SETTINGS,
            scanThreshold: 10000000,
            batchSize: 5,
          });
        },
      },
      {
        name: 'Should update settings and agreements',
        statusCode: 200,
        data: validInputData,
        responseSchema,
        checkFn: ({ body }) => {
          const { agreements, ...settings } = validInputData;

          expect(body).to.include(settings);
          expect(body.agreements).to.include(agreements);
        },
      },
      {
        name: 'Should set default settings',
        statusCode: 200,
        data: { scanThreshold: null, theme: null, batchSize: null },
        responseSchema,
        checkFn: ({ body }) => {
          const { agreements, ...defaultSettings } =
            constants.APP_DEFAULT_SETTINGS;

          expect(body).to.include(defaultSettings);
        },
      },
    ].map(mainCheckFn);
  });

  describe('agreements', () => {
    before(resetSettings);

    const allAcceptedAgreements = {};
    Object.keys(AGREEMENTS_SPEC.agreements).forEach(
      (agreement) => (allAcceptedAgreements[agreement] = true),
    );
    return [
      {
        name: 'Should throw [Bad Request] if some agreements are missed in dto',
        data: {
          agreements: {
            analytics: true,
          },
        },
        statusCode: 400,
        responseBody: {
          statusCode: 400,
          error: 'Bad Request',
        },
      },
      {
        name: 'Should accept all agreements defined in specification',
        statusCode: 200,
        data: { agreements: allAcceptedAgreements },
        responseSchema,
        checkFn: ({ body }) => {
          const { agreements, ...defaultSettings } =
            constants.APP_DEFAULT_SETTINGS;

          expect(body).to.include(defaultSettings);
          expect(body.agreements).to.eql({
            version: AGREEMENTS_SPEC.version,
            ...allAcceptedAgreements,
          });
        },
      },
      {
        name: 'Should reject analytics agreement',
        statusCode: 200,
        data: { agreements: { analytics: false } },
        responseSchema,
        checkFn: ({ body }) => {
          const { agreements, ...defaultSettings } =
            constants.APP_DEFAULT_SETTINGS;

          expect(body).to.include(defaultSettings);
          expect(body.agreements).to.eql({
            version: AGREEMENTS_SPEC.version,
            ...allAcceptedAgreements,
            analytics: false,
          });
        },
      },
    ].map(mainCheckFn);
  });
});
