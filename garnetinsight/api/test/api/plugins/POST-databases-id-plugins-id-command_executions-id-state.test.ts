import {
  expect,
  describe,
  it,
  Joi,
  _,
  deps,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  validateApiCall,
} from '../deps';
const { server, request, constants, localDb } = deps;

// endpoint to test
const endpoint = (
  instanceId = constants.TEST_INSTANCE_ID,
  visualizationId = constants.TEST_PLUGIN_VISUALIZATION_ID_1,
  id = constants.TEST_COMMAND_EXECUTION_ID_1,
) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/plugins/${visualizationId}/command-executions/${id}/state`,
  );

// input data schema
const dataSchema = Joi.object({
  state: Joi.any().required(),
})
  .messages({
    'any.required': '{#label} should be defined',
  })
  .strict();

const validInputData = {
  state: {
    some: 'state',
    here: true,
  },
};

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
  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

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
        data: {
          state: 'some state',
        },
        responseBody: {
          statusCode: 404,
          message: 'Command execution was not found.',
          error: 'Not Found',
        },
      },
      {
        name: 'Should set string',
        data: {
          state: 'some state',
        },
        statusCode: 201,
        checkFn: async ({ body }) => {
          expect(body).to.eql({});
          const entity: any = await (
            await localDb.getRepository(localDb.repositories.PLUGIN_STATE)
          ).findOneBy({
            commandExecutionId: constants.TEST_COMMAND_EXECUTION_ID_1,
            visualizationId: constants.TEST_PLUGIN_VISUALIZATION_ID_1,
          });

          expect(entity.state).to.eql(
            localDb.encryptData(JSON.stringify('some state')),
          );
        },
        before: async () => {
          await localDb.generateNCommandExecutions(
            {
              databaseId: constants.TEST_INSTANCE_ID,
              id: constants.TEST_COMMAND_EXECUTION_ID_1,
            },
            1,
          );
        },
      },
      {
        name: 'Should set empty string',
        data: {
          state: '',
        },
        statusCode: 201,
        checkFn: async ({ body }) => {
          expect(body).to.eql({});
          const entity: any = await (
            await localDb.getRepository(localDb.repositories.PLUGIN_STATE)
          ).findOneBy({
            commandExecutionId: constants.TEST_COMMAND_EXECUTION_ID_1,
            visualizationId: constants.TEST_PLUGIN_VISUALIZATION_ID_1,
          });

          expect(entity.state).to.eql(localDb.encryptData(JSON.stringify('')));
        },
        before: async () => {
          await localDb.generateNCommandExecutions(
            {
              databaseId: constants.TEST_INSTANCE_ID,
              id: constants.TEST_COMMAND_EXECUTION_ID_1,
            },
            1,
          );
        },
      },
      {
        name: 'Should set null state',
        data: {
          state: null,
        },
        statusCode: 201,
        checkFn: async ({ body }) => {
          expect(body).to.eql({});
          const entity: any = await (
            await localDb.getRepository(localDb.repositories.PLUGIN_STATE)
          ).findOneBy({
            commandExecutionId: constants.TEST_COMMAND_EXECUTION_ID_1,
            visualizationId: constants.TEST_PLUGIN_VISUALIZATION_ID_1,
          });

          expect(entity.state).to.eql(
            localDb.encryptData(JSON.stringify(null)),
          );
        },
        before: async () => {
          await localDb.generateNCommandExecutions(
            {
              databaseId: constants.TEST_INSTANCE_ID,
              id: constants.TEST_COMMAND_EXECUTION_ID_1,
            },
            1,
          );
        },
      },
    ].map(mainCheckFn);
  });
});
