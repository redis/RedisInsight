import {
  describe,
  deps,
  expect,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  Joi,
  getMainCheckFn,
  serverConfig,
} from '../../deps';
import { nock } from '../../../helpers/test';
import {
  mockCloudCapiSubscriptionDatabases,
  mockCloudCapiSubscriptionDatabasesFixed,
  mockCloudDatabaseFromList,
  mockCloudDatabaseFromListFixed,
  mockGetCloudSubscriptionDatabasesDto,
  mockGetCloudSubscriptionDatabasesDtoFixed,
} from 'src/__mocks__';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

const { request, server, constants } = deps;

const endpoint = () =>
  request(server).post(`/cloud/autodiscovery/get-databases`);

const dataSchema = Joi.object({
  subscriptions: Joi.array()
    .items({
      subscriptionId: Joi.number()
        .allow(true)
        .required()
        .label('.subscriptionId'), // todo: review transform rules
      subscriptionType: Joi.string()
        .valid('fixed', 'flexible')
        .required()
        .label('subscriptionType'),
    })
    .required()
    .messages({
      'any.required': '{#label} should not be empty',
      'array.sparse': '{#label} must be either object or array',
      'array.base': 'property {#label} must be either object or array',
    }),
}).strict();

const validInputData = {
  subscriptions: [
    {
      subscriptionId: constants.TEST_CLOUD_SUBSCRIPTION_ID,
      subscriptionType: 'fixed',
    },
  ],
};

const headers = {
  'x-cloud-api-key': constants.TEST_CLOUD_API_KEY,
  'x-cloud-api-secret': constants.TEST_CLOUD_API_SECRET_KEY,
};

const responseSchema = Joi.array()
  .items(
    Joi.object().keys({
      subscriptionId: Joi.number().required(),
      subscriptionType: Joi.string().valid('fixed', 'flexible').required(),
      databaseId: Joi.number().required(),
      name: Joi.string().required(),
      publicEndpoint: Joi.string().required(),
      status: Joi.string().required(),
      sslClientAuthentication: Joi.boolean().required(),
      modules: Joi.array().required(),
      options: Joi.object().required(),
      tags: Joi.array()
        .items(
          Joi.object().keys({
            key: Joi.string().required(),
            value: Joi.string().required(),
          }),
        )
        .allow(null),
      cloudDetails: Joi.object()
        .keys({
          cloudId: Joi.number().required(),
          subscriptionType: Joi.string().valid('fixed', 'flexible').required(),
          planMemoryLimit: Joi.number(),
          memoryLimitMeasurementUnit: Joi.string(),
          subscriptionId: Joi.number().integer(),
          free: Joi.boolean().required(),
        })
        .required(),
    }),
  )
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

const nockScope = nock(serverConfig.get('cloud').capiUrl);

describe('POST /cloud/autodiscovery/get-databases', () => {
  requirements('rte.serverType=local');

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData, 'data', {
      headers,
    }).map(validateInvalidDataTestCase(endpoint, dataSchema));
  });

  describe('Common', async () => {
    [
      {
        before: () => {
          nockScope
            .get(
              `/subscriptions/${mockGetCloudSubscriptionDatabasesDto.subscriptionId}/databases`,
            )
            .reply(200, mockCloudCapiSubscriptionDatabases);
        },
        name: 'Should get databases list inside subscription',
        data: {
          subscriptions: [mockGetCloudSubscriptionDatabasesDto],
        },
        headers,
        responseSchema,
        checkFn: ({ body }) => {
          expect(body).to.deepEqualIgnoreUndefined([mockCloudDatabaseFromList]);
        },
      },
      {
        before: () => {
          nockScope
            .get(
              `/fixed/subscriptions/${mockGetCloudSubscriptionDatabasesDtoFixed.subscriptionId}/databases`,
            )
            .reply(200, mockCloudCapiSubscriptionDatabasesFixed);
        },
        name: 'Should get databases list inside fixed subscription',
        data: {
          subscriptions: [mockGetCloudSubscriptionDatabasesDtoFixed],
        },
        headers,
        responseSchema,
        checkFn: ({ body }) => {
          expect(body).to.deepEqualIgnoreUndefined([
            mockCloudDatabaseFromListFixed,
          ]);
        },
      },
      {
        before: () => {
          nockScope
            .get(
              `/subscriptions/${mockGetCloudSubscriptionDatabasesDto.subscriptionId}/databases`,
            )
            .replyWithError({
              message: 'Unauthorized for this action',
              response: {
                status: 403,
              },
            });
        },
        name: 'Should throw Forbidden error when api returns 403',
        headers,
        data: {
          subscriptions: [mockGetCloudSubscriptionDatabasesDto],
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'CloudApiForbidden',
          message: 'Unauthorized for this action',
          errorCode: CustomErrorCodes.CloudApiForbidden,
        },
      },
      {
        before: () => {
          nockScope
            .get(
              `/subscriptions/${mockGetCloudSubscriptionDatabasesDto.subscriptionId}/databases`,
            )
            .replyWithError({
              message: ERROR_MESSAGES.UNAUTHORIZED,
              response: {
                status: 401,
              },
            });
        },
        name: 'Should throw Forbidden error when api returns 401',
        headers,
        data: {
          subscriptions: [mockGetCloudSubscriptionDatabasesDto],
        },
        statusCode: 401,
        responseBody: {
          statusCode: 401,
          error: 'CloudCapiUnauthorized',
          errorCode: CustomErrorCodes.CloudCapiUnauthorized,
          message: ERROR_MESSAGES.UNAUTHORIZED,
        },
      },
      {
        before: () => {
          nockScope
            .get(
              `/subscriptions/${mockGetCloudSubscriptionDatabasesDto.subscriptionId}/databases`,
            )
            .replyWithError({
              message: ERROR_MESSAGES.NOT_FOUND,
              response: {
                status: 404,
                data: 'Subscription is not found',
              },
            });
        },
        name: 'Should throw Not Found error when subscription id is not found',
        headers,
        data: {
          subscriptions: [mockGetCloudSubscriptionDatabasesDto],
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          error: 'CloudApiNotFound',
          message: ERROR_MESSAGES.NOT_FOUND,
          errorCode: CustomErrorCodes.CloudApiNotFound,
        },
      },
      {
        name: 'Should throw Unauthorized error when api key or secret was not provided',
        headers: {},
        statusCode: 401,
        responseBody: {
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Required authentication credentials were not provided',
        },
      },
    ].map(mainCheckFn);
  });
});
