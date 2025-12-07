import { expect, describe, before, deps, getMainCheckFn } from '../deps';

const { request, server, localDb, constants } = deps;

const endpoint = (id) =>
  request(server).delete(`/${constants.API.DATABASES}/${id}`);

const mainCheckFn = getMainCheckFn(endpoint);

describe(`DELETE /databases/:id`, () => {
  before(async () => await localDb.createDatabaseInstances());

  describe('Common', () => {
    [
      {
        name: 'Should remove single database',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ID_2),
        before: async () => {
          expect(
            await localDb.getInstanceByName(constants.TEST_INSTANCE_NAME_2),
          ).to.be.an('object');
        },
        after: async () => {
          expect(
            await localDb.getInstanceByName(constants.TEST_INSTANCE_NAME_2),
          ).to.eql(null);
        },
      },
      {
        name: 'Should return Not Found Error',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ID_2),
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Invalid database instance id.',
          error: 'Not Found',
        },
        before: async () => {
          expect(
            await localDb.getInstanceByName(constants.TEST_INSTANCE_NAME_2),
          ).to.eql(null);
        },
      },
      {
        name: 'Should remove unused tags along with database',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ID_7),
        before: async () => {
          await localDb.createInstancesWithTags();

          const instance = await localDb.getInstanceById(
            constants.TEST_INSTANCE_ID_7,
          );
          const tags = await localDb.getAllTags();

          expect(instance).to.be.an('object');
          expect(tags.length).to.eq(constants.TEST_TAGS.length);
        },
        after: async () => {
          const instance = await localDb.getInstanceById(
            constants.TEST_INSTANCE_ID_7,
          );
          const tags = await localDb.getAllTags();

          expect(instance).to.eql(null);
          expect(tags.length).to.eq(constants.TEST_TAGS.length - 1);
        },
      },
    ].map(mainCheckFn);
  });
});
