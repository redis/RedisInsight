import {
  describe,
  before,
  deps,
  Joi,
  requirements,
  getMainCheckFn,
  JoiRedisString,
} from '../deps';

const { server, request, constants } = deps;
const rte = deps.rte as any;

// Targets the shared /keys/get-info endpoint but lives in test/api/array so
// the new oss-st-8 RTE (TEST_TAGS=array) loads it. The matching Array branch
// in test/api/keys/POST-databases-id-keys-get_info.test.ts was removed to
// avoid duplicate runs on untagged RTEs.
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/keys/get-info`,
  );

// Decimal-string contract: ARLEN / ARCOUNT can exceed Number.MAX_SAFE_INTEGER
// for sparse arrays, so the response surfaces them as strings — never numbers.
const responseSchema = Joi.object()
  .keys({
    name: JoiRedisString.required(),
    type: Joi.string().valid('array').required(),
    ttl: Joi.number().integer().allow(null).optional(),
    size: Joi.number().integer().allow(null).optional(),
    length: Joi.string().pattern(/^\d+$/).required(),
    count: Joi.string().pattern(/^\d+$/).required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

// Exercises the GetArrayKeyInfoResponse branch of the keys/get-info `oneOf`
// response and the ArrayKeyInfoStrategy. The dense vs sparse divergence is
// the whole reason the strategy issues both ARLEN and ARCOUNT.
describe('POST /databases/:instanceId/keys/get-info (Array)', () => {
  requirements('rte.version>=8.8');

  const denseKey = constants.getRandomString();
  const sparseKey = constants.getRandomString();
  const gapKey = constants.getRandomString();

  before(async () => {
    await rte.client.call('ARSET', denseKey, '0', 'a', 'b', 'c');
    // Sparse: indexes 0,5 populated → length=6, count=2.
    await rte.client.call('ARMSET', sparseKey, '0', 'v0', '5', 'v5');
    // Highest index 2^53 → length 2^53 + 1, inside the (2^53, 2^63) zone
    // where Redis sends a RESP integer a JS number would round.
    await rte.client.call('ARSET', gapKey, '9007199254740992', 'x');
  });

  [
    {
      name: 'Should return array info with length === count for a dense array',
      data: { keyName: denseKey },
      responseSchema,
      responseBody: {
        name: denseKey,
        type: 'array',
        length: '3',
        count: '3',
      },
    },
    {
      name: 'Should return array info with length !== count for a sparse array',
      data: { keyName: sparseKey },
      responseSchema,
      responseBody: {
        name: sparseKey,
        type: 'array',
        length: '6',
        count: '2',
      },
    },
    {
      name: 'Should keep a u64 length exact in the (2^53, 2^63) RESP-integer zone',
      data: { keyName: gapKey },
      responseSchema,
      responseBody: {
        name: gapKey,
        type: 'array',
        length: '9007199254740993',
        count: '1',
      },
    },
  ].map(mainCheckFn);
});
