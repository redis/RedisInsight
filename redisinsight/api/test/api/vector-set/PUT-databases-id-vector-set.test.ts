import {
  expect,
  describe,
  it,
  deps,
  requirements,
  validateApiCall,
  getMainCheckFn,
} from '../deps';

const { server, request, constants } = deps;
const rte = deps.rte as any;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).put(`/${constants.API.DATABASES}/${instanceId}/vector-set`);

const mainCheckFn = getMainCheckFn(endpoint);

const vcard = (key: string) => rte.client.call('VCARD', key);
const seed = (key: string) =>
  rte.client.call('VADD', key, 'VALUES', '3', '1', '2', '3', 'a');

describe('PUT /databases/:id/vector-set', () => {
  requirements('rte.version>=8.0');
  beforeEach(async () => rte.data.truncate());

  describe('Main', () => {
    it('Should add elements to an existing vector set', async () => {
      const keyName = constants.getRandomString();
      await seed(keyName);

      await validateApiCall({
        endpoint,
        data: {
          keyName,
          elements: [
            { name: 'b', vectorValues: [4, 5, 6] },
            { name: 'c', vectorValues: [7, 8, 9] },
          ],
        },
        statusCode: 200,
      });

      expect(await vcard(keyName)).to.eql(3);
    });
  });

  describe('Errors', () => {
    [
      {
        name: 'Should return NotFound if key does not exist',
        data: {
          keyName: constants.getRandomString(),
          elements: [{ name: 'a', vectorValues: [1, 2, 3] }],
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          error: 'Not Found',
          message: 'Key with this name does not exist.',
        },
      },
      {
        name: 'Should return NotFound if instance id does not exist',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        data: {
          keyName: constants.getRandomString(),
          elements: [{ name: 'a', vectorValues: [1, 2, 3] }],
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
});
