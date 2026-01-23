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
  request(server).put(`/${constants.API.DATABASES}/${instanceId}/list`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  elements: Joi.array()
    .items(
      Joi.custom((value, helpers) => {
        if (typeof value === 'string' || Buffer.isBuffer(value)) {
          return value;
        }
        return helpers.error('any.invalid');
      }).messages({
        'any.invalid': 'elements must be a string or a Buffer',
      }),
    )
    .required(),
  destination: Joi.string().valid('HEAD', 'TAIL').default('TAIL'),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  elements: [constants.getRandomString()],
  destination: 'TAIL',
};

const responseSchema = Joi.object()
  .keys({
    keyName: Joi.string().required(),
    total: Joi.number().integer().required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('PUT /databases/:instanceId/list', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    before(() => rte.data.generateBinKeys(true));

    [
      {
        name: 'Should insert element from buff (return utf8)',
        query: {
          encoding: 'utf8',
        },
        data: {
          keyName: constants.TEST_LIST_KEY_BIN_BUF_OBJ_1,
          elements: [constants.TEST_LIST_ELEMENT_BIN_BUF_OBJ_1],
        },
        responseBody: {
          keyName: constants.TEST_LIST_KEY_BIN_UTF8_1,
          total: 2,
        },
        after: async () => {
          expect(
            await rte.client.lrangeBuffer(
              constants.TEST_LIST_KEY_BIN_BUFFER_1,
              0,
              100,
            ),
          ).to.deep.eq([
            constants.TEST_LIST_ELEMENT_BIN_BUFFER_1,
            constants.TEST_LIST_ELEMENT_BIN_BUFFER_1,
          ]);
        },
      },
      {
        name: 'Should insert element from buffer (return buffer)',
        query: {
          encoding: 'buffer',
        },
        data: {
          keyName: constants.TEST_LIST_KEY_BIN_BUF_OBJ_1,
          elements: [constants.TEST_LIST_ELEMENT_BIN_BUF_OBJ_1],
        },
        responseBody: {
          keyName: constants.TEST_LIST_KEY_BIN_BUF_OBJ_1,
          total: 3,
        },
        after: async () => {
          expect(
            await rte.client.lrangeBuffer(
              constants.TEST_LIST_KEY_BIN_BUFFER_1,
              0,
              100,
            ),
          ).to.deep.eq([
            constants.TEST_LIST_ELEMENT_BIN_BUFFER_1,
            constants.TEST_LIST_ELEMENT_BIN_BUFFER_1,
            constants.TEST_LIST_ELEMENT_BIN_BUFFER_1,
          ]);
        },
      },
      {
        name: 'Should insert element from ascii (return ascii)',
        query: {
          encoding: 'ascii',
        },
        data: {
          keyName: constants.TEST_LIST_KEY_BIN_ASCII_1,
          elements: [constants.TEST_LIST_ELEMENT_BIN_ASCII_1],
        },
        responseBody: {
          keyName: constants.TEST_LIST_KEY_BIN_ASCII_1,
          total: 4,
        },
        after: async () => {
          expect(
            await rte.client.lrangeBuffer(
              constants.TEST_LIST_KEY_BIN_BUFFER_1,
              0,
              100,
            ),
          ).to.deep.eq([
            constants.TEST_LIST_ELEMENT_BIN_BUFFER_1,
            constants.TEST_LIST_ELEMENT_BIN_BUFFER_1,
            constants.TEST_LIST_ELEMENT_BIN_BUFFER_1,
            constants.TEST_LIST_ELEMENT_BIN_BUFFER_1,
          ]);
        },
      },
    ].map(mainCheckFn);
  });

  describe('Main', () => {
    before(rte.data.truncate);
    before(async () => await rte.data.generateKeys(true));

    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });

    describe('Common', () => {
      before(async () => await rte.data.generateKeys(true));

      [
        {
          name: 'Should insert 1 element to the tail (by default)',
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            elements: [constants.getRandomString()],
          },
          responseSchema,
          responseBody: {
            keyName: constants.TEST_LIST_KEY_1,
            total: 3,
          },
          after: async function () {
            const elements = await rte.client.lrange(
              constants.TEST_LIST_KEY_1,
              0,
              1000,
            );
            expect(elements[2]).to.eql(this.data.elements[0]);
          },
        },
        {
          name: 'Should insert 1 element to the tail',
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            elements: [constants.getRandomString()],
            destination: 'TAIL',
          },
          responseSchema,
          responseBody: {
            keyName: constants.TEST_LIST_KEY_1,
            total: 4,
          },
          after: async function () {
            const elements = await rte.client.lrange(
              constants.TEST_LIST_KEY_1,
              0,
              1000,
            );
            expect(elements[3]).to.eql(this.data.elements[0]);
          },
        },
        {
          name: 'Should insert 1 element to the head',
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            elements: [constants.getRandomString()],
            destination: 'HEAD',
          },
          responseSchema,
          responseBody: {
            keyName: constants.TEST_LIST_KEY_1,
            total: 5,
          },
          after: async function () {
            const elements = await rte.client.lrange(
              constants.TEST_LIST_KEY_1,
              0,
              1000,
            );
            expect(elements[0]).to.eql(this.data.elements[0]);
          },
        },
        {
          name: 'Should return NotFound error if key does not exists',
          data: {
            keyName: constants.getRandomString(),
            elements: [constants.getRandomString()],
            destination: 'HEAD',
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
            keyName: constants.TEST_LIST_KEY_1,
            elements: [constants.getRandomString()],
            destination: 'HEAD',
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
          name: 'Should create regular item',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            elements: [constants.getRandomString()],
            destination: 'TAIL',
          },
          responseSchema,
        },
        {
          name: 'Should throw error if no permissions for "lpushx" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            elements: [constants.getRandomString()],
            destination: 'HEAD',
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -lpushx'),
        },
        {
          name: 'Should throw error if no permissions for "rpushx" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            elements: [constants.getRandomString()],
            destination: 'TAIL',
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -rpushx'),
        },
      ].map(mainCheckFn);
    });
  });
});
