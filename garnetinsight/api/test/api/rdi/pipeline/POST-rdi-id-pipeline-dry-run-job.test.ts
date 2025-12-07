import { RdiUrl } from 'src/modules/rdi/constants';
import { sign } from 'jsonwebtoken';
import { RdiDyRunJobStatus } from 'src/modules/rdi/models';
import { describe, expect, deps, getMainCheckFn } from '../../deps';
import { Joi, nock } from '../../../helpers/test';

const { localDb, request, server, constants } = deps;

const testRdiId = 'someTEST_pipeline_dry_run_job';
const notExistedRdiId = 'notExisted';
const testRdiUrl = 'http://rdilocal.test';

const endpoint = (id) =>
  request(server).post(
    `/${constants.API.RDI}/${id || testRdiId}/pipeline/dry-run-job`,
  );

const validInputData = {
  input_data: { some: 'data' },
  job: { name: 'job1' },
};

const responseSchema = Joi.object()
  .keys({
    transformations: Joi.object().keys({
      status: Joi.string().allow('success', 'failed').required(),
      data: Joi.object()
        .keys({
          connections: Joi.any(),
          dataStreams: Joi.any(),
          processingPerformance: Joi.any(),
          rdiPipelineStatus: Joi.any(),
          clients: Joi.any(),
        })
        .optional(),
      error: Joi.string().optional(),
    }),
    commands: Joi.object().keys({
      status: Joi.string()
        .allow(RdiDyRunJobStatus.Success, RdiDyRunJobStatus.Fail)
        .required(),
      data: Joi.any().optional(),
      error: Joi.any().optional(),
    }),
  })
  .required()
  .strict(true);

const mockResponse = {
  transformations: {
    status: RdiDyRunJobStatus.Success,
  },
  commands: {
    status: RdiDyRunJobStatus.Success,
  },
};

const mockedAccessToken = sign(
  { exp: Math.trunc(Date.now() / 1000) + 3600 },
  'test',
);

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /rdi/:id/pipeline/dry-run-job', () => {
  [
    {
      name: 'Should be success if rdi with :id is in db',
      responseSchema,
      data: validInputData,
      statusCode: 201,
      checkFn: ({ body }) => {
        expect(body).to.eql(mockResponse);
      },
      before: async () => {
        await localDb.generateRdis({ id: testRdiId, url: testRdiUrl }, 1);
        nock(testRdiUrl).post(`/${RdiUrl.Login}`).query(true).reply(200, {
          access_token: mockedAccessToken,
        });
        nock(testRdiUrl)
          .post(`/${RdiUrl.DryRunJob}`)
          .query(true)
          .reply(200, mockResponse);
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
      name: 'Should throw error if client dryRunJob will not succeed',
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
        nock(testRdiUrl).post(`/${RdiUrl.DryRunJob}`).query(true).reply(401, {
          message: 'Request failed with status code 401',
          detail: 'Unauthorized',
        });
      },
    },
  ].forEach(mainCheckFn);
});
