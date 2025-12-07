import IORedis from 'ioredis';

export const mockIORedisClientExec = jest.fn();
const getRedisCommanderMockFunctions = jest.fn(() => ({
  sendCommand: jest.fn(),
  info: jest.fn(),
  monitor: jest.fn(),
  disconnect: jest.fn(),
  duplicate: jest.fn(),
  call: jest.fn(),
  subscribe: jest.fn(),
  psubscribe: jest.fn(),
  unsubscribe: jest.fn(),
  punsubscribe: jest.fn(),
  publish: jest.fn(),
  pipeline: jest.fn().mockReturnThis(),
  exec: mockIORedisClientExec,
  cluster: jest.fn(),
  quit: jest.fn(),
}));

export const mockIORedisClient = {
  ...Object.create(IORedis.prototype),
  ...getRedisCommanderMockFunctions(),
  status: 'ready',
  options: {
    db: 0,
  },
};

export const mockIOClusterNode1 = {
  ...Object.create(IORedis.prototype),
  ...getRedisCommanderMockFunctions(),
  status: 'ready',
  options: {
    host: '127.0.100.1',
    port: 6379,
    db: 0,
  },
};

export const mockIOClusterNode2 = {
  ...Object.create(IORedis.prototype),
  ...getRedisCommanderMockFunctions(),
  status: 'ready',
  options: {
    host: '127.0.100.2',
    port: 6379,
    db: 0,
  },
};

export const mockIORedisSentinel = {
  ...Object.create(IORedis.prototype),
  ...getRedisCommanderMockFunctions(),
  status: 'ready',
  options: {
    db: 0,
  },
};

export const mockIORedisCluster = {
  ...Object.create(IORedis.Cluster.prototype),
  ...getRedisCommanderMockFunctions(),
  isCluster: true,
  status: 'ready',
  nodes: jest.fn().mockReturnValue([mockIOClusterNode1, mockIOClusterNode2]),
};

export const mockRedisService = jest.fn(() => ({
  getClientInstance: jest.fn().mockResolvedValue({
    client: mockIORedisClient,
  }),
  setClientInstance: jest.fn().mockReturnValue({
    client: mockIORedisClient,
  }),
  isClientConnected: jest.fn().mockReturnValue(true),
  removeClientInstance: jest.fn(),
  removeClientInstances: jest.fn(),
  findClientInstances: jest.fn(),
}));

export const mockRedisConnectionFactory = jest.fn(() => ({
  createRedisConnection: jest.fn().mockResolvedValue(mockIORedisClient),
  createStandaloneConnection: jest.fn().mockResolvedValue(mockIORedisClient),
  createSentinelConnection: jest.fn().mockResolvedValue(mockIORedisSentinel),
  createClusterConnection: jest.fn().mockResolvedValue(mockIORedisCluster),
}));
