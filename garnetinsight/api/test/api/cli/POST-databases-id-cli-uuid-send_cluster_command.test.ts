import {
  expect,
  describe,
  it,
  before,
  Joi,
  _,
  deps,
  validateApiCall,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (
  instanceId = constants.TEST_INSTANCE_ID,
  uuid = constants.TEST_CLI_UUID_1,
) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/cli/${uuid}/send-cluster-command`,
  );

// input data schema
const dataSchema = Joi.object({
  command: Joi.string().required().messages({
    'any.required': '{#label} should not be empty',
  }),
  outputFormat: Joi.string().allow(null).valid('TEXT', 'RAW'),
}).strict();

const validInputData = {
  command: 'set foo bar',
};

const responseSchema = Joi.object()
  .keys({
    response: Joi.string().required(),
    status: Joi.string().required(),
  })
  .required();

const responseRawSchema = Joi.object()
  .keys({
    response: Joi.any().required(),
    status: Joi.string().required(),
  })
  .required();

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    // additional checks before test run
    if (testCase.before) {
      await testCase.before();
    }

    await validateApiCall({
      endpoint,
      ...testCase,
    });

    // additional checks after test pass
    if (testCase.after) {
      await testCase.after();
    }
  });
};

describe('POST /databases/:instanceId/cli/:uuid/send-cluster-command', () => {
  requirements('rte.type=CLUSTER');

  before(rte.data.truncate);
  // Create Redis client for CLI
  before(
    async () =>
      await request(server).patch(
        `/${constants.API.DATABASES}/${constants.TEST_INSTANCE_ID}/cli/${constants.TEST_CLI_UUID_1}`,
      ),
  );

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should create string',
        data: {
          command: `set ${constants.TEST_STRING_KEY_1} ${constants.TEST_STRING_VALUE_1}`,
          outputFormat: 'TEXT',
        },
        responseSchema,
        before: async () => {
          expect(await rte.client.exists(constants.TEST_STRING_KEY_1)).to.eql(
            0,
          );
        },
        after: async () => {
          expect(await rte.client.get(constants.TEST_STRING_KEY_1)).to.eql(
            constants.TEST_STRING_VALUE_1,
          );
        },
      },
      {
        name: 'Should get string',
        data: {
          command: `get ${constants.TEST_STRING_KEY_1}`,
          outputFormat: 'TEXT',
        },
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.response).to.have.string(constants.TEST_STRING_VALUE_1);
        },
      },
      {
        name: 'Should remove string',
        data: {
          command: `del ${constants.TEST_STRING_KEY_1}`,
          outputFormat: 'TEXT',
        },
        responseSchema,
        after: async () => {
          expect(await rte.client.exists(constants.TEST_STRING_KEY_1)).to.eql(
            0,
          );
        },
      },
    ].map(mainCheckFn);
  });

  describe('Single Node', () => {
    describe('String', () => {
      [
        {
          name: 'Should create string',
          data: {
            command: `set ${constants.TEST_STRING_KEY_1} ${constants.TEST_STRING_VALUE_1}`,
            outputFormat: 'TEXT',
          },
          responseSchema,
          before: async () => {
            expect(await rte.client.exists(constants.TEST_STRING_KEY_1)).to.eql(
              0,
            );
          },
          after: async () => {
            expect(await rte.client.get(constants.TEST_STRING_KEY_1)).to.eql(
              constants.TEST_STRING_VALUE_1,
            );
          },
        },
        {
          name: 'Should get string',
          data: {
            command: `get ${constants.TEST_STRING_KEY_1}`,
            outputFormat: 'TEXT',
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.response).to.have.string(constants.TEST_STRING_VALUE_1);
          },
        },
        {
          name: 'Should remove string',
          data: {
            command: `del ${constants.TEST_STRING_KEY_1}`,
            outputFormat: 'TEXT',
          },
          responseSchema,
          after: async () => {
            expect(await rte.client.exists(constants.TEST_STRING_KEY_1)).to.eql(
              0,
            );
          },
        },
      ].map(mainCheckFn);
    });
    describe('Raw output', () => {
      [
        {
          name: 'Should return a string type response',
          data: {
            command: `set ${constants.TEST_STRING_KEY_1} ${constants.TEST_STRING_VALUE_1}`,
            outputFormat: 'RAW',
          },
          responseRawSchema,
          checkFn: ({ body }) => {
            expect(body.response).to.eql('OK');
          },
        },
        {
          name: 'Should return a number type response',
          data: {
            command: `del ${constants.TEST_STRING_KEY_1}`,
            outputFormat: 'RAW',
          },
          responseRawSchema,
          checkFn: ({ body }) => {
            expect(body.response).to.be.a('number');
          },
        },
        {
          name: 'Should return an array type response',
          data: {
            command: `lrange ${constants.TEST_LIST_KEY_1} 0 100`,
            outputFormat: 'RAW',
          },
          responseRawSchema,
          before: async () => {
            await rte.client.lpush(
              constants.TEST_LIST_KEY_1,
              constants.TEST_LIST_ELEMENT_1,
              constants.TEST_LIST_ELEMENT_2,
            );
          },
          after: async () => {
            await rte.client.del(constants.TEST_LIST_KEY_1);
          },
          checkFn: ({ body }) => {
            expect(body.response).to.eql([
              constants.TEST_LIST_ELEMENT_2,
              constants.TEST_LIST_ELEMENT_1,
            ]);
          },
        },
      ].map(mainCheckFn);
    });
  });

  // Skip 'Commands redirection' and 'Client' tests because tested functionalities were removed
  xdescribe('Commands redirection', () => {
    const nodes = rte.env.nodes;
    _.map(nodes, (node) => ({
      name: `Should create string with redirection if needed (${node.host}:${node.port})`,
      data: {
        command: `set ${constants.TEST_STRING_KEY_1} ${node.host}`,
        outputFormat: 'TEXT',
        nodeOptions: {
          host: node.host,
          port: node.port,
          enableRedirection: true,
        },
      },
      responseSchema,
      checkFn: ({ body }) => {
        expect(
          body[0].response === '"OK"' ||
            body[0].response.toLowerCase().includes('redirected'),
        ).to.eql(true);
      },
      after: async () => {
        expect(await rte.client.get(constants.TEST_STRING_KEY_1)).to.eql(
          node.host,
        );
      },
    })).map(mainCheckFn);
  });
  xdescribe('Client', () => {
    [
      {
        name: 'Should throw ClientNotFoundError',
        data: {
          command: 'info',
          outputFormat: 'TEXT',
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Client not found or it has been disconnected.',
          name: 'ClientNotFoundError',
        },
        before: async function () {
          await request(server).delete(
            `/${constants.API.DATABASES}/${constants.TEST_INSTANCE_ID}/cli/${constants.TEST_CLI_UUID_1}`,
          );
        },
        after: async function () {
          await request(server).patch(
            `/${constants.API.DATABASES}/${constants.TEST_INSTANCE_ID}/cli/${constants.TEST_CLI_UUID_1}`,
          );
        },
      },
    ].map(mainCheckFn);
  });
});
