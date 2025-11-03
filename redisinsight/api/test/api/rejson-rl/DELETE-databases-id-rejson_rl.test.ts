import {
  expect,
  describe,
  it,
  before,
  deps,
  Joi,
  _,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  validateApiCall,
  getMainCheckFn,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).delete(`/${constants.API.DATABASES}/${instanceId}/rejson-rl`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  path: Joi.string().required().messages({
    'any.required': '{#label} should not be empty',
  }),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  path: '$',
};

const responseSchema = Joi.object()
  .keys({
    affected: Joi.number().integer().required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('DELETE /databases/:instanceId/rejson-rl', () => {
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
          name: 'Should delete element from nested object by path (from buf)',
          data: {
            keyName: {
              type: 'Buffer',
              data: [...Buffer.from(constants.TEST_REJSON_KEY_3)],
            },
            path: '.object.field',
          },
          responseSchema,
          responseBody: {
            affected: 1,
          },
          before: async () => {
            const json = JSON.parse(
              await rte.data.executeCommand(
                'json.get',
                constants.TEST_REJSON_KEY_3,
                '.',
              ),
            );
            expect(json.object).to.have.property('field');
          },
          after: async () => {
            const json = JSON.parse(
              await rte.data.executeCommand(
                'json.get',
                constants.TEST_REJSON_KEY_3,
                '.',
              ),
            );
            expect(json).to.deep.eql(
              _.omit(constants.TEST_REJSON_VALUE_3, 'object.field'),
            );
          },
        },
        {
          name: 'Should delete element from array by path',
          data: {
            keyName: constants.TEST_REJSON_KEY_3,
            path: '.array[1]',
          },
          responseSchema,
          responseBody: {
            affected: 1,
          },
          before: async () => {
            const json = JSON.parse(
              await rte.data.executeCommand(
                'json.get',
                constants.TEST_REJSON_KEY_3,
                '.',
              ),
            );
            expect(json.array.length).to.eql(3);
          },
          after: async () => {
            const json = JSON.parse(
              await rte.data.executeCommand(
                'json.get',
                constants.TEST_REJSON_KEY_3,
                '.',
              ),
            );
            expect(json.array.length).to.eql(2);
          },
        },
        {
          name: 'Should not affect json if not existing path',
          data: {
            keyName: constants.TEST_REJSON_KEY_3,
            path: '.not_existing_path',
          },
          responseSchema,
          responseBody: {
            affected: 0,
          },
        },
        {
          name: 'Should delete entire json and remove the key',
          data: {
            keyName: constants.TEST_REJSON_KEY_3,
            path: '.',
          },
          responseSchema,
          responseBody: {
            affected: 1,
          },
          after: async () => {
            expect(await rte.client.exists(constants.TEST_REJSON_KEY_3)).to.eql(
              0,
            );
          },
        },
        {
          name: 'Should return NotFound error if instance id does not exists',
          endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
          data: {
            keyName: constants.TEST_REJSON_KEY_1,
            data: JSON.stringify(constants.getRandomString()),
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Invalid database instance id.',
          },
          after: async () => {
            // check that value was not overwritten
            const json = JSON.parse(
              await rte.data.executeCommand(
                'json.get',
                constants.TEST_REJSON_KEY_1,
                '.',
              ),
            );
            expect(json).to.deep.eql(constants.TEST_REJSON_VALUE_1);
          },
        },
      ].map(mainCheckFn);
    });
    describe('re-json v2', () => {
      requirements('rte.modules.rejson.version>=20000');

      [
        {
          name: 'Should delete element from nested object by path (from buf)',
          data: {
            keyName: {
              type: 'Buffer',
              data: [...Buffer.from(constants.TEST_REJSON_KEY_3)],
            },
            path: '$.object.field',
          },
          responseSchema,
          responseBody: {
            affected: 1,
          },
          before: async () => {
            const json = JSON.parse(
              await rte.data.executeCommand(
                'json.get',
                constants.TEST_REJSON_KEY_3,
                '$',
              ),
            );
            expect(json[0].object).to.have.property('field');
          },
          after: async () => {
            const json = JSON.parse(
              await rte.data.executeCommand(
                'json.get',
                constants.TEST_REJSON_KEY_3,
                '$',
              ),
            );
            expect(json[0]).to.deep.eql(
              _.omit(constants.TEST_REJSON_VALUE_3, 'object.field'),
            );
          },
        },
        {
          name: 'Should delete element from array by path',
          data: {
            keyName: constants.TEST_REJSON_KEY_3,
            path: '$.array[1]',
          },
          responseSchema,
          responseBody: {
            affected: 1,
          },
          before: async () => {
            const json = JSON.parse(
              await rte.data.executeCommand(
                'json.get',
                constants.TEST_REJSON_KEY_3,
                '$',
              ),
            );
            expect(json[0].array.length).to.eql(3);
          },
          after: async () => {
            const json = JSON.parse(
              await rte.data.executeCommand(
                'json.get',
                constants.TEST_REJSON_KEY_3,
                '$',
              ),
            );
            expect(json[0].array.length).to.eql(2);
          },
        },
        {
          name: 'Should not affect json if not existing path',
          data: {
            keyName: constants.TEST_REJSON_KEY_3,
            path: '.not_existing_path',
          },
          responseSchema,
          responseBody: {
            affected: 0,
          },
        },
        {
          name: 'Should delete entire json and remove the key',
          data: {
            keyName: constants.TEST_REJSON_KEY_3,
            path: '$',
          },
          responseSchema,
          responseBody: {
            affected: 1,
          },
          after: async () => {
            expect(await rte.client.exists(constants.TEST_REJSON_KEY_3)).to.eql(
              0,
            );
          },
        },
        {
          name: 'Should return NotFound error if instance id does not exists',
          endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
          data: {
            keyName: constants.TEST_REJSON_KEY_1,
            data: JSON.stringify(constants.getRandomString()),
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Invalid database instance id.',
          },
          after: async () => {
            // check that value was not overwritten
            const json = JSON.parse(
              await rte.data.executeCommand(
                'json.get',
                constants.TEST_REJSON_KEY_1,
                '$',
              ),
            );
            expect(json[0]).to.deep.eql(constants.TEST_REJSON_VALUE_1);
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
        name: 'Should create regular item',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_REJSON_KEY_1,
          path: '.n',
        },
        responseSchema,
      },
      {
        name: 'Should throw error if no permissions for "json.del" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_REJSON_KEY_1,
          path: '.n',
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -json.del'),
      },
    ].map(mainCheckFn);
  });
});
