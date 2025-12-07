import {
  expect,
  describe,
  it,
  before,
  deps,
  Joi,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  validateApiCall,
  getMainCheckFn,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).patch(
    `/${constants.API.DATABASES}/${instanceId}/rejson-rl/arrappend`,
  );

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  data: Joi.array()
    .items(
      Joi.string()
        .required()
        .messages({
          'any.required': '{#label} should be a correct serialized json string',
        })
        .label('data'),
    )
    .required()
    .messages({
      'any.required': '{#label} must be an array',
      'array.sparse': 'each value in data must be a string',
    }),
  path: Joi.string().required().messages({
    'any.required': '{#label} should not be empty',
  }),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  data: [JSON.stringify(constants.getRandomString())],
  path: '$',
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('PATCH /databases/:instanceId/rejson-rl/arrappend', () => {
  requirements('rte.modules.rejson');

  before(async () => await rte.data.generateKeys(true));

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    describe('re-json v1', () => {
      requirements('rte.modules.rejson.version<20000');
      [
        {
          name: 'Should append array (from buf)',
          data: {
            keyName: {
              type: 'Buffer',
              data: [...Buffer.from(constants.TEST_REJSON_KEY_2)],
            },
            data: [JSON.stringify([1, 2])],
            path: '.',
          },
          statusCode: 200,
          after: async () => {
            const json = JSON.parse(
              await rte.data.executeCommand(
                'json.get',
                constants.TEST_REJSON_KEY_2,
                '.',
              ),
            );
            expect(json)
              .to
              .eql([...constants.TEST_REJSON_VALUE_2, [1, 2]]);
          },
        },
        {
          name: 'Should append multiple items into array.array',
          data: {
            keyName: constants.TEST_REJSON_KEY_2,
            data: [JSON.stringify(null), JSON.stringify('somestring')],
            path: '[1]',
          },
          statusCode: 200,
          before: async () => {
            const json = JSON.parse(
              await rte.data.executeCommand(
                'json.get',
                constants.TEST_REJSON_KEY_2,
                '[1]',
              ),
            );
            expect(json)
              .to
              .eql([1, 2]);
          },
          after: async () => {
            const json = JSON.parse(
              await rte.data.executeCommand(
                'json.get',
                constants.TEST_REJSON_KEY_2,
                '.',
              ),
            );
            expect(json)
              .to
              .eql([
                ...constants.TEST_REJSON_VALUE_2,
                [1, 2, null, 'somestring'],
              ]);
          },
        },
        {
          name: 'Should return BadRequest if try to append to not array item',
          data: {
            keyName: constants.TEST_REJSON_KEY_2,
            data: [JSON.stringify(constants.getRandomString())],
            path: '[1][1]',
          },
          // todo: handle error to return 400 instead of 500 (BE)
          statusCode: 500,
          responseBody: {
            statusCode: 500,
          },
        },
        {
          name: 'Should return NotFound error if instance id does not exists',
          endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
          data: {
            keyName: constants.TEST_REJSON_KEY_2,
            data: JSON.stringify(constants.getRandomString()),
            path: '.',
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

    describe('re-json v2', () => {
      requirements('rte.modules.rejson.version>=20000');
      [
        {
          name: 'Should append array (from buf)',
          data: {
            keyName: {
              type: 'Buffer',
              data: [...Buffer.from(constants.TEST_REJSON_KEY_2)],
            },
            data: [JSON.stringify([1, 2])],
            path: '.',
          },
          statusCode: 200,
          after: async () => {
            const json = JSON.parse(
              await rte.data.executeCommand(
                'json.get',
                constants.TEST_REJSON_KEY_2,
                '$',
              ),
            );
            expect(json[0])
              .to
              .eql([...constants.TEST_REJSON_VALUE_2, [1, 2]]);
          },
        },
        {
          name: 'Should append multiple items into array.array',
          data: {
            keyName: constants.TEST_REJSON_KEY_2,
            data: [JSON.stringify(null), JSON.stringify('somestring')],
            path: '$[1]',
          },
          statusCode: 200,
          before: async () => {
            const json = JSON.parse(
              await rte.data.executeCommand(
                'json.get',
                constants.TEST_REJSON_KEY_2,
                '$[1]',
              ),
            );
            expect(json[0])
              .to
              .eql([1, 2]);
          },
          after: async () => {
            const json = JSON.parse(
              await rte.data.executeCommand(
                'json.get',
                constants.TEST_REJSON_KEY_2,
                '$',
              ),
            );
            expect(json[0])
              .to
              .eql([
                ...constants.TEST_REJSON_VALUE_2,
                [1, 2, null, 'somestring'],
              ]);
          },
        },
        {
          name: 'Should return BadRequest if try to append to not array item',
          data: {
            keyName: constants.TEST_REJSON_KEY_2,
            data: [JSON.stringify(constants.getRandomString())],
            path: '$[1][1]',
          },
          // todo: handle error to return 400 instead of 500 (BE)
          statusCode: 500,
          responseBody: {
            statusCode: 500,
          },
        },
        {
          name: 'Should return NotFound error if instance id does not exists',
          endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
          data: {
            keyName: constants.TEST_REJSON_KEY_2,
            data: JSON.stringify(constants.getRandomString()),
            path: '$',
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
  });

  describe('ACL', () => {
    requirements('rte.acl');
    before(async () => rte.data.setAclUserRules('~* +@all'));

    [
      {
        name: 'Should modify json',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_REJSON_KEY_2,
          data: [JSON.stringify([1, 2])],
          path: '.',
        },
        statusCode: 200,
      },
      {
        name: 'Should throw error if no permissions for "json.arrappend" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_REJSON_KEY_2,
          data: [JSON.stringify(constants.getRandomString())],
          path: '.',
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -json.arrappend'),
      },
    ].map(mainCheckFn);
  });
});
