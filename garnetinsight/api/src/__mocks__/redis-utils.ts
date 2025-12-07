import {
  mockOtherSentinelEndpoint,
  mockSentinelMasterDto,
} from 'src/__mocks__/redis-sentinel';

export const mockDbSizeKeysCount = 10_000;

export const mockInfoKeysCount = 20_000;

export const mockRedisKeysUtil = {
  __esModule: true,
  getTotalKeysFromInfo: jest.fn().mockResolvedValue(mockInfoKeysCount),
  getTotalKeysFromDBSize: jest.fn().mockResolvedValue(mockDbSizeKeysCount),
  getTotalKeys: jest.fn().mockResolvedValue(mockDbSizeKeysCount),
};

export const mockRedisKeysUtilModule = () => mockRedisKeysUtil;

export const mockRedisSentinelUtil = {
  __esModule: true,
  isSentinel: jest.fn().mockResolvedValue(true),
  discoverOtherSentinels: jest
    .fn()
    .mockResolvedValue([mockOtherSentinelEndpoint]),
  discoverSentinelMasterGroups: jest
    .fn()
    .mockResolvedValue([mockSentinelMasterDto]),
};

export const mockRedisSentinelUtilModule = () => mockRedisSentinelUtil;

export const mockRedisClusterUtil = {
  __esModule: true,
  isCluster: jest.fn().mockResolvedValue(true),
  discoverClusterNodes: jest
    .fn()
    .mockResolvedValue([mockOtherSentinelEndpoint]),
};

export const mockRedisClusterUtilModule = () => mockRedisClusterUtil;
