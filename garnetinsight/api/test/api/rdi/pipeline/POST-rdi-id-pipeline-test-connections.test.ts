import { RdiUrl } from 'src/modules/rdi/constants';
import { sign } from 'jsonwebtoken';
import { RdiTestConnectionStatus } from 'src/modules/rdi/dto';
import {
  describe,
  expect,
  deps,
  getMainCheckFn,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
} from '../../deps';
import { Joi, nock } from '../../../helpers/test';

const { localDb, request, server, constants } = deps;

const testRdiId = 'someTEST_pipeline_test_connections';
const notExistedRdiId = 'notExisted';
const testRdiUrl = 'http://rdilocal.test';

const endpoint = (id) =>
  request(server).post(
    `/${constants.API.RDI}/${id || testRdiId}/pipeline/test-connections`,
  );

const dataSchema = Joi.object().optional().strict(true);

const validInputData = {
  sources: {},
};

const responseSchema = Joi.object()
  .keys({
    sources: Joi.object()
      .pattern(
        Joi.string(),
        Joi.object({
          connected: Joi.boolean().required(),
          error: Joi.string().allow(null).optional(),
        }),
      )
      .required(),

    targets: Joi.object()
      .keys({
        target: Joi.object()
          .keys({
            status: Joi.string()
              .valid(
                RdiTestConnectionStatus.Success,
                RdiTestConnectionStatus.Fail,
              )
              .required(),
            error: Joi.object()
              .keys({
                code: Joi.string(),
                message: Joi.string(),
              })
              .optional(),
          })
          .required(),
      })
      .required(),
  })
  .strict(true);

const validMockResponses = {
  sources: {},
  targets: {
    target: {
      status: RdiTestConnectionStatus.Success,
    },
  },
};

const failedMockResponses = {
  sources: {},
  targets: {
    target: {
      status: RdiTestConnectionStatus.Fail,
      error: {
        code: 'some_code',
        message: 'Some Error during connection',
      },
    },
  },
};

const mockedAccessToken = sign(
  { exp: Math.trunc(Date.now() / 1000) + 3600 },
  'test',
);

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /rdi/:id/pipeline/test-connections', () => {
  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).forEach(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });
  describe('Common', () => {
    [
      {
        name: 'Should be success if rdi with :id is in db and client testConnections returns with success status',
        responseSchema,
        data: validInputData,
        statusCode: 201,
        checkFn: ({ body }) => {
          expect(body).to.eql(validMockResponses);
        },
        before: async () => {
          await localDb.generateRdis({ id: testRdiId, url: testRdiUrl }, 1);
          nock(testRdiUrl).post(`/${RdiUrl.Login}`).query(true).reply(200, {
            access_token: mockedAccessToken,
          });

          nock(testRdiUrl)
            .post(`/${RdiUrl.TestTargetsConnections}`)
            .query(true)
            .reply(200, { targets: validMockResponses.targets });
        },
      },
      {
        name: 'Should be success even if client testConnection returns with failed connection status',
        responseSchema,
        data: validInputData,
        statusCode: 201,
        checkFn: ({ body }) => {
          expect(body).to.eql(failedMockResponses);
        },
        before: async () => {
          await localDb.generateRdis({ id: testRdiId, url: testRdiUrl }, 1);
          nock(testRdiUrl).post(`/${RdiUrl.Login}`).query(true).reply(200, {
            access_token: mockedAccessToken,
          });

          nock(testRdiUrl)
            .post(`/${RdiUrl.TestTargetsConnections}`)
            .query(true)
            .reply(200, { targets: failedMockResponses.targets });
        },
      },
      {
        name: 'Should be success even if client testConnection returns with some failed connection status',
        responseSchema,
        data: validInputData,
        statusCode: 201,
        checkFn: ({ body }) => {
          expect(body).to.eql({
            sources: validMockResponses.sources,
            targets: failedMockResponses.targets,
          });
        },
        before: async () => {
          await localDb.generateRdis({ id: testRdiId, url: testRdiUrl }, 1);
          nock(testRdiUrl).post(`/${RdiUrl.Login}`).query(true).reply(200, {
            access_token: mockedAccessToken,
          });

          nock(testRdiUrl)
            .post(`/${RdiUrl.TestTargetsConnections}`)
            .query(true)
            .reply(200, { targets: failedMockResponses.targets });
        },
      },
      {
        name: 'Should throw notFoundError if rdi with id in params does not exist',
        endpoint: () => endpoint(notExistedRdiId),
        data: validInputData,
        statusCode: 404,
        checkFn: ({ body }) => {
          expect(body).to.eql({
            error: 'Not Found',
            message: 'Invalid rdi instance id.',
            statusCode: 404,
          });
        },
        before: async () => {
          expect(await localDb.getRdiById(notExistedRdiId)).to.eql(null);
        },
      },
      {
        name: 'Should throw error if client testConnection will not succeed',
        data: validInputData,
        statusCode: 401,
        checkFn: ({ body }) => {
          expect(body).to.eql({
            error: 'RdiUnauthorized',
            errorCode: 11402,
            message: 'Unauthorized',
            statusCode: 401,
          });
        },
        before: async () => {
          await localDb.generateRdis({ id: testRdiId, url: testRdiUrl }, 1);
          nock(testRdiUrl).post(`/${RdiUrl.Login}`).query(true).reply(200, {
            access_token: mockedAccessToken,
          });
          nock(testRdiUrl)
            .post(`/${RdiUrl.TestTargetsConnections}`)
            .query(true)
            .reply(401, {
              message: 'Request failed with status code 401',
              detail: 'Unauthorized',
            });
        },
      },
    ].forEach(mainCheckFn);
  });
});
