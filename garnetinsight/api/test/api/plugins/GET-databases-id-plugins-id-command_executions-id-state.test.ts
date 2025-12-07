import { expect, describe, it, Joi, _, deps, validateApiCall } from '../deps';
const { server, request, constants, localDb } = deps;

// endpoint to test
const endpoint = (
  instanceId = constants.TEST_INSTANCE_ID,
  visualizationId = constants.TEST_PLUGIN_VISUALIZATION_ID_1,
  id = constants.TEST_COMMAND_EXECUTION_ID_1,
) =>
  request(server).get(
    `/${constants.API.DATABASES}/${instanceId}/plugins/${visualizationId}/command-executions/${id}/state`,
  );

const responseSchema = Joi.object()
  .keys({
    commandExecutionId: Joi.string().required(),
    visualizationId: Joi.string().required(),
    state: Joi.any().required(),
    createdAt: Joi.date().required(),
    updatedAt: Joi.date().required(),
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

describe('POST /databases/:instanceId/plugins/:vId/command-executions/:id/state', () => {
  describe('Common', () => {
    [
      {
        name: 'Should return 404 not found when incorrect instance',
        endpoint: () =>
          endpoint(
            constants.TEST_NOT_EXISTED_INSTANCE_ID,
            constants.TEST_PLUGIN_VISUALIZATION_ID_1,
            constants.TEST_NOT_EXISTED_INSTANCE_ID,
          ),
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Plugin state was not found.',
          error: 'Not Found',
        },
      },
      {
        name: 'Should get string',
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.commandExecutionId).to.eql(
            constants.TEST_COMMAND_EXECUTION_ID_1,
          );
          expect(body.visualizationId).to.eql(
            constants.TEST_PLUGIN_VISUALIZATION_ID_1,
          );
          expect(body.state).to.eql('some state');
        },
        before: async () => {
          await localDb.generateNCommandExecutions(
            {
              databaseId: constants.TEST_INSTANCE_ID,
              id: constants.TEST_COMMAND_EXECUTION_ID_1,
            },
            1,
            true,
          );

          await localDb.generatePluginState(
            {
              commandExecutionId: constants.TEST_COMMAND_EXECUTION_ID_1,
              visualizationId: constants.TEST_PLUGIN_VISUALIZATION_ID_1,
            },
            true,
          );
        },
      },
    ].map(mainCheckFn);
  });
});
