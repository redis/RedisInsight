import { RdiClientMetadata } from 'src/modules/rdi/models';
import { ApiRdiClient } from 'src/modules/rdi/client/api/v1/api.rdi.client';
import { RdiEntity } from 'src/modules/rdi/entities/rdi.entity';
import { EncryptionStrategy } from 'src/modules/encryption/models';
import { RdiDryRunJobDto } from 'src/modules/rdi/dto';
import { sign } from 'jsonwebtoken';
import {
  RdiFactory,
  RdiClientMetadataFactory,
  RdiPipelineFactory,
  RdiDryRunJobFactory,
  RdiStatisticsDataFactory,
} from './factories/rdi';

export * from './factories/rdi';

export const mockRdiId = 'rdiId';
export const mockRdiPasswordEncrypted = 'password_ENCRYPTED';

export const mockRdiPasswordPlain = 'some pass';

export const mockedRdiAccessToken = sign(
  { exp: Math.trunc(Date.now() / 1000) + 3600 },
  'test',
);
export const mockedAccessToken = mockedRdiAccessToken;

export class MockRdiClient extends ApiRdiClient {
  constructor(metadata: RdiClientMetadata, client: any = jest.fn()) {
    super(metadata, client);
  }

  public getSchema = jest.fn();

  public getPipeline = jest.fn();

  public getConfigTemplate = jest.fn();

  public getJobTemplate = jest.fn();

  public getStrategies = jest.fn();

  public deploy = jest.fn();

  public startPipeline = jest.fn();

  public stopPipeline = jest.fn();

  public resetPipeline = jest.fn();

  public deployJob = jest.fn();

  public dryRunJob = jest.fn();

  public testConnections = jest.fn();

  public getStatistics = jest.fn();

  public getPipelineStatus = jest.fn();

  public getJobFunctions = jest.fn();

  public connect = jest.fn();

  public ensureAuth = jest.fn();
}

export const generateMockRdiClient = (
  metadata: RdiClientMetadata,
  client = jest.fn(),
): MockRdiClient => new MockRdiClient(metadata as RdiClientMetadata, client);

// Backward compatible mocks using factories with fixed values for deterministic tests
export const mockRdiClientMetadata: RdiClientMetadata =
  RdiClientMetadataFactory.build({
    sessionMetadata: undefined,
    id: mockRdiId,
  });

export const mockRdi = RdiFactory.build({
  name: 'name',
  version: '1.2',
  url: 'http://localhost:4000',
  password: 'pass',
  username: 'user',
});

export const mockRdiPipeline = RdiPipelineFactory.build({
  jobs: { some_job: {} },
  config: {},
});

export const mockRdiDryRunJob: RdiDryRunJobDto = RdiDryRunJobFactory.build({
  input_data: {},
  job: {},
});

export const mockRdiStatisticsData = RdiStatisticsDataFactory.build();

export const mockRdiDecrypted = RdiFactory.build({
  id: '1',
  name: 'name',
  version: '1.0',
  url: 'http://test.com',
  username: 'testuser',
  password: mockRdiPasswordPlain,
  lastConnection: new Date(),
});

export const mockRdiEntityEncrypted = Object.assign(new RdiEntity(), {
  ...mockRdiDecrypted,
  password: mockRdiPasswordEncrypted,
  encryption: EncryptionStrategy.KEYTAR,
});

export const mockRdiUnauthorizedError = {
  message: 'Request failed with status code 401',
  response: {
    status: 401,
  },
};

export const mockRdiConfigSchema = {
  title: 'Redis Data Integration Configuration File',
  type: ['object', 'null'],
  properties: {
    sources: {
      title: 'Source collectors',
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          connection: {
            $ref: '#/definitions/connection',
          },
          type: {
            title: 'Collector type',
            type: 'string',
            const: 'cdc',
          },
          logging: {
            title: 'Logging configuration',
            type: 'object',
            properties: {
              level: {
                title: 'Logging level',
                description:
                  'Logging level for the source collector (trace|debug|info|warn|error)',
                type: 'string',
                enum: ['trace', 'debug', 'info', 'warn', 'error'],
                default: 'info',
              },
            },
            additionalProperties: false,
          },
          tables: {
            type: 'object',
            title: 'Tables to capture',
            description:
              'Tables to capture from the source database (table.include.list)',
            additionalProperties: {
              type: 'object',
              properties: {
                snapshot_sql: {
                  title: 'Snapshot SQL',
                  description:
                    'SQL statement used to override the statement for the initial snapshot (snapshot.select.statement.overrides)',
                  type: 'string',
                },
                columns: {
                  type: 'array',
                  title: 'Columns to capture',
                  description:
                    'Columns to capture from the source database (column.include.list)',
                  items: {
                    type: 'string',
                  },
                },
                keys: {
                  type: 'array',
                  title: 'Message keys',
                  description:
                    'Fields to use as keys in the generated messages (message.key.columns)',
                  items: {
                    type: 'string',
                  },
                },
              },
            },
          },
          sink: {
            type: 'object',
            title: 'Sink configuration',
            properties: {
              nopass: {
                title: 'Nopass in the Redis sink',
                description:
                  'Flag to disable password in the sink configuration. If set to true, the password will not be included in the sink configuration',
                type: 'boolean',
                default: false,
              },
            },
          },
          advanced: {
            type: 'object',
            title: 'Advanced configuration',
            properties: {
              sink: {
                type: 'object',
                title: 'Sink configuration',
              },
              source: {
                type: 'object',
                title: 'Source configuration',
              },
              quarkus: {
                type: 'object',
                title: 'Quarkus configuration',
              },
            },
            additionalProperties: false,
          },
        },
        required: ['type', 'connection'],
      },
    },
    processors: {
      title: 'Configuration details of Redis Data Integration Processors',
      type: ['object', 'null'],
      properties: {
        on_failed_retry_interval: {
          title: 'Interval (in seconds) on which to perform retry on failure',
          type: ['integer', 'string'],
          minimum: 1,
          pattern: '^\\${.*}$',
          default: 5,
        },
        read_batch_size: {
          title: 'The batch size for reading data from source database',
          type: ['integer', 'string'],
          minimum: 1,
          pattern: '^\\${.*}$',
          default: 2000,
        },
        debezium_lob_encoded_placeholder: {
          title: 'Enable Debezium LOB placeholders',
          type: 'string',
          default: 'X19kZWJleml1bV91bmF2YWlsYWJsZV92YWx1ZQ==',
        },
        dedup: {
          title: 'Enable deduplication mechanism',
          type: 'boolean',
          default: false,
        },
        dedup_max_size: {
          title: 'Max size of the deduplication set',
          type: 'integer',
          minimum: 1,
          default: 1024,
        },
        dedup_strategy: {
          title:
            'Deduplication strategy: reject - reject messages(dlq), ignore - ignore messages',
          type: 'string',
          default: 'ignore',
          enum: ['reject', 'ignore'],
          deprecated: true,
          description:
            "Property 'dedup_strategy' is now deprecated. The only supported strategy is 'ignore'. Please remove from the configuration.",
        },
        duration: {
          title:
            'Time (in ms) after which data will be read from stream even if read_batch_size was not reached',
          type: ['integer', 'string'],
          minimum: 1,
          pattern: '^\\${.*}$',
          default: 100,
        },
        write_batch_size: {
          title:
            'The batch size for writing data to target Redis database. Should be less or equal to the read_batch_size',
          type: ['integer', 'string'],
          minimum: 1,
          pattern: '^\\${.*}$',
          default: 200,
        },
        error_handling: {
          title:
            'Error handling strategy: ignore - skip, dlq - store rejected messages in a dead letter queue',
          type: 'string',
          pattern: '^\\${.*}$|ignore|dlq',
          default: 'dlq',
        },
        dlq_max_messages: {
          title: 'Dead letter queue max messages per stream',
          type: ['integer', 'string'],
          minimum: 1,
          pattern: '^\\${.*}$',
          default: 1000,
        },
        target_data_type: {
          title:
            'Target data type: hash/json - JSON module must be in use in the target DB',
          type: 'string',
          pattern: '^\\${.*}$|hash|json',
          default: 'hash',
        },
        json_update_strategy: {
          title:
            'Target update strategy: replace/merge - JSON module must be in use in the target DB',
          type: 'string',
          pattern: '^\\${.*}$|replace|merge',
          default: 'replace',
          deprecated: true,
          description:
            "Property 'json_update_strategy' will be deprecated in future releases. Use 'on_update' job-level property to define the json update strategy.",
        },
        initial_sync_processes: {
          title:
            'Number of processes RDI Engine creates to process the initial sync with the source',
          type: ['integer', 'string'],
          minimum: 1,
          maximum: 32,
          pattern: '^\\${.*}$',
          default: 4,
        },
        idle_sleep_time_ms: {
          title: 'Idle sleep time (in milliseconds) between batches',
          type: ['integer', 'string'],
          minimum: 1,
          maximum: 999999,
          pattern: '^\\${.*}$',
          default: 200,
        },
        idle_streams_check_interval_ms: {
          title:
            'Interval (in milliseconds) for checking new streams when the stream processor is idling',
          type: ['integer', 'string'],
          minimum: 1,
          maximum: 999999,
          pattern: '^\\${.*}$',
          default: 1000,
        },
        busy_streams_check_interval_ms: {
          title:
            'Interval (in milliseconds) for checking new streams when the stream processor is busy',
          type: ['integer', 'string'],
          minimum: 1,
          maximum: 999999,
          pattern: '^\\${.*}$',
          default: 5000,
        },
        wait_enabled: {
          title: 'Checks if the data has been written to the replica shard',
          type: 'boolean',
          default: false,
        },
        wait_timeout: {
          title:
            'Timeout in milliseconds when checking write to the replica shard',
          type: ['integer', 'string'],
          minimum: 1,
          pattern: '^\\${.*}$',
          default: 1000,
        },
        retry_on_replica_failure: {
          title:
            'Ensures that the data has been written to the replica shard and keeps retrying if not',
          type: 'boolean',
          default: true,
        },
      },
      additionalProperties: false,
    },
    targets: {
      title: 'Target connections',
      type: 'object',
      properties: {
        connection: {
          $ref: '#/definitions/connection',
        },
      },
    },
  },
  definitions: {
    connection: {
      title: 'Connection details',
      type: 'object',
      patternProperties: {
        '.*': {
          oneOf: [
            {
              title: 'Redis DB connection details',
              type: 'object',
              properties: {
                type: {
                  description: 'DB type',
                  const: 'redis',
                },
                host: {
                  title: 'Redis target DB host',
                  type: 'string',
                },
                port: {
                  title: 'Redis DB port',
                  type: ['integer', 'string'],
                  minimum: 1,
                  maximum: 65535,
                  pattern: '^\\${.*}$',
                },
                user: {
                  title: 'Redis DB user',
                  type: 'string',
                },
                password: {
                  title: 'Redis DB password',
                  type: 'string',
                },
                key: {
                  title: 'Private key file to authenticate with',
                  type: 'string',
                },
                key_password: {
                  title: 'Password for unlocking an encrypted private key',
                  type: 'string',
                },
                cert: {
                  title: 'Client certificate file to authenticate with',
                  type: 'string',
                },
                cacert: {
                  title: 'CA certificate file to verify with',
                  type: 'string',
                },
              },
              required: ['host', 'port'],
              dependentRequired: {
                key: ['cert'],
                cert: ['key'],
                key_password: ['key'],
              },
              additionalProperties: false,
            },
            {
              type: 'object',
              description: 'SQL database',
              properties: {
                type: {
                  description: 'DB type',
                  type: 'string',
                  enum: ['db2', 'mysql', 'oracle', 'postgresql', 'sqlserver'],
                },
                host: {
                  description: 'DB host',
                  type: 'string',
                },
                port: {
                  description: 'DB port',
                  type: 'integer',
                  minimum: 1,
                  maximum: 65535,
                },
                database: {
                  description: 'DB name',
                  type: 'string',
                },
                user: {
                  description: 'DB user',
                  type: 'string',
                },
                password: {
                  description: 'DB password',
                  type: 'string',
                },
                db_connection_pool_size: {
                  description: 'Database connection pool size',
                  type: 'integer',
                  minimum: 1,
                  default: 10,
                },
                statement_timeout: {
                  description: 'Statement timeout in seconds (only for Oracle)',
                  type: 'integer',
                  minimum: 1,
                  default: 60,
                },
                connect_args: {
                  description:
                    'Additional arguments to use when connecting to the DB',
                  type: 'object',
                  additionalProperties: true,
                },
                query_args: {
                  description:
                    'Additional query string arguments to use when connecting to the DB',
                  type: 'object',
                  additionalProperties: true,
                },
              },
              additionalProperties: false,
              oneOf: [
                {
                  properties: {
                    type: {
                      const: 'oracle',
                    },
                    database: {
                      type: 'string',
                    },
                    query_args: {
                      not: {
                        required: ['service_name'],
                      },
                    },
                  },
                  required: ['type', 'database'],
                },
                {
                  properties: {
                    type: {
                      const: 'oracle',
                    },
                    database: {
                      not: {
                        type: 'string',
                      },
                    },
                    query_args: {
                      required: ['service_name'],
                    },
                  },
                  required: ['type', 'query_args'],
                },
                {
                  properties: {
                    type: {
                      enum: ['db2', 'mysql', 'postgresql', 'sqlserver'],
                    },
                    database: {
                      type: 'string',
                    },
                  },
                  required: ['type', 'database'],
                },
              ],
              examples: [
                {
                  hr: {
                    type: 'postgresql',
                    host: 'localhost',
                    port: 5432,
                    database: 'postgres',
                    user: 'postgres',
                    password: 'postgres',
                    connect_args: {
                      connect_timeout: 10,
                    },
                    query_args: {
                      sslmode: 'verify-ca',
                      sslrootcert: '/opt/ssl/ca.crt',
                      sslcert: '/opt/ssl/client.crt',
                      sslkey: '/opt/ssl/client.key',
                    },
                  },
                },
                {
                  'my-oracle': {
                    type: 'oracle',
                    host: '172.17.0.4',
                    port: 1521,
                    user: 'c##dbzuser',
                    password: 'dbz',
                    query_args: {
                      service_name: 'ORCLPDB1',
                    },
                  },
                },
              ],
            },
            {
              description: 'Cassandra',
              properties: {
                type: {
                  description: 'DB type',
                  type: 'string',
                  const: 'cassandra',
                },
                hosts: {
                  description: 'Cassandra hosts',
                  type: 'array',
                  items: {
                    type: 'string',
                    title: 'Address of Cassandra node',
                  },
                },
                port: {
                  description: 'Cassandra DB port',
                  type: 'integer',
                  minimum: 1,
                  maximum: 65535,
                  default: 9042,
                },
                database: {
                  description: 'DB name',
                  type: 'string',
                },
                user: {
                  description: 'DB user',
                  type: 'string',
                },
                password: {
                  description: 'DB password',
                  type: 'string',
                },
              },
              additionalProperties: false,
              required: ['type', 'hosts'],
              examples: [
                {
                  cache: {
                    type: 'cassandra',
                    hosts: ['localhost'],
                    port: 9042,
                    database: 'myDB',
                    user: 'myUser',
                    password: 'myPassword',
                  },
                },
              ],
            },
          ],
        },
        additionalProperties: false,
      },
    },
  },
};

export const mockRdiJobsSchema = {
  oneOf: [
    {
      title: 'Ingest Job Definition',
      type: 'object',
      properties: {
        name: {
          $ref: '#/$defs/job_name',
        },
        source: {
          title: 'Source',
          type: 'object',
          properties: {
            case_insensitive: {
              $ref: '#/$defs/source_definition/case_insensitive',
            },
            server_name: {
              $ref: '#/$defs/source_definition/server_name',
            },
            db: {
              $ref: '#/$defs/source_definition/db',
            },
            schema: {
              $ref: '#/$defs/source_definition/schema',
            },
            table: {
              $ref: '#/$defs/source_definition/table',
            },
            row_format: {
              $ref: '#/$defs/row_format',
            },
          },
          required: ['table'],
          additionalProperties: false,
        },
        transform: {
          title: 'Transformation steps',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              uses: {
                title: 'Block name',
                type: 'string',
              },
              with: {
                title: 'Block arguments',
                type: 'object',
              },
            },
            required: ['uses', 'with'],
            additionalProperties: false,
          },
        },
        output: {
          $ref: '#/$defs/output',
        },
      },
      anyOf: [
        {
          required: ['source', 'transform'],
        },
        {
          required: ['source', 'output'],
        },
      ],
      additionalProperties: false,
    },
    {
      title: 'Write Behind Job Definition',
      type: 'object',
      properties: {
        name: {
          $ref: '#/$defs/job_name',
        },
        source: {
          title: 'Source',
          type: 'object',
          properties: {
            redis: {
              title: 'Keyspace properties',
              type: 'object',
              properties: {
                trigger: {
                  const: 'write-behind',
                },
                key_pattern: {
                  $ref: '#/$defs/source_definition/redis_key_pattern',
                },
                exclude_commands: {
                  title: 'Redis commands to exclude from CDC',
                  type: 'array',
                  uniqueItems: true,
                  maxItems: 16,
                  items: {
                    type: 'string',
                    enum: [
                      'del',
                      'hdel',
                      'hincrby',
                      'hincrbyfloat',
                      'hmset',
                      'hset',
                      'hsetnx',
                      'unlink',
                      'json.arrappend',
                      'json.arrinsert',
                      'json.arrpop',
                      'json.arrtrim',
                      'json.del',
                      'json.numincrby',
                      'json.set',
                      'json.strappend',
                      'json.toggle',
                    ],
                  },
                },
              },
              required: ['key_pattern'],
              additionalProperties: false,
            },
            row_format: {
              $ref: '#/$defs/row_format',
            },
          },
          required: ['redis'],
          additionalProperties: false,
        },
        transform: {
          title: 'Transformation steps',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              uses: {
                title: 'Block name',
                type: 'string',
              },
              with: {
                title: 'Block arguments',
                type: 'object',
              },
            },
            required: ['uses', 'with'],
            additionalProperties: false,
          },
        },
        output: {
          $ref: '#/$defs/output',
        },
      },
      required: ['output'],
      additionalProperties: false,
    },
  ],
  $defs: {
    job_name: {
      title: 'Job name',
      type: 'string',
      pattern: '^[A-Za-z0-9_-]+$',
      examples: ['my-job'],
    },
    row_format: {
      title:
        'Format of the data to be transformed: data_only - only payload, full - complete change record',
      type: 'string',
      enum: ['data_only', 'full'],
    },
    source_definition: {
      case_insensitive: {
        title: 'Case insensitive comparison',
        type: 'boolean',
        default: true,
      },
      server_name: {
        title: 'Collector logical server name',
        type: 'string',
      },
      db: {
        title: 'DB name',
        type: 'string',
      },
      schema: {
        title: 'DB schema name',
        type: 'string',
      },
      table: {
        title: 'DB table name',
        type: 'string',
      },
      redis_key_pattern: {
        title: 'Redis key pattern',
        type: 'string',
      },
    },
    output_definition: {
      expire: {
        title: 'TTL in seconds for the target key in Redis database',
        type: 'integer',
        minimum: 0,
        default: '0',
      },
      on_update: {
        title: 'Target update strategy',
        type: 'string',
        enum: ['merge', 'replace'],
        default: 'replace',
      },
      data_type: {
        title: 'Target data type',
        description: '',
        type: 'string',
        enum: ['hash', 'json', 'lua', 'set', 'sorted_set', 'stream', 'string'],
        default: 'hash',
      },
    },
    'redis.write_with-nest': {
      title: 'Redis nesting settings',
      type: 'object',
      properties: {
        parent: {
          type: 'object',
          title: 'Parent Source',
          description: 'Parent collection to be used for child objects nesting',
          properties: {
            server_name: {
              $ref: '#/$defs/source_definition/server_name',
            },
            schema: {
              $ref: '#/$defs/source_definition/schema',
            },
            table: {
              $ref: '#/$defs/source_definition/table',
            },
          },
          required: ['table'],
          additionalProperties: false,
        },
        parent_key: {
          description:
            'Foreign key field that is used to identify the parent record',
          type: 'string',
          examples: ['InvoiceId'],
        },
        child_key: {
          description:
            'Foreign key field in a child table, if different from the parent_key',
          type: 'string',
          examples: ['ParentInvoiceId'],
        },
        nesting_key: {
          description:
            'Primary key that is used to identify child element in a parent collection',
          type: 'string',
          examples: ['InvoiceLineId'],
        },
        path: {
          description: 'Path used to embed child elements to a parent object',
          type: 'string',
          pattern: '^\\$\\.[a-zA-Z0-9_]+$',
          examples: ['$.InvoiceLineItems'],
        },
        structure: {
          description: 'Structure type used to embed children objects',
          type: 'string',
          enum: ['map'],
          default: 'map',
        },
      },
      required: ['parent', 'parent_key', 'nesting_key', 'path'],
      additionalProperties: false,
    },
    'supported-arguments-for-sets': {
      if: {
        properties: {
          data_type: {
            const: 'set',
          },
        },
        required: ['data_type'],
      },
      then: {
        properties: {
          args: {
            properties: {
              member: {
                title: 'Member to be added to the set',
                type: 'string',
              },
            },
            required: ['member'],
            additionalProperties: false,
          },
        },
        required: ['args'],
      },
    },
    'supported-arguments-for-sorted-sets': {
      if: {
        properties: {
          data_type: {
            const: 'sorted_set',
          },
        },
        required: ['data_type'],
      },
      then: {
        properties: {
          args: {
            properties: {
              member: {
                title: 'Member of the sorted set',
                type: 'string',
              },
              score: {
                title: 'Score associated with the member in the sorted set',
                type: 'string',
              },
            },
            required: ['member', 'score'],
            additionalProperties: false,
          },
        },
        required: ['args'],
      },
    },
    'supported-arguments-for-strings': {
      if: {
        properties: {
          data_type: {
            const: 'string',
          },
        },
        required: ['data_type'],
      },
      then: {
        properties: {
          args: {
            properties: {
              value: {
                title: 'Value for the string data type',
                type: 'string',
              },
            },
            required: ['value'],
            additionalProperties: false,
          },
        },
        required: ['args'],
      },
    },
    'supported-arguments-for-lua': {
      if: {
        properties: {
          data_type: {
            const: 'lua',
          },
        },
        required: ['data_type'],
      },
      then: {
        properties: {
          args: {
            properties: {
              script: {
                title: 'Lua script to be executed',
                type: 'string',
              },
            },
            required: ['script'],
            additionalProperties: false,
          },
        },
        required: ['args'],
      },
    },
    'unsupported-legacy-rt-job': {
      title: 'Read Through Job Definition',
      type: 'object',
      properties: {
        source: {
          title: 'Source',
          type: 'object',
          properties: {
            redis: {
              title: 'Keyspace properties',
              type: 'object',
              properties: {
                trigger: {
                  const: 'read-through',
                },
                key_pattern: {
                  $ref: '#/$defs/source_definition/redis_key_pattern',
                },
              },
              required: ['key_pattern'],
              additionalProperties: false,
            },
            keys: {
              title: 'Key parts',
              type: 'object',
              properties: {
                expression: {
                  title: 'Regular expression',
                  type: 'string',
                  examples: ['branch:(\\d+):emp:(\\d+)'],
                },
                delimiter: {
                  title: 'Delimiter',
                  type: 'string',
                  minLength: 1,
                  default: ':',
                  examples: [':'],
                },
                fields: {
                  title: 'Key parts mapping',
                  type: 'object',
                  minProperties: 1,
                  additionalProperties: {
                    type: 'integer',
                    minimum: 0,
                    examples: [2, 4],
                  },
                },
              },
              oneOf: [
                {
                  required: ['fields', 'expression'],
                  not: {
                    required: ['delimiter'],
                  },
                },
                {
                  required: ['fields'],
                  not: {
                    required: ['expression'],
                  },
                },
              ],
              additionalProperties: false,
            },
            connection: {
              title: 'Connection',
              type: 'string',
            },
            schema: {
              $ref: '#/$defs/source_definition/schema',
            },
            table: {
              title: 'Table to fetch data from',
              type: 'string',
              examples: ['EMP'],
            },
            columns: {
              title: 'List of columns',
              type: 'array',
              items: {
                type: 'string',
                title: 'Column',
              },
              examples: [['first_name', 'last_name', 'birth_date']],
            },
            sql: {
              title: 'SQL',
              type: 'string',
              examples: [
                'SELECT emp.*, address.*, kids.* FROM emp LEFT JOIN address ON emp.employee_id = address.employee_id LEFT JOIN kids ON emp.employee_id = kids.employee_id WHERE emp.employee_fname = :first_name AND emp.employee_lname = :last_name;',
              ],
            },
            retries: {
              title: 'Number of attempts to read from the database',
              type: 'integer',
              minimum: 1,
              default: '1',
            },
          },
          required: ['redis', 'keys', 'connection'],
          oneOf: [
            {
              required: ['table', 'columns', 'schema'],
              not: {
                required: ['sql'],
              },
            },
            {
              required: ['sql'],
              allOf: [
                {
                  not: {
                    required: ['table'],
                  },
                },
                {
                  not: {
                    required: ['columns'],
                  },
                },
                {
                  not: {
                    required: ['schema'],
                  },
                },
              ],
            },
          ],
          additionalProperties: false,
        },
        transform: {
          title: 'Transformation steps',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              uses: {
                title: 'Block name',
                type: 'string',
              },
              with: {
                title: 'Block arguments',
                type: 'object',
              },
            },
            required: ['uses', 'with'],
            additionalProperties: false,
          },
        },
        output: {
          title: 'Output definitions',
          type: 'object',
          properties: {
            expire: {
              $ref: '#/$defs/output_definition/expire',
            },
            additionalProperties: false,
          },
        },
      },
      required: ['source'],
      additionalProperties: false,
    },
    output: {
      title: 'Output definitions',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          uses: {
            title: 'Output writer',
            type: 'string',
            enum: ['cassandra.write', 'redis.write', 'relational.write'],
          },
          with: {
            title: 'Output writer arguments',
            type: 'object',
            properties: {
              nest: {
                $ref: '#/$defs/redis.write_with-nest',
              },
              connection: {
                title: 'Target database connection',
                type: 'string',
                default: 'target',
              },
              keyspace: {
                type: 'string',
                title: 'Keyspace',
                description: 'Keyspace',
                examples: ['employees'],
              },
              key: {
                title: 'key',
                description:
                  'Expression to form the target Redis key when using redis.write block',
                type: 'object',
              },
              keys: {
                title: 'keys',
                description:
                  'List of fields to uniquely identify target record when using relational.write block',
                type: 'array',
              },
              data_type: {
                $ref: '#/$defs/output_definition/data_type',
              },
              schema: {
                type: 'string',
                title: 'The table schema of the target table',
                description:
                  'If left blank, the default schema of this connection will be used as defined in the `connections.yaml`',
                examples: ['dbo'],
              },
              table: {
                type: 'string',
                title: 'The target table name',
                description: 'Target table name',
                examples: ['employees'],
              },
              mapping: {
                title: 'Fields to write',
                type: 'array',
                items: {
                  type: ['string', 'object'],
                  title: 'Name of column',
                },
              },
              foreach: {
                type: 'string',
                title:
                  'Split a column into multiple records with a JMESPath expression',
                description:
                  'Use a JMESPath expression to split a column into multiple records. The expression should be in the format column: expression.',
                pattern: '^(?!:).*:.*(?<!:)$',
                examples: ['order_line: lines[]'],
              },
              args: {
                title: 'Arguments for Redis writers',
                type: 'object',
              },
              options: {
                title: 'Redis writer options passed to the writer',
                type: 'array',
                default: [],
              },
              on_update: {
                $ref: '#/$defs/output_definition/on_update',
              },
              expire: {
                $ref: '#/$defs/output_definition/expire',
              },
            },
            anyOf: [
              {
                properties: {
                  on_update: {
                    const: 'merge',
                  },
                  data_type: {
                    const: 'json',
                  },
                },
                required: ['nest', 'on_update', 'data_type'],
              },
              {
                required: ['key'],
                not: {
                  required: ['nest'],
                },
              },
              {
                required: ['keys'],
                not: {
                  required: ['nest'],
                },
              },
              {
                required: ['data_type'],
                not: {
                  required: ['nest'],
                },
              },
            ],
            dependentSchemas: {
              mapping: {
                properties: {
                  data_type: {
                    enum: ['hash', 'json', 'stream'],
                  },
                },
              },
            },
            allOf: [
              {
                $ref: '#/$defs/supported-arguments-for-sets',
              },
              {
                $ref: '#/$defs/supported-arguments-for-sorted-sets',
              },
              {
                $ref: '#/$defs/supported-arguments-for-strings',
              },
              {
                $ref: '#/$defs/supported-arguments-for-lua',
              },
            ],
            additionalProperties: false,
          },
        },
        required: ['uses', 'with'],
        additionalProperties: false,
      },
    },
  },
};

export const mockRdiSchema = {
  config: mockRdiConfigSchema,
  jobs: mockRdiJobsSchema,
};

export const mockRdiRepository = jest.fn(() => ({
  get: jest.fn(),
  list: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

export const mockRdiClientProvider = jest.fn(() => ({
  getOrCreate: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  deleteManyByRdiId: jest.fn(),
}));

export const mockRdiClientFactory = jest.fn(() => ({
  createClient: jest.fn(),
}));

export const mockRdiClientStorage = jest.fn(() => ({
  getByMetadata: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  deleteManyByRdiId: jest.fn(),
}));

export const mockRdiPipelineAnalytics = jest.fn(() => ({
  sendRdiPipelineFetched: jest.fn(),
  sendRdiPipelineFetchFailed: jest.fn(),
  sendRdiPipelineDeployed: jest.fn(),
  sendRdiPipelineDeployFailed: jest.fn(),
}));

export const mockRdiAnalytics = jest.fn(() => ({
  sendRdiInstanceDeleted: jest.fn(),
}));
