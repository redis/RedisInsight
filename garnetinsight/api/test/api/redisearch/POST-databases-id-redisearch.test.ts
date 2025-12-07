import {
  expect,
  describe,
  it,
  before,
  Joi,
  deps,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  validateApiCall,
  getMainCheckFn,
  _,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/redisearch`);

// input data schema
const dataSchema = Joi.object({
  index: Joi.string().allow('').required(),
  type: Joi.string().valid('hash', 'json').required(),
  // prefixes: Joi.array().items(Joi.string()).allow(null),
  // fields: Joi.array().items(Joi.object({
  //   name: Joi.string().required(),
  //   type: Joi.string().valid('text', 'tag', 'numeric', 'geo', 'vector').required(),
  // }).required()),
}).strict();

const validInputData = {
  index: constants.TEST_SEARCH_HASH_INDEX_1,
  type: constants.TEST_SEARCH_HASH_TYPE,
  prefixes: ['*'],
  fields: [
    {
      name: '*',
      type: 'text',
    },
  ],
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:id/redisearch', () => {
  requirements('!rte.bigData', 'rte.modules.search');

  describe('Main', () => {
    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });

    describe('Common', () => {
      beforeEach(rte.data.truncate);

      [
        {
          name: 'Should create index',
          data: {
            ...validInputData,
            index: constants.TEST_SEARCH_HASH_INDEX_1,
          },
          statusCode: 201,
          before: async () => {
            await validateApiCall({
              endpoint: () =>
                request(server).get(
                  `/${constants.API.DATABASES}/${constants.TEST_INSTANCE_ID}/redisearch`,
                ),
              checkFn: ({ body }) => {
                expect(body.indexes.length).to.eq(0);
              },
            });
          },
          after: async () => {
            await validateApiCall({
              endpoint: () =>
                request(server).get(
                  `/${constants.API.DATABASES}/${constants.TEST_INSTANCE_ID}/redisearch`,
                ),
              checkFn: ({ body }) => {
                expect(body.indexes.length).to.eq(1);
                expect(body.indexes).to.include(
                  constants.TEST_SEARCH_HASH_INDEX_1,
                );
              },
            });
          },
        },
        {
          name: 'Should throw Conflict Error if such index name already exists',
          data: {
            ...validInputData,
            index: constants.TEST_SEARCH_HASH_INDEX_1,
          },
          statusCode: 201,
          after: async () => {
            await validateApiCall({
              endpoint,
              statusCode: 409,
              data: {
                ...validInputData,
                index: constants.TEST_SEARCH_HASH_INDEX_1,
              },
              responseBody: {
                statusCode: 409,
                message: 'This index name is already in use.',
                error: 'Conflict',
              },
            });
          },
        },
      ].map(mainCheckFn);
    });

    describe('ACL', () => {
      requirements('rte.acl');
      before(async () => rte.data.setAclUserRules('~* +@all'));

      [
        {
          name: 'Should create regular index',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            ...validInputData,
            index: constants.getRandomString(),
          },
          statusCode: 201,
        },
        {
          name: 'Should throw error if no permissions for "ft.info" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            ...validInputData,
            index: constants.getRandomString(),
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -ft.info'),
        },
        {
          name: 'Should throw error if no permissions for "ft.create" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            ...validInputData,
            index: constants.getRandomString(),
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -ft.create'),
        },
      ].map(mainCheckFn);
    });
  });
});
