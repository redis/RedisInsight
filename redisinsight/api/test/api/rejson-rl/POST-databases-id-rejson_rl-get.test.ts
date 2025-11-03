import {
  describe,
  before,
  deps,
  Joi,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  getMainCheckFn,
  expect,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/rejson-rl/get`,
  );

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  path: Joi.string(),
  forceRetrieve: Joi.boolean(),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  path: '$',
  forceRetrieve: false,
};

const responseSchema = Joi.object()
  .keys({
    downloaded: Joi.boolean().required(),
    path: Joi.string().required(),
    type: Joi.string(),
    data: Joi.any(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/rejson-rl/get', () => {
  requirements('rte.modules.rejson');

  describe('Main', () => {
    before(async () => await rte.data.generateKeys(true));

    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });

    describe('Modes', () => {
      describe('re-json v1', () => {
        requirements('rte.modules.rejson.version<20000');

        [
          {
            name: 'Should force get entire json from buff',
            data: {
              keyName: {
                type: 'Buffer',
                data: [...Buffer.from(constants.TEST_REJSON_KEY_3)],
              },
              path: '.',
              forceRetrieve: true,
            },
            responseSchema,
            responseBody: {
              downloaded: true,
              path: '.',
              data: JSON.stringify(constants.TEST_REJSON_VALUE_3),
            },
          },
        ].map(mainCheckFn);
      });
      describe('re-json v2', () => {
        requirements('rte.modules.rejson.version>=20000');

        [
          {
            name: 'Should force get entire json from buff',
            data: {
              keyName: {
                type: 'Buffer',
                data: [...Buffer.from(constants.TEST_REJSON_KEY_3)],
              },
              path: '$',
              forceRetrieve: true,
            },
            responseSchema,
            responseBody: {
              downloaded: true,
              path: '$',
              data: JSON.stringify(constants.TEST_REJSON_VALUE_3),
            },
          },
        ].map(mainCheckFn);
      });
    });

    describe('Common', () => {
      describe('re-json v1', () => {
        requirements('rte.modules.rejson.version<20000');
        [
          {
            name: 'Should force get entire json',
            data: {
              keyName: constants.TEST_REJSON_KEY_3,
              path: '.',
              forceRetrieve: true,
            },
            responseSchema,
            responseBody: {
              downloaded: true,
              path: '.',
              data: JSON.stringify(constants.TEST_REJSON_VALUE_3),
            },
          },
          {
            name: 'Should get nested object',
            data: {
              keyName: constants.TEST_REJSON_KEY_3,
              path: '.object.field',
              forceRetrieve: false,
            },
            responseSchema,
            responseBody: {
              downloaded: true,
              path: '.object.field',
              data: `"${'value'}"`,
            },
          },
          {
            name: 'Should get nested array value (downloaded true due to size)',
            data: {
              keyName: constants.TEST_REJSON_KEY_3,
              path: '["array"][1]',
              forceRetrieve: false,
            },
            responseSchema,
            responseBody: {
              downloaded: true,
              path: '["array"][1]',
              data: String(2),
            },
          },
          {
            name: 'Should return NotFound error if instance id does not exists',
            endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
            data: {
              keyName: constants.TEST_REJSON_KEY_1,
              path: '["object"]["some"]',
              forceRetrieve: false,
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
            name: 'Should force get entire json',
            data: {
              keyName: constants.TEST_REJSON_KEY_3,
              path: '$',
              forceRetrieve: true,
            },
            responseSchema,
            responseBody: {
              downloaded: true,
              path: '$',
              data: JSON.stringify(constants.TEST_REJSON_VALUE_3),
            },
          },
          {
            name: 'Should get nested object',
            data: {
              keyName: constants.TEST_REJSON_KEY_3,
              path: '$.object.field',
              forceRetrieve: false,
            },
            responseSchema,
            responseBody: {
              downloaded: true,
              path: '$.object.field',
              data: `"${'value'}"`,
            },
          },
          {
            name: 'Should get nested array value (downloaded true due to size)',
            data: {
              keyName: constants.TEST_REJSON_KEY_3,
              path: '$["array"][1]',
              forceRetrieve: false,
            },
            responseSchema,
            responseBody: {
              downloaded: true,
              path: '$["array"][1]',
              data: String(2),
            },
          },
          {
            name: 'Should return NotFound error if instance id does not exists',
            endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
            data: {
              keyName: constants.TEST_REJSON_KEY_1,
              path: '$["object"]["some"]',
              forceRetrieve: false,
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

    describe('Large key value', () => {
      // todo: do not forget to remove module version check after fixing MEMORY USAGE issue in RedisJSON v2.0.0
      requirements('rte.modules.rejson.version<20000');
      [
        {
          name: 'Should get json with calculated cardinality',
          data: {
            keyName: constants.TEST_REJSON_KEY_3,
            path: '.',
            forceRetrieve: false,
          },
          responseSchema,
          responseBody: {
            downloaded: false,
            path: '.',
            type: 'object',
            data: [
              {
                type: 'array',
                key: 'array',
                path: '["array"]',
                cardinality: 3,
              },
              {
                type: 'object',
                key: 'object',
                path: '["object"]',
                cardinality: 2,
              },
            ],
          },
        },
        {
          name: 'Should get safe large string from the object', // todo: do not forget to implement partially string download for JSON
          data: {
            keyName: constants.TEST_REJSON_KEY_3,
            path: '["object"]["some"]',
            forceRetrieve: false,
          },
          responseSchema,
          responseBody: {
            downloaded: false,
            path: '["object"]["some"]',
            data: `"${constants.TEST_REJSON_VALUE_3.object.some}"`, // full value right now
            type: 'string',
          },
        },
      ].map(mainCheckFn);
    });

    describe('ACL', () => {
      // todo: do not forget to remove rte.modules.rejson check after fixing MEMORY USAGE issue in RedisJSON v2.0.0
      requirements('rte.acl', 'rte.modules.rejson.version<20000');
      before(async () => rte.data.setAclUserRules('~* +@all'));

      [
        {
          name: 'Should create regular item',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_REJSON_KEY_1,
            path: '.',
            forceRetrieve: false,
          },
          responseSchema,
        },
        {
          name: 'Should throw error if no permissions for "json.get" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_REJSON_KEY_1,
            path: '.',
            forceRetrieve: true,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -json.get'),
        },
        {
          name: 'Should throw error if no permissions for "json.get" command (another)',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_REJSON_KEY_1,
            path: '.',
            forceRetrieve: false,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -json.get'),
        },
        {
          name: 'Should return regular item if no permissions for "json.debug" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_REJSON_KEY_3,
            path: '.',
            forceRetrieve: false,
          },
          responseSchema,
          responseBody: {
            downloaded: true,
            path: '.',
            data: constants.TEST_REJSON_VALUE_3,
          },
          before: () => rte.data.setAclUserRules('~* +@all -json.debug'),
        },
        {
          name: 'Should get full json if no permissions for "json.debug" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_REJSON_KEY_3,
            path: '.',
            forceRetrieve: false,
          },
          responseSchema,
          responseBody: {
            downloaded: true,
            path: '.',
            data: constants.TEST_REJSON_VALUE_3,
          },
          before: () => rte.data.setAclUserRules('~* +@all -json.debug'),
        },
        {
          name: 'Should throw error if no permissions for "json.objkeys" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_REJSON_KEY_3,
            path: '.',
            forceRetrieve: false,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -json.objkeys'),
        },
        {
          name: 'Should throw error if no permissions for "json.type" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_REJSON_KEY_3,
            path: '.',
            forceRetrieve: false,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -json.type'),
        },
        {
          name: 'Should throw error if no permissions for "json.objlen" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_REJSON_KEY_3,
            path: '.',
            forceRetrieve: false,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -json.objlen'),
        },
        {
          name: 'Should throw error if no permissions for "json.arrlen" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_REJSON_KEY_3,
            path: '.',
            forceRetrieve: false,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -json.arrlen'),
        },
      ].map(mainCheckFn);
    });
  });
});
