import {
  describe,
  deps,
  requirements,
  Joi,
  getMainCheckFn,
  expect,
  nock,
} from './../../deps';
import { mockCapiUnauthorizedError, mockCloudUserSafe } from 'src/__mocks__';
import { initApiUserProfileNockScope, initSMApiNockScope } from '../constants';

const { request, server } = deps;

const endpoint = () => request(server).get(`/cloud/me`);

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

describe('GET /cloud/me', () => {
  requirements('rte.serverType=local');

  beforeEach(async () => {
    nock.cleanAll();
    initApiUserProfileNockScope();
  });

  describe('Common', () => {
    [
      {
        name: 'Should get user profile',
        responseSchema,
        checkFn: ({ body }) => {
          expect(body).to.deepEqualIgnoreUndefined(mockCloudUserSafe);
        },
      },
    ].map(mainCheckFn);
  });

  describe('MFA challenge', () => {
    // The API keeps one shared, in-memory cloud session for the whole suite. By
    // the time this runs a prior test has logged in, so the session holds an
    // apiSessionId + cached user and GET /cloud/me returns that cached profile
    // without ever calling /login. Reset it to a pre-login state first: a failed
    // account switch (and its failed re-login) drives the auth-retry to
    // invalidate the apiSessionId and cached user, so the next GET /cloud/me
    // performs a real login and reaches the challenge.
    beforeEach(async () => {
      nock.cleanAll();
      initSMApiNockScope()
        .persist()
        .post('/accounts/setcurrent/1')
        .reply(401, mockCapiUnauthorizedError)
        .get('/users/me')
        .reply(401, mockCapiUnauthorizedError)
        .post('/login')
        .query(true)
        .reply(401, mockCapiUnauthorizedError);
      await request(server).put('/cloud/me/accounts/1/current');
      nock.cleanAll();
    });

    [
      {
        name: 'Should surface the cloud mfa-required challenge as errorCode 11025 without retrying /login',
        before: () => {
          initSMApiNockScope()
            // stubbed once: a retried /login would not match and fail the test
            .post('/login')
            .query(true)
            .reply(
              401,
              {
                errors: {
                  code: 'user-mfa-required',
                  params: JSON.stringify({
                    smsFactorAvailable: false,
                    totpFactorAvailable: true,
                  }),
                },
              },
              { 'set-cookie': 'JSESSIONID=mfa-challenge' },
            );
        },
        statusCode: 401,
        checkFn: ({ body }: any) => {
          // errorCode the frontend interceptor keys off to keep the session
          expect(body.errorCode).to.eq(11025);
          expect(body.error).to.eq('CloudApiMfaRequired');
          // factors arrive as a JSON string in errors.params; assert it parses
          expect(body.factors).to.deep.eq({
            smsFactorAvailable: false,
            totpFactorAvailable: true,
          });
        },
      },
    ].map(mainCheckFn);
  });
});
