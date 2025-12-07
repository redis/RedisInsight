import { expect, describe, deps, getMainCheckFn } from '../deps';
const { server, request, constants, rte, localDb } = deps;

// endpoint to test
const endpoint = (
  instanceId = constants.TEST_INSTANCE_ID,
  id = constants.TEST_COMMAND_EXECUTION_ID_1,
) =>
  request(server).delete(
    `/${constants.API.DATABASES}/${instanceId}/workbench/command-executions/${id}`,
  );

const mainCheckFn = getMainCheckFn(endpoint);

describe('DELETE /databases/:instanceId/workbench/command-executions/:commandExecutionId', () => {
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
        name: 'Should return 0 array when no history items yet',
        before: async () => {
          await localDb.generateNCommandExecutions(
            {
              databaseId: constants.TEST_INSTANCE_ID,
              id: constants.TEST_COMMAND_EXECUTION_ID_1,
            },
            1,
          );
        },
        after: async () => {
          expect(
            await (
              await localDb.getRepository(
                localDb.repositories.COMMAND_EXECUTION,
              )
            ).findOneBy({ id: constants.TEST_COMMAND_EXECUTION_ID_1 }),
          ).to.eql(null);
        },
      },
    ].map(mainCheckFn);
  });
});
