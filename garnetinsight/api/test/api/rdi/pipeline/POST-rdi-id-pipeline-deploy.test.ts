import { RdiUrl } from 'src/modules/rdi/constants';
import { sign } from 'jsonwebtoken';
import { describe, expect, deps, getMainCheckFn } from '../../deps';
import { nock } from '../../../helpers/test';

const { localDb, request, server, constants } = deps;

const testRdiId = 'someTEST_pipeline_deploy';
const notExistedRdiId = 'notExisted';
const testRdiUrl = 'http://rdilocal.test';
const errorMessage = 'Authorization failed';

const endpoint = (id) =>
  request(server).post(
    `/${constants.API.RDI}/${id || testRdiId}/pipeline/deploy`,
  );

const validInputData = {
  config: {},
  jobs: {},
};

const mockResponse = {
  action_id: 'some_action_id_123',
};
const mockActionResponse = {
  status: 'completed',
  data: 'Some successful data',
  error: null,
};

const mockedAccessToken = sign(
  { exp: Math.trunc(Date.now() / 1000) + 3600 },
  'test',
);

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /rdi/:id/pipeline/deploy', () => {
  [
    {
      name: 'Should be success if rdi with :id is in db and all client deploy and action calls are success',
      data: validInputData,
      statusCode: 201,
      checkFn: ({ body }) => {
        expect(body).to.eql({});
      },
      before: async () => {
        await localDb.generateRdis({ id: testRdiId, url: testRdiUrl }, 1);
        nock(testRdiUrl).post(`/${RdiUrl.Login}`).query(true).reply(200, {
          access_token: mockedAccessToken,
        });
        nock(testRdiUrl)
          .post(`/${RdiUrl.Deploy}`)
          .query(true)
          .reply(200, mockResponse);
        nock(testRdiUrl)
          .get(`/${RdiUrl.Action}/${mockResponse.action_id}`)
          .query(true)
          .reply(200, mockActionResponse);
      },
    },
    {
      name: 'Should be success if rdi with :id is in db and all client deploy and action calls are success',
      data: validInputData,
      statusCode: 400,
      checkFn: ({ body }) => {
        expect(body).to.eql({
          error: 'RdiPipelineDeployFailed',
          errorCode: 11401,
          errors: [null],
          message: 'Failed to deploy pipeline',
          statusCode: 400,
        });
      },
      before: async () => {
        await localDb.generateRdis({ id: testRdiId, url: testRdiUrl }, 1);
        nock(testRdiUrl).post(`/${RdiUrl.Login}`).query(true).reply(200, {
          access_token: mockedAccessToken,
        });
        nock(testRdiUrl)
          .post(`/${RdiUrl.Deploy}`)
          .query(true)
          .reply(200, mockResponse);
        nock(testRdiUrl)
          .get(`/${RdiUrl.Action}/${mockResponse.action_id}`)
          .query(true)
          .reply(200, {
            status: 'failed',
            data: null,
            error: 'Error with deploy',
          });
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
      name: 'Should throw error if client deploy will not succeed',
      data: validInputData,
      statusCode: 401,
      checkFn: ({ body }) => {
        expect(body).to.eql({
          error: 'RdiUnauthorized',
          errorCode: 11402,
          message: errorMessage,
          statusCode: 401,
        });
      },
      before: async () => {
        await localDb.generateRdis({ id: testRdiId, url: testRdiUrl }, 1);
        nock(testRdiUrl).post(`/${RdiUrl.Login}`).query(true).reply(200, {
          access_token: mockedAccessToken,
        });
        nock(testRdiUrl).post(`/${RdiUrl.Deploy}`).query(true).reply(401, {
          message: errorMessage,
          detail: errorMessage,
        });
      },
    },
    {
      name: 'Should throw error if client Action will not succeed',
      data: validInputData,
      statusCode: 401,
      checkFn: ({ body }) => {
        expect(body).to.eql({
          error: 'RdiUnauthorized',
          errorCode: 11402,
          message: errorMessage,
          statusCode: 401,
        });
      },
      before: async () => {
        await localDb.generateRdis({ id: testRdiId, url: testRdiUrl }, 1);
        nock(testRdiUrl).post(`/${RdiUrl.Login}`).query(true).reply(200, {
          access_token: mockedAccessToken,
        });
        nock(testRdiUrl)
          .post(`/${RdiUrl.Deploy}`)
          .query(true)
          .reply(200, mockResponse);
        nock(testRdiUrl)
          .get(`/${RdiUrl.Action}/${mockResponse.action_id}`)
          .query(true)
          .reply(401, {
            message: 'Authorization 2 failed',
            detail: errorMessage,
          });
      },
    },
  ].forEach(mainCheckFn);
});
