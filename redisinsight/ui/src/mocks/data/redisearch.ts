import { IndexInfoDto } from 'apiSrc/modules/browser/redisearch/dto'

// TODO: Rework this mock to use factory and faker later
export const MOCK_REDISEARCH_INDEX_INFO: IndexInfoDto = {
  index_name: 'idx:smpl_bicycle',
  index_options: {},
  index_definition: {
    key_type: 'JSON',
    prefixes: ['sample_bicycle:'],
    default_score: '1',
    indexes_all: 'false',
  },
  attributes: [
    {
      identifier: '$.brand',
      attribute: 'brand',
      type: 'TEXT',
      WEIGHT: '1',
      SEPARATOR: ',',
    },
    {
      identifier: '$.model',
      attribute: 'model',
      type: 'TEXT',
      WEIGHT: '1',
    },
    {
      identifier: '$.description',
      attribute: 'description',
      type: 'TEXT',
      WEIGHT: '1',
    },
    {
      identifier: '$.price',
      attribute: 'price',
      type: 'NUMERIC',
    },
    {
      identifier: '$.condition',
      attribute: 'condition',
      type: 'TAG',
      SEPARATOR: ',',
    },
    {
      identifier: '$.type',
      attribute: 'type',
      type: 'TAG',
      SEPARATOR: '',
    },
    {
      identifier: '$.helmet_included',
      attribute: 'helmet_included',
      type: 'TAG',
      SEPARATOR: '',
    },
    {
      identifier: '$.specs.material',
      attribute: 'material',
      type: 'TAG',
      SEPARATOR: '',
    },
    {
      identifier: '$.specs.weight',
      attribute: 'weight',
      type: 'NUMERIC',
    },
  ],
  num_docs: '106', // Note: DTO and actual response have different types, it should be a number
  max_doc_id: '106', // Note: DTO and actual response have different types, it should be a number
  num_terms: '539', // Note: DTO and actual response have different types, it should be a number
  num_records: '2645', // Note: DTO and actual response have different types, it should be a number
  inverted_sz_mb: '0.06543350219726563',
  vector_index_sz_mb: '0',
  total_inverted_index_blocks: '690', // Note: DTO and actual response have different types, it should be a number
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
  'field statistics': [
    {
      identifier: '$.brand',
      attribute: 'brand',
      'Index Errors': {
        'indexing failures': 0,
        'last indexing error': 'N/A',
        'last indexing error key': 'N/A',
      },
    },
    {
      identifier: '$.model',
      attribute: 'model',
      'Index Errors': {
        'indexing failures': 0,
        'last indexing error': 'N/A',
        'last indexing error key': 'N/A',
      },
    },
    {
      identifier: '$.description',
      attribute: 'description',
      'Index Errors': {
        'indexing failures': 0,
        'last indexing error': 'N/A',
        'last indexing error key': 'N/A',
      },
    },
    {
      identifier: '$.price',
      attribute: 'price',
      'Index Errors': {
        'indexing failures': 0,
        'last indexing error': 'N/A',
        'last indexing error key': 'N/A',
      },
    },
    {
      identifier: '$.condition',
      attribute: 'condition',
      'Index Errors': {
        'indexing failures': 0,
        'last indexing error': 'N/A',
        'last indexing error key': 'N/A',
      },
    },
    {
      identifier: '$.type',
      attribute: 'type',
      'Index Errors': {
        'indexing failures': 0,
        'last indexing error': 'N/A',
        'last indexing error key': 'N/A',
      },
    },
    {
      identifier: '$.helmet_included',
      attribute: 'helmet_included',
      'Index Errors': {
        'indexing failures': 0,
        'last indexing error': 'N/A',
        'last indexing error key': 'N/A',
      },
    },
    {
      identifier: '$.specs.material',
      attribute: 'material',
      'Index Errors': {
        'indexing failures': 0,
        'last indexing error': 'N/A',
        'last indexing error key': 'N/A',
      },
    },
    {
      identifier: '$.specs.weight',
      attribute: 'weight',
      'Index Errors': {
        'indexing failures': 0,
        'last indexing error': 'N/A',
        'last indexing error key': 'N/A',
      },
    },
  ],
}
