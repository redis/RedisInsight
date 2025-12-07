import {
  expect,
  describe,
  before,
  deps,
  Joi,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  getMainCheckFn,
  JoiRedisString,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/streams/consumer-groups/get`,
  );

const consumerGroupSchema = Joi.object().keys({
  name: JoiRedisString.required(),
  consumers: Joi.number().required(),
  pending: Joi.number().required(),
  lastDeliveredId: Joi.string().required(),
  smallestPendingId: Joi.string().allow(null).required(),
  greatestPendingId: Joi.string().allow(null).required(),
});

const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
}).strict();

const validInputData = {
  keyName: constants.TEST_STREAM_KEY_1,
};

const responseSchema = Joi.array().items(consumerGroupSchema).min(0).required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/streams/consumer-groups/get', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    beforeEach(() => rte.data.generateBinKeys(true));

    [
      {
        name: 'Should get consumer groups from buff (return utf8)',
        query: {
          encoding: 'utf8',
        },
        data: {
          keyName: constants.TEST_STREAM_KEY_BIN_BUF_OBJ_1,
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.length).to.eq(1);
          expect(body[0].name).to.eq(constants.TEST_STREAM_GROUP_BIN_UTF8_1);
          expect(body[0].consumers).to.eq(0);
          expect(body[0].pending).to.eq(0);
          expect(body[0].lastDeliveredId).to.eq(constants.TEST_STREAM_ID_1);
          expect(body[0].smallestPendingId).to.eq(null);
          expect(body[0].greatestPendingId).to.eq(null);
        },
      },
      {
        name: 'Should get consumer groups from buff (return buff)',
        query: {
          encoding: 'buffer',
        },
        data: {
          keyName: constants.TEST_STREAM_KEY_BIN_BUF_OBJ_1,
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.length).to.eq(1);
          expect(body[0].name).to.deep.eq(
            constants.TEST_STREAM_GROUP_BIN_BUF_OBJ_1,
          );
          expect(body[0].consumers).to.eq(0);
          expect(body[0].pending).to.eq(0);
          expect(body[0].lastDeliveredId).to.eq(constants.TEST_STREAM_ID_1);
          expect(body[0].smallestPendingId).to.eq(null);
          expect(body[0].greatestPendingId).to.eq(null);
        },
      },
      {
        name: 'Should get consumer groups from ascii (return ascii)',
        query: {
          encoding: 'ascii',
        },
        data: {
          keyName: constants.TEST_STREAM_KEY_BIN_BUF_OBJ_1,
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.length).to.eq(1);
          expect(body[0].name).to.eq(constants.TEST_STREAM_GROUP_BIN_ASCII_1);
          expect(body[0].consumers).to.eq(0);
          expect(body[0].pending).to.eq(0);
          expect(body[0].lastDeliveredId).to.eq(constants.TEST_STREAM_ID_1);
          expect(body[0].smallestPendingId).to.eq(null);
          expect(body[0].greatestPendingId).to.eq(null);
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
          name: 'Should return empty array when no consumer groups',
          data: {
            keyName: constants.TEST_STREAM_KEY_2,
          },
          responseSchema,
          responseBody: [],
        },
        {
          name: 'Should return groups list',
          data: {
            keyName: constants.TEST_STREAM_KEY_1,
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.length).to.eq(2);
            expect(body[0].name).to.eq(constants.TEST_STREAM_GROUP_1);
            expect(body[1].name).to.eq(constants.TEST_STREAM_GROUP_2);
            expect(body[1].consumers).to.eq(0);
            expect(body[1].pending).to.eq(0);
            expect(body[1].lastDeliveredId).to.eq(constants.TEST_STREAM_ID_1);
            expect(body[1].smallestPendingId).to.eq(null);
            expect(body[1].greatestPendingId).to.eq(null);
          },
        },
        {
          name: 'Should return BadRequest error if key has another type',
          data: {
            ...validInputData,
            keyName: constants.TEST_STRING_KEY_1,
          },
          statusCode: 400,
          responseBody: {
            statusCode: 400,
            error: 'Bad Request',
          },
        },
        {
          name: 'Should return NotFound error if key does not exists',
          data: {
            ...validInputData,
            keyName: constants.getRandomString(),
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
            ...validInputData,
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Invalid database instance id.',
          },
        },
      ].map(mainCheckFn);
    });

    describe('ACL', () => {
      requirements('rte.acl');

      before(async () => await rte.data.generateKeys(true));
      before(async () => rte.data.setAclUserRules('~* +@all'));

      [
        {
          name: 'Should create consumer group',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            ...validInputData,
          },
        },
        {
          name: 'Should throw error if no permissions for "exists" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            ...validInputData,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -exists'),
        },
        {
          name: 'Should throw error if no permissions for "xpending" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            ...validInputData,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -xpending'),
        },
        {
          name: 'Should throw error if no permissions for "xinfo" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            ...validInputData,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -xinfo'),
        },
      ].map(mainCheckFn);
    });
  });
});
