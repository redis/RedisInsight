import {
  mockCapiUnauthorizedError,
  mockCloudApiBadRequestExceptionResponse,
  mockCloudApiUnauthorizedExceptionResponse,
  mockCloudUserAccount,
  mockCloudUserSafe,
  mockSmApiBadRequestError,
} from 'src/__mocks__';
import {
  describe,
  deps,
  requirements,
  Joi,
  getMainCheckFn,
  expect,
  nock,
} from '../../deps';
import { initApiUserProfileNockScope, initSMApiNockScope } from '../constants';

const { request, server } = deps;

const endpoint = (account = mockCloudUserAccount.id) =>
  request(server).put(`/cloud/me/accounts/${account}/current`);

const responseSchema = Joi.object()
  .keys({
    id: Joi.number().required(),
    name: Joi.string().required(),
    currentAccountId: Joi.number().required(),
    accounts: Joi.array()
      .items(
        Joi.object().keys({
          id: Joi.number().required(),
          name: Joi.string().required(),
        }),
      )
      .required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('PUT /cloud/me/accounts/:id/current', () => {
  requirements('rte.serverType=local');

  beforeEach(async () => {
    nock.cleanAll();
    initApiUserProfileNockScope();
  });

  describe('Common', () => {
    [
      {
        name: 'Should switch account',
        before: () => {
          initSMApiNockScope()
            .post(`/accounts/setcurrent/${mockCloudUserAccount.id}`)
            .reply(200, {});
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body).to.deepEqualIgnoreUndefined(mockCloudUserSafe);
        },
      },
      {
        name: 'Should switch account from 2nd attempt',
        before: () => {
          initSMApiNockScope()
            .post(`/accounts/setcurrent/${mockCloudUserAccount.id}`)
            .reply(401, mockCapiUnauthorizedError)
            .post(`/accounts/setcurrent/${mockCloudUserAccount.id}`)
            .reply(200, {});
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body).to.deepEqualIgnoreUndefined(mockCloudUserSafe);
        },
      },
      {
        name: 'Should throw 401 error',
        before: () => {
          initSMApiNockScope()
            .post(`/accounts/setcurrent/${mockCloudUserAccount.id}`)
            .replyWithError(mockCapiUnauthorizedError)
            .post(`/accounts/setcurrent/${mockCloudUserAccount.id}`)
            .replyWithError(mockCapiUnauthorizedError);
        },
        statusCode: 401,
        checkFn: ({ body }) => {
          expect(body).to.deep.eq(mockCloudApiUnauthorizedExceptionResponse);
        },
      },
      {
        name: 'Should throw 400 error without retry',
        before: () => {
          initSMApiNockScope()
            .post(`/accounts/setcurrent/${mockCloudUserAccount.id}`)
            .replyWithError(mockSmApiBadRequestError);
        },
        statusCode: 400,
        checkFn: ({ body }) => {
          expect(body).to.deep.eq(mockCloudApiBadRequestExceptionResponse);
        },
      },
    ].map(mainCheckFn);
  });
});
