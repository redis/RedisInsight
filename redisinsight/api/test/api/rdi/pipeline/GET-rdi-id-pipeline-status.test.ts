import { RdiUrl, RdiUrlV2 } from 'src/modules/rdi/constants';
import { sign } from 'jsonwebtoken';
import { describe, expect, deps, getMainCheckFn } from '../../deps';
import { nock } from '../../../helpers/test';

const { localDb, request, server, constants } = deps;

const testRdiIdV1 = 'someTEST_pipeline_status_v1';
const testRdiIdV2 = 'someTEST_pipeline_status_v2';
const notExistedRdiId = 'notExisted';
const testRdiUrlV1 = 'http://rdilocalv1.test';
const testRdiUrlV2 = 'http://rdilocalv2.test';
const mockedAccessToken = sign(
  { exp: Math.trunc(Date.now() / 1000) + 3600 },
  'test',
);

const endpoint = (id: string) =>
  request(server).get(`/${constants.API.RDI}/${id}/pipeline/status`);

// V1 API response structure
const mockV1ApiResponse = {
  components: {
    'collector-source': {
      status: 'running',
      connected: true,
      version: '1.0.0',
    },
    processor: { status: 'running', version: '1.0.0' },
  },
  pipelines: {
    default: {
      status: 'ready',
      state: 'cdc',
      tasks: [],
    },
  },
};

// Expected transformed response for V1
const mockV1ResponseSuccess = {
  status: 'ready',
  state: 'cdc',
};

// V2 API response structure
const mockV2InfoResponse = {
  version: '2.0.0',
};

const mockV2PipelinesResponse = [
  {
    name: 'test-pipeline',
    active: true,
    status: 'started',
  },
];

const mockV2StatusResponse = {
  status: 'started',
  errors: [],
  components: [
    {
      name: 'processor',
      type: 'stream-processor',
      version: '2.0.0',
      status: 'running',
      errors: [],
    },
  ],
};

// Expected transformed response for V2
const mockV2ResponseSuccess = {
  status: 'started',
  errors: [],
  components: [
    {
      name: 'processor',
      type: 'stream-processor',
      version: '2.0.0',
      status: 'running',
      errors: [],
    },
  ],
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /rdi/:id/pipeline/status', () => {
  describe('V1 API', () => {
    [
      {
        name: 'Should be success if rdi with :id is in db and client GetPipelineStatus succeeds (V1)',
        endpoint: () => endpoint(testRdiIdV1),
        statusCode: 200,
        checkFn: ({ body }) => {
          expect(body).to.eql(mockV1ResponseSuccess);
        },
        before: async () => {
          await localDb.generateRdis({ id: testRdiIdV1, url: testRdiUrlV1 }, 1);
          // Mock V2 info endpoint to return 404 (fall back to V1)
          nock(testRdiUrlV1).get(`/${RdiUrlV2.GetInfo}`).query(true).reply(404);
          nock(testRdiUrlV1).post(`/${RdiUrl.Login}`).query(true).reply(200, {
            access_token: mockedAccessToken,
          });
          nock(testRdiUrlV1)
            .get(`/${RdiUrl.GetPipelineStatus}`)
            .query(true)
            .reply(200, mockV1ApiResponse);
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
        name: 'Should throw error if client getPipelineStatus will not succeed (V1)',
        endpoint: () => endpoint(testRdiIdV1),
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
          await localDb.generateRdis({ id: testRdiIdV1, url: testRdiUrlV1 }, 1);
          // Mock V2 info endpoint to return 404 (fall back to V1)
          nock(testRdiUrlV1).get(`/${RdiUrlV2.GetInfo}`).query(true).reply(404);
          nock(testRdiUrlV1).post(`/${RdiUrl.Login}`).query(true).reply(200, {
            access_token: mockedAccessToken,
          });
          nock(testRdiUrlV1)
            .get(`/${RdiUrl.GetPipelineStatus}`)
            .query(true)
            .reply(401, {
              message: 'Request failed with status code 401',
              detail: 'Unauthorized',
            });
        },
      },
    ].forEach(mainCheckFn);
  });

  describe('V2 API', () => {
    [
      {
        name: 'Should be success if rdi with :id is in db and client GetPipelineStatus succeeds (V2)',
        endpoint: () => endpoint(testRdiIdV2),
        statusCode: 200,
        checkFn: ({ body }) => {
          expect(body).to.eql(mockV2ResponseSuccess);
        },
        before: async () => {
          await localDb.generateRdis({ id: testRdiIdV2, url: testRdiUrlV2 }, 1);
          // Mock V2 info endpoint to return success (use V2 client)
          nock(testRdiUrlV2)
            .get(`/${RdiUrlV2.GetInfo}`)
            .query(true)
            .reply(200, mockV2InfoResponse);
          nock(testRdiUrlV2).post(`/${RdiUrl.Login}`).query(true).reply(200, {
            access_token: mockedAccessToken,
          });
          // Mock V2 pipelines endpoint for selectPipeline()
          nock(testRdiUrlV2)
            .get(`/${RdiUrlV2.GetPipelines}`)
            .query(true)
            .reply(200, mockV2PipelinesResponse);
          // Mock V2 pipeline status endpoint
          nock(testRdiUrlV2)
            .get(`/${RdiUrlV2.GetPipelineStatus('test-pipeline')}`)
            .query(true)
            .reply(200, mockV2StatusResponse);
        },
      },
      {
        name: 'Should throw error if client getPipelineStatus will not succeed (V2)',
        endpoint: () => endpoint(testRdiIdV2),
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
          await localDb.generateRdis({ id: testRdiIdV2, url: testRdiUrlV2 }, 1);
          // Mock V2 info endpoint to return success (use V2 client)
          nock(testRdiUrlV2)
            .get(`/${RdiUrlV2.GetInfo}`)
            .query(true)
            .reply(200, mockV2InfoResponse);
          nock(testRdiUrlV2).post(`/${RdiUrl.Login}`).query(true).reply(200, {
            access_token: mockedAccessToken,
          });
          // Mock V2 pipelines endpoint for selectPipeline()
          nock(testRdiUrlV2)
            .get(`/${RdiUrlV2.GetPipelines}`)
            .query(true)
            .reply(200, mockV2PipelinesResponse);
          // Mock V2 pipeline status endpoint with error
          nock(testRdiUrlV2)
            .get(`/${RdiUrlV2.GetPipelineStatus('test-pipeline')}`)
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
