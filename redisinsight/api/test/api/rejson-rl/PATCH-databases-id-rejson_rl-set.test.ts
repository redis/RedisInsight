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
  request(server).patch(
    `/${constants.API.DATABASES}/${instanceId}/rejson-rl/set`,
  );

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  data: Joi.string().required().messages({
    'any.required': '{#label} should be a correct serialized json string',
  }),
  path: Joi.string().required().messages({
    'any.required': '{#label} should not be empty',
  }),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  data: JSON.stringify(constants.TEST_REJSON_VALUE_1),
  path: '$',
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('PATCH /databases/:instanceId/rejson-rl/set', () => {
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
          name: 'Should modify item with empty value (from buff)',
          data: {
            keyName: {
              type: 'Buffer',
              data: [...Buffer.from(constants.TEST_REJSON_KEY_1)],
            },
            data: JSON.stringify(''),
            path: 'test',
          },
          statusCode: 200,
          after: async () => {
            expect(
              JSON.parse(
                await rte.data.executeCommand(
                  'json.get',
                  constants.TEST_REJSON_KEY_1,
                  '.',
                ),
              ),
            ).to.eql({ test: '' });
          },
        },
        {
          name: 'Should modify item with null value',
          data: {
            keyName: constants.TEST_REJSON_KEY_1,
            data: JSON.stringify(null),
            path: 'test',
          },
          statusCode: 200,
          after: async () => {
            expect(
              JSON.parse(
                await rte.data.executeCommand(
                  'json.get',
                  constants.TEST_REJSON_KEY_1,
                  '.',
                ),
              ),
            ).to.eql({ test: null });
          },
        },
        {
          name: 'Should modify item with array in the root',
          data: {
            keyName: constants.TEST_REJSON_KEY_1,
            data: JSON.stringify([1, 2]),
            path: '.',
          },
          statusCode: 200,
          after: async () => {
            expect(
              JSON.parse(
                await rte.data.executeCommand(
                  'json.get',
                  constants.TEST_REJSON_KEY_1,
                  '.',
                ),
              ),
            ).to.eql([1, 2]);
          },
        },
        {
          name: 'Should modify item with object in the root',
          data: {
            keyName: constants.TEST_REJSON_KEY_1,
            data: JSON.stringify({ test: 'test' }),
            path: '$',
          },
          statusCode: 200,
          after: async () => {
            expect(
              await rte.data.executeCommand(
                'json.get',
                constants.TEST_REJSON_KEY_1,
                '.',
              ),
            ).to.eql(JSON.stringify({ test: 'test' }));
          },
        },
        {
          name: 'Should return NotFound error if instance id does not exists',
          endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
          data: {
            keyName: constants.TEST_REJSON_KEY_1,
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
          name: 'Should modify item with empty value (from buff)',
          data: {
            keyName: {
              type: 'Buffer',
              data: [...Buffer.from(constants.TEST_REJSON_KEY_1)],
            },
            data: JSON.stringify(''),
            path: 'test',
          },
          statusCode: 200,
          after: async () => {
            expect(
              JSON.parse(
                await rte.data.executeCommand(
                  'json.get',
                  constants.TEST_REJSON_KEY_1,
                  '$',
                ),
              )[0],
            ).to.eql({ test: '' });
          },
        },
        {
          name: 'Should modify item with null value',
          data: {
            keyName: constants.TEST_REJSON_KEY_1,
            data: JSON.stringify(null),
            path: 'test',
          },
          statusCode: 200,
          after: async () => {
            expect(
              JSON.parse(
                await rte.data.executeCommand(
                  'json.get',
                  constants.TEST_REJSON_KEY_1,
                  '$',
                ),
              )[0],
            ).to.eql({ test: null });
          },
        },
        {
          name: 'Should modify item with array in the root',
          data: {
            keyName: constants.TEST_REJSON_KEY_1,
            data: JSON.stringify([1, 2]),
            path: '$',
          },
          statusCode: 200,
          after: async () => {
            expect(
              JSON.parse(
                await rte.data.executeCommand(
                  'json.get',
                  constants.TEST_REJSON_KEY_1,
                  '$',
                ),
              )[0],
            ).to.eql([1, 2]);
          },
        },
        {
          name: 'Should modify item with object in the root',
          data: {
            keyName: constants.TEST_REJSON_KEY_1,
            data: JSON.stringify({ test: 'test' }),
            path: '$',
          },
          statusCode: 200,
          after: async () => {
            expect(
              await rte.data.executeCommand(
                'json.get',
                constants.TEST_REJSON_KEY_1,
                '.',
              ),
            ).to.eql(JSON.stringify({ test: 'test' }));
          },
        },
        {
          name: 'Should return NotFound error if instance id does not exists',
          endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
          data: {
            keyName: constants.TEST_REJSON_KEY_1,
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
  });

  describe('ACL', () => {
    requirements('rte.acl');
    before(async () => rte.data.setAclUserRules('~* +@all'));

    [
      {
        name: 'Should modify json',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_REJSON_KEY_1,
          data: JSON.stringify([1, 2]),
          path: '.',
        },
        statusCode: 200,
        after: async () => {
          expect(
            await rte.data.executeCommand(
              'json.get',
              constants.TEST_REJSON_KEY_1,
              '.',
            ),
          ).to.eql(JSON.stringify([1, 2]));
        },
      },
      {
        name: 'Should throw error if no permissions for "json.set" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_REJSON_KEY_1,
          data: JSON.stringify(constants.getRandomString()),
          path: '.',
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -json.set'),
      },
    ].map(mainCheckFn);
  });
});
