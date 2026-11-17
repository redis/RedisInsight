import {
  expect,
  describe,
  it,
  deps,
  Joi,
  requirements,
  validateApiCall,
  getMainCheckFn,
  JoiRedisString,
} from '../deps';

const { server, request, constants } = deps;
const rte = deps.rte as any;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/vector-set/get-elements`,
  );

const mainCheckFn = getMainCheckFn(endpoint);

const responseSchema = Joi.object()
  .keys({
    keyName: JoiRedisString.required(),
    total: Joi.number().required(),
    nextCursor: Joi.string(),
    isPaginationSupported: Joi.boolean().required(),
    elements: Joi.array()
      .items(
        Joi.object({
          name: JoiRedisString.required(),
          attributes: Joi.string(),
        }),
      )
      .required(),
  })
  .required();

const seed = (key: string) =>
  Promise.all([
    rte.client.call('VADD', key, 'VALUES', '3', '1', '2', '3', 'a'),
    rte.client.call('VADD', key, 'VALUES', '3', '4', '5', '6', 'b'),
  ]);

describe('POST /databases/:id/vector-set/get-elements', () => {
  requirements('rte.version>=8.0');
  beforeEach(async () => rte.data.truncate());

  describe('Main', () => {
    it('Should return the elements of a vector set', async () => {
      const keyName = constants.getRandomString();
      await seed(keyName);

      await validateApiCall({
        endpoint,
        data: { keyName, count: 10 },
        responseSchema,
        checkFn: ({ body }: any) => {
          expect(body.total).to.eql(2);
          expect(body.elements.map((e: any) => e.name).sort()).to.eql([
            'a',
            'b',
          ]);
        },
      });
    });
  });

  describe('Errors', () => {
    [
      {
        name: 'Should return NotFound if key does not exist',
        data: { keyName: constants.getRandomString(), count: 10 },
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
        data: { keyName: constants.getRandomString(), count: 10 },
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
