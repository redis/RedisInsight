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
    beforeEach(async () => {
      // the outer hook stubs /login -> 200; drop it so /login can challenge
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
            )
            // a valid apiSessionId on the shared session would skip /login; a
            // 401 makes the auth-retry drop it so the challenge reaches /login
            .get('/users/me')
            .reply(401, mockCapiUnauthorizedError)
            // likewise, a session still missing csrf would stop before /login
            .get('/csrf')
            .reply(200, { csrfToken: 'csrf' });
        },
        statusCode: 401,
        checkFn: ({ body }) => {
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
