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
import ERROR_MESSAGES from 'src/constants/error-messages';

import { nock } from '../../../helpers/test';
import {
  mockCloudCapiDatabase,
  mockCloudCapiDatabaseTags,
  mockCloudCapiDatabaseFixed,
  mockCloudDatabase,
  mockCloudDatabaseFixed,
  mockImportCloudDatabaseDto,
  mockImportCloudDatabaseDtoFixed,
} from 'src/__mocks__';
import { CustomErrorCodes } from 'src/constants';

const { request, server, constants } = deps;

const endpoint = () => request(server).post(`/cloud/autodiscovery/databases`);

const dataSchema = Joi.object({
  databases: Joi.array()
    .items({
      databaseId: Joi.number().allow(true).required().label('.databaseId'),
      subscriptionId: Joi.number()
        .allow(true)
        .required()
        .label('.subscriptionId'),
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
  databases: [
    {
      databaseId: 1,
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
      free: Joi.boolean(),
      status: Joi.string().valid('fail', 'success').required(),
      message: Joi.string().required(),
      databaseDetails: Joi.object().required(),
      tags: Joi.array()
        .items(
          Joi.object().keys({
            key: Joi.string().required(),
            value: Joi.string().required(),
            createdAt: Joi.string().isoDate(),
            updatedAt: Joi.string().isoDate(),
            links: Joi.array().items(Joi.string().required()),
          }),
        )
        .allow(null),
    }),
  )
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

const nockScope = nock(serverConfig.get('cloud').capiUrl);

describe('POST /cloud/autodiscovery/databases', () => {
  requirements('rte.serverType=local');

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData, 'data', {
      headers,
    }).map(validateInvalidDataTestCase(endpoint, dataSchema));
  });

  describe('Common mocked to localhost', () => {
    requirements('rte.type=STANDALONE', '!rte.pass', '!rte.tls');
    [
      {
        before: () => {
          nockScope
            .get(
              `/subscriptions/${mockImportCloudDatabaseDto.subscriptionId}/databases/${mockImportCloudDatabaseDto.databaseId}`,
            )
            .reply(200, {
              ...mockCloudCapiDatabase,
              publicEndpoint: `${constants.TEST_REDIS_HOST}:${constants.TEST_REDIS_PORT}`,
            })
            .get(
              `/fixed/subscriptions/${mockImportCloudDatabaseDtoFixed.subscriptionId}/databases/${mockImportCloudDatabaseDtoFixed.databaseId}`,
            )
            .reply(200, {
              ...mockCloudCapiDatabaseFixed,
              publicEndpoint: `${constants.TEST_REDIS_HOST}:${constants.TEST_REDIS_PORT}`,
            })
            .get(
              `/subscriptions/${mockImportCloudDatabaseDtoFixed.subscriptionId}/databases/${mockImportCloudDatabaseDtoFixed.databaseId}/tags`,
            )
            .reply(200, {
              tags: mockCloudCapiDatabaseTags,
            });
        },
        name: 'Should add 2 databases',
        data: {
          databases: [
            mockImportCloudDatabaseDto,
            mockImportCloudDatabaseDtoFixed,
          ],
        },
        headers,
        responseSchema,
        statusCode: 201,
        checkFn: ({ body }) => {
          expect(body).to.deepEqualIgnoreUndefined([
            {
              ...mockImportCloudDatabaseDto,
              message: 'Added',
              status: 'success',
              databaseDetails: {
                ...mockCloudDatabase,
                publicEndpoint: `${constants.TEST_REDIS_HOST}:${constants.TEST_REDIS_PORT}`,
                tags: mockCloudCapiDatabaseTags,
              },
            },
            {
              ...mockImportCloudDatabaseDtoFixed,
              message: 'Added',
              status: 'success',
              databaseDetails: {
                ...mockCloudDatabaseFixed,
                publicEndpoint: `${constants.TEST_REDIS_HOST}:${constants.TEST_REDIS_PORT}`,
              },
            },
          ]);
        },
      },
    ].map(mainCheckFn);
  });

  describe('Common fails', async () => {
    [
      {
        before: () => {
          nockScope
            .get(
              `/fixed/subscriptions/${mockImportCloudDatabaseDtoFixed.subscriptionId}/databases/${mockImportCloudDatabaseDtoFixed.databaseId}`,
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
          databases: [mockImportCloudDatabaseDtoFixed],
        },
        responseBody: [
          {
            ...mockImportCloudDatabaseDtoFixed,
            status: 'fail',
            message: 'Unauthorized for this action',
            error: {
              statusCode: 403,
              error: 'CloudApiForbidden',
              message: 'Unauthorized for this action',
              errorCode: CustomErrorCodes.CloudApiForbidden,
            },
          },
        ],
      },
      {
        before: () => {
          nockScope
            .get(
              `/subscriptions/${mockImportCloudDatabaseDto.subscriptionId}/databases/${mockImportCloudDatabaseDto.databaseId}`,
            )
            .replyWithError({
              message: ERROR_MESSAGES.UNAUTHORIZED,
              response: {
                status: 401,
                data: '',
              },
            });
        },
        name: 'Should throw Forbidden error when api returns 401',
        headers,
        data: {
          databases: [mockImportCloudDatabaseDto],
        },
        responseBody: [
          {
            ...mockImportCloudDatabaseDto,
            status: 'fail',
            message: ERROR_MESSAGES.UNAUTHORIZED,
            error: {
              statusCode: 401,
              error: 'CloudCapiUnauthorized',
              errorCode: CustomErrorCodes.CloudCapiUnauthorized,
              message: ERROR_MESSAGES.UNAUTHORIZED,
            },
          },
        ],
      },
      {
        before: () => {
          nockScope
            .get(
              `/subscriptions/${mockImportCloudDatabaseDto.subscriptionId}/databases/${mockImportCloudDatabaseDto.databaseId}`,
            )
            .replyWithError({
              message: ERROR_MESSAGES.NOT_FOUND,
              response: {
                status: 404,
                data: ERROR_MESSAGES.NOT_FOUND,
              },
            });
        },
        name: 'Should throw Not Found error when subscription id is not found',
        headers,
        data: {
          databases: [mockImportCloudDatabaseDto],
        },
        responseBody: [
          {
            ...mockImportCloudDatabaseDto,
            status: 'fail',
            message: ERROR_MESSAGES.NOT_FOUND,
            error: {
              statusCode: 404,
              error: 'CloudApiNotFound',
              message: ERROR_MESSAGES.NOT_FOUND,
              errorCode: CustomErrorCodes.CloudApiNotFound,
            },
          },
        ],
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
