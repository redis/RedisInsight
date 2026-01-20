import { RdiUrl } from 'src/modules/rdi/constants';
import { sign } from 'jsonwebtoken';
import { RdiPipeline } from 'src/modules/rdi/models';
import { nock, Joi } from '../../../helpers/test';
import { describe, expect, deps, getMainCheckFn } from '../../deps';

const { localDb, request, server, constants } = deps;

const testRdiId = 'someTEST_pipeline';
const notExistedRdiId = 'notExisted';
const testRdiUrl = 'http://rdilocal.test';

const endpoint = (id: string) =>
  request(server).get(`/${constants.API.RDI}/${id || testRdiId}/pipeline`);

const job1 = {
  name: 'job1',
  source: {
    redis: {},
  },
  transform: [],
  output: [],
};
const job2 = {
  name: 'job2',
  source: {
    redis: {},
  },
  transform: [],
  output: [],
};

const mockResponseSuccess = {
  targets: {
    target: {},
  },
  jobs: [job1, job2],
  sources: { psql: {} },
  processors: {},
};

const expectedPipeline: RdiPipeline = Object.assign(new RdiPipeline(), {
  config: {
    targets: {
      target: {},
    },
    sources: { psql: {} },
  },
  jobs: {
    [job1.name]: (({ name: _name, ...job }) => job)(job1),
    [job2.name]: (({ name: _name, ...job }) => job)(job2),
  },
});

const responseSchema = Joi.object()
  .keys({
    jobs: Joi.object().required(),
    config: Joi.object().required(),
  })
  .required()
  .strict(true);

const mockedAccessToken = sign(
  { exp: Math.trunc(Date.now() / 1000) + 3600 },
  'test',
);

const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /rdi/:id/pipeline/', () => {
  [
    {
      name: 'Should be success if rdi with :id is in db',
      responseSchema,
      statusCode: 200,
      checkFn: ({ body }) => {
        expect(body).to.eql(expectedPipeline);
      },
      before: async () => {
        await localDb.generateRdis({ id: testRdiId, url: testRdiUrl }, 1);
        nock(testRdiUrl).post(`/${RdiUrl.Login}`).query(true).reply(200, {
          access_token: mockedAccessToken,
        });
        nock(testRdiUrl)
          .get(`/${RdiUrl.GetPipeline}`)
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
      name: 'Should throw error if client getPipeline will not succeed',
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
        nock(testRdiUrl).get(`/${RdiUrl.GetPipeline}`).query(true).reply(401, {
          message: 'Request failed with status code 401',
          detail: 'Unauthorized',
        });
      },
    },
  ].forEach(mainCheckFn);
});
