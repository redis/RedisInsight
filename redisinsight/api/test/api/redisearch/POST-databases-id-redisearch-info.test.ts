import {
  expect,
  describe,
  before,
  Joi,
  deps,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  getMainCheckFn,
} from '../deps';

const { server, request, constants, rte, localDb } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/redisearch/info`,
  );

// input data schema
const dataSchema = Joi.object({
  index: Joi.string().required(),
}).strict();

const validInputData = {
  index: constants.TEST_SEARCH_HASH_INDEX_1,
};

const BASE_RESPONSE_SCHEMA = {
  index_name: Joi.string().required(),
  index_options: Joi.object({}),
  index_definition: {
    key_type: Joi.string(),
    prefixes: Joi.array(),
    default_score: Joi.string(),
  },
  attributes: Joi.array().items({
    identifier: Joi.string(),
    attribute: Joi.string(),
    type: Joi.string(),
    WEIGHT: Joi.string(),
    SORTABLE: Joi.string(),
    NOINDEX: Joi.string(),
    CASESENSITIVE: Joi.string(),
    UNF: Joi.string(),
    NOSTEM: Joi.string(),
    SEPARATOR: Joi.string(),
  }),
  inverted_sz_mb: Joi.string(),
  vector_index_sz_mb: Joi.string(),
  offset_vectors_sz_mb: Joi.string(),
  doc_table_size_mb: Joi.string(),
  sortable_values_size_mb: Joi.string(),
  tag_overhead_sz_mb: Joi.string(),
  text_overhead_sz_mb: Joi.string(),
  total_index_memory_sz_mb: Joi.string(),
  key_table_size_mb: Joi.string(),
  geoshapes_sz_mb: Joi.string(),
  records_per_doc_avg: Joi.string(),
  bytes_per_record_avg: Joi.string(),
  offsets_per_term_avg: Joi.string(),
  offset_bits_per_record_avg: Joi.string(),
  total_indexing_time: Joi.string(),
  percent_indexed: Joi.string(),
  number_of_uses: Joi.number(),
  cleaning: Joi.number(),
  gc_stats: Joi.object(),
  cursor_stats: Joi.object(),
  dialect_stats: Joi.object(),
  'Index Errors': Joi.object(),
  'field statistics': Joi.array().items({
    identifier: Joi.string(),
    attribute: Joi.string(),
    'Index Errors': Joi.object(),
  }),
};

const EXPECTED_SCHEMA_V1 = Joi.object({
  ...BASE_RESPONSE_SCHEMA,
  num_docs: Joi.string(),
  max_doc_id: Joi.string(),
  num_terms: Joi.string(),
  num_records: Joi.string(),
  total_inverted_index_blocks: Joi.string(),
  hash_indexing_failures: Joi.string(),
  indexing: Joi.string(),
  index_definition: Joi.object(BASE_RESPONSE_SCHEMA.index_definition),
})
  .required()
  .strict();

const EXPECTED_SCHEMA_V2 = Joi.object({
  ...BASE_RESPONSE_SCHEMA,
  num_docs: Joi.number(),
  max_doc_id: Joi.number(),
  num_terms: Joi.number(),
  num_records: Joi.number(),
  total_inverted_index_blocks: Joi.number(),
  hash_indexing_failures: Joi.number(),
  indexing: Joi.number(),
  index_definition: Joi.object({
    ...BASE_RESPONSE_SCHEMA.index_definition,
    indexes_all: Joi.string(),
  }),
})
  .required()
  .strict();

const INVALID_INDEX_ERROR_MESSAGE_V1: string = 'Unknown Index name';
const INVALID_INDEX_ERROR_MESSAGE_V2: string = 'Unknown index name';

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:id/redisearch/info', () => {
  requirements('!rte.bigData', 'rte.modules.search');
  before(async () => {
    await rte.data.generateRedisearchIndexes(true);
    await localDb.createTestDbInstance(
      rte,
      {},
      { id: constants.TEST_INSTANCE_ID_2 },
    );
  });

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).forEach(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common, redisearch version < 2.8.X', () => {
    requirements('rte.modules.search.version<20800');
    [
      {
        name: 'Should get info index',
        data: validInputData,
        responseSchema: EXPECTED_SCHEMA_V1,
        checkFn: async ({ body }) => {
          expect(body.index_name).to.eq(constants.TEST_SEARCH_HASH_INDEX_1);
          expect(body.index_definition?.key_type).to.eq('HASH');
        },
      },
      {
        name: 'Should throw error if non-existent index provided',
        data: {
          index: 'Invalid index',
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: INVALID_INDEX_ERROR_MESSAGE_V1,
          error: 'Not Found',
        },
      },
    ].forEach(mainCheckFn);
  });

  describe('Common, 2.8.X <= redisearch version  < 2.10.X', () => {
    requirements(
      () =>
        20800 <= rte.env.modules.search.version &&
        rte.env.modules.search.version < 21000,
    );
    [
      {
        name: 'Should get info index',
        data: validInputData,
        responseSchema: EXPECTED_SCHEMA_V1,
        checkFn: async ({ body }) => {
          expect(body.index_name).to.eq(constants.TEST_SEARCH_HASH_INDEX_1);
          expect(body.index_definition?.key_type).to.eq('HASH');
        },
      },
      {
        name: 'Should throw error if non-existent index provided',
        data: {
          index: 'Invalid index',
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: INVALID_INDEX_ERROR_MESSAGE_V2,
          error: 'Not Found',
        },
      },
    ].forEach(mainCheckFn);
  });

  describe('Common, redisearch version >= 2.10.X', () => {
    requirements('rte.modules.search.version>=21000');
    [
      {
        name: 'Should get info index',
        data: validInputData,
        responseSchema: EXPECTED_SCHEMA_V2,
        checkFn: async ({ body }) => {
          expect(body.index_name).to.eq(constants.TEST_SEARCH_HASH_INDEX_1);
          expect(body.index_definition?.key_type).to.eq('HASH');
        },
      },
      {
        name: 'Should throw error if non-existent index provided',
        data: {
          index: 'Invalid index',
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Invalid index: no such index',
          error: 'Not Found',
        },
      },
    ].forEach(mainCheckFn);
  });
});
