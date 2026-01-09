import { RdiUrl } from 'src/modules/rdi/constants';
import { describe, expect, deps, getMainCheckFn } from '../../deps';
import { nock } from '../../../helpers/test';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { mockedAccessToken } from 'src/__mocks__';

const { localDb, request, server, constants } = deps;

const testRdiId = 'someTEST_pipeline_stop';
const notExistedRdiId = 'notExisted';
const testRdiUrl = 'http://rdilocal.test';
const errorMessage = 'Authorization failed';

const endpoint = (id) =>
  request(server).post(
    `/${constants.API.RDI}/${id || testRdiId}/pipeline/stop`,
  );

const mockResponse = {
  action_id: 'some_action_id_123',
};
const mockActionResponse = {
  status: 'completed',
  data: 'Some successful data',
  error: null,
};
const mockErrorMessage = 'Error when stopping a pipeline';

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /rdi/:id/pipeline/stop', () => {
  [
    {
      name: 'Should be success if rdi with :id is in db and all client stopPipeline and action calls are success',
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
          .post(`/${RdiUrl.StopPipeline}`)
          .query(true)
          .reply(200, mockResponse);
        nock(testRdiUrl)
          .get(`/${RdiUrl.Action}/${mockResponse.action_id}`)
          .query(true)
          .reply(200, mockActionResponse);
      },
    },
    {
      name: 'Should throw an error if rdi is ok but the stop pipeline Action call responds success data with failed status',
      statusCode: 400,
      checkFn: ({ body }) => {
        expect(body).to.eql({
          error: 'RdiStopPipelineFailed',
          errorCode: CustomErrorCodes.RdiStopPipelineFailure,
          errors: [null],
          message: ERROR_MESSAGES.RDI_STOP_PIPELINE_FAILURE,
          statusCode: 400,
        });
      },
      before: async () => {
        await localDb.generateRdis({ id: testRdiId, url: testRdiUrl }, 1);
        nock(testRdiUrl).post(`/${RdiUrl.Login}`).query(true).reply(200, {
          access_token: mockedAccessToken,
        });
        nock(testRdiUrl)
          .post(`/${RdiUrl.StopPipeline}`)
          .query(true)
          .reply(200, mockResponse);
        nock(testRdiUrl)
          .get(`/${RdiUrl.Action}/${mockResponse.action_id}`)
          .query(true)
          .reply(200, {
            status: 'failed',
            data: null,
            error: mockErrorMessage,
          });
      },
    },
    {
      name: 'Should throw notFoundError if rdi with id in params does not exist',
      endpoint: () => endpoint(notExistedRdiId),
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
      name: 'Should throw error if client stopPipeline will not succeed',
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
          .post(`/${RdiUrl.StopPipeline}`)
          .query(true)
          .reply(401, {
            message: errorMessage,
            detail: errorMessage,
          });
      },
    },
    {
      name: 'Should throw error if client authorization will not succeed',
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
          .post(`/${RdiUrl.StopPipeline}`)
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
