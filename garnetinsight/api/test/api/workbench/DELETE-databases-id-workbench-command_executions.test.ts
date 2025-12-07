import {
  expect,
  describe,
  deps,
  getMainCheckFn,
  Joi,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
} from '../deps';
const { server, request, constants, localDb } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).delete(
    `/${constants.API.DATABASES}/${instanceId}/workbench/command-executions`,
  );

// input data schema
const dataSchema = Joi.object({
  type: Joi.string().valid('WORKBENCH', 'SEARCH').allow(null),
})
  .messages({
    'any.required': '{#label} should not be empty',
  })
  .strict();

const validInputData = {
  type: 'WORKBENCH',
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('DELETE /databases/:instanceId/workbench/command-executions', () => {
  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should return 404 not found when incorrect instance',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Invalid database instance id.',
          error: 'Not Found',
        },
      },
      {
        name: 'Should return 0 array when no history items yet',
        before: async () => {
          await localDb.generateNCommandExecutions(
            {
              databaseId: constants.TEST_INSTANCE_ID,
              id: constants.TEST_COMMAND_EXECUTION_ID_1,
            },
            2,
          );
        },
        after: async () => {
          expect(
            await (
              await localDb.getRepository(
                localDb.repositories.COMMAND_EXECUTION,
              )
            ).count({}),
          ).to.eq(0);
        },
      },
    ].map(mainCheckFn);
  });
  describe('Filter', () => {
    beforeEach(async () => {
      await localDb.generateNCommandExecutions(
        {
          databaseId: constants.TEST_INSTANCE_ID,
          type: 'WORKBENCH',
        },
        20,
        true,
      );
      await localDb.generateNCommandExecutions(
        {
          databaseId: constants.TEST_INSTANCE_ID,
          type: 'SEARCH',
        },
        10,
        false,
      );
    });

    [
      {
        name: 'Should return 404 not found when incorrect instance',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Invalid database instance id.',
          error: 'Not Found',
        },
      },
      {
        name: 'Should return remove only WORKBENCH items (by default)',
        after: async () => {
          expect(
            await (
              await localDb.getRepository(
                localDb.repositories.COMMAND_EXECUTION,
              )
            ).count({}),
          ).to.eq(10);
        },
      },
      {
        name: 'Should return remove only WORKBENCH items',
        data: {
          type: 'WORKBENCH',
        },
        after: async () => {
          expect(
            await (
              await localDb.getRepository(
                localDb.repositories.COMMAND_EXECUTION,
              )
            ).count({}),
          ).to.eq(10);
        },
      },
      {
        name: 'Should return remove only SEARCH items',
        data: {
          type: 'SEARCH',
        },
        after: async () => {
          expect(
            await (
              await localDb.getRepository(
                localDb.repositories.COMMAND_EXECUTION,
              )
            ).count({}),
          ).to.eq(20);
        },
      },
    ].map(mainCheckFn);
  });
});
