import {
  AiChat,
  AiChatMessage,
  AiChatMessageType,
} from 'src/modules/ai/chat/models';
import { Readable } from 'stream';
import * as MockSocket from 'socket.io-mock';
import { AxiosError } from 'axios';
import { SendAiChatMessageDto } from 'src/modules/ai/chat/dto/send.ai-chat.message.dto';
import { mockCloudSession } from 'src/__mocks__/cloud-session';
import {
  AiQueryIntermediateStep,
  AiQueryIntermediateStepType,
  AiQueryMessage,
} from 'src/modules/ai/query/models';
import { AiQueryMessageEntity } from 'src/modules/ai/query/entities/ai-query.message.entity';
import { EncryptionStrategy } from 'src/modules/encryption/models';

export const mockAiChatId =
  '0539879dc020add5abb33f6f60a07fe8d5a0b9d61c81c9d79d77f9b1b2f2e239';

export const mockAiChatBadRequestError = {
  message: 'Bad request',
  response: {
    status: 400,
  },
} as AxiosError;

export const mockAiChatUnauthorizedError = {
  message: 'Request failed with status code 401',
  response: {
    status: 401,
  },
} as AxiosError;

export const mockAiChatAccessDeniedError = {
  message: 'Access denied',
  response: {
    status: 403,
  },
} as AxiosError;

export const mockAiChatNotFoundError = {
  message: 'Requested resource was not found',
  response: {
    status: 404,
  },
} as AxiosError;

export const mockAiChatInternalServerError = {
  message: 'Server error',
  response: {
    status: 500,
  },
} as AxiosError;

export const mockHumanMessage1Response = {
  type: AiChatMessageType.HumanMessage,
  content: 'Question 1',
};

export const mockHumanMessage2Response = {
  type: AiChatMessageType.HumanMessage,
  content: 'Question 2',
};

export const mockAiMessage1Response = {
  type: AiChatMessageType.AiMessage,
  content: 'Answer 1',
};
export const mockAiMessage2Response = {
  type: AiChatMessageType.AiMessage,
  content: 'Answer 2',
};

export const mockAiHistoryApiResponse = [
  mockHumanMessage1Response,
  mockAiMessage1Response,
  mockHumanMessage2Response,
  mockAiMessage2Response,
];

export const mockAiChat = Object.assign(new AiChat(), {
  id: mockAiChatId,
  messages: [
    Object.assign(new AiChatMessage(), mockHumanMessage1Response),
    Object.assign(new AiChatMessage(), mockAiMessage1Response),
    Object.assign(new AiChatMessage(), mockHumanMessage2Response),
    Object.assign(new AiChatMessage(), mockAiMessage2Response),
  ],
});
export const getMockedReadableStream = () => new Readable();
export const mockAiResponseStream = getMockedReadableStream();

export const mockSendAiChatMessageDto = Object.assign(
  new SendAiChatMessageDto(),
  {
    content: mockHumanMessage1Response.content,
  },
);

export const mockAiQueryConversationId = 'conversation-id-uuid';
export const mockAiQueryDatabaseId = 'database-id-uuid';
export const mockAiQueryAccountId = 'account-id';

export const mockAiQueryHumanMessage: AiQueryMessage = Object.assign(
  new AiQueryMessage(),
  {
    id: 'uuid-for-human-message-1',
    type: AiChatMessageType.HumanMessage,
    content: 'human message 1',
    conversationId: mockAiQueryConversationId,
    databaseId: mockAiQueryDatabaseId,
    accountId: mockAiQueryAccountId,
  },
);

export const mockAiQueryHumanMessageEntity: AiQueryMessageEntity =
  Object.assign(new AiQueryMessageEntity(), {
    ...mockAiQueryHumanMessage,
    content: 'human message 1 ENCRYPTED',
    encryption: EncryptionStrategy.KEYTAR,
  });

export const mockAiQueryHumanMessage2: AiQueryMessage = Object.assign(
  new AiQueryMessage(),
  {
    id: 'uuid-for-human-message-2',
    type: AiChatMessageType.HumanMessage,
    content: 'human message 2',
    conversationId: mockAiQueryConversationId,
    databaseId: mockAiQueryDatabaseId,
    accountId: mockAiQueryAccountId,
  },
);

export const mockAiQueryHumanMessageEntity2: AiQueryMessageEntity =
  Object.assign(new AiQueryMessageEntity(), {
    ...mockAiQueryHumanMessage2,
    content: 'human message 2',
    encryption: EncryptionStrategy.PLAIN,
  });

export const mockAiQueryAiIntermediateStep: AiQueryIntermediateStep =
  Object.assign(new AiQueryIntermediateStep(), {
    type: AiQueryIntermediateStepType.TOOL,
    data: 'intermediate tool 1',
  });

export const mockAiQueryAiIntermediateStep2: AiQueryIntermediateStep =
  Object.assign(new AiQueryIntermediateStep(), {
    type: AiQueryIntermediateStepType.TOOL_CALL,
    data: 'intermediate tool call 2',
  });

export const mockAiQueryAiResponse: AiQueryMessage = Object.assign(
  new AiQueryMessage(),
  {
    id: 'uuid-for-ai-response-1',
    type: AiChatMessageType.AiMessage,
    content: 'ai response 1',
    steps: [mockAiQueryAiIntermediateStep, mockAiQueryAiIntermediateStep2],
    conversationId: mockAiQueryConversationId,
    databaseId: mockAiQueryDatabaseId,
    accountId: mockAiQueryAccountId,
  },
);

export const mockAiQueryAiResponseEntity: AiQueryMessageEntity = Object.assign(
  new AiQueryMessageEntity(),
  {
    ...mockAiQueryAiResponse,
    content: 'ai response 1 ENCRYPTED',
    encryption: EncryptionStrategy.KEYTAR,
  },
);

export const mockAiQueryAiResponse2: AiQueryMessage = Object.assign(
  new AiQueryMessage(),
  {
    id: 'uuid-for-ai-response-2',
    type: AiChatMessageType.AiMessage,
    content: 'ai response 2',
    steps: [],
    conversationId: mockAiQueryConversationId,
    databaseId: mockAiQueryDatabaseId,
    accountId: mockAiQueryAccountId,
  },
);

export const mockAiQueryAiResponseEntity2: AiQueryMessageEntity = Object.assign(
  new AiQueryMessageEntity(),
  {
    ...mockAiQueryAiResponse2,
    content: 'ai response 2',
    encryption: EncryptionStrategy.PLAIN,
    steps: '[]',
  },
);

export const mockAiQueryHistory = [
  mockAiQueryHumanMessage,
  mockAiQueryAiResponse,
];

export const mockAiQueryIndex = 'idx:bicycle';

export const mockAiQueryIndexInfoReply = [
  'index_name',
  mockAiQueryIndex,
  'index_options',
  [],
  'index_definition',
  ['key_type', 'JSON', 'prefixes', ['bicycle:'], 'default_score', '1'],
  'attributes',
  [
    [
      'identifier',
      '$.description',
      'attribute',
      'description',
      'type',
      'TEXT',
      'WEIGHT',
      '1',
    ],
    ['identifier', '$.price', 'attribute', 'price', 'type', 'NUMERIC'],
    [
      'identifier',
      '$.type',
      'attribute',
      'type',
      'type',
      'TAG',
      'SEPARATOR',
      '',
    ],
  ],
  'num_docs',
  '122',
  'max_doc_id',
  '122',
  'num_terms',
  '550',
  'num_records',
  '2964',
  'inverted_sz_mb',
  '0.0145721435546875',
  'vector_index_sz_mb',
  '0',
  'total_inverted_index_blocks',
  '576',
  'offset_vectors_sz_mb',
  '0.0024938583374023438',
  'doc_table_size_mb',
  '0.009075164794921875',
  'sortable_values_size_mb',
  '0',
  'key_table_size_mb',
  '0.0038166046142578125',
  'records_per_doc_avg',
  '24.295082092285156',
  'bytes_per_record_avg',
  '5.1551957130432129',
  'offsets_per_term_avg',
  '0.88225370645523071',
  'offset_bits_per_record_avg',
  '8',
  'hash_indexing_failures',
  '0',
  'indexing',
  '0',
  'percent_indexed',
  '1',
  'gc_stats',
  [
    'bytes_collected',
    '0',
    'total_ms_run',
    '0',
    'total_cycles',
    '0',
    'average_cycle_time_ms',
    '-nan',
    'last_run_time_ms',
    '0',
    'gc_numeric_trees_missed',
    '0',
    'gc_blocks_denied',
    '0',
  ],
  'cursor_stats',
  [
    'global_idle',
    0,
    'global_total',
    0,
    'index_capacity',
    128,
    'index_total',
    0,
  ],
];

export const mockAiQueryIndexInfoObject = {
  index_name: mockAiQueryIndex,
  index_options: [],
  index_definition: {
    key_type: 'JSON',
    prefixes: ['bicycle:'],
    default_score: '1',
  },
  attributes: [
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
      identifier: '$.type',
      attribute: 'type',
      type: 'TAG',
      SEPARATOR: '',
    },
  ],
  num_docs: '122',
  max_doc_id: '122',
  num_terms: '550',
  num_records: '2964',
  inverted_sz_mb: '0.0145721435546875',
  vector_index_sz_mb: '0',
  total_inverted_index_blocks: '576',
  offset_vectors_sz_mb: '0.0024938583374023438',
  doc_table_size_mb: '0.009075164794921875',
  sortable_values_size_mb: '0',
  key_table_size_mb: '0.0038166046142578125',
  records_per_doc_avg: '24.295082092285156',
  bytes_per_record_avg: '5.1551957130432129',
  offsets_per_term_avg: '0.88225370645523071',
  offset_bits_per_record_avg: '8',
  hash_indexing_failures: '0',
  indexing: '0',
  percent_indexed: '1',
  gc_stats: [
    'bytes_collected',
    '0',
    'total_ms_run',
    '0',
    'total_cycles',
    '0',
    'average_cycle_time_ms',
    '-nan',
    'last_run_time_ms',
    '0',
    'gc_numeric_trees_missed',
    '0',
    'gc_blocks_denied',
    '0',
  ],
  cursor_stats: [
    'global_idle',
    0,
    'global_total',
    0,
    'index_capacity',
    128,
    'index_total',
    0,
  ],
};

export const mockAiQuerySchema = {
  $schema: 'http://json-schema.org/draft-06/schema#',
  $ref: '#/definitions/IdxBicycle',
  definitions: {
    IdxBicycle: {
      type: 'object',
      additionalProperties: false,
      properties: {
        price: { type: 'integer' },
        type: { type: 'string' },
        description: { type: 'string' },
      },
      required: ['description', 'price', 'type'],
      title: 'IdxBicycle',
    },
  },
};

export const mockAiQuerySchemaForHash = {
  $schema: 'http://json-schema.org/draft-06/schema#',
  $ref: '#/definitions/IdxBicycle',
  definitions: {
    IdxBicycle: {
      type: 'object',
      additionalProperties: false,
      properties: {
        price: { type: 'string', format: 'integer' },
        type: { type: 'string' },
        description: { type: 'string' },
      },
      required: ['description', 'price', 'type'],
      title: 'IdxBicycle',
    },
  },
};

export const mockAiQueryGetDescriptionTopValuesReply = [
  '3',
  [
    '1',
    'The Freedom offers eco-friendly mobility without compromising on style and performance!',
  ],
  [
    '1',
    'The Explorer conquers rugged trails and mountain peaks with confidence and agility!',
  ],
  [
    '1',
    'The Pioneer leads the way through challenging trails and rocky terrain with confidence!',
  ],
];

export const mockAiQueryGetPriceTopValuesReply = [
  '3',
  ['1', '320'],
  ['1', '329'],
  ['1', '380'],
];

export const mockAiQueryGetTypeTopValuesReply = [
  '3',
  ['1', 'Mountain'],
  ['1', 'City'],
  ['1', 'Kids'],
];

export const mockAiQueryIndexContext = {
  index_name: mockAiQueryIndex,
  create_statement: `FT.CREATE ${mockAiQueryIndex} ON JSON PREFIX 1 bicycle: SCHEMA $.description AS description TEXT $.price AS price NUMERIC $.type AS type TAG`,
  documents_schema: mockAiQuerySchema,
  documents_type: 'JSON',
  attributes: {
    description: {
      identifier: '$.description',
      attribute: 'description',
      type: 'TEXT',
      WEIGHT: '1',
      distinct_count: 3,
      top_values: [
        {
          value:
            'The Freedom offers eco-friendly mobility without compromising on style and performance!',
        },
        {
          value:
            'The Explorer conquers rugged trails and mountain peaks with confidence and agility!',
        },
        {
          value:
            'The Pioneer leads the way through challenging trails and rocky terrain with confidence!',
        },
      ],
    },
    price: {
      identifier: '$.price',
      attribute: 'price',
      type: 'NUMERIC',
      distinct_count: 3,
      top_values: [{ value: '320' }, { value: '329' }, { value: '380' }],
    },
    type: {
      identifier: '$.type',
      attribute: 'type',
      type: 'TAG',
      SEPARATOR: '',
      distinct_count: 3,
      top_values: [{ value: 'Mountain' }, { value: 'City' }, { value: 'Kids' }],
    },
  },
};

export const mockAiQueryFullDbContext = {
  [mockAiQueryIndex]: {
    index_name: mockAiQueryIndex,
    attributes: [
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
        identifier: '$.type',
        attribute: 'type',
        type: 'TAG',
        SEPARATOR: '',
      },
    ],
    documents_type: 'JSON',
  },
};

export const mockAiQueryJsonReply = JSON.stringify({
  price: 490,
  type: 'Touring',
  description:
    'The Wanderer takes you on epic adventures across varied landscapes with comfort and endurance!',
});

export const mockAiQueryHScanReply = [
  0,
  [
    'price',
    '490',
    'type',
    'Touring',
    'description',
    'The Wanderer takes you on epic adventures across varied landscapes with comfort and endurance!',
  ],
];

export const mockAiQueryAuth = {
  accountId: mockCloudSession.user.currentAccountId,
  csrf: mockCloudSession.csrf,
  sessionId: mockCloudSession.apiSessionId,
};

export const mockAiQuerySocket = new MockSocket();

export const mockConvAiProvider = jest.fn(() => ({
  auth: jest.fn().mockResolvedValue(mockAiChatId),
  postMessage: jest.fn().mockResolvedValue(mockAiResponseStream),
  getHistory: jest.fn().mockResolvedValue(mockAiHistoryApiResponse),
  reset: jest.fn(),
}));

export const mockAiQueryProvider = jest.fn(() => ({
  getSocket: jest.fn().mockResolvedValue(mockAiQuerySocket.socketClient),
}));

export const mockAiQueryAuthProvider = jest.fn(() => ({
  getAuthData: jest.fn().mockResolvedValue(mockAiQueryAuth),
}));

export const mockAiQueryMessageRepository = jest.fn(() => ({
  list: jest.fn().mockResolvedValue(mockAiQueryHistory),
  createMany: jest.fn(),
  clearHistory: jest.fn(),
}));

export const mockAiQueryContextRepository = jest.fn(() => ({
  getFullDbContext: jest.fn().mockResolvedValue(mockAiQueryFullDbContext),
  setFullDbContext: jest.fn().mockResolvedValue(mockAiQueryFullDbContext),
  getIndexContext: jest.fn().mockResolvedValue(mockAiQueryIndexContext),
  setIndexContext: jest.fn().mockResolvedValue(mockAiQueryIndexContext),
  reset: jest.fn(),
}));
