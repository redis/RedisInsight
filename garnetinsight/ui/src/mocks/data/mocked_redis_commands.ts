export const MOCKED_REDIS_COMMANDS = {
  'FT.SEARCH': {
    summary:
      'Searches the index with a textual query, returning either documents or just ids',
    complexity: 'O(N)',
    history: [['2.0.0', 'Deprecated `WITHPAYLOADS` and `PAYLOAD` arguments']],
    arguments: [
      {
        name: 'index',
        type: 'string',
      },
      {
        name: 'query',
        type: 'string',
      },
      {
        name: 'nocontent',
        type: 'pure-token',
        token: 'NOCONTENT',
        optional: true,
      },
      {
        name: 'verbatim',
        type: 'pure-token',
        token: 'VERBATIM',
        optional: true,
      },
      {
        name: 'nostopwords',
        type: 'pure-token',
        token: 'NOSTOPWORDS',
        optional: true,
      },
      {
        name: 'withscores',
        type: 'pure-token',
        token: 'WITHSCORES',
        optional: true,
      },
      {
        name: 'withpayloads',
        type: 'pure-token',
        token: 'WITHPAYLOADS',
        optional: true,
      },
      {
        name: 'withsortkeys',
        type: 'pure-token',
        token: 'WITHSORTKEYS',
        optional: true,
      },
      {
        name: 'filter',
        type: 'block',
        optional: true,
        multiple: true,
        arguments: [
          {
            name: 'numeric_field',
            type: 'string',
            token: 'FILTER',
          },
          {
            name: 'min',
            type: 'double',
          },
          {
            name: 'max',
            type: 'double',
          },
        ],
      },
      {
        name: 'geo_filter',
        type: 'block',
        optional: true,
        multiple: true,
        arguments: [
          {
            name: 'geo_field',
            type: 'string',
            token: 'GEOFILTER',
          },
          {
            name: 'lon',
            type: 'double',
          },
          {
            name: 'lat',
            type: 'double',
          },
          {
            name: 'radius',
            type: 'double',
          },
          {
            name: 'radius_type',
            type: 'oneof',
            arguments: [
              {
                name: 'm',
                type: 'pure-token',
                token: 'm',
              },
              {
                name: 'km',
                type: 'pure-token',
                token: 'km',
              },
              {
                name: 'mi',
                type: 'pure-token',
                token: 'mi',
              },
              {
                name: 'ft',
                type: 'pure-token',
                token: 'ft',
              },
            ],
          },
        ],
      },
      {
        name: 'in_keys',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'count',
            type: 'string',
            token: 'INKEYS',
          },
          {
            name: 'key',
            type: 'string',
            multiple: true,
          },
        ],
      },
      {
        name: 'in_fields',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'count',
            type: 'string',
            token: 'INFIELDS',
          },
          {
            name: 'field',
            type: 'string',
            multiple: true,
          },
        ],
      },
      {
        name: 'return',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'count',
            type: 'string',
            token: 'RETURN',
          },
          {
            name: 'identifiers',
            type: 'block',
            multiple: true,
            arguments: [
              {
                name: 'identifier',
                type: 'string',
              },
              {
                name: 'property',
                type: 'string',
                token: 'AS',
                optional: true,
              },
            ],
          },
        ],
      },
      {
        name: 'summarize',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'summarize',
            type: 'pure-token',
            token: 'SUMMARIZE',
          },
          {
            name: 'fields',
            type: 'block',
            optional: true,
            arguments: [
              {
                name: 'count',
                type: 'string',
                token: 'FIELDS',
              },
              {
                name: 'field',
                type: 'string',
                multiple: true,
              },
            ],
          },
          {
            name: 'num',
            type: 'integer',
            token: 'FRAGS',
            optional: true,
          },
          {
            name: 'fragsize',
            type: 'integer',
            token: 'LEN',
            optional: true,
          },
          {
            name: 'separator',
            type: 'string',
            token: 'SEPARATOR',
            optional: true,
          },
        ],
      },
      {
        name: 'highlight',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'highlight',
            type: 'pure-token',
            token: 'HIGHLIGHT',
          },
          {
            name: 'fields',
            type: 'block',
            optional: true,
            arguments: [
              {
                name: 'count',
                type: 'string',
                token: 'FIELDS',
              },
              {
                name: 'field',
                type: 'string',
                multiple: true,
              },
            ],
          },
          {
            name: 'tags',
            type: 'block',
            optional: true,
            arguments: [
              {
                name: 'tags',
                type: 'pure-token',
                token: 'TAGS',
              },
              {
                name: 'open',
                type: 'string',
              },
              {
                name: 'close',
                type: 'string',
              },
            ],
          },
        ],
      },
      {
        name: 'slop',
        type: 'integer',
        optional: true,
        token: 'SLOP',
      },
      {
        name: 'timeout',
        type: 'integer',
        optional: true,
        token: 'TIMEOUT',
      },
      {
        name: 'inorder',
        type: 'pure-token',
        token: 'INORDER',
        optional: true,
      },
      {
        name: 'language',
        type: 'string',
        optional: true,
        token: 'LANGUAGE',
      },
      {
        name: 'expander',
        type: 'string',
        optional: true,
        token: 'EXPANDER',
      },
      {
        name: 'scorer',
        type: 'string',
        optional: true,
        token: 'SCORER',
      },
      {
        name: 'explainscore',
        type: 'pure-token',
        token: 'EXPLAINSCORE',
        optional: true,
      },
      {
        name: 'payload',
        type: 'string',
        optional: true,
        token: 'PAYLOAD',
      },
      {
        name: 'sortby',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'sortby',
            type: 'string',
            token: 'SORTBY',
          },
          {
            name: 'order',
            type: 'oneof',
            optional: true,
            arguments: [
              {
                name: 'asc',
                type: 'pure-token',
                token: 'ASC',
              },
              {
                name: 'desc',
                type: 'pure-token',
                token: 'DESC',
              },
            ],
          },
        ],
      },
      {
        name: 'limit',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'limit',
            type: 'pure-token',
            token: 'LIMIT',
          },
          {
            name: 'offset',
            type: 'integer',
          },
          {
            name: 'num',
            type: 'integer',
          },
        ],
      },
      {
        name: 'params',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'params',
            type: 'pure-token',
            token: 'PARAMS',
          },
          {
            name: 'nargs',
            type: 'integer',
          },
          {
            name: 'values',
            type: 'block',
            multiple: true,
            arguments: [
              {
                name: 'name',
                type: 'string',
              },
              {
                name: 'value',
                type: 'string',
              },
            ],
          },
        ],
      },
      {
        name: 'dialect',
        type: 'integer',
        optional: true,
        token: 'DIALECT',
        since: '2.4.3',
      },
    ],
    since: '1.0.0',
    group: 'search',
  },
  'FT.AGGREGATE': {
    summary:
      'Run a search query on an index and perform aggregate transformations on the results',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'index',
        type: 'string',
      },
      {
        name: 'query',
        type: 'string',
      },
      {
        name: 'verbatim',
        type: 'pure-token',
        token: 'VERBATIM',
        optional: true,
      },
      {
        name: 'load',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'count',
            type: 'string',
            token: 'LOAD',
          },
          {
            name: 'field',
            type: 'string',
            multiple: true,
          },
        ],
      },
      {
        name: 'timeout',
        type: 'integer',
        optional: true,
        token: 'TIMEOUT',
      },
      {
        name: 'loadall',
        type: 'pure-token',
        token: 'LOAD *',
        optional: true,
      },
      {
        name: 'groupby',
        type: 'block',
        optional: true,
        multiple: true,
        arguments: [
          {
            name: 'nargs',
            type: 'integer',
            token: 'GROUPBY',
          },
          {
            name: 'property',
            type: 'string',
            multiple: true,
          },
          {
            name: 'reduce',
            type: 'block',
            optional: true,
            multiple: true,
            arguments: [
              {
                name: 'function',
                type: 'string',
                token: 'REDUCE',
              },
              {
                name: 'nargs',
                type: 'integer',
              },
              {
                name: 'arg',
                type: 'string',
                multiple: true,
              },
              {
                name: 'name',
                type: 'string',
                token: 'AS',
                optional: true,
              },
            ],
          },
        ],
      },
      {
        name: 'sortby',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'nargs',
            type: 'integer',
            token: 'SORTBY',
          },
          {
            name: 'fields',
            type: 'block',
            optional: true,
            multiple: true,
            arguments: [
              {
                name: 'property',
                type: 'string',
              },
              {
                name: 'order',
                type: 'oneof',
                arguments: [
                  {
                    name: 'asc',
                    type: 'pure-token',
                    token: 'ASC',
                  },
                  {
                    name: 'desc',
                    type: 'pure-token',
                    token: 'DESC',
                  },
                ],
              },
            ],
          },
          {
            name: 'num',
            type: 'integer',
            token: 'MAX',
            optional: true,
          },
        ],
      },
      {
        name: 'apply',
        type: 'block',
        optional: true,
        multiple: true,
        arguments: [
          {
            name: 'expression',
            type: 'string',
            token: 'APPLY',
          },
          {
            name: 'name',
            type: 'string',
            token: 'AS',
          },
        ],
      },
      {
        name: 'limit',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'limit',
            type: 'pure-token',
            token: 'LIMIT',
          },
          {
            name: 'offset',
            type: 'integer',
          },
          {
            name: 'num',
            type: 'integer',
          },
        ],
      },
      {
        name: 'filter',
        type: 'string',
        optional: true,
        token: 'FILTER',
      },
      {
        name: 'cursor',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'withcursor',
            type: 'pure-token',
            token: 'WITHCURSOR',
          },
          {
            name: 'read_size',
            type: 'integer',
            optional: true,
            token: 'COUNT',
          },
          {
            name: 'idle_time',
            type: 'integer',
            optional: true,
            token: 'MAXIDLE',
          },
        ],
      },
      {
        name: 'params',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'params',
            type: 'pure-token',
            token: 'PARAMS',
          },
          {
            name: 'nargs',
            type: 'integer',
          },
          {
            name: 'values',
            type: 'block',
            multiple: true,
            arguments: [
              {
                name: 'name',
                type: 'string',
              },
              {
                name: 'value',
                type: 'string',
              },
            ],
          },
        ],
      },
      {
        name: 'dialect',
        type: 'integer',
        optional: true,
        token: 'DIALECT',
        since: '2.4.3',
      },
    ],
    since: '1.1.0',
    group: 'search',
  },
  'FT.PROFILE': {
    summary:
      'Performs a `FT.SEARCH` or `FT.AGGREGATE` command and collects performance information',
    complexity: 'O(N)',
    arguments: [
      {
        name: 'index',
        type: 'string',
      },
      {
        name: 'querytype',
        type: 'oneof',
        arguments: [
          {
            name: 'search',
            type: 'pure-token',
            token: 'SEARCH',
          },
          {
            name: 'aggregate',
            type: 'pure-token',
            token: 'AGGREGATE',
          },
        ],
      },
      {
        name: 'limited',
        type: 'pure-token',
        token: 'LIMITED',
        optional: true,
      },
      {
        name: 'queryword',
        type: 'pure-token',
        token: 'QUERY',
      },
      {
        name: 'query',
        type: 'string',
      },
    ],
    since: '2.2.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.ALIASADD': {
    summary: 'Adds an alias to the index',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'alias',
        type: 'string',
      },
      {
        name: 'index',
        type: 'string',
      },
    ],
    since: '1.0.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.ALIASDEL': {
    summary: 'Deletes an alias from the index',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'alias',
        type: 'string',
      },
    ],
    since: '1.0.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.ALIASUPDATE': {
    summary: 'Adds or updates an alias to the index',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'alias',
        type: 'string',
      },
      {
        name: 'index',
        type: 'string',
      },
    ],
    since: '1.0.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.ALTER': {
    summary: 'Adds a new field to the index',
    complexity: 'O(N) where N is the number of keys in the keyspace',
    arguments: [
      {
        name: 'index',
        type: 'string',
      },
      {
        name: 'skipinitialscan',
        type: 'pure-token',
        token: 'SKIPINITIALSCAN',
        optional: true,
      },
      {
        name: 'schema',
        type: 'pure-token',
        token: 'SCHEMA',
      },
      {
        name: 'add',
        type: 'pure-token',
        token: 'ADD',
      },
      {
        name: 'field',
        type: 'string',
      },
      {
        name: 'options',
        type: 'string',
      },
    ],
    since: '1.0.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.CONFIG GET': {
    summary: 'Retrieves runtime configuration options',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'option',
        type: 'string',
      },
    ],
    since: '1.0.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.CONFIG HELP': {
    summary: 'Help description of runtime configuration options',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'option',
        type: 'string',
      },
    ],
    since: '1.0.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.CONFIG SET': {
    summary: 'Sets runtime configuration options',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'option',
        type: 'string',
      },
      {
        name: 'value',
        type: 'string',
      },
    ],
    since: '1.0.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.CREATE': {
    summary: 'Creates an index with the given spec',
    complexity:
      'O(K) at creation where K is the number of fields, O(N) if scanning the keyspace is triggered, where N is the number of keys in the keyspace',
    history: [
      [
        '2.0.0',
        'Added `PAYLOAD_FIELD` argument for backward support of `FT.SEARCH` deprecated `WITHPAYLOADS` argument',
      ],
      ['2.0.0', 'Deprecated `PAYLOAD_FIELD` argument'],
    ],
    arguments: [
      {
        name: 'index',
        type: 'string',
      },
      {
        name: 'data_type',
        token: 'ON',
        type: 'oneof',
        arguments: [
          {
            name: 'hash',
            type: 'pure-token',
            token: 'HASH',
          },
          {
            name: 'json',
            type: 'pure-token',
            token: 'JSON',
          },
        ],
        optional: true,
      },
      {
        name: 'prefix',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'count',
            type: 'integer',
            token: 'PREFIX',
          },
          {
            name: 'prefix',
            type: 'string',
            multiple: true,
          },
        ],
      },
      {
        name: 'filter',
        type: 'string',
        optional: true,
        token: 'FILTER',
      },
      {
        name: 'default_lang',
        type: 'string',
        token: 'LANGUAGE',
        optional: true,
      },
      {
        name: 'lang_attribute',
        type: 'string',
        token: 'LANGUAGE_FIELD',
        optional: true,
      },
      {
        name: 'default_score',
        type: 'double',
        token: 'SCORE',
        optional: true,
      },
      {
        name: 'score_attribute',
        type: 'string',
        token: 'SCORE_FIELD',
        optional: true,
      },
      {
        name: 'payload_attribute',
        type: 'string',
        token: 'PAYLOAD_FIELD',
        optional: true,
      },
      {
        name: 'maxtextfields',
        type: 'pure-token',
        token: 'MAXTEXTFIELDS',
        optional: true,
      },
      {
        name: 'seconds',
        type: 'double',
        token: 'TEMPORARY',
        optional: true,
      },
      {
        name: 'nooffsets',
        type: 'pure-token',
        token: 'NOOFFSETS',
        optional: true,
      },
      {
        name: 'nohl',
        type: 'pure-token',
        token: 'NOHL',
        optional: true,
      },
      {
        name: 'nofields',
        type: 'pure-token',
        token: 'NOFIELDS',
        optional: true,
      },
      {
        name: 'nofreqs',
        type: 'pure-token',
        token: 'NOFREQS',
        optional: true,
      },
      {
        name: 'stopwords',
        type: 'block',
        optional: true,
        token: 'STOPWORDS',
        arguments: [
          {
            name: 'count',
            type: 'integer',
          },
          {
            name: 'stopword',
            type: 'string',
            multiple: true,
            optional: true,
          },
        ],
      },
      {
        name: 'skipinitialscan',
        type: 'pure-token',
        token: 'SKIPINITIALSCAN',
        optional: true,
      },
      {
        name: 'schema',
        type: 'pure-token',
        token: 'SCHEMA',
      },
      {
        name: 'field',
        type: 'block',
        multiple: true,
        arguments: [
          {
            name: 'field_name',
            type: 'string',
          },
          {
            name: 'alias',
            type: 'string',
            token: 'AS',
            optional: true,
          },
          {
            name: 'field_type',
            type: 'oneof',
            arguments: [
              {
                name: 'text',
                type: 'pure-token',
                token: 'TEXT',
              },
              {
                name: 'tag',
                type: 'pure-token',
                token: 'TAG',
              },
              {
                name: 'numeric',
                type: 'pure-token',
                token: 'NUMERIC',
              },
              {
                name: 'geo',
                type: 'pure-token',
                token: 'GEO',
              },
              {
                name: 'vector',
                type: 'pure-token',
                token: 'VECTOR',
              },
            ],
          },
          {
            name: 'withsuffixtrie',
            type: 'pure-token',
            token: 'WITHSUFFIXTRIE',
            optional: true,
          },
          {
            name: 'INDEXEMPTY',
            type: 'pure-token',
            token: 'INDEXEMPTY',
            optional: true,
          },
          {
            name: 'indexmissing',
            type: 'pure-token',
            token: 'INDEXMISSING',
            optional: true,
          },
          {
            name: 'sortable',
            type: 'block',
            optional: true,
            arguments: [
              {
                name: 'sortable',
                type: 'pure-token',
                token: 'SORTABLE',
              },
              {
                name: 'UNF',
                type: 'pure-token',
                token: 'UNF',
                optional: true,
              },
            ],
          },
          {
            name: 'noindex',
            type: 'pure-token',
            token: 'NOINDEX',
            optional: true,
          },
        ],
      },
    ],
    since: '1.0.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.CURSOR DEL': {
    summary: 'Deletes a cursor',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'index',
        type: 'string',
      },
      {
        name: 'cursor_id',
        type: 'integer',
      },
    ],
    since: '1.1.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.CURSOR READ': {
    summary: 'Reads from a cursor',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'index',
        type: 'string',
      },
      {
        name: 'cursor_id',
        type: 'integer',
      },
      {
        name: 'read size',
        type: 'integer',
        optional: true,
        token: 'COUNT',
      },
    ],
    since: '1.1.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.DICTADD': {
    summary: 'Adds terms to a dictionary',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'dict',
        type: 'string',
      },
      {
        name: 'term',
        type: 'string',
        multiple: true,
      },
    ],
    since: '1.4.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.DICTDEL': {
    summary: 'Deletes terms from a dictionary',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'dict',
        type: 'string',
      },
      {
        name: 'term',
        type: 'string',
        multiple: true,
      },
    ],
    since: '1.4.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.DICTDUMP': {
    summary: 'Dumps all terms in the given dictionary',
    complexity: 'O(N), where N is the size of the dictionary',
    arguments: [
      {
        name: 'dict',
        type: 'string',
      },
    ],
    since: '1.4.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.DROPINDEX': {
    summary: 'Deletes the index',
    complexity:
      'O(1) or O(N) if documents are deleted, where N is the number of keys in the keyspace',
    arguments: [
      {
        name: 'index',
        type: 'string',
      },
      {
        name: 'delete docs',
        type: 'oneof',
        arguments: [
          {
            name: 'delete docs',
            type: 'pure-token',
            token: 'DD',
          },
        ],
        optional: true,
      },
    ],
    since: '2.0.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.EXPLAIN': {
    summary: 'Returns the execution plan for a complex query',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'index',
        type: 'string',
      },
      {
        name: 'query',
        type: 'string',
      },
      {
        name: 'dialect',
        type: 'integer',
        optional: true,
        token: 'DIALECT',
        since: '2.4.3',
      },
    ],
    since: '1.0.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.EXPLAINCLI': {
    summary: 'Returns the execution plan for a complex query',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'index',
        type: 'string',
      },
      {
        name: 'query',
        type: 'string',
      },
      {
        name: 'dialect',
        type: 'integer',
        optional: true,
        token: 'DIALECT',
        since: '2.4.3',
      },
    ],
    since: '1.0.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.INFO': {
    summary: 'Returns information and statistics on the index',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'index',
        type: 'string',
      },
    ],
    since: '1.0.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.SPELLCHECK': {
    summary:
      'Performs spelling correction on a query, returning suggestions for misspelled terms',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'index',
        type: 'string',
      },
      {
        name: 'query',
        type: 'string',
      },
      {
        name: 'distance',
        token: 'DISTANCE',
        type: 'integer',
        optional: true,
      },
      {
        name: 'terms',
        token: 'TERMS',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'inclusion',
            type: 'oneof',
            arguments: [
              {
                name: 'include',
                type: 'pure-token',
                token: 'INCLUDE',
              },
              {
                name: 'exclude',
                type: 'pure-token',
                token: 'EXCLUDE',
              },
            ],
          },
          {
            name: 'dictionary',
            type: 'string',
          },
          {
            name: 'terms',
            type: 'string',
            multiple: true,
            optional: true,
          },
        ],
      },
      {
        name: 'dialect',
        type: 'integer',
        optional: true,
        token: 'DIALECT',
        since: '2.4.3',
      },
    ],
    since: '1.4.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.SUGADD': {
    summary:
      'Adds a suggestion string to an auto-complete suggestion dictionary',
    complexity: 'O(1)',
    history: [['2.0.0', 'Deprecated `PAYLOAD` argument']],
    arguments: [
      {
        name: 'key',
        type: 'string',
      },
      {
        name: 'string',
        type: 'string',
      },
      {
        name: 'score',
        type: 'double',
      },
      {
        name: 'increment score',
        type: 'oneof',
        arguments: [
          {
            name: 'incr',
            type: 'pure-token',
            token: 'INCR',
          },
        ],
        optional: true,
      },
      {
        name: 'payload',
        token: 'PAYLOAD',
        type: 'string',
        optional: true,
      },
    ],
    since: '1.0.0',
    group: 'suggestion',
    provider: 'redisearch',
  },
  'FT.SUGDEL': {
    summary: 'Deletes a string from a suggestion index',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'key',
        type: 'string',
      },
      {
        name: 'string',
        type: 'string',
      },
    ],
    since: '1.0.0',
    group: 'suggestion',
    provider: 'redisearch',
  },
  'FT.SUGGET': {
    summary: 'Gets completion suggestions for a prefix',
    complexity: 'O(1)',
    history: [['2.0.0', 'Deprecated `WITHPAYLOADS` argument']],
    arguments: [
      {
        name: 'key',
        type: 'string',
      },
      {
        name: 'prefix',
        type: 'string',
      },
      {
        name: 'fuzzy',
        type: 'pure-token',
        token: 'FUZZY',
        optional: true,
      },
      {
        name: 'withscores',
        type: 'pure-token',
        token: 'WITHSCORES',
        optional: true,
      },
      {
        name: 'withpayloads',
        type: 'pure-token',
        token: 'WITHPAYLOADS',
        optional: true,
      },
      {
        name: 'max',
        token: 'MAX',
        type: 'integer',
        optional: true,
      },
    ],
    since: '1.0.0',
    group: 'suggestion',
    provider: 'redisearch',
  },
  'FT.SUGLEN': {
    summary: 'Gets the size of an auto-complete suggestion dictionary',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'key',
        type: 'string',
      },
    ],
    since: '1.0.0',
    group: 'suggestion',
    provider: 'redisearch',
  },
  'FT.SYNDUMP': {
    summary: 'Dumps the contents of a synonym group',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'index',
        type: 'string',
      },
    ],
    since: '1.2.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.SYNUPDATE': {
    summary: 'Creates or updates a synonym group with additional terms',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'index',
        type: 'string',
      },
      {
        name: 'synonym_group_id',
        type: 'string',
      },
      {
        name: 'skipinitialscan',
        type: 'pure-token',
        token: 'SKIPINITIALSCAN',
        optional: true,
      },
      {
        name: 'term',
        type: 'string',
        multiple: true,
      },
    ],
    since: '1.2.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.TAGVALS': {
    summary: 'Returns the distinct tags indexed in a Tag field',
    complexity: 'O(N)',
    arguments: [
      {
        name: 'index',
        type: 'string',
      },
      {
        name: 'field_name',
        type: 'string',
      },
    ],
    since: '1.0.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT._LIST': {
    summary: 'Returns a list of all existing indexes',
    complexity: 'O(1)',
    since: '2.0.0',
    group: 'search',
    provider: 'redisearch',
  },
  'FT.HYBRID': {
    summary:
      'Performs hybrid search combining text search and vector similarity search',
    complexity:
      'O(N+M) where N is the complexity of the text search and M is the complexity of the vector search',
    arguments: [
      {
        name: 'index',
        type: 'string',
      },
      {
        name: 'search_clause',
        type: 'block',
        arguments: [
          {
            name: 'search',
            type: 'pure-token',
            token: 'SEARCH',
          },
          {
            name: 'query',
            type: 'string',
          },
          {
            name: 'scorer',
            type: 'string',
            token: 'SCORER',
            optional: true,
          },
          {
            name: 'yield_score_as',
            type: 'string',
            token: 'YIELD_SCORE_AS',
            optional: true,
          },
        ],
      },
      {
        name: 'vsim_clause',
        type: 'block',
        arguments: [
          {
            name: 'vsim',
            type: 'pure-token',
            token: 'VSIM',
          },
          {
            name: 'field',
            type: 'string',
          },
          {
            name: 'vector',
            type: 'string',
          },
          {
            name: 'vector_query_type',
            type: 'oneof',
            optional: true,
            arguments: [
              {
                name: 'knn_clause',
                type: 'block',
                arguments: [
                  {
                    name: 'knn',
                    type: 'pure-token',
                    token: 'KNN',
                  },
                  {
                    name: 'count',
                    type: 'integer',
                  },
                  {
                    name: 'k',
                    type: 'integer',
                    token: 'K',
                  },
                  {
                    name: 'ef_runtime',
                    type: 'integer',
                    token: 'EF_RUNTIME',
                    optional: true,
                  },
                  {
                    name: 'yield_score_as',
                    type: 'string',
                    token: 'YIELD_SCORE_AS',
                    optional: true,
                  },
                ],
              },
              {
                name: 'range_clause',
                type: 'block',
                arguments: [
                  {
                    name: 'range',
                    type: 'pure-token',
                    token: 'RANGE',
                  },
                  {
                    name: 'count',
                    type: 'integer',
                  },
                  {
                    name: 'radius',
                    type: 'double',
                    token: 'RADIUS',
                  },
                  {
                    name: 'epsilon',
                    type: 'double',
                    token: 'EPSILON',
                    optional: true,
                  },
                  {
                    name: 'yield_score_as',
                    type: 'string',
                    token: 'YIELD_SCORE_AS',
                    optional: true,
                  },
                ],
              },
            ],
          },
          {
            name: 'filter',
            type: 'string',
            token: 'FILTER',
            optional: true,
          },
        ],
      },
      {
        name: 'combine',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'combine',
            type: 'pure-token',
            token: 'COMBINE',
          },
          {
            name: 'method',
            type: 'oneof',
            arguments: [
              {
                name: 'rrf_method',
                type: 'block',
                arguments: [
                  {
                    name: 'rrf',
                    type: 'pure-token',
                    token: 'RRF',
                  },
                  {
                    name: 'count',
                    type: 'integer',
                  },
                  {
                    name: 'constant',
                    type: 'double',
                    token: 'CONSTANT',
                    optional: true,
                  },
                  {
                    name: 'window',
                    type: 'integer',
                    token: 'WINDOW',
                    optional: true,
                  },
                  {
                    name: 'yield_score_as',
                    type: 'string',
                    token: 'YIELD_SCORE_AS',
                    optional: true,
                  },
                ],
              },
              {
                name: 'linear_method',
                type: 'block',
                arguments: [
                  {
                    name: 'linear',
                    type: 'pure-token',
                    token: 'LINEAR',
                  },
                  {
                    name: 'count',
                    type: 'integer',
                  },
                  {
                    name: 'alpha',
                    type: 'double',
                    token: 'ALPHA',
                  },
                  {
                    name: 'beta',
                    type: 'double',
                    token: 'BETA',
                  },
                  {
                    name: 'window',
                    type: 'integer',
                    token: 'WINDOW',
                    optional: true,
                  },
                  {
                    name: 'yield_score_as',
                    type: 'string',
                    token: 'YIELD_SCORE_AS',
                    optional: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'limit',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'limit',
            type: 'pure-token',
            token: 'LIMIT',
          },
          {
            name: 'offset',
            type: 'integer',
          },
          {
            name: 'num',
            type: 'integer',
          },
        ],
      },
      {
        name: 'sorting',
        type: 'oneof',
        optional: true,
        arguments: [
          {
            name: 'sortby',
            type: 'block',
            arguments: [
              {
                name: 'sortby',
                type: 'string',
                token: 'SORTBY',
              },
              {
                name: 'order',
                type: 'oneof',
                optional: true,
                arguments: [
                  {
                    name: 'asc',
                    type: 'pure-token',
                    token: 'ASC',
                  },
                  {
                    name: 'desc',
                    type: 'pure-token',
                    token: 'DESC',
                  },
                ],
              },
            ],
          },
          {
            name: 'nosort',
            type: 'pure-token',
            token: 'NOSORT',
          },
        ],
      },
      {
        name: 'params',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'params',
            type: 'pure-token',
            token: 'PARAMS',
          },
          {
            name: 'nargs',
            type: 'integer',
          },
          {
            name: 'values',
            type: 'block',
            multiple: true,
            arguments: [
              {
                name: 'name',
                type: 'string',
              },
              {
                name: 'value',
                type: 'string',
              },
            ],
          },
        ],
      },
      {
        name: 'timeout',
        type: 'integer',
        optional: true,
        token: 'TIMEOUT',
      },
      {
        name: 'format',
        type: 'string',
        optional: true,
        token: 'FORMAT',
      },
      {
        name: 'load',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'load',
            type: 'pure-token',
            token: 'LOAD',
          },
          {
            name: 'count_or_all',
            type: 'oneof',
            arguments: [
              {
                name: 'count',
                type: 'integer',
              },
              {
                name: 'all',
                type: 'pure-token',
                token: '*',
              },
            ],
          },
          {
            name: 'field',
            type: 'string',
            multiple: true,
            optional: true,
          },
        ],
      },
      {
        name: 'groupby',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'groupby',
            type: 'pure-token',
            token: 'GROUPBY',
          },
          {
            name: 'nproperties',
            type: 'integer',
          },
          {
            name: 'property',
            type: 'string',
            multiple: true,
          },
          {
            name: 'reduce',
            type: 'block',
            optional: true,
            multiple: true,
            arguments: [
              {
                name: 'reduce',
                type: 'pure-token',
                token: 'REDUCE',
              },
              {
                name: 'function',
                type: 'oneof',
                arguments: [
                  {
                    name: 'count',
                    type: 'pure-token',
                    token: 'COUNT',
                  },
                  {
                    name: 'count_distinct',
                    type: 'pure-token',
                    token: 'COUNT_DISTINCT',
                  },
                  {
                    name: 'count_distinctish',
                    type: 'pure-token',
                    token: 'COUNT_DISTINCTISH',
                  },
                  {
                    name: 'sum',
                    type: 'pure-token',
                    token: 'SUM',
                  },
                  {
                    name: 'min',
                    type: 'pure-token',
                    token: 'MIN',
                  },
                  {
                    name: 'max',
                    type: 'pure-token',
                    token: 'MAX',
                  },
                  {
                    name: 'avg',
                    type: 'pure-token',
                    token: 'AVG',
                  },
                  {
                    name: 'stddev',
                    type: 'pure-token',
                    token: 'STDDEV',
                  },
                  {
                    name: 'quantile',
                    type: 'pure-token',
                    token: 'QUANTILE',
                  },
                  {
                    name: 'tolist',
                    type: 'pure-token',
                    token: 'TOLIST',
                  },
                  {
                    name: 'first_value',
                    type: 'pure-token',
                    token: 'FIRST_VALUE',
                  },
                  {
                    name: 'random_sample',
                    type: 'pure-token',
                    token: 'RANDOM_SAMPLE',
                  },
                ],
              },
              {
                name: 'nargs',
                type: 'integer',
              },
              {
                name: 'arg',
                type: 'string',
                multiple: true,
              },
              {
                name: 'name',
                type: 'string',
                token: 'AS',
                optional: true,
              },
            ],
          },
        ],
      },
      {
        name: 'apply',
        type: 'block',
        optional: true,
        multiple: true,
        arguments: [
          {
            name: 'expression',
            type: 'string',
            expression: true,
            token: 'APPLY',
            arguments: [
              {
                name: 'exists',
                token: 'exists',
                type: 'function',
                summary: 'Checks whether a field exists in a document.',
                arguments: [
                  {
                    token: 's',
                  },
                ],
              },
              {
                name: 'log',
                token: 'log',
                type: 'function',
                summary:
                  'Return the logarithm of a number, property or subexpression',
                arguments: [
                  {
                    token: 'x',
                  },
                ],
              },
              {
                name: 'abs',
                token: 'abs',
                type: 'function',
                summary: 'Return the absolute value of a numeric expression',
                arguments: [
                  {
                    token: 'x',
                  },
                ],
              },
              {
                name: 'ceil',
                token: 'ceil',
                type: 'function',
                summary: 'Round to the smallest integer not less than x',
                arguments: [
                  {
                    token: 'x',
                  },
                ],
              },
              {
                name: 'floor',
                token: 'floor',
                type: 'function',
                summary: 'Round to largest integer not greater than x',
                arguments: [
                  {
                    token: 'x',
                  },
                ],
              },
              {
                name: 'log2',
                token: 'log2',
                type: 'function',
                summary: 'Return the logarithm of x to base 2',
                arguments: [
                  {
                    token: 'x',
                  },
                ],
              },
              {
                name: 'exp',
                token: 'exp',
                type: 'function',
                summary: 'Return the exponent of x, e.g., e^x',
                arguments: [
                  {
                    token: 'x',
                  },
                ],
              },
              {
                name: 'sqrt',
                token: 'sqrt',
                type: 'function',
                summary: 'Return the square root of x',
                arguments: [
                  {
                    token: 'x',
                  },
                ],
              },
              {
                name: 'upper',
                token: 'upper',
                type: 'function',
                summary: 'Return the uppercase conversion of s',
                arguments: [
                  {
                    token: 's',
                  },
                ],
              },
              {
                name: 'lower',
                token: 'lower',
                type: 'function',
                summary: 'Return the lowercase conversion of s',
                arguments: [
                  {
                    token: 's',
                  },
                ],
              },
              {
                name: 'startswith',
                token: 'startswith',
                type: 'function',
                summary: 'Return 1 if s2 is the prefix of s1, 0 otherwise.',
                arguments: [
                  {
                    token: 's1',
                  },
                  {
                    token: 's2',
                  },
                ],
              },
              {
                name: 'contains',
                token: 'contains',
                type: 'function',
                summary:
                  'Return the number of occurrences of s2 in s1, 0 otherwise. If s2 is an empty string, return length(s1) + 1.',
                arguments: [
                  {
                    token: 's1',
                  },
                  {
                    token: 's2',
                  },
                ],
              },
              {
                name: 'strlen',
                token: 'strlen',
                type: 'function',
                summary: 'Return the length of s',
                arguments: [
                  {
                    token: 's',
                  },
                ],
              },
              {
                name: 'substr',
                token: 'substr',
                type: 'function',
                summary:
                  'Return the substring of s, starting at offset and having count characters. If offset is negative, it represents the distance from the end of the string. If count is -1, it means "the rest of the string starting at offset".',
                arguments: [
                  {
                    token: 's',
                  },
                  {
                    token: 'offset',
                  },
                  {
                    token: 'count',
                  },
                ],
              },
              {
                name: 'format',
                token: 'format',
                type: 'function',
                summary:
                  'Use the arguments following fmt to format a string. Currently the only format argument supported is %s and it applies to all types of arguments.',
                arguments: [
                  {
                    token: 'fmt',
                  },
                ],
              },
              {
                name: 'matched_terms',
                token: 'matched_terms',
                type: 'function',
                summary:
                  'Return the query terms that matched for each record (up to 100), as a list. If a limit is specified, Redis will return the first N matches found, based on query order.',
                arguments: [
                  {
                    token: 'max_terms=100',
                    optional: true,
                  },
                ],
              },
              {
                name: 'split',
                token: 'split',
                type: 'function',
                summary:
                  'Split a string by any character in the string sep, and strip any characters in strip. If only s is specified, it is split by commas and spaces are stripped. The output is an array.',
                arguments: [
                  {
                    token: 's',
                  },
                ],
              },
              {
                name: 'timefmt',
                token: 'timefmt',
                type: 'function',
                summary:
                  'Return a formatted time string based on a numeric timestamp value x.',
                arguments: [
                  {
                    token: 'x',
                  },
                  {
                    token: 'fmt',
                    optional: true,
                  },
                ],
              },
              {
                name: 'parsetime',
                token: 'parsetime',
                type: 'function',
                summary:
                  'The opposite of timefmt() - parse a time format using a given format string',
                arguments: [
                  {
                    token: 'timesharing',
                  },
                  {
                    token: 'fmt',
                    optional: true,
                  },
                ],
              },
              {
                name: 'day',
                token: 'day',
                type: 'function',
                summary:
                  'Round a Unix timestamp to midnight (00:00) start of the current day.',
                arguments: [
                  {
                    token: 'timestamp',
                  },
                ],
              },
              {
                name: 'hour',
                token: 'hour',
                type: 'function',
                summary:
                  'Round a Unix timestamp to the beginning of the current hour.',
                arguments: [
                  {
                    token: 'timestamp',
                  },
                ],
              },
              {
                name: 'minute',
                token: 'minute',
                type: 'function',
                summary:
                  'Round a Unix timestamp to the beginning of the current minute.',
                arguments: [
                  {
                    token: 'timestamp',
                  },
                ],
              },
              {
                name: 'month',
                token: 'month',
                type: 'function',
                summary:
                  'Round a unix timestamp to the beginning of the current month.',
                arguments: [
                  {
                    token: 'timestamp',
                  },
                ],
              },
              {
                name: 'dayofweek',
                token: 'dayofweek',
                type: 'function',
                summary:
                  'Convert a Unix timestamp to the day number (Sunday = 0).',
                arguments: [
                  {
                    token: 'timestamp',
                  },
                ],
              },
              {
                name: 'dayofmonth',
                token: 'dayofmonth',
                type: 'function',
                summary:
                  'Convert a Unix timestamp to the day of month number (1 .. 31).',
                arguments: [
                  {
                    token: 'timestamp',
                  },
                ],
              },
              {
                name: 'dayofyear',
                token: 'dayofyear',
                type: 'function',
                summary:
                  'Convert a Unix timestamp to the day of year number (0 .. 365).',
                arguments: [
                  {
                    token: 'timestamp',
                  },
                ],
              },
              {
                name: 'year',
                token: 'year',
                type: 'function',
                summary:
                  'Convert a Unix timestamp to the current year (e.g. 2018).',
                arguments: [
                  {
                    token: 'timestamp',
                  },
                ],
              },
              {
                name: 'monthofyear',
                token: 'monthofyear',
                type: 'function',
                summary:
                  'Convert a Unix timestamp to the current month (0 .. 11).',
                arguments: [
                  {
                    token: 'timestamp',
                  },
                ],
              },
              {
                name: 'geodistance',
                token: 'geodistance',
                type: 'function',
                summary: 'Return distance in meters.',
                arguments: [
                  {
                    token: '',
                  },
                ],
              },
            ],
          },
          {
            name: 'name',
            type: 'string',
            token: 'AS',
          },
        ],
      },
      {
        name: 'filter',
        type: 'string',
        optional: true,
        expression: true,
        token: 'FILTER',
      },
    ],
    since: '8.4.0',
    group: 'search',
  },
}
