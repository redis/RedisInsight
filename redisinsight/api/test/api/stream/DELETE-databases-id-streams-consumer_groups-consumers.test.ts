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
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).delete(
    `/${constants.API.DATABASES}/${instanceId}/streams/consumer-groups/consumers`,
  );

const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  groupName: Joi.string().required().messages({
    'any.required': '{#label} should not be empty',
  }),
  consumerNames: Joi.array()
    .items(
      Joi.string().required().label('consumerNames').messages({
        'any.required': '{#label} should not be empty',
      }),
    )
    .min(1)
    .required()
    .messages({
      'array.sparse': 'each value in consumerNames should not be empty',
    }),
}).strict();

const validInputData = {
  keyName: constants.TEST_STREAM_KEY_1,
  groupName: constants.TEST_STREAM_GROUP_1,
  consumerNames: [constants.TEST_STREAM_GROUP_1],
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('DELETE /databases/:instanceId/streams/consumer-groups/consumers', () => {
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
        name: 'Should remove stream consumer from buff',
        data: {
          keyName: constants.TEST_STREAM_KEY_BIN_BUF_OBJ_1,
          groupName: constants.TEST_STREAM_GROUP_BIN_BUF_OBJ_1,
          consumerNames: [constants.TEST_STREAM_CONSUMER_BIN_BUF_OBJ_1],
        },
        before: async () => {
          const consumers = await rte.data.sendCommand('xinfo', [
            'consumers',
            constants.TEST_STREAM_KEY_BIN_BUFFER_1,
            constants.TEST_STREAM_GROUP_BIN_BUFFER_1,
          ]);
          expect(consumers.length).to.eq(1);
        },
        after: async () => {
          const consumers = await rte.data.sendCommand('xinfo', [
            'consumers',
            constants.TEST_STREAM_KEY_BIN_BUFFER_1,
            constants.TEST_STREAM_GROUP_BIN_BUFFER_1,
          ]);
          expect(consumers.length).to.eq(0);
        },
      },
      {
        name: 'Should remove stream consumer from ascii',
        data: {
          keyName: constants.TEST_STREAM_KEY_BIN_ASCII_1,
          groupName: constants.TEST_STREAM_GROUP_BIN_ASCII_1,
          consumerNames: [constants.TEST_STREAM_CONSUMER_BIN_ASCII_1],
        },
        before: async () => {
          const consumers = await rte.data.sendCommand('xinfo', [
            'consumers',
            constants.TEST_STREAM_KEY_BIN_BUFFER_1,
            constants.TEST_STREAM_GROUP_BIN_BUFFER_1,
          ]);
          expect(consumers.length).to.eq(1);
        },
        after: async () => {
          const consumers = await rte.data.sendCommand('xinfo', [
            'consumers',
            constants.TEST_STREAM_KEY_BIN_BUFFER_1,
            constants.TEST_STREAM_GROUP_BIN_BUFFER_1,
          ]);
          expect(consumers.length).to.eq(0);
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
        await rte.data.sendCommand('xreadgroup', [
          'GROUP',
          constants.TEST_STREAM_GROUP_1,
          constants.TEST_STREAM_CONSUMER_2,
          'STREAMS',
          constants.TEST_STREAM_KEY_1,
          constants.TEST_STREAM_ID_2,
        ]);
      });

      [
        {
          name: 'Should remove single consumer',
          data: {
            keyName: constants.TEST_STREAM_KEY_1,
            groupName: constants.TEST_STREAM_GROUP_1,
            consumerNames: [constants.TEST_STREAM_CONSUMER_1],
          },
          before: async () => {
            const consumers = await rte.data.sendCommand('xinfo', [
              'consumers',
              constants.TEST_STREAM_KEY_1,
              constants.TEST_STREAM_GROUP_1,
            ]);
            expect(consumers.length).to.eq(2);
          },
          after: async () => {
            const consumers = await rte.data.sendCommand('xinfo', [
              'consumers',
              constants.TEST_STREAM_KEY_1,
              constants.TEST_STREAM_GROUP_1,
            ]);
            expect(consumers.length).to.eq(1);
          },
        },
        {
          name: 'Should remove multiple consumers',
          data: {
            keyName: constants.TEST_STREAM_KEY_1,
            groupName: constants.TEST_STREAM_GROUP_1,
            consumerNames: [
              constants.TEST_STREAM_CONSUMER_1,
              constants.TEST_STREAM_CONSUMER_2,
            ],
          },
          before: async () => {
            const consumers = await rte.data.sendCommand('xinfo', [
              'consumers',
              constants.TEST_STREAM_KEY_1,
              constants.TEST_STREAM_GROUP_1,
            ]);
            expect(consumers.length).to.eq(2);
          },
          after: async () => {
            const consumers = await rte.data.sendCommand('xinfo', [
              'consumers',
              constants.TEST_STREAM_KEY_1,
              constants.TEST_STREAM_GROUP_1,
            ]);
            expect(consumers.length).to.eq(0);
          },
        },
        {
          name: 'Should remove single consumers and skip not existing consumers',
          data: {
            keyName: constants.TEST_STREAM_KEY_1,
            groupName: constants.TEST_STREAM_GROUP_1,
            consumerNames: [
              constants.TEST_STREAM_CONSUMER_1,
              constants.getRandomString(),
              constants.getRandomString(),
            ],
          },
          before: async () => {
            const consumers = await rte.data.sendCommand('xinfo', [
              'consumers',
              constants.TEST_STREAM_KEY_1,
              constants.TEST_STREAM_GROUP_1,
            ]);
            expect(consumers.length).to.eq(2);
          },
          after: async () => {
            const consumers = await rte.data.sendCommand('xinfo', [
              'consumers',
              constants.TEST_STREAM_KEY_1,
              constants.TEST_STREAM_GROUP_1,
            ]);
            expect(consumers.length).to.eq(1);
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
          name: 'Should throw error if no permissions for "xgroup)" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            ...validInputData,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -xgroup'),
        },
      ].map(mainCheckFn);
    });
  });
});
