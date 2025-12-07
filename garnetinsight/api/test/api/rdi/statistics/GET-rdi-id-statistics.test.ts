import { RdiUrl } from 'src/modules/rdi/constants';
import { sign } from 'jsonwebtoken';
import { Joi, nock } from '../../../helpers/test';
import { describe, expect, deps, getMainCheckFn } from '../../deps';

const { localDb, request, server, constants } = deps;

const testRdiId = 'someTEST_statistics';
const notExistedRdiId = 'notExisted';
const testRdiUrl = 'http://rdilocal.test';

const endpoint = (id: string, sections = null) => {
  let url = `/${constants.API.RDI}/${id || testRdiId}/statistics`;
  if (sections) {
    url += `?sections=${sections}`;
  }
  return request(server).get(url);
};

const mockResponseSuccess = {
  connections: 'connections info',
  dataStreams: 'data streams',
  processingPerformance: {},
  rdiPipelineStatus: 'success',
  clients: '',
};

const responseSchema = Joi.object()
  .keys({
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
  })
  .required()
  .strict(true);

const mockedAccessToken = sign(
  { exp: Math.trunc(Date.now() / 1000) + 3600 },
  'test',
);
nock(testRdiUrl).post(`/${RdiUrl.Login}`).query(true).reply(200, {
  access_token: mockedAccessToken,
});

const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /rdi/:id/statistics/', () => {
  [
    {
      name: 'Should be success if rdi with :id is in db and client GetStatistics succeeds',
      responseSchema,
      statusCode: 200,
      checkFn: ({ body }) => {
        expect(body).to.eql({ status: 'success', data: mockResponseSuccess });
      },
      before: async () => {
        await localDb.generateRdis({ id: testRdiId, url: testRdiUrl }, 1);
        nock(testRdiUrl)
          .get(`/${RdiUrl.GetStatistics}`)
          .query(true)
          .reply(200, mockResponseSuccess);
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
      name: 'Should not throw error even if client GetStatistics will not succeed',
      responseSchema,
      statusCode: 200,
      checkFn: ({ body }) => {
        expect(body).to.eql({
          status: 'failed',
          error: 'Request failed with status code 401',
        });
      },
      before: async () => {
        await localDb.generateRdis({ id: testRdiId, url: testRdiUrl }, 1);
        nock(testRdiUrl)
          .get(`/${RdiUrl.GetStatistics}`)
          .query(true)
          .reply(401, {
            message: 'Request failed with status code 401',
          });
      },
    },
  ].forEach(mainCheckFn);
});
