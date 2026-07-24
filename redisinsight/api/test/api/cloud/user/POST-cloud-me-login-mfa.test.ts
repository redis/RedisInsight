import { mockCloudApiCsrfToken } from 'src/__mocks__';
import {
  describe,
  deps,
  requirements,
  Joi,
  getMainCheckFn,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  nock,
  expect,
} from '../../deps';
import { initSMApiNockScope } from '../constants';

const { request, server } = deps;

const endpoint = () => request(server).post('/cloud/me/login/mfa');

const dataSchema = Joi.object({
  code: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
}).strict();

const validInputData = { code: '123456' };

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /cloud/me/login/mfa', () => {
  requirements('rte.serverType=local');

  beforeEach(async () => {
    nock.cleanAll();
  });

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should complete the login by re-sending /login with the mfa code',
        data: validInputData,
        before: () => {
          // matcher only matches when mfa_code + mfa_type are in the body,
          // so a missing code would fail the request
          initSMApiNockScope()
            .post(
              '/login',
              (body) =>
                body.mfa_code === validInputData.code &&
                body.mfa_type === 'Totp',
            )
            .query(true)
            .reply(200, {}, { 'set-cookie': 'JSESSIONID=jsessionid' })
            .get('/csrf')
            .reply(200, { csrfToken: mockCloudApiCsrfToken });
        },
        statusCode: 200,
        checkFn: () => {
          expect(nock.isDone()).to.eq(true);
        },
      },
    ].map(mainCheckFn);
  });
});
