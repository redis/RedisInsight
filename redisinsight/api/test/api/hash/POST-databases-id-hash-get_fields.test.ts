import {
  expect,
  describe,
  it,
  before,
  deps,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  validateApiCall,
  getMainCheckFn,
} from '../deps';
const { server, request, constants, rte } = deps;
import * as Joi from 'joi';

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/hash/get-fields`,
  );

// input data schema // todo: review BE for transform true -> 1
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  cursor: Joi.number().integer().min(0).allow(true).required().messages({
    'any.required': 'cursor should not be empty',
  }),
  count: Joi.number().integer().min(1).allow(true, null).messages({
    'any.required': 'count should not be empty',
  }),
  match: Joi.string().allow(null),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  cursor: 0,
  count: 1,
  match: constants.getRandomString(),
};

const responseSchema = Joi.object()
  .keys({
    keyName: Joi.string().required(),
    total: Joi.number().integer().required(),
    fields: Joi.array().items(
      Joi.object().keys({
        field: Joi.string().required(),
        value: Joi.string().required(),
        expire: Joi.number(),
      }),
    ),
    nextCursor: Joi.number().integer().required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/hash/get-fields', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    beforeEach(() => rte.data.generateBinKeys(true));

    [
      {
        name: 'Should find by buff (return utf8)',
        query: {
          encoding: 'utf8',
        },
        data: {
          keyName: constants.TEST_HASH_KEY_BIN_BUF_OBJ_1,
          cursor: 0,
          count: 15,
          match: constants.TEST_HASH_FIELD_BIN_UTF8_1.slice(0, -10) + '*',
        },
        responseBody: {
          keyName: constants.TEST_HASH_KEY_BIN_UTF8_1,
          total: 1,
          nextCursor: 0,
          fields: [
            {
              field: constants.TEST_HASH_FIELD_BIN_UTF8_1,
              value: constants.TEST_HASH_VALUE_BIN_UTF8_1,
            },
          ],
        },
      },
      {
        name: 'Should find by buff (return buffer)',
        query: {
          encoding: 'buffer',
        },
        data: {
          keyName: constants.TEST_HASH_KEY_BIN_BUF_OBJ_1,
          cursor: 0,
          count: 15,
          match: constants.TEST_HASH_FIELD_BIN_UTF8_1.slice(0, -10) + '*',
        },
        responseBody: {
          keyName: constants.TEST_HASH_KEY_BIN_BUF_OBJ_1,
          total: 1,
          nextCursor: 0,
          fields: [
            {
              field: constants.TEST_HASH_FIELD_BIN_BUF_OBJ_1,
              value: constants.TEST_HASH_VALUE_BIN_BUF_OBJ_1,
            },
          ],
        },
      },
      {
        name: 'Should find by ascii (return ascii)',
        query: {
          encoding: 'ascii',
        },
        data: {
          keyName: constants.TEST_HASH_KEY_BIN_ASCII_1,
          cursor: 0,
          count: 15,
          match: constants.TEST_HASH_FIELD_BIN_ASCII_1.slice(0, -20) + '*',
        },
        responseBody: {
          keyName: constants.TEST_HASH_KEY_BIN_ASCII_1,
          total: 1,
          nextCursor: 0,
          fields: [
            {
              field: constants.TEST_HASH_FIELD_BIN_ASCII_1,
              value: constants.TEST_HASH_VALUE_BIN_ASCII_1,
            },
          ],
        },
      },
    ].map(mainCheckFn);
  });

  describe('Main', () => {
    before(async () => await rte.data.generateKeys(true));

    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });

    describe('Common', () => {
      [
        {
          name: 'Should find by exact match',
          data: {
            keyName: constants.TEST_HASH_KEY_2,
            cursor: 0,
            count: 15,
            match: 'field_9',
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.keyName).to.eql(constants.TEST_HASH_KEY_2);
            expect(body.total).to.eql(3000);
            expect(body.fields.length).to.eql(1);
            expect(body.fields[0].field).to.eql('field_9');
            expect(body.fields[0].value).to.eql('value_9');
          },
        },
        {
          name: 'Should not find any field',
          data: {
            keyName: constants.TEST_HASH_KEY_2,
            cursor: 0,
            count: 15,
            match: 'field_9asd*',
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.keyName).to.eql(constants.TEST_HASH_KEY_2);
            expect(body.total).to.eql(3000);
            expect(body.fields.length).to.eql(0);
          },
        },
        {
          name: 'Should query 15 fields',
          data: {
            keyName: constants.TEST_HASH_KEY_2,
            cursor: 0,
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.keyName).to.eql(constants.TEST_HASH_KEY_2);
            expect(body.total).to.eql(3000);
            expect(body.fields.length).to.gte(15);
            expect(body.fields.length).to.lt(3000);
          },
        },
        {
          name: 'Should query by * in the end',
          data: {
            keyName: constants.TEST_HASH_KEY_2,
            cursor: 0,
            count: 15,
            match: 'field_219*',
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.keyName).to.eql(constants.TEST_HASH_KEY_2);
            expect(body.total).to.eql(3000);
            expect(body.fields.length).to.eq(11);
          },
        },
        {
          name: 'Should query by * in the beginning',
          data: {
            keyName: constants.TEST_HASH_KEY_2,
            cursor: 0,
            count: 15,
            match: '*eld_9',
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.keyName).to.eql(constants.TEST_HASH_KEY_2);
            expect(body.total).to.eql(3000);
            expect(body.fields.length).to.eq(1);
            expect(body.fields[0].field).to.eql('field_9');
            expect(body.fields[0].value).to.eql('value_9');
          },
        },
        {
          name: 'Should query by * in the middle',
          data: {
            keyName: constants.TEST_HASH_KEY_2,
            cursor: 0,
            count: 15,
            match: 'f*eld_9',
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.keyName).to.eql(constants.TEST_HASH_KEY_2);
            expect(body.total).to.eql(3000);
            expect(body.fields.length).to.eq(1);
            expect(body.fields[0].field).to.eql('field_9');
            expect(body.fields[0].value).to.eql('value_9');
          },
        },
        {
          name: 'Should return NotFound error if key does not exists',
          data: {
            keyName: constants.getRandomString(),
            cursor: 0,
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Key with this name does not exist.',
          },
        },
        {
          name: 'Should return NotFound error if instance id does not exists',
          endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
          data: {
            keyName: constants.TEST_HASH_KEY_1,
            cursor: 0,
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Invalid database instance id.',
          },
        },
      ].map(mainCheckFn);

      describe('Search in huge number of fields', () => {
        requirements('rte.bigData');
        // number of hash fields inside existing data (1M fields)
        const NUMBER_OF_FIELDS = 1_000_000;

        [
          {
            name: 'Should find exact one key',
            data: {
              keyName: constants.TEST_HASH_HUGE_KEY,
              cursor: 0,
              count: 15,
              match: constants.TEST_HASH_HUGE_KEY_FIELD,
            },
            responseSchema,
            checkFn: ({ body }) => {
              expect(body.keyName).to.eql(constants.TEST_HASH_HUGE_KEY);
              expect(body.total).to.eql(NUMBER_OF_FIELDS);
              expect(body.fields.length).to.eq(1);
              expect(body.fields[0].field).to.eql(
                constants.TEST_HASH_HUGE_KEY_FIELD,
              );
              expect(body.fields[0].value).to.eql(
                constants.TEST_HASH_HUGE_KEY_VALUE,
              );
            },
          },
        ].map(mainCheckFn);
      });
    });

    describe('ACL', () => {
      requirements('rte.acl');
      before(async () => rte.data.setAclUserRules('~* +@all'));

      [
        {
          name: 'Should not delete member',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_HASH_KEY_1,
            cursor: 0,
          },
          responseSchema,
        },
        {
          name: 'Should throw error if no permissions for "hlen" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_HASH_KEY_1,
            cursor: 0,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -hlen'),
        },
        {
          name: 'Should throw error if no permissions for "hget" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_HASH_KEY_1,
            cursor: 0,
            match: 'asd',
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -hget'),
        },
        {
          name: 'Should throw error if no permissions for "hscan" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_HASH_KEY_1,
            cursor: 0,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -hscan'),
        },
      ].map(mainCheckFn);
    });
  });
});
