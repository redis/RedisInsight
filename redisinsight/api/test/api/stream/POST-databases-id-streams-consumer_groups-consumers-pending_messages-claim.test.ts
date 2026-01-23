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
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/streams/consumer-groups/consumers/pending-messages/claim`,
  );

const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  groupName: Joi.string().required().messages({
    'any.required': '{#label} should not be empty',
  }),
  consumerName: Joi.string().required().messages({
    'any.required': '{#label} should not be empty',
  }),
  entries: Joi.array()
    .items(
      Joi.string().required().label('entries').messages({
        'any.required': '{#label} should not be empty',
      }),
    )
    .required()
    .min(1)
    .messages({
      'array.sparse': 'each value in entries should not be empty',
    }),
  minIdleTime: Joi.number().integer().min(0),
  time: Joi.number().integer(),
  retryCount: Joi.number().integer().min(0),
  force: Joi.boolean(),
}).strict();

const validInputData = {
  keyName: constants.TEST_STREAM_KEY_1,
  groupName: constants.TEST_STREAM_GROUP_1,
  consumerName: constants.TEST_STREAM_GROUP_1,
  minIdleTime: 0,
  entries: [constants.TEST_STREAM_ID_1],
};

const responseSchema = Joi.object()
  .keys({
    affected: Joi.array().items(Joi.string()).required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/streams/consumer-groups/consumers/pending-messages/claim', () => {
  requirements('!rte.crdt');

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
        name: 'Should claim single entry',
        data: {
          keyName: {
            type: 'Buffer',
            data: [...Buffer.from(constants.TEST_STREAM_KEY_1)],
          },
          groupName: {
            type: 'Buffer',
            data: [...Buffer.from(constants.TEST_STREAM_GROUP_1)],
          },
          consumerName: {
            type: 'Buffer',
            data: [...Buffer.from(constants.TEST_STREAM_CONSUMER_2)],
          },
          entries: [
            {
              type: 'Buffer',
              data: [...Buffer.from(constants.TEST_STREAM_ID_3)],
            },
          ],
          force: true,
        },
        responseSchema,
        responseBody: { affected: [constants.TEST_STREAM_ID_3] },
        before: async () => {
          const consumerOneEntries = await rte.data.sendCommand('xpending', [
            constants.TEST_STREAM_KEY_1,
            constants.TEST_STREAM_GROUP_1,
            '-',
            '+',
            100,
            constants.TEST_STREAM_CONSUMER_1,
          ]);
          expect(consumerOneEntries.length).to.eql(2);
          const consumerTwoEntries = await rte.data.sendCommand('xpending', [
            constants.TEST_STREAM_KEY_1,
            constants.TEST_STREAM_GROUP_1,
            '-',
            '+',
            100,
            constants.TEST_STREAM_CONSUMER_2,
          ]);
          expect(consumerTwoEntries.length).to.eql(0);
        },
        after: async () => {
          const consumerOneEntries = await rte.data.sendCommand('xpending', [
            constants.TEST_STREAM_KEY_1,
            constants.TEST_STREAM_GROUP_1,
            '-',
            '+',
            100,
            constants.TEST_STREAM_CONSUMER_1,
          ]);
          expect(consumerOneEntries.length).to.eql(1);
          const consumerTwoEntries = await rte.data.sendCommand('xpending', [
            constants.TEST_STREAM_KEY_1,
            constants.TEST_STREAM_GROUP_1,
            '-',
            '+',
            100,
            constants.TEST_STREAM_CONSUMER_2,
          ]);
          expect(consumerTwoEntries.length).to.eql(1);
        },
      },
      {
        name: 'Should claim multiple entries',
        data: {
          keyName: constants.TEST_STREAM_KEY_1,
          groupName: constants.TEST_STREAM_GROUP_1,
          consumerName: constants.TEST_STREAM_CONSUMER_2,
          entries: [constants.TEST_STREAM_ID_3, constants.TEST_STREAM_ID_4],
          minIdleTime: 0,
          idle: 0,
          retryCount: 1,
        },
        responseSchema,
        responseBody: {
          affected: [constants.TEST_STREAM_ID_3, constants.TEST_STREAM_ID_4],
        },
        before: async () => {
          const consumerOneEntries = await rte.data.sendCommand('xpending', [
            constants.TEST_STREAM_KEY_1,
            constants.TEST_STREAM_GROUP_1,
            '-',
            '+',
            100,
            constants.TEST_STREAM_CONSUMER_1,
          ]);
          expect(consumerOneEntries.length).to.eql(2);
          const consumerTwoEntries = await rte.data.sendCommand('xpending', [
            constants.TEST_STREAM_KEY_1,
            constants.TEST_STREAM_GROUP_1,
            '-',
            '+',
            100,
            constants.TEST_STREAM_CONSUMER_2,
          ]);
          expect(consumerTwoEntries.length).to.eql(0);
        },
        after: async () => {
          const consumerOneEntries = await rte.data.sendCommand('xpending', [
            constants.TEST_STREAM_KEY_1,
            constants.TEST_STREAM_GROUP_1,
            '-',
            '+',
            100,
            constants.TEST_STREAM_CONSUMER_1,
          ]);
          expect(consumerOneEntries.length).to.eql(0);
          const consumerTwoEntries = await rte.data.sendCommand('xpending', [
            constants.TEST_STREAM_KEY_1,
            constants.TEST_STREAM_GROUP_1,
            '-',
            '+',
            100,
            constants.TEST_STREAM_CONSUMER_2,
          ]);
          expect(consumerTwoEntries.length).to.eql(2);
        },
      },
      {
        name: 'Should claim multiple entries out of known consumer',
        data: {
          keyName: constants.TEST_STREAM_KEY_1,
          groupName: constants.TEST_STREAM_GROUP_1,
          consumerName: constants.getRandomString(),
          entries: [constants.TEST_STREAM_ID_3, constants.TEST_STREAM_ID_4],
          minIdleTime: 0,
          time: 0,
          retryCount: 1,
        },
        responseSchema,
        responseBody: {
          affected: [constants.TEST_STREAM_ID_3, constants.TEST_STREAM_ID_4],
        },
        before: async () => {
          const consumerOneEntries = await rte.data.sendCommand('xpending', [
            constants.TEST_STREAM_KEY_1,
            constants.TEST_STREAM_GROUP_1,
            '-',
            '+',
            100,
            constants.TEST_STREAM_CONSUMER_1,
          ]);
          expect(consumerOneEntries.length).to.eql(2);
          const consumerTwoEntries = await rte.data.sendCommand('xpending', [
            constants.TEST_STREAM_KEY_1,
            constants.TEST_STREAM_GROUP_1,
            '-',
            '+',
            100,
            constants.TEST_STREAM_CONSUMER_2,
          ]);
          expect(consumerTwoEntries.length).to.eql(0);
        },
        after: async () => {
          const consumerOneEntries = await rte.data.sendCommand('xpending', [
            constants.TEST_STREAM_KEY_1,
            constants.TEST_STREAM_GROUP_1,
            '-',
            '+',
            100,
            constants.TEST_STREAM_CONSUMER_1,
          ]);
          expect(consumerOneEntries.length).to.eql(0);
          const consumerTwoEntries = await rte.data.sendCommand('xpending', [
            constants.TEST_STREAM_KEY_1,
            constants.TEST_STREAM_GROUP_1,
            '-',
            '+',
            100,
            constants.TEST_STREAM_CONSUMER_2,
          ]);
          expect(consumerTwoEntries.length).to.eql(0);
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
        name: 'Should throw error if no permissions for "xclaim" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          ...validInputData,
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -xclaim'),
      },
    ].map(mainCheckFn);
  });
});
