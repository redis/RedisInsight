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
    `/${constants.API.DATABASES}/${instanceId}/streams/consumer-groups/consumers/get`,
  );

const consumerSchema = Joi.object()
  .keys({
    name: JoiRedisString.required(),
    idle: Joi.number().required(),
    pending: Joi.number().required(),
  })
  .strict();

const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  groupName: Joi.string().required().messages({
    'any.required': '{#label} should not be empty',
  }),
}).strict();

const validInputData = {
  keyName: constants.TEST_STREAM_KEY_1,
  groupName: constants.TEST_STREAM_GROUP_1,
};

const responseSchema = Joi.array().items(consumerSchema).min(0).required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/streams/consumer-groups/consumers/get', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    beforeEach(async () => {
      await rte.data.generateBinKeys(true);
      await rte.data.sendCommand('xreadgroup', [
        'GROUP',
        constants.TEST_STREAM_GROUP_BIN_BUFFER_1,
        constants.TEST_STREAM_CONSUMER_BIN_BUFFER_1,
        'STREAMS',
        constants.TEST_STREAM_KEY_BIN_BUFFER_1,
        constants.TEST_STREAM_ID_1,
      ]);
    });

    [
      {
        name: 'Should get stream consumer from buff (return utf8)',
        query: {
          encoding: 'utf8',
        },
        data: {
          keyName: constants.TEST_STREAM_KEY_BIN_BUF_OBJ_1,
          groupName: constants.TEST_STREAM_GROUP_BIN_BUF_OBJ_1,
        },
        responseSchema,
        checkFn: ({ body }) => {
          const [consumer] = body;
          expect(consumer.name).to.eq(
            constants.TEST_STREAM_CONSUMER_BIN_UTF8_1,
          );
          expect(consumer.pending).to.eq(0);
          expect(consumer.idle).to.gte(0);
        },
      },
      {
        name: 'Should get stream consumer from buff (return buff)',
        query: {
          encoding: 'buffer',
        },
        data: {
          keyName: constants.TEST_STREAM_KEY_BIN_BUF_OBJ_1,
          groupName: constants.TEST_STREAM_GROUP_BIN_BUF_OBJ_1,
        },
        responseSchema,
        checkFn: ({ body }) => {
          const [consumer] = body;
          expect(consumer.name).to.deep.eq(
            constants.TEST_STREAM_CONSUMER_BIN_BUF_OBJ_1,
          );
          expect(consumer.pending).to.eq(0);
          expect(consumer.idle).to.gte(0);
        },
      },
      {
        name: 'Should get stream consumer from ascii (return ascii)',
        query: {
          encoding: 'ascii',
        },
        data: {
          keyName: constants.TEST_STREAM_KEY_BIN_ASCII_1,
          groupName: constants.TEST_STREAM_GROUP_BIN_ASCII_1,
        },
        responseSchema,
        checkFn: ({ body }) => {
          const [consumer] = body;
          expect(consumer.name).to.deep.eq(
            constants.TEST_STREAM_CONSUMER_BIN_ASCII_1,
          );
          expect(consumer.pending).to.eq(0);
          expect(consumer.idle).to.gte(0);
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
      beforeEach(async () => {
        await rte.data.sendCommand('xreadgroup', [
          'GROUP',
          constants.TEST_STREAM_GROUP_1,
          constants.TEST_STREAM_CONSUMER_1,
          'STREAMS',
          constants.TEST_STREAM_KEY_1,
          constants.TEST_STREAM_ID_1,
        ]);
      });

      [
        {
          name: 'Should return empty array when no consumers',
          data: {
            keyName: constants.TEST_STREAM_KEY_1,
            groupName: constants.TEST_STREAM_GROUP_2,
          },
          responseSchema,
          responseBody: [],
        },
        {
          name: 'Should return consumers list',
          data: {
            keyName: constants.TEST_STREAM_KEY_1,
            groupName: constants.TEST_STREAM_GROUP_1,
          },
          responseSchema,
          checkFn: ({ body }) => {
            const [consumer] = body;
            expect(consumer.name).to.eq(constants.TEST_STREAM_CONSUMER_1);
            expect(consumer.pending).to.eq(0);
            expect(consumer.idle).to.gte(0);
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
          name: 'Should return NotFound error if group does not exists',
          data: {
            ...validInputData,
            groupName: constants.getRandomString(),
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Consumer Group with such name was not found.',
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
