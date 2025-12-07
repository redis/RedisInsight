import {
  AddStreamEntriesDto,
  ConsumerDto,
  CreateConsumerGroupDto,
  GetStreamEntriesDto,
  StreamEntryDto,
  StreamEntryFieldDto,
} from 'src/modules/browser/stream/dto';
import { SortOrder } from 'src/constants';
import { mockKeyDto } from 'src/modules/browser/__mocks__/keys';

// stream entries
export const mockEntryId = '1651130346487-0';
export const mockEntryId2 = '1651130346487-1';
export const mockEntryField: StreamEntryFieldDto = {
  name: Buffer.from('field1'),
  value: Buffer.from('value1'),
};
export const mockEntryField2: StreamEntryFieldDto = {
  name: Buffer.from('field2'),
  value: Buffer.from('value2'),
};
export const mockStreamEntry: StreamEntryDto = {
  id: mockEntryId,
  fields: [mockEntryField],
};
export const mockStreamEntries = [
  { id: mockEntryId2, fields: [mockEntryField, mockEntryField2] },
  { id: mockEntryId, fields: [mockEntryField, mockEntryField2] },
];
export const mockAddStreamEntriesDto: AddStreamEntriesDto = {
  keyName: Buffer.from('testList'),
  entries: [mockStreamEntry],
};
export const mockGetStreamEntriesDto: GetStreamEntriesDto = {
  keyName: mockAddStreamEntriesDto.keyName,
  start: '-',
  end: '+',
  sortOrder: SortOrder.Desc,
};

// stream info
export const mockEmptyStreamInfo = {
  keyName: mockAddStreamEntriesDto.keyName,
  total: 0,
  lastGeneratedId: mockEntryId2,
  firstEntry: null,
  lastEntry: null,
};
export const mockStreamInfo = {
  keyName: mockAddStreamEntriesDto.keyName,
  total: 2,
  lastGeneratedId: mockEntryId2,
  firstEntry: {
    id: mockEntryId,
    fields: [mockEntryField, mockEntryField2],
  },
  lastEntry: {
    id: mockEntryId2,
    fields: [mockEntryField, mockEntryField2],
  },
};

// consumer groups
export const mockConsumerGroup = {
  name: Buffer.from('consumer-1'),
  consumers: 0,
  pending: 0,
  lastDeliveredId: mockEntryId2,
  smallestPendingId: mockEntryId,
  greatestPendingId: mockEntryId2,
};
export const mockCreateConsumerGroupDto: CreateConsumerGroupDto = {
  name: mockConsumerGroup.name,
  lastDeliveredId: mockConsumerGroup.lastDeliveredId,
};

// consumers
export const mockConsumer: ConsumerDto = {
  name: Buffer.from('consumer-1'),
  pending: 0,
  idle: 10,
};
export const mockPendingMessage = {
  id: mockEntryId,
  consumerName: mockConsumer.name,
  idle: mockConsumer.idle,
  delivered: 1,
};
export const mockGetPendingMessagesDto = {
  ...mockKeyDto,
  groupName: mockConsumerGroup.name,
  start: '-',
  end: '+',
  count: 10,
  consumerName: mockConsumer.name,
};
export const mockAckPendingMessagesDto = {
  ...mockKeyDto,
  groupName: mockConsumerGroup.name,
  entries: [mockPendingMessage.id, mockPendingMessage.id],
};
export const mockClaimPendingEntriesDto = {
  ...mockKeyDto,
  groupName: mockConsumerGroup.name,
  consumerName: mockConsumer.name,
  entries: [mockPendingMessage.id, mockPendingMessage.id],
  minIdleTime: 0,
};
export const mockAdditionalClaimPendingEntriesDto = {
  time: 0,
  retryCount: 1,
  force: true,
};

// Redis replies
export const mockStreamInfoReply = [
  Buffer.from('length'),
  2,
  Buffer.from('radix-tree-keys'),
  1,
  Buffer.from('radix-tree-nodes'),
  2,
  Buffer.from('last-generated-id'),
  Buffer.from(mockEntryId2),
  Buffer.from('groups'),
  0,
  Buffer.from('first-entry'),
  [
    Buffer.from(mockEntryId),
    [
      mockEntryField.name,
      mockEntryField.value,
      mockEntryField2.name,
      mockEntryField2.value,
    ],
  ],
  Buffer.from('last-entry'),
  [
    Buffer.from(mockEntryId2),
    [
      mockEntryField.name,
      mockEntryField.value,
      mockEntryField2.name,
      mockEntryField2.value,
    ],
  ],
];
export const mockEmptyStreamInfoReply = [
  Buffer.from('length'),
  0,
  Buffer.from('radix-tree-keys'),
  1,
  Buffer.from('radix-tree-nodes'),
  2,
  Buffer.from('last-generated-id'),
  Buffer.from(mockEntryId2),
  Buffer.from('groups'),
  0,
  Buffer.from('first-entry'),
  null,
  Buffer.from('last-entry'),
  null,
];
export const mockStreamEntriesReply = [
  [
    mockEntryId2,
    [
      mockEntryField.name,
      mockEntryField.value,
      mockEntryField2.name,
      mockEntryField2.value,
    ],
  ],
  [
    mockEntryId,
    [
      mockEntryField.name,
      mockEntryField.value,
      mockEntryField2.name,
      mockEntryField2.value,
    ],
  ],
];
export const mockEmptyStreamEntriesReply = [];
export const mockConsumerGroupsReply = [
  'name',
  mockConsumerGroup.name,
  'consumers',
  mockConsumerGroup.consumers,
  'pending',
  mockConsumerGroup.pending,
  'last-delivered-id',
  mockConsumerGroup.lastDeliveredId,
];
export const mockConsumerReply = [
  'name',
  mockConsumer.name,
  'pending',
  mockConsumer.pending,
  'idle',
  mockConsumer.idle,
];
export const mockPendingMessageReply = Object.values(mockPendingMessage);
export const mockClaimPendingEntriesReply = [
  mockPendingMessage.id,
  mockPendingMessage.id,
];
