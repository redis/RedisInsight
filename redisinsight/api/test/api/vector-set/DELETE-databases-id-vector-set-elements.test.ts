import {
  expect,
  describe,
  it,
  deps,
  Joi,
  requirements,
  validateApiCall,
  getMainCheckFn,
} from '../deps';

const { server, request, constants } = deps;
const rte = deps.rte as any;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).delete(
    `/${constants.API.DATABASES}/${instanceId}/vector-set/elements`,
  );

const mainCheckFn = getMainCheckFn(endpoint);

const responseSchema = Joi.object()
  .keys({ affected: Joi.number().required() })
  .required();

const vcard = (key: string) => rte.client.call('VCARD', key);
const seed = (key: string) =>
  Promise.all([
    rte.client.call('VADD', key, 'VALUES', '3', '1', '2', '3', 'a'),
    rte.client.call('VADD', key, 'VALUES', '3', '4', '5', '6', 'b'),
  ]);

describe('DELETE /databases/:id/vector-set/elements', () => {
  requirements('rte.version>=8.0');
  beforeEach(async () => rte.data.truncate());

  describe('Main', () => {
    it('Should remove elements and report the affected count', async () => {
      const keyName = constants.getRandomString();
      await seed(keyName);

      await validateApiCall({
        endpoint,
        data: { keyName, elements: ['a', 'missing'] },
        responseSchema,
        // Only 'a' exists, so a single member is removed.
        responseBody: { affected: 1 },
      });

      expect(await vcard(keyName)).to.eql(1);
    });
  });

  describe('Errors', () => {
    [
      {
        name: 'Should return NotFound if key does not exist',
        data: { keyName: constants.getRandomString(), elements: ['a'] },
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
        data: { keyName: constants.getRandomString(), elements: ['a'] },
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
