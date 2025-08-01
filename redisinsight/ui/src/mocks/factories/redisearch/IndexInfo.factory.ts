import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import {
  FieldStatisticsDto,
  IndexAttibuteDto,
  IndexInfoDto,
} from 'apiSrc/modules/browser/redisearch/dto'

export const INDEX_INFO_SEPARATORS: string[] = [',', ';', '|', ':']

// Note: Current data is replica of the sample data, but we can make it more realistic/diverse in the future
export const indexInfoFactory = Factory.define<IndexInfoDto>(() => ({
  index_name: `idx:${faker.word.noun()}`,
  index_options: {},
  index_definition: {
    key_type: 'JSON',
    prefixes: [`$${faker.word.noun()}:`],
    default_score: '1',
    indexes_all: 'false',
  },
  attributes: indexInfoAttributeFactory.buildList(3),
  num_docs: faker.number.int({ min: 0, max: 100 }).toString(), // Note: DTO and actual response have different types, it should be a number
  max_doc_id: faker.number.int({ min: 101, max: 200 }).toString(), // Note: DTO and actual response have different types, it should be a number
  num_terms: faker.number.int({ min: 201, max: 300 }).toString(), // Note: DTO and actual response have different types, it should be a number
  num_records: faker.number.int({ min: 301, max: 400 }).toString(), // Note: DTO and actual response have different types, it should be a number
  inverted_sz_mb: '0.06543350219726563',
  vector_index_sz_mb: '0',
  total_inverted_index_blocks: faker.number
    .int({ min: 401, max: 500 })
    .toString(), // Note: DTO and actual response have different types, it should be a number
  offset_vectors_sz_mb: '0.0022459030151367188',
  doc_table_size_mb: '0.023920059204101563',
  sortable_values_size_mb: '0',
  key_table_size_mb: '0.0032911300659179688',
  tag_overhead_sz_mb: '6.361007690429688e-4',
  text_overhead_sz_mb: '0.017991065979003906',
  total_index_memory_sz_mb: '0.11714744567871094',
  geoshapes_sz_mb: '0',
  records_per_doc_avg: '24.952829360961914',
  bytes_per_record_avg: '25.940263748168945',
  offsets_per_term_avg: '0.8903591632843018',
  offset_bits_per_record_avg: '8',
  hash_indexing_failures: '0', // Note: DTO and actual response have different types, it should be a number
  total_indexing_time: '1.7289999723434448',
  indexing: '0', // Note: DTO and actual response have different types, it should be a number
  percent_indexed: '1',
  number_of_uses: 39,
  cleaning: 0,
  gc_stats: {
    bytes_collected: '0',
    total_ms_run: '0',
    total_cycles: '0',
    average_cycle_time_ms: 'nan',
    last_run_time_ms: '0',
    gc_numeric_trees_missed: '0',
    gc_blocks_denied: '0',
  },
  cursor_stats: {
    global_idle: 0,
    global_total: 0,
    index_capacity: 128,
    index_total: 0,
  },
  dialect_stats: {
    dialect_1: 0,
    dialect_2: 0,
    dialect_3: 0,
    dialect_4: 0,
  },
  'Index Errors': {
    'indexing failures': 0,
    'last indexing error': 'N/A',
    'last indexing error key': 'N/A',
    'background indexing status': 'OK',
  },
  'field statistics': indexInfoFieldStatisticsFactory.buildList(3),
}))

type IndexInfoAttributeFactoryTransientParams = {
  includeWeight?: boolean
  includeSeparator?: boolean
  includeNoIndex?: boolean
}

export const indexInfoAttributeFactory = Factory.define<
  IndexAttibuteDto,
  IndexInfoAttributeFactoryTransientParams
>(({ transientParams }) => {
  const name = faker.word.noun()

  const {
    includeWeight = faker.datatype.boolean(),
    includeSeparator = faker.datatype.boolean(),
    includeNoIndex = faker.datatype.boolean(),
  } = transientParams

  return {
    identifier: `$.${name}`,
    attribute: name,
    type: faker.helpers.enumValue(FieldTypes).toString(),

    // Optional fields
    ...(includeWeight && {
      WEIGHT: faker.number
        .float({ min: 0.1, max: 10, fractionDigits: 1 })
        .toString(),
    }),
    ...(includeSeparator && {
      SEPARATOR: faker.helpers.arrayElement(INDEX_INFO_SEPARATORS),
    }),
    ...(includeNoIndex && {
      NOINDEX: faker.datatype.boolean(),
    }),
  }
})

export const indexInfoFieldStatisticsFactory =
  Factory.define<FieldStatisticsDto>(() => {
    const name = faker.word.noun()

    return {
      identifier: `$.${name}`,
      attribute: name,
      'Index Errors': {
        'indexing failures': 0,
        'last indexing error': 'N/A',
        'last indexing error key': 'N/A',
      },
    }
  })
