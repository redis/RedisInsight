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

const { localDb, request, server, constants } = deps;

const testRdiId = 'someTestId';
const testRdiUrl = 'http://rdilocal.test';
const testRdiName = 'Test Rdi Name';
const testRdiBase = { id: testRdiId, name: testRdiName, url: testRdiUrl };

const endpoint = (id) =>
  request(server).patch(`/${constants.API.RDI}/${id || testRdiId}`);

const dataSchema = Joi.object()
  .keys({
    name: Joi.string().max(500).allow(null),
    username: Joi.string().allow(null),
    password: Joi.string().allow(null),
  })
  .messages({ 'any.required': '{#label} should not be empty' })
  .strict(true);

const validInputData = {
  name: 'Updated Rdi',
  username: 'rdiUsername Updated',
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
const loginNock = nock(testRdiUrl).post(`/${RdiUrl.Login}`).query(true);

describe('PATCH /rdi/:id', () => {
  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).forEach(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });
  describe('Common', () => {
    [
      {
        name: 'Should update rdi name',
        responseSchema,
        data: { name: validInputData.name },
        statusCode: 200,
        checkFn: ({ body }) => {
          expect(body.name).to.eql(validInputData.name);
          expect(body.id).to.eql(testRdiId);
        },
        before: async () => {
          await localDb.generateRdis(testRdiBase, 1);
          loginNock.reply(200, {
            access_token: mockedAccessToken,
          });
        },
      },
      {
        name: 'Should update rdi username',
        responseSchema,
        data: { username: validInputData.username },
        statusCode: 200,
        checkFn: ({ body }) => {
          expect(body.name).to.eql(testRdiName);
          expect(body.username).to.eql(validInputData.username);
        },
        before: async () => {
          await localDb.generateRdis(testRdiBase, 1);
          loginNock.reply(200, {
            access_token: mockedAccessToken,
          });
        },
      },
      {
        name: 'Should throw error if rdiClient was not connected',
        statusCode: 401,
        data: validInputData,
        responseBody: {
          message: 'Unauthorized',
          statusCode: 401,
          error: 'RdiUnauthorized',
          errorCode: 11402,
        },
        before: () => {
          loginNock.reply(401, {
            message: 'Unauthorized',
            detail: 'Unauthorized',
          });
        },
      },
    ].forEach(mainCheckFn);
  });
});
