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
    `/${constants.API.DATABASES}/${instanceId}/streams/consumer-groups`,
  );

const consumerGroupSchema = Joi.object().keys({
  name: Joi.string().label('consumerGroups.0.name').required(),
  lastDeliveredId: Joi.string()
    .label('consumerGroups.0.lastDeliveredId')
    .required(),
});

const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  consumerGroups: Joi.array().items(consumerGroupSchema).required().messages({
    'array.sparse': 'entries must be either object or array',
    'array.base': 'property {#label} must be either object or array',
    'any.required': '{#label} should not be empty',
  }),
}).strict();

const validInputData = {
  keyName: constants.TEST_STREAM_KEY_1,
  consumerGroups: [
    {
      name: 'group-1',
      lastDeliveredId: '$',
    },
  ],
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/streams/consumer-groups', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    beforeEach(async () => {
      await rte.data.generateBinKeys(true);
      await rte.data.sendCommand('xgroup', [
        'destroy',
        constants.TEST_STREAM_KEY_BIN_BUFFER_1,
        constants.TEST_STREAM_GROUP_BIN_BUFFER_1,
      ]);
    });

    describe('Redis version < 7', () => {
      requirements('rte.version<7.0');
      [
        {
          name: 'Should create consumer group from buff',
          data: {
            keyName: constants.TEST_STREAM_KEY_BIN_BUF_OBJ_1,
            consumerGroups: [
              {
                name: constants.TEST_STREAM_GROUP_BIN_BUF_OBJ_1,
                lastDeliveredId: constants.TEST_STREAM_ID_1,
              },
            ],
          },
          statusCode: 201,
          after: async () => {
            const groups = await rte.data.sendCommand(
              'xinfo',
              ['groups', constants.TEST_STREAM_KEY_BIN_BUFFER_1],
              null,
            );
            const expected = [
              [
                Buffer.from('name'),
                constants.TEST_STREAM_GROUP_BIN_BUFFER_1,
                Buffer.from('consumers'),
                0,
                Buffer.from('pending'),
                0,
                Buffer.from('last-delivered-id'),
                Buffer.from(constants.TEST_STREAM_ID_1),
              ],
            ];

            expect(groups).to.deep.eq(expected);
          },
        },
        {
          name: 'Should create consumer group from ascii',
          data: {
            keyName: constants.TEST_STREAM_KEY_BIN_ASCII_1,
            consumerGroups: [
              {
                name: constants.TEST_STREAM_GROUP_BIN_ASCII_1,
                lastDeliveredId: constants.TEST_STREAM_ID_1,
              },
            ],
          },
          statusCode: 201,
          after: async () => {
            const groups = await rte.data.sendCommand(
              'xinfo',
              ['groups', constants.TEST_STREAM_KEY_BIN_BUFFER_1],
              null,
            );
            expect(groups).to.deep.eq([
              [
                Buffer.from('name'),
                constants.TEST_STREAM_GROUP_BIN_BUFFER_1,
                Buffer.from('consumers'),
                0,
                Buffer.from('pending'),
                0,
                Buffer.from('last-delivered-id'),
                Buffer.from(constants.TEST_STREAM_ID_1),
              ],
            ]);
          },
        },
      ].map(mainCheckFn);
    });

    describe('Redis version >= 7', () => {
      requirements('rte.version>=7.0');
      [
        {
          name: 'Should create consumer group from buff',
          data: {
            keyName: constants.TEST_STREAM_KEY_BIN_BUF_OBJ_1,
            consumerGroups: [
              {
                name: constants.TEST_STREAM_GROUP_BIN_BUF_OBJ_1,
                lastDeliveredId: constants.TEST_STREAM_ID_1,
              },
            ],
          },
          statusCode: 201,
          after: async () => {
            const groups = await rte.data.sendCommand(
              'xinfo',
              ['groups', constants.TEST_STREAM_KEY_BIN_BUFFER_1],
              null,
            );
            const expected = [
              [
                Buffer.from('name'),
                constants.TEST_STREAM_GROUP_BIN_BUFFER_1,
                Buffer.from('consumers'),
                0,
                Buffer.from('pending'),
                0,
                Buffer.from('last-delivered-id'),
                Buffer.from(constants.TEST_STREAM_ID_1),
                Buffer.from('entries-read'),
                null,
                Buffer.from('lag'),
                1,
              ],
            ];

            expect(groups).to.deep.eq(expected);
          },
        },
        {
          name: 'Should create consumer group from ascii',
          data: {
            keyName: constants.TEST_STREAM_KEY_BIN_ASCII_1,
            consumerGroups: [
              {
                name: constants.TEST_STREAM_GROUP_BIN_ASCII_1,
                lastDeliveredId: constants.TEST_STREAM_ID_1,
              },
            ],
          },
          statusCode: 201,
          after: async () => {
            const groups = await rte.data.sendCommand(
              'xinfo',
              ['groups', constants.TEST_STREAM_KEY_BIN_BUFFER_1],
              null,
            );
            expect(groups).to.deep.eq([
              [
                Buffer.from('name'),
                constants.TEST_STREAM_GROUP_BIN_BUFFER_1,
                Buffer.from('consumers'),
                0,
                Buffer.from('pending'),
                0,
                Buffer.from('last-delivered-id'),
                Buffer.from(constants.TEST_STREAM_ID_1),
                Buffer.from('entries-read'),
                null,
                Buffer.from('lag'),
                1,
              ],
            ]);
          },
        },
      ].map(mainCheckFn);
    });
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
        await rte.client.del(constants.TEST_STREAM_KEY_2);
        await rte.client.xadd(constants.TEST_STREAM_KEY_2, '*', 'f', 'v');
      });

      describe('Redis version < 7', () => {
        requirements('rte.version<7.0');
        [
          {
            name: 'Should create single consumer group',
            data: {
              keyName: constants.TEST_STREAM_KEY_2,
              consumerGroups: [
                {
                  name: constants.TEST_STREAM_GROUP_1,
                  lastDeliveredId: constants.TEST_STREAM_ID_1,
                },
              ],
            },
            before: async () => {
              const groups = await rte.data.sendCommand('xinfo', [
                'groups',
                constants.TEST_STREAM_KEY_2,
              ]);
              expect(groups.length).to.eq(0);
            },
            statusCode: 201,
            after: async () => {
              const groups = await rte.data.sendCommand('xinfo', [
                'groups',
                constants.TEST_STREAM_KEY_2,
              ]);
              expect(groups).to.deep.eq([
                [
                  'name',
                  constants.TEST_STREAM_GROUP_1,
                  'consumers',
                  0,
                  'pending',
                  0,
                  'last-delivered-id',
                  constants.TEST_STREAM_ID_1,
                ],
              ]);
            },
          },
          {
            name: 'Should create multiple consumer groups',
            data: {
              keyName: constants.TEST_STREAM_KEY_2,
              consumerGroups: [
                {
                  name: constants.TEST_STREAM_GROUP_1,
                  lastDeliveredId: constants.TEST_STREAM_ID_1,
                },
                {
                  name: constants.TEST_STREAM_GROUP_2,
                  lastDeliveredId: constants.TEST_STREAM_ID_1,
                },
              ],
            },
            before: async () => {
              const groups = await rte.data.sendCommand('xinfo', [
                'groups',
                constants.TEST_STREAM_KEY_2,
              ]);
              expect(groups.length).to.eq(0);
            },
            statusCode: 201,
            after: async () => {
              const groups = await rte.data.sendCommand('xinfo', [
                'groups',
                constants.TEST_STREAM_KEY_2,
              ]);
              expect(groups).to.deep.eq([
                [
                  'name',
                  constants.TEST_STREAM_GROUP_1,
                  'consumers',
                  0,
                  'pending',
                  0,
                  'last-delivered-id',
                  constants.TEST_STREAM_ID_1,
                ],
                [
                  'name',
                  constants.TEST_STREAM_GROUP_2,
                  'consumers',
                  0,
                  'pending',
                  0,
                  'last-delivered-id',
                  constants.TEST_STREAM_ID_1,
                ],
              ]);
            },
          },
        ].forEach(mainCheckFn);
      });

      describe('Redis version >= 7', () => {
        requirements('rte.version>=7.0');
        [
          {
            name: 'Should create single consumer group',
            data: {
              keyName: constants.TEST_STREAM_KEY_2,
              consumerGroups: [
                {
                  name: constants.TEST_STREAM_GROUP_1,
                  lastDeliveredId: constants.TEST_STREAM_ID_1,
                },
              ],
            },
            before: async () => {
              const groups = await rte.data.sendCommand('xinfo', [
                'groups',
                constants.TEST_STREAM_KEY_2,
              ]);
              expect(groups.length).to.eq(0);
            },
            statusCode: 201,
            after: async () => {
              const groups = await rte.data.sendCommand('xinfo', [
                'groups',
                constants.TEST_STREAM_KEY_2,
              ]);
              expect(groups).to.deep.eq([
                [
                  'name',
                  constants.TEST_STREAM_GROUP_1,
                  'consumers',
                  0,
                  'pending',
                  0,
                  'last-delivered-id',
                  constants.TEST_STREAM_ID_1,
                  'entries-read',
                  null,
                  'lag',
                  1,
                ],
              ]);
            },
          },
          {
            name: 'Should create multiple consumer groups',
            data: {
              keyName: constants.TEST_STREAM_KEY_2,
              consumerGroups: [
                {
                  name: constants.TEST_STREAM_GROUP_1,
                  lastDeliveredId: constants.TEST_STREAM_ID_1,
                },
                {
                  name: constants.TEST_STREAM_GROUP_2,
                  lastDeliveredId: constants.TEST_STREAM_ID_1,
                },
              ],
            },
            before: async () => {
              const groups = await rte.data.sendCommand('xinfo', [
                'groups',
                constants.TEST_STREAM_KEY_2,
              ]);
              expect(groups.length).to.eq(0);
            },
            statusCode: 201,
            after: async () => {
              const groups = await rte.data.sendCommand('xinfo', [
                'groups',
                constants.TEST_STREAM_KEY_2,
              ]);
              expect(groups).to.deep.eq([
                [
                  'name',
                  constants.TEST_STREAM_GROUP_1,
                  'consumers',
                  0,
                  'pending',
                  0,
                  'last-delivered-id',
                  constants.TEST_STREAM_ID_1,
                  'entries-read',
                  null,
                  'lag',
                  1,
                ],
                [
                  'name',
                  constants.TEST_STREAM_GROUP_2,
                  'consumers',
                  0,
                  'pending',
                  0,
                  'last-delivered-id',
                  constants.TEST_STREAM_ID_1,
                  'entries-read',
                  null,
                  'lag',
                  1,
                ],
              ]);
            },
          },
        ].forEach(mainCheckFn);
      });

      [
        {
          name: 'Should return 409 Conflict error when group exists',
          data: {
            keyName: constants.TEST_STREAM_KEY_1,
            consumerGroups: [
              {
                name: constants.TEST_STREAM_GROUP_1,
                lastDeliveredId: constants.TEST_STREAM_ID_1,
              },
            ],
          },
          statusCode: 409,
          responseBody: {
            statusCode: 409,
            error: 'Conflict',
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
          statusCode: 201,
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
          name: 'Should throw error if no permissions for "xgroup" command',
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
