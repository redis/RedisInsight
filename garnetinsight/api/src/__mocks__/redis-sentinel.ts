import {
  SentinelMaster,
  SentinelMasterStatus,
} from 'src/modules/redis-sentinel/models/sentinel-master';
import { Endpoint } from 'src/common/models';
import { CreateSentinelDatabasesDto } from 'src/modules/redis-sentinel/dto/create.sentinel.databases.dto';

export const mockOtherSentinelsReply = [['ip', '127.0.0.2', 'port', '26379']];

export const mockOtherSentinelEndpoint: Endpoint = {
  host: '127.0.0.2',
  port: 26379,
};

export const mockSentinelMasterEndpoint: Endpoint = {
  host: '127.0.0.1',
  port: 6379,
};

export const mockSentinelMasterDto: SentinelMaster = {
  name: 'mymaster',
  host: mockSentinelMasterEndpoint.host,
  port: mockSentinelMasterEndpoint.port,
  numberOfSlaves: 1,
  status: SentinelMasterStatus.Active,
  nodes: [mockOtherSentinelEndpoint],
};

export const mockCreateSentinelDatabasesDto = Object.assign(
  new CreateSentinelDatabasesDto(),
  {
    ...mockOtherSentinelEndpoint,
    masters: [
      {
        name: mockSentinelMasterDto.name,
        alias: mockSentinelMasterDto.name,
      },
    ],
  },
);

export const mockRedisSentinelAnalytics = jest.fn(() => ({
  sendGetSentinelMastersSucceedEvent: jest.fn(),
  sendGetSentinelMastersFailedEvent: jest.fn(),
}));

export const mockRedisSentinelService = jest.fn(() => ({
  getSentinelMasters: jest.fn().mockResolvedValue([mockSentinelMasterDto]),
  createSentinelDatabases: jest.fn().mockResolvedValue([]),
}));
