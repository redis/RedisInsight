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
  beforeEach,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/streams/entries`,
  );

const entryFieldSchema = Joi.object().keys({
  name: Joi.string().label('entries.0.fields.0.name').required(),
  value: Joi.string().label('entries.0.fields.0.value').required(),
});

const entrySchema = Joi.object().keys({
  id: Joi.string().label('entries.0.id').required(),
  fields: Joi.array()
    .label('entries.0.fields')
    .items(entryFieldSchema)
    .required()
    .messages({
      'array.base': '{#label} must be an array',
    }),
});

const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  entries: Joi.array().items(entrySchema).required().messages({
    'array.sparse': 'entries must be either object or array',
    'array.base': '{#label} must be either object or array',
  }),
}).strict();

const responseSchema = Joi.object()
  .keys({
    keyName: Joi.string().required(),
    entries: Joi.array().items(Joi.string()).required(),
  })
  .required();

const validInputData = {
  keyName: constants.TEST_STREAM_KEY_1,
  entries: [
    {
      id: '*',
      fields: [
        {
          name: constants.TEST_STREAM_FIELD_1,
          value: constants.TEST_STREAM_VALUE_1,
        },
        {
          name: constants.TEST_STREAM_FIELD_2,
          value: constants.TEST_STREAM_VALUE_2,
        },
      ],
    },
  ],
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/streams/entries', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    beforeEach(async () => await rte.data.generateBinKeys(true));

    [
      {
        name: 'Should add entries to stream from buff',
        data: {
          keyName: constants.TEST_STREAM_KEY_BIN_BUF_OBJ_1,
          entries: [
            {
              id: '*',
              fields: [
                {
                  name: constants.TEST_STREAM_FIELD_BIN_BUF_OBJ_1,
                  value: constants.TEST_STREAM_VALUE_BIN_BUF_OBJ_1,
                },
              ],
            },
          ],
        },
        responseSchema,
        after: async () => {
          expect(
            await rte.client.xlen(constants.TEST_STREAM_KEY_BIN_BUFFER_1),
          ).to.eq(2);
          const [entry] = await rte.data.sendCommand(
            'xrevrange',
            [constants.TEST_STREAM_KEY_BIN_BUFFER_1, '+', '-', 'COUNT', 1],
            null,
          );
          expect(entry[1]).to.eql([
            constants.TEST_STREAM_FIELD_BIN_BUFFER_1,
            constants.TEST_STREAM_VALUE_BIN_BUFFER_1,
          ]);
        },
      },
      {
        name: 'Should add entries to stream from ascii',
        data: {
          keyName: constants.TEST_STREAM_KEY_BIN_ASCII_1,
          entries: [
            {
              id: '*',
              fields: [
                {
                  name: constants.TEST_STREAM_FIELD_BIN_ASCII_1,
                  value: constants.TEST_STREAM_VALUE_BIN_ASCII_1,
                },
              ],
            },
          ],
        },
        responseSchema,
        after: async () => {
          expect(
            await rte.client.xlen(constants.TEST_STREAM_KEY_BIN_BUFFER_1),
          ).to.eq(2);
          const [entry] = await rte.data.sendCommand(
            'xrevrange',
            [constants.TEST_STREAM_KEY_BIN_BUFFER_1, '+', '-', 'COUNT', 1],
            null,
          );
          expect(entry[1]).to.eql([
            constants.TEST_STREAM_FIELD_BIN_BUFFER_1,
            constants.TEST_STREAM_VALUE_BIN_BUFFER_1,
          ]);
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
          name: 'Should add entry',
          data: {
            keyName: constants.TEST_STREAM_KEY_1,
            entries: [
              {
                id: '*',
                fields: [
                  {
                    name: constants.TEST_STREAM_FIELD_1,
                    value: constants.TEST_STREAM_FIELD_1,
                  },
                ],
              },
            ],
          },
          responseSchema,
          after: async () => {
            expect(await rte.client.xlen(constants.TEST_STREAM_KEY_1)).to.eq(2);
            const [entry] = await rte.client.xrevrange(
              constants.TEST_STREAM_KEY_1,
              '+',
              '-',
              'COUNT',
              1,
            );
            expect(entry[1]).to.eql([
              constants.TEST_STREAM_FIELD_1,
              constants.TEST_STREAM_FIELD_1,
            ]);
          },
        },
        {
          name: 'Should add multiple entries and multiple fields',
          data: {
            keyName: constants.TEST_STREAM_KEY_1,
            entries: [
              {
                id: '*',
                fields: [
                  {
                    name: constants.TEST_STREAM_FIELD_1,
                    value: constants.TEST_STREAM_FIELD_1,
                  },
                  {
                    name: constants.TEST_STREAM_FIELD_2,
                    value: constants.TEST_STREAM_FIELD_2,
                  },
                ],
              },
              {
                id: '*',
                fields: [
                  {
                    name: constants.TEST_STREAM_VALUE_1,
                    value: constants.TEST_STREAM_VALUE_1,
                  },
                  {
                    name: constants.TEST_STREAM_VALUE_2,
                    value: constants.TEST_STREAM_VALUE_2,
                  },
                ],
              },
            ],
          },
          responseSchema,
          after: async () => {
            expect(await rte.client.xlen(constants.TEST_STREAM_KEY_1)).to.eq(4);
            const [entry1, entry2] = await rte.client.xrevrange(
              constants.TEST_STREAM_KEY_1,
              '+',
              '-',
              'COUNT',
              2,
            );
            expect(entry1[1]).to.eql([
              constants.TEST_STREAM_VALUE_1,
              constants.TEST_STREAM_VALUE_1,
              constants.TEST_STREAM_VALUE_2,
              constants.TEST_STREAM_VALUE_2,
            ]);
            expect(entry2[1]).to.eql([
              constants.TEST_STREAM_FIELD_1,
              constants.TEST_STREAM_FIELD_1,
              constants.TEST_STREAM_FIELD_2,
              constants.TEST_STREAM_FIELD_2,
            ]);
          },
        },
        {
          name: 'Should return BadRequest when try to work with non-stream type',
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
          name: 'Should return BadRequest when id specified is less then the latest one',
          data: {
            ...validInputData,
            entries: [
              {
                ...validInputData.entries[0],
                id: '100',
              },
            ],
          },
          statusCode: 400,
          responseBody: {
            statusCode: 400,
            error: 'Bad Request',
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
      before(async () => rte.data.setAclUserRules('~* +@all'));

      [
        {
          name: 'Should add entries',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            ...validInputData,
          },
          responseSchema,
        },
        {
          name: 'Should throw error if no permissions for "exists" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            ...validInputData,
            keyName: constants.getRandomString(),
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -exists'),
        },
        {
          name: 'Should throw error if no permissions for "xadd" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            ...validInputData,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -xadd'),
        },
      ].map(mainCheckFn);
    });
  });
});
