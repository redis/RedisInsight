import { RdiUrl } from 'src/modules/rdi/constants';
import { sign } from 'jsonwebtoken';
import { describe, expect, deps, getMainCheckFn } from '../deps';
import { nock } from '../../helpers/test';

const { localDb, request, server, constants } = deps;

const testRdiId = 'someTEST';
const notExistedRdiId = 'notExisted';
const testRdiUrl = 'http://rdilocal.test';

const endpoint = (id) =>
  request(server).get(`/${constants.API.RDI}/${id || testRdiId}/connect`);

const mockedAccessToken = sign(
  { exp: Math.trunc(Date.now() / 1000) + 3600 },
  'test',
);

const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /rdi/:id/connect', () => {
  [
    {
      name: 'Should be success if rdi with :id is in db',
      statusCode: 200,
      before: async () => {
        await localDb.generateRdis({ id: testRdiId, url: testRdiUrl }, 1);
        nock(testRdiUrl).post(`/${RdiUrl.Login}`).query(true).reply(200, {
          access_token: mockedAccessToken,
        });
      },
    },
    {
      name: 'Should throw notFoundError if rdi with id in params does not exist',
      endpoint: () => endpoint(notExistedRdiId),
      statusCode: 404,
      before: async () => {
        expect(await localDb.getRdiById(notExistedRdiId)).to.eql(null);
      },
    },
  ].forEach(mainCheckFn);
});
