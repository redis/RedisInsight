import {
  expect,
  before,
  describe,
  it,
  Joi,
  deps,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  validateApiCall,
  requirements,
  getMainCheckFn,
} from '../deps';
const { server, request, constants, rte, localDb } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/plugins/command-executions`,
  );

// input data schema
const dataSchema = Joi.object({
  command: Joi.string().required(),
  mode: Joi.string().valid('RAW', 'ASCII').allow(null),
  resultsMode: Joi.string()
    .valid('DEFAULT', 'GROUP_MODE', 'SILENT')
    .allow(null),
})
  .messages({
    'any.required': '{#label} should not be empty',
  })
  .strict();

const validInputData = {
  command: 'set foo bar',
  mode: 'ASCII',
  resultsMode: 'DEFAULT',
};

const responseSchema = Joi.object()
  .keys({
    databaseId: Joi.string().required(),
    command: Joi.string().required(),
    result: Joi.array().items(
      Joi.object({
        response: Joi.any().required(),
        status: Joi.string().required(),
      }),
    ),
    mode: Joi.string().required(),
    resultsMode: Joi.string().required(),
    type: Joi.string().valid('WORKBENCH', 'SEARCH').required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/plugins/command-executions', () => {
  before(rte.data.truncate);

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    describe('String', () => {
      const bigStringValue = Buffer.alloc(1023 * 1024, 'a').toString();

      [
        {
          name: 'Should return 404 not found when incorrect instance',
          endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
          statusCode: 404,
          data: {
            command: 'get foo',
            mode: 'ASCII',
            resultsMode: 'DEFAULT',
          },
          responseBody: {
            statusCode: 404,
            message: 'Invalid database instance id.',
            error: 'Not Found',
          },
        },
        {
          name: 'Should get string',
          data: {
            command: `get ${constants.TEST_STRING_KEY_1}`,
            mode: 'ASCII',
            resultsMode: 'DEFAULT',
          },
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.command).to.eql(`get ${constants.TEST_STRING_KEY_1}`);
            expect(body.result.length).to.eql(1);
            expect(body.result[0].response).to.eql(bigStringValue);
            expect(body.result[0].status).to.eql('success');
          },
          before: async () => {
            expect(
              await rte.client.set(constants.TEST_STRING_KEY_1, bigStringValue),
            );
          },
        },
      ].map(mainCheckFn);
    });
    describe('RediSearch', () => {
      requirements('rte.modules.search');
      [
        {
          name: 'Should support ft.info command (whitelist case insensitive check)',
          data: {
            command: `ft.info ${constants.TEST_STRING_KEY_1}`,
            mode: 'ASCII',
            resultsMode: 'DEFAULT',
          },
          responseSchema,
        },
      ].map(mainCheckFn);
    });
    describe('Bad commands', () => {
      [
        {
          name: 'Should return error if try to run unsupported command (monitor)',
          data: {
            command: `monitor`,
            mode: 'ASCII',
            resultsMode: 'DEFAULT',
          },
        },
        {
          name: 'Should return error if try to run unsupported command (subscribe)',
          data: {
            command: `subscribe`,
            mode: 'ASCII',
            resultsMode: 'DEFAULT',
          },
        },
        {
          name: 'Should return error if try to run unsupported command (psubscribe)',
          data: {
            command: `psubscribe`,
            mode: 'ASCII',
            resultsMode: 'DEFAULT',
          },
        },
        {
          name: 'Should return error if try to run unsupported command (sync)',
          data: {
            command: `sync`,
            mode: 'ASCII',
            resultsMode: 'DEFAULT',
          },
        },
        {
          name: 'Should return error if try to run unsupported command (psync)',
          data: {
            command: `psync`,
            mode: 'ASCII',
            resultsMode: 'DEFAULT',
          },
        },
        {
          name: 'Should return error if try to run unsupported command (script debug)',
          data: {
            command: `script debug`,
            mode: 'ASCII',
            resultsMode: 'DEFAULT',
          },
        },
        {
          name: 'Should return error if try to run blocking command',
          data: {
            command: `blpop key`,
            mode: 'ASCII',
            resultsMode: 'DEFAULT',
          },
        },
        {
          name: 'Should return error if try to run not readonly command',
          data: {
            command: `set string_key value`,
            mode: 'ASCII',
            resultsMode: 'DEFAULT',
          },
        },
      ].map((testCase) =>
        mainCheckFn({
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.result.length).to.eql(1);
            expect(body.result[0].status).to.eql('fail');
            expect(body.result[0].response).to.include(
              'command is not allowed by the Garnet Insight Plugins',
            );
          },
          ...testCase,
        }),
      );
    });
    describe('History items limit', () => {
      it('Number of history items should be less then 30', async () => {
        const repo = await localDb.getRepository(
          localDb.repositories.COMMAND_EXECUTION,
        );
        await localDb.generateNCommandExecutions(
          {
            databaseId: constants.TEST_INSTANCE_ID,
            createdAt: new Date(Date.now() - 1000),
          },
          30,
          true,
        );

        for (let i = 0; i < 40; i++) {
          await validateApiCall({
            endpoint,
            data: {
              command: `get ${constants.TEST_STRING_KEY_2}`,
              mode: 'ASCII',
              resultsMode: 'DEFAULT',
            },
            responseSchema,
            checkFn: async ({ body }) => {
              expect(body.result.length).to.eql(1);

              // @ts-expect-error
              const count = await repo.count({
                databaseId: constants.TEST_INSTANCE_ID,
              });
              expect(count).to.lte(30);

              // check that the last execution command was not deleted
              // await repo.findOneOrFail({ id: body.id }); // sometimes localDb is not in sync. investigate
            },
          });
        }
      });
    });
  });
  // Skip 'Standalone + Sentinel' and 'Cluster' tests because tested functionalities were removed
  xdescribe('Standalone + Sentinel', () => {
    requirements('!rte.type=CLUSTER');

    describe('Incorrect requests for redis client type', () => {
      [
        {
          name: 'Should return error if try to execute command for role for standalone database',
          data: {
            command: `get ${constants.TEST_STRING_KEY_1}`,
            role: 'ALL',
            mode: 'ASCII',
            resultsMode: 'DEFAULT',
          },
          statusCode: 400,
          responseBody: {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Wrong database type.',
          },
        },
        {
          name: 'Should return error if try to execute command for particular node for standalone database',
          data: {
            command: `get ${constants.TEST_STRING_KEY_1}`,
            mode: 'ASCII',
            resultsMode: 'DEFAULT',
            nodeOptions: {
              host: 'localhost',
              port: 6379,
              enableRedirection: true,
            },
          },
          statusCode: 400,
          responseBody: {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Wrong database type.',
          },
        },
      ].map(mainCheckFn);
    });
  });
  xdescribe('Cluster', () => {
    requirements('rte.type=CLUSTER');
    requirements('!rte.re');

    let database;
    let nodes;

    before(async () => {
      database = await (
        await localDb.getRepository(localDb.repositories.DATABASE)
      ).findOneBy({
        id: constants.TEST_INSTANCE_ID,
      });
      nodes = JSON.parse(database.nodes);
    });

    describe('Commands using role', () => {
      [
        {
          name: 'Get command with role=ALL',
          data: {
            command: `get ${constants.TEST_STRING_KEY_1}`,
            role: 'ALL',
            mode: 'ASCII',
            resultsMode: 'DEFAULT',
          },
          responseSchema,
          before: async () => {
            await rte.client.set(
              constants.TEST_STRING_KEY_1,
              constants.TEST_STRING_VALUE_1,
            );
          },
          checkFn: async ({ body }) => {
            const result = body.result;

            expect(result.length).to.eql(nodes.length);
            expect(body.role).to.eql('ALL');
            expect(body.nodeOptions).to.eql(undefined);

            const resultSummary = {
              moved: 0,
              succeed: 0,
            };

            result.forEach((nodeResult) => {
              const node = nodes.find((node) => {
                return (
                  nodeResult.node.host === node.host &&
                  nodeResult.node.port === node.port
                );
              });

              if (!node) {
                fail(
                  `Unexpected node detected: ${JSON.stringify(nodeResult.node)}`,
                );
              }

              switch (nodeResult.status) {
                case 'fail':
                  expect(nodeResult.response).to.have.string('MOVED');
                  resultSummary.moved++;
                  break;
                case 'success':
                  expect(nodeResult.response).to.eql(
                    constants.TEST_STRING_VALUE_1,
                  );
                  resultSummary.succeed++;
                  break;
                default:
                  fail(`Unexpected node result status: ${nodeResult.status}`);
              }
            });

            expect(resultSummary.moved).to.gt(0);
            expect(resultSummary.succeed).to.gt(0);
            expect(resultSummary.moved + resultSummary.succeed).to.eq(
              nodes.length,
            );
          },
        },
        {
          name: 'Get command with role=MASTER',
          data: {
            command: `get ${constants.TEST_STRING_KEY_1}`,
            role: 'MASTER',
            mode: 'ASCII',
            resultsMode: 'DEFAULT',
          },
          responseSchema,
          checkFn: async ({ body }) => {
            const result = body.result;

            expect(result.length).to.lte(nodes.length);

            const resultSummary = {
              moved: 0,
              succeed: 0,
            };

            result.forEach((nodeResult) => {
              const node = nodes.find((node) => {
                return (
                  nodeResult.node.host === node.host &&
                  nodeResult.node.port === node.port
                );
              });

              if (!node) {
                fail(
                  `Unexpected node detected: ${JSON.stringify(nodeResult.node)}`,
                );
              }

              switch (nodeResult.status) {
                case 'fail':
                  expect(nodeResult.response).to.have.string('MOVED');
                  resultSummary.moved++;
                  break;
                case 'success':
                  expect(nodeResult.response).to.eql(
                    constants.TEST_STRING_VALUE_1,
                  );
                  resultSummary.succeed++;
                  break;
                default:
                  fail(`Unexpected node result status: ${nodeResult.status}`);
              }
            });

            expect(resultSummary.moved).to.gt(0);
            expect(resultSummary.succeed).to.gt(0);
            expect(resultSummary.moved + resultSummary.succeed).to.lte(
              nodes.length,
            );
          },
        },
        {
          name: 'Get command with role=SLAVE should return all failed responses',
          data: {
            command: `get ${constants.TEST_STRING_KEY_1}`,
            role: 'SLAVE',
            mode: 'ASCII',
            resultsMode: 'DEFAULT',
          },
          responseSchema,
          checkFn: async ({ body }) => {
            const result = body.result;

            expect(result.length).to.lte(nodes.length);

            const resultSummary = {
              moved: 0,
              succeed: 0,
            };

            result.forEach((nodeResult) => {
              const node = nodes.find((node) => {
                return (
                  nodeResult.node.host === node.host &&
                  nodeResult.node.port === node.port
                );
              });

              if (!node) {
                fail(
                  `Unexpected node detected: ${JSON.stringify(nodeResult.node)}`,
                );
              }

              switch (nodeResult.status) {
                case 'fail':
                  expect(nodeResult.response).to.have.string('MOVED');
                  resultSummary.moved++;
                  break;
                case 'success':
                  expect(nodeResult.response).to.eql(
                    constants.TEST_STRING_VALUE_1,
                  );
                  resultSummary.succeed++;
                  break;
                default:
                  fail(`Unexpected node result status: ${nodeResult.status}`);
              }
            });

            expect(resultSummary.moved).to.gte(0);
            expect(resultSummary.succeed).to.gte(0);
            expect(resultSummary.moved + resultSummary.succeed).to.lte(
              nodes.length,
            );
          },
        },
      ].map(mainCheckFn);
    });
    describe('Commands using nodeOptions', () => {
      [
        {
          name: 'Incorrect node should return an error',
          data: {
            command: `get ${constants.TEST_STRING_KEY_1}`,
            mode: 'ASCII',
            resultsMode: 'DEFAULT',
            nodeOptions: {
              host: 'unreachable',
              port: 6380,
              enableRedirection: true,
            },
          },
          statusCode: 400,
          responseBody: {
            statusCode: 400,
            message: 'Node unreachable:6380 not exist in OSS Cluster.',
            error: 'Bad Request',
          },
          before: async () => {
            await rte.client.set(
              constants.TEST_STRING_KEY_1,
              constants.TEST_STRING_VALUE_1,
            );
          },
        },
      ].map(mainCheckFn);

      it('Should auto redirect and never fail', async () => {
        await validateApiCall({
          endpoint,
          data: {
            command: `get ${constants.TEST_STRING_KEY_1}`,
            mode: 'ASCII',
            resultsMode: 'DEFAULT',
            nodeOptions: {
              ...nodes[0],
              enableRedirection: true,
            },
          },
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.result.length).to.eql(1);
            expect(body.nodeOptions).to.eql({
              ...nodes[0],
              enableRedirection: true,
            });
            expect(body.result[0].status).to.eql('success');
            expect(body.result[0].response).to.eql(
              constants.TEST_STRING_VALUE_1,
            );
          },
        });
      });
    });
  });
});
