import { mockStandaloneRedisClient } from 'src/__mocks__/redis-client';

export const mockDatabaseClientFactory = jest.fn(() => ({
  getOrCreateClient: jest.fn().mockResolvedValue(mockStandaloneRedisClient),
  createClient: jest.fn().mockResolvedValue(mockStandaloneRedisClient),
}));
