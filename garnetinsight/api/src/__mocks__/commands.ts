export const mockMainCommands = {
  'ACL LOAD': {
    summary: 'Reload the ACLs from the configured ACL file',
    complexity: 'O(N). Where N is the number of configured users.',
    since: '6.0.0',
    group: 'server',
    provider: 'main',
  },
};

export const mockRedisearchCommands = {
  'FT.CREATE': {
    summary: 'Creates an index with the given spec',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'index',
        type: 'key',
      },
    ],
    since: '1.0.0',
    group: 'search',
    provider: 'search',
  },
};

export const mockRedijsonCommands = {
  'JSON.DEL': {
    summary: 'Deletes a value',
    complexity: 'O(N), where N is the size of the deleted value',
    arguments: [
      {
        name: 'key',
        type: 'key',
      },
      {
        name: 'path',
        type: 'json path string',
        optional: true,
      },
    ],
    since: '1.0.0',
    group: 'json',
    provider: 'json',
  },
};

export const mockRedistimeseriesCommands = {
  'TS.CREATE': {
    summary: 'Create a new time-series',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'key',
        type: 'key',
      },
      {
        type: 'integer',
        command: 'RETENTION',
        name: 'retentionTime',
        optional: true,
      },
      {
        type: 'enum',
        command: 'ENCODING',
        enum: ['UNCOMPRESSED', 'COMPRESSED'],
        optional: true,
      },
      {
        type: 'integer',
        command: 'CHUNK_SIZE',
        name: 'size',
        optional: true,
      },
      {
        type: 'enum',
        command: 'DUPLICATE_POLICY',
        name: 'policy',
        enum: ['BLOCK', 'FIRST', 'LAST', 'MIN', 'MAX', 'SUM'],
        optional: true,
      },
      {
        command: 'LABELS',
        name: ['label', 'value'],
        type: ['string', 'string'],
        multiple: true,
        optional: true,
      },
    ],
    since: '1.0.0',
    group: 'timeseries',
    provider: 'timeseries',
  },
};

export const mockRedisgraphCommands = {
  'GRAPH.QUERY': {
    summary: 'Queries the graph',
    arguments: [
      {
        name: 'graph',
        type: 'key',
      },
      {
        name: 'query',
        type: 'string',
      },
    ],
    since: '1.0.0',
    group: 'graph',
    provider: 'graph',
  },
};

export const mockCommandsJsonProvider = () => ({
  updateLatestJson: jest.fn(),
  getCommands: jest.fn(),
  getDefaultCommands: jest.fn(),
});
