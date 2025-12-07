import { RdiUrl } from 'src/modules/rdi/constants';
import { sign } from 'jsonwebtoken';
import {
  describe,
  expect,
  deps,
  getMainCheckFn,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
} from '../deps';
import { Joi, nock } from '../../helpers/test';

const { request, server, constants } = deps;

const endpoint = () => request(server).post(`/${constants.API.RDI}`);

const dataSchema = Joi.object()
  .keys({
    url: Joi.string().required(),
    name: Joi.string().max(500).required(),
    username: Joi.string().allow(null),
    password: Joi.string().allow(null),
  })
  .messages({ 'any.required': '{#label} should not be empty' })
  .strict(true);

const validInputData = {
  url: 'http://testRDI.test/',
  name: 'Created Rdi',
  username: 'rdiUsername',
  password: constants.TEST_KEYTAR_PASSWORD,
};

const responseSchema = Joi.object()
  .keys({
    id: Joi.string().required(),
    url: Joi.string().required(),
    name: Joi.string().max(500).required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    lastConnection: Joi.string().isoDate().required(),
    version: Joi.string().required(),
  })
  .required()
  .strict(true);

const mockedAccessToken = sign(
  { exp: Math.trunc(Date.now() / 1000) + 3600 },
  'test',
);

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /rdi', () => {
  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).forEach(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });
  describe('Common', () => {
    [
      {
        name: 'Should create rdi from valid data',
        responseSchema,
        data: validInputData,
        statusCode: 201,
        checkFn: ({ body }) => {
          expect(body.name).to.eql(validInputData.name);
        },
        before: () => {
          nock(validInputData.url)
            .post(`/${RdiUrl.Login}`)
            .query(true)
            .reply(200, {
              access_token: mockedAccessToken,
            });
          nock(validInputData.url)
            .get(`/${RdiUrl.GetPipelineStatus}`)
            .query(true)
            .reply(200, {
              version: '2.17',
            });
        },
      },
      {
        name: 'Should throw error if rdiClient was not connected',
        statusCode: 401,
        data: validInputData,
        before: () => {
          nock(validInputData.url)
            .post(`/${RdiUrl.Login}`)
            .query(true)
            .reply(401, {
              message: 'Unauthorized',
              detail: 'Unauthorized',
            });
        },
        responseBody: {
          message: 'Unauthorized',
          statusCode: 401,
          error: 'RdiUnauthorized',
          errorCode: 11402,
        },
      },
    ].forEach(mainCheckFn);
  });
});
