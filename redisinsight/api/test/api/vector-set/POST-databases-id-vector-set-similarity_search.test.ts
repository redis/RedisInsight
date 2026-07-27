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
    `/${constants.API.DATABASES}/${instanceId}/vector-set/similarity-search`,
  );

const mainCheckFn = getMainCheckFn(endpoint);

// A self-match should score a perfect 1.0, but the default int8 quantization
// can land it slightly under (~0.999 observed), so assert closeness rather than
// an exact score — mirroring the e2e vector-set similarity tests.
const SELF_MATCH_SCORE_TOLERANCE = 0.001;

const responseSchema = Joi.object()
  .keys({
    keyName: JoiRedisString.required(),
    elements: Joi.array()
      .items(
        Joi.object({
          name: JoiRedisString.required(),
          score: Joi.number().required(),
          attributes: Joi.string(),
        }),
      )
      .required(),
  })
  .required();

const seed = (key: string) =>
  Promise.all([
    rte.client.call('VADD', key, 'VALUES', '3', '1', '2', '3', 'a'),
    rte.client.call('VADD', key, 'VALUES', '3', '1', '2', '3.1', 'b'),
    rte.client.call('VADD', key, 'VALUES', '3', '-9', '-9', '-9', 'c'),
  ]);

describe('POST /databases/:id/vector-set/similarity-search', () => {
  requirements('rte.version>=8.0');
  beforeEach(async () => rte.data.truncate());

  describe('Main', () => {
    it('Should return matches ordered by descending score for an element query', async () => {
      const keyName = constants.getRandomString();
      await seed(keyName);

      await validateApiCall({
        endpoint,
        data: { keyName, elementName: 'a', count: 2 },
        responseSchema,
        checkFn: ({ body }: any) => {
          expect(body.elements.length).to.eql(2);

          // Querying by element 'a' ranks a self-match first with a ~1.0 score.
          // Because 'a' ([1,2,3]) and 'b' ([1,2,3.1]) quantize almost identically,
          // either can occupy the top slot, so assert the top score is within
          // tolerance of a perfect match and that 'a' is present — rather than
          // pinning an exact name that flakes on the quantization tie.
          expect(body.elements[0].score).to.be.closeTo(
            1,
            SELF_MATCH_SCORE_TOLERANCE,
          );
          expect(body.elements[0].score).to.be.at.least(body.elements[1].score);
          expect(body.elements.map((element: any) => element.name)).to.include(
            'a',
          );
        },
      });
    });
  });

  describe('Validation', () => {
    // The "exactly one query" rule is enforced after the key-existence check,
    // so these cases seed the key first to reach the 400 instead of a 404.
    const validationKey = constants.getRandomString();

    [
      {
        name: 'Should reject a payload with no query (under-specified)',
        data: { keyName: validationKey },
        statusCode: 400,
        before: () => seed(validationKey),
      },
      {
        name: 'Should reject a payload with more than one query (over-specified)',
        data: {
          keyName: validationKey,
          elementName: 'a',
          vectorValues: [1, 2, 3],
        },
        statusCode: 400,
        before: () => seed(validationKey),
      },
    ].map(mainCheckFn);
  });

  describe('Errors', () => {
    [
      {
        name: 'Should return NotFound if key does not exist',
        data: { keyName: constants.getRandomString(), elementName: 'a' },
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
        data: { keyName: constants.getRandomString(), elementName: 'a' },
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
