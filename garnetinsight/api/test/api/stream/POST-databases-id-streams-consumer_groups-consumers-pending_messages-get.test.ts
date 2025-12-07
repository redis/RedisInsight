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
    `/${constants.API.DATABASES}/${instanceId}/streams/consumer-groups/consumers/pending-messages/get`,
  );

const pendingMessageSchema = Joi.object()
  .keys({
    id: Joi.string().required(),
    consumerName: JoiRedisString.required(),
    idle: Joi.number().required(),
    delivered: Joi.number().required(),
  })
  .strict();

const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  groupName: Joi.string().required().messages({
    'any.required': '{#label} should not be empty',
  }),
  consumerName: Joi.string().required().messages({
    'any.required': '{#label} should not be empty',
  }),
  count: Joi.number(),
  start: Joi.string(),
  end: Joi.string(),
}).strict();

const validInputData = {
  keyName: constants.TEST_STREAM_KEY_1,
  groupName: constants.TEST_STREAM_GROUP_1,
  consumerName: constants.TEST_STREAM_CONSUMER_1,
};

const responseSchema = Joi.array().items(pendingMessageSchema).required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/streams/consumer-groups/consumers/pending-messages/get', () => {
  requirements('!rte.crdt');

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
        '>',
      ]);
    });

    [
      {
        name: 'Should get pending messages from buff (return utf8)',
        query: {
          encoding: 'utf8',
        },
        data: {
          keyName: constants.TEST_STREAM_KEY_BIN_BUF_OBJ_1,
          groupName: constants.TEST_STREAM_GROUP_BIN_BUF_OBJ_1,
          consumerName: constants.TEST_STREAM_CONSUMER_BIN_BUF_OBJ_1,
          count: 1,
        },
        responseSchema,
        checkFn: ({ body }) => {
          const [message] = body;
          expect(body.length).to.eql(1);
          expect(message.id).to.be.a('string');
          expect(message.consumerName).to.eq(
            constants.TEST_STREAM_CONSUMER_BIN_UTF8_1,
          );
          expect(message.idle).to.gte(0);
          expect(message.delivered).to.eq(1);
        },
      },
      {
        name: 'Should get pending messages from buff (return buff)',
        query: {
          encoding: 'buff',
        },
        data: {
          keyName: constants.TEST_STREAM_KEY_BIN_BUF_OBJ_1,
          groupName: constants.TEST_STREAM_GROUP_BIN_BUF_OBJ_1,
          consumerName: constants.TEST_STREAM_CONSUMER_BIN_BUF_OBJ_1,
          count: 1,
        },
        responseSchema,
        checkFn: ({ body }) => {
          const [message] = body;
          expect(body.length).to.eql(1);
          expect(message.id).to.be.a('string');
          expect(message.consumerName).to.deep.eq(
            constants.TEST_STREAM_CONSUMER_BIN_BUF_OBJ_1,
          );
          expect(message.idle).to.gte(0);
          expect(message.delivered).to.eq(1);
        },
      },
      {
        name: 'Should get pending messages from ascii (return ascii)',
        query: {
          encoding: 'ascii',
        },
        data: {
          keyName: constants.TEST_STREAM_KEY_BIN_BUF_OBJ_1,
          groupName: constants.TEST_STREAM_GROUP_BIN_BUF_OBJ_1,
          consumerName: constants.TEST_STREAM_CONSUMER_BIN_BUF_OBJ_1,
          count: 1,
        },
        responseSchema,
        checkFn: ({ body }) => {
          const [message] = body;
          expect(body.length).to.eql(1);
          expect(message.id).to.be.a('string');
          expect(message.consumerName).to.deep.eq(
            constants.TEST_STREAM_CONSUMER_BIN_ASCII_1,
          );
          expect(message.idle).to.gte(0);
          expect(message.delivered).to.eq(1);
        },
      },
    ].map(mainCheckFn);
  });

  describe('Main', () => {
    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });

    describe('Common', () => {
      beforeEach(async () => {
        await rte.data.generateStrings(true);
        await rte.data.generateStreamsWithoutStrictMode();
      });

      beforeEach(async () => {
        await rte.data.sendCommand('xadd', [
          constants.TEST_STREAM_KEY_1,
          constants.TEST_STREAM_ID_3,
          constants.TEST_STREAM_FIELD_1,
          constants.TEST_STREAM_VALUE_1,
        ]);
        await rte.data.sendCommand('xadd', [
          constants.TEST_STREAM_KEY_1,
          constants.TEST_STREAM_ID_4,
          constants.TEST_STREAM_FIELD_1,
          constants.TEST_STREAM_VALUE_1,
        ]);
        await rte.data.sendCommand('xreadgroup', [
          'GROUP',
          constants.TEST_STREAM_GROUP_1,
          constants.TEST_STREAM_CONSUMER_1,
          'STREAMS',
          constants.TEST_STREAM_KEY_1,
          '>',
        ]);
        await rte.data.sendCommand('xreadgroup', [
          'GROUP',
          constants.TEST_STREAM_GROUP_1,
          constants.TEST_STREAM_CONSUMER_2,
          'STREAMS',
          constants.TEST_STREAM_KEY_1,
          '>',
        ]);
      });

      [
        {
          name: 'Should return empty array when no pending messages',
          data: {
            keyName: constants.TEST_STREAM_KEY_1,
            groupName: constants.TEST_STREAM_GROUP_2,
            consumerName: constants.TEST_STREAM_CONSUMER_2,
          },
          responseSchema,
          responseBody: [],
        },
        {
          name: 'Should return pending messages list with only 1 message',
          data: {
            keyName: constants.TEST_STREAM_KEY_1,
            groupName: constants.TEST_STREAM_GROUP_1,
            consumerName: constants.TEST_STREAM_CONSUMER_1,
            count: 1,
          },
          responseSchema,
          checkFn: ({ body }) => {
            const [message] = body;
            expect(body.length).to.eql(1);
            expect(message.id).to.eq(constants.TEST_STREAM_ID_3);
            expect(message.consumerName).to.eq(
              constants.TEST_STREAM_CONSUMER_1,
            );
            expect(message.idle).to.gte(0);
            expect(message.delivered).to.eq(1);
          },
        },
        {
          name: 'Should return pending messages list (2 messages)',
          data: {
            keyName: constants.TEST_STREAM_KEY_1,
            groupName: constants.TEST_STREAM_GROUP_1,
            consumerName: constants.TEST_STREAM_CONSUMER_1,
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.length).to.eql(2);
          },
        },
        {
          name: 'Should return pending messages list (0 messages) filtered by end',
          data: {
            keyName: constants.TEST_STREAM_KEY_1,
            groupName: constants.TEST_STREAM_GROUP_1,
            consumerName: constants.TEST_STREAM_CONSUMER_1,
            start: '-',
            end: '99-0',
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.length).to.eql(0);
          },
        },
        {
          name: 'Should return pending messages list (1 messages) filtered by end',
          data: {
            keyName: constants.TEST_STREAM_KEY_1,
            groupName: constants.TEST_STREAM_GROUP_1,
            consumerName: constants.TEST_STREAM_CONSUMER_1,
            start: '-',
            end: '300-0',
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.length).to.eql(1);
          },
        },
        {
          name: 'Should return pending messages list (0 messages) filtered by start',
          data: {
            keyName: constants.TEST_STREAM_KEY_1,
            groupName: constants.TEST_STREAM_GROUP_1,
            consumerName: constants.TEST_STREAM_CONSUMER_1,
            start: '999-0',
            end: '+',
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.length).to.eql(0);
          },
        },
        {
          name: 'Should return pending messages list (1 messages) filtered by start',
          data: {
            keyName: constants.TEST_STREAM_KEY_1,
            groupName: constants.TEST_STREAM_GROUP_1,
            consumerName: constants.TEST_STREAM_CONSUMER_1,
            start: '400-0',
            end: '+',
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.length).to.eql(1);
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
      ].map(mainCheckFn);
    });
  });
});
