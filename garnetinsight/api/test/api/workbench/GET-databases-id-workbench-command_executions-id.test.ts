import { expect, describe, it, Joi, deps, validateApiCall } from '../deps';
const { server, request, constants, localDb } = deps;

// endpoint to test
const endpoint = (
  instanceId = constants.TEST_INSTANCE_ID,
  id = constants.TEST_COMMAND_EXECUTION_ID_1,
) =>
  request(server).get(
    `/${constants.API.DATABASES}/${instanceId}/workbench/command-executions/${id}`,
  );

const responseSchema = Joi.object()
  .keys({
    id: Joi.string().required(),
    databaseId: Joi.string().required(),
    command: Joi.string().required().allow(null),
    result: Joi.array()
      .items(
        Joi.object({
          response: Joi.any().required(),
          status: Joi.string().required(),
        }),
      )
      .allow(null),
    mode: Joi.string().required(),
    summary: Joi.string().allow(null),
    resultsMode: Joi.string().allow(null),
    executionTime: Joi.number().required(),
    db: Joi.number().integer().allow(null),
    createdAt: Joi.date().required(),
    type: Joi.string().valid('WORKBENCH', 'SEARCH').required(),
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

describe('GET /databases/:instanceId/workbench/command-executions/:commandExecutionId', () => {
  describe('Common', () => {
    [
      {
        name: 'Should return 404 not found when incorrect instance',
        endpoint: () =>
          endpoint(
            constants.TEST_NOT_EXISTED_INSTANCE_ID,
            constants.TEST_COMMAND_EXECUTION_ID_1,
          ),
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Invalid database instance id.',
          error: 'Not Found',
        },
      },
      {
        name: 'Should return 404 not found when incorrect command execution id',
        endpoint: () =>
          endpoint(constants.TEST_INSTANCE_ID, constants.TEST_INSTANCE_ID),
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Command execution was not found.',
          error: 'Not Found',
        },
      },
      {
        name: 'Should return 0 array when no history items yet',
        responseSchema,
        before: async () => {
          await localDb.generateNCommandExecutions(
            {
              databaseId: constants.TEST_INSTANCE_ID,
            },
            100,
            true,
          );
          await localDb.generateNCommandExecutions(
            {
              databaseId: constants.TEST_INSTANCE_ID,
              id: constants.TEST_COMMAND_EXECUTION_ID_1,
            },
            1,
          );
        },
        checkFn: async ({ body }) => {
          expect(body.id).to.eql(constants.TEST_COMMAND_EXECUTION_ID_1);
        },
      },
      {
        name: 'Should return null in the command and result when unable to decrypt',
        responseSchema,
        before: async () => {
          await localDb.generateNCommandExecutions(
            {
              databaseId: constants.TEST_INSTANCE_ID,
              id: constants.TEST_COMMAND_EXECUTION_ID_1,
              command: 'badencryption',
              result: 'badencryption',
              encryption: 'KEYTAR',
            },
            1,
          );
        },
        checkFn: async ({ body }) => {
          expect(body.id).to.eql(constants.TEST_COMMAND_EXECUTION_ID_1);
          expect(body.command).to.eql(null);
          expect(body.result).to.eql(null);
        },
      },
    ].map(mainCheckFn);
  });
});
