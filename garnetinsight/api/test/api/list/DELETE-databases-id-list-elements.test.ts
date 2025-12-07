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
  request(server).delete(
    `/${constants.API.DATABASES}/${instanceId}/list/elements`,
  );

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  destination: Joi.string().required().valid('HEAD', 'TAIL'),
  count: Joi.number().integer().min(1).allow(true), // todo: investigate/fix BE payload transform function
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  destination: 'TAIL',
  count: 2,
};

const responseSchema = Joi.object()
  .keys({
    elements: Joi.array().items(JoiRedisString).required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('DELETE /databases/:id/list/elements', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    beforeEach(() => rte.data.generateBinKeys(true));

    [
      {
        name: 'Should remove element by buffer (return utf8)',
        query: {
          encoding: 'utf8',
        },
        data: {
          keyName: constants.TEST_LIST_KEY_BIN_BUF_OBJ_1,
          destination: 'TAIL',
          count: 1,
        },
        responseSchema,
        responseBody: {
          elements: [constants.TEST_LIST_ELEMENT_BIN_UTF8_1],
        },
      },
      {
        name: 'Should remove element by buffer (return buffer)',
        query: {
          encoding: 'buffer',
        },
        data: {
          keyName: constants.TEST_LIST_KEY_BIN_BUF_OBJ_1,
          destination: 'TAIL',
          count: 1,
        },
        responseSchema,
        responseBody: {
          elements: [constants.TEST_LIST_ELEMENT_BIN_BUF_OBJ_1],
        },
      },
      {
        name: 'Should remove element by buffer (return ascii)',
        query: {
          encoding: 'ascii',
        },
        data: {
          keyName: constants.TEST_LIST_KEY_BIN_BUF_OBJ_1,
          destination: 'TAIL',
          count: 1,
        },
        responseSchema,
        responseBody: {
          elements: [constants.TEST_LIST_ELEMENT_BIN_ASCII_1],
        },
      },
    ].map(mainCheckFn);
  });

  describe('Main', () => {
    before(rte.data.truncate);

    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });

    describe('Common', () => {
      describe('Only one element for redis < 6.2', () => {
        requirements('rte.version<6.2');
        before(async () => await rte.data.generateKeys(true));

        [
          {
            name: 'Should delete 1 element from the tail',
            data: {
              keyName: constants.TEST_LIST_KEY_2,
              destination: 'TAIL',
              count: 1,
            },
            responseSchema,
            responseBody: {
              elements: ['element_100'],
            },
            after: async () => {
              const elements = await rte.client.lrange(
                constants.TEST_LIST_KEY_2,
                0,
                1000,
              );
              expect(elements.length).to.eql(99);
              expect(elements[0]).to.eql('element_1');
              expect(elements[98]).to.eql('element_99');
            },
          },
          {
            name: 'Should delete 1 element from the head',
            data: {
              keyName: constants.TEST_LIST_KEY_2,
              destination: 'HEAD',
              count: 1,
            },
            responseSchema,
            responseBody: {
              elements: ['element_1'],
            },
            after: async () => {
              const elements = await rte.client.lrange(
                constants.TEST_LIST_KEY_2,
                0,
                1000,
              );
              expect(elements.length).to.eql(98);
              expect(elements[0]).to.eql('element_2');
              expect(elements[97]).to.eql('element_99');
            },
          },
          {
            name: 'Should return NotFound error if instance id does not exists',
            endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
            data: {
              keyName: constants.TEST_LIST_KEY_1,
              destination: 'TAIL',
              count: 1,
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
      describe('Multiple elements for redis >= 6.2', () => {
        requirements('rte.version>=6.2');
        before(async () => await rte.data.generateKeys(true));

        [
          {
            name: 'Should delete 2 element from the tail',
            data: {
              keyName: constants.TEST_LIST_KEY_2,
              destination: 'TAIL',
              count: 2,
            },
            responseSchema,
            responseBody: {
              elements: ['element_100', 'element_99'],
            },
            after: async () => {
              const elements = await rte.client.lrange(
                constants.TEST_LIST_KEY_2,
                0,
                1000,
              );
              expect(elements.length).to.eql(98);
              expect(elements[0]).to.eql('element_1');
              expect(elements[97]).to.eql('element_98');
            },
          },
          {
            name: 'Should delete 10 elements from the head',
            data: {
              keyName: constants.TEST_LIST_KEY_2,
              destination: 'HEAD',
              count: 10,
            },
            responseBody: {
              elements: new Array(10)
                .fill(0)
                .map((item, i) => `element_${i + 1}`),
            },
            responseSchema,
            after: async () => {
              const elements = await rte.client.lrange(
                constants.TEST_LIST_KEY_2,
                0,
                1000,
              );
              expect(elements.length).to.eql(88);
              expect(elements[0]).to.eql('element_11');
              expect(elements[87]).to.eql('element_98');
            },
          },
          {
            name: 'Should delete all elements and key',
            data: {
              keyName: constants.TEST_LIST_KEY_2,
              destination: 'HEAD',
              count: 88,
            },
            responseBody: {
              elements: new Array(88)
                .fill(0)
                .map((item, i) => `element_${i + 11}`),
            },
            responseSchema,
            before: async () => {
              expect(await rte.client.exists(constants.TEST_LIST_KEY_2)).to.eql(
                1,
              );
            },
            after: async () => {
              expect(await rte.client.exists(constants.TEST_LIST_KEY_2)).to.eql(
                0,
              );
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
            keyName: constants.TEST_LIST_KEY_1,
            destination: 'TAIL',
            count: 1,
          },
          responseSchema,
        },
        {
          name: 'Should throw error if no permissions for "lpop" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            destination: 'HEAD',
            count: 1,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -lpop'),
        },
        {
          name: 'Should throw error if no permissions for "rpop" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            destination: 'TAIL',
            count: 1,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -rpop'),
        },
      ].map(mainCheckFn);
    });
  });
});
