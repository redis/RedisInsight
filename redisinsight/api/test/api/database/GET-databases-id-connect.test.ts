import { describe, deps, before, getMainCheckFn } from '../deps';
const { localDb, request, server, constants } = deps;

const endpoint = (id = constants.TEST_INSTANCE_ID) =>
  request(server).get(`/${constants.API.DATABASES}/${id}/connect`);

const mainCheckFn = getMainCheckFn(endpoint);

describe(`GET /databases/:id/connect`, () => {
  before(async () => await localDb.createDatabaseInstances());

  [
    {
      name: 'Should connect to a database',
      statusCode: 200,
    },
    {
      endpoint: () => endpoint(constants.TEST_INSTANCE_ID_2),
      name: 'Should not connect to a database due to misconfiguration',
      statusCode: 424,
      responseBody: {
        statusCode: 424,
        error: 'RedisConnectionUnavailableException',
        errorCode: 10904,
      },
    },
    {
      name: 'Should return NotFound error if instance id does not exists',
      endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
      statusCode: 404,
      responseBody: {
        statusCode: 404,
        error: 'Not Found',
        message: 'Invalid database instance id.',
      },
    },
  ].map(mainCheckFn);
});
