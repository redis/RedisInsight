import { HostingProvider } from 'src/modules/database/entities/database.entity';
import { mockStandaloneRedisClient } from 'src/__mocks__';
import { getHostingProvider } from './hosting-provider-helper';

const getHostingProviderTests = [
  { input: '127.0.0.1', output: HostingProvider.UNKNOWN_LOCALHOST },
  { input: '0.0.0.0', output: HostingProvider.UNKNOWN_LOCALHOST },
  { input: 'localhost', output: HostingProvider.UNKNOWN_LOCALHOST },
  { input: '172.18.0.2', output: HostingProvider.UNKNOWN_LOCALHOST },
  { input: '176.87.56.244', output: HostingProvider.UNKNOWN },
  { input: '192.12.56.244', output: HostingProvider.UNKNOWN },
  { input: '255.255.56.244', output: HostingProvider.UNKNOWN },
  { input: 'redis', output: HostingProvider.UNKNOWN },
  { input: 'demo-redislabs.rlrcp.com', output: HostingProvider.REDIS_CLOUD },
  { input: 'memorydb.aws.com', output: HostingProvider.AWS_MEMORYDB },
  {
    input: 'redis-16781.c273.us-east-1-2.ec2.cloud.redislabs.com',
    output: HostingProvider.REDIS_CLOUD,
  },
  {
    input: 'redis-16781.c273.us-east-1-2.ec2.cloud.redis-cloud.com',
    output: HostingProvider.REDIS_CLOUD,
  },
  {
    input: 'redis-16781.c273.us-east-1-2.ec2.cloud.rlrcp.com',
    output: HostingProvider.REDIS_CLOUD,
  },
  {
    input: 'askubuntu.mki5tz.0001.use1.cache.amazonaws.com',
    output: HostingProvider.AWS_ELASTICACHE,
  },
  {
    input: 'contoso5.redis.cache.windows.net',
    output: HostingProvider.AZURE_CACHE,
  },
  {
    input: 'contoso5.redisenterprise.cache.azure.net',
    output: HostingProvider.AZURE_CACHE_REDIS_ENTERPRISE,
  },
  { input: 'demo-redis-provider.unknown.com', output: HostingProvider.UNKNOWN },
  {
    input: 'localhost',
    hello: ['server', 'redis'],
    info: '# Server\r\n' + 'executable:/opt/redis/bin/redis-server',
    output: HostingProvider.REDIS_COMMUNITY_EDITION,
  },
  {
    input: 'localhost',
    hello: ['server', 'redis'],
    info: '# Server\r\n' + 'executable:/data/redis-server',
    output: HostingProvider.REDIS_COMMUNITY_EDITION,
  },
  {
    input: 'localhost',
    hello: ['server', 'redis'],
    info: '# Server\r\n' + 'executable:/opt/redis-stack/bin/redis-server',
    output: HostingProvider.REDIS_STACK,
  },
  {
    input: 'localhost',
    hello: [
      'server',
      'redis',
      'modules',
      [['name', 'search', 'path', '/enterprise-managed']],
    ],
    info: '# Server\r\n' + 'redis_version: 7.2.0',
    output: HostingProvider.OTHER_REDIS_MANAGED,
  },
  {
    input: 'localhost',
    hello: [
      'server',
      'redis',
      'modules',
      [['name', 'search', 'path', 'google']],
    ],
    output: HostingProvider.MEMORYSTORE,
  },
  {
    input: 'localhost',
    info: '# Server\r\n' + 'server_name:valkey',
    output: HostingProvider.VALKEY,
  },
  {
    input: 'localhost',
    info: '# Server\r\n' + 'dragonfly_version:df-7.0.0',
    output: HostingProvider.DRAGONFLY,
  },
  {
    input: 'localhost',
    info: '# Server\r\n' + 'garnet_version:gr-7.0.0',
    output: HostingProvider.GARNET,
  },
  {
    input: 'localhost',
    info: '# Server\r\n' + 'kvrocks_version:kv-7.0.0',
    output: HostingProvider.KVROCKS,
  },
  {
    input: 'localhost',
    info: '# Server\r\n' + 'redict_version:rd-7.0.0',
    output: HostingProvider.REDICT,
  },
  {
    input: 'localhost',
    info: '# Server\r\n' + 'upstash_version:up-7.0.0',
    output: HostingProvider.UPSTASH,
  },
  {
    input: 'localhost',
    info: '# Server\r\n' + 'ElastiCache:sometinhg',
    output: HostingProvider.AWS_ELASTICACHE,
  },
  {
    input: 'localhost',
    info: '# Server\r\n' + 'MemoryDB:sometinhg',
    output: HostingProvider.AWS_MEMORYDB,
  },
  {
    input: 'localhost',
    info: '#KeyDb\r\n' + 'some:data',
    output: HostingProvider.KEYDB,
  },
];

describe('getHostingProvider', () => {
  beforeEach(() => {
    mockStandaloneRedisClient.sendCommand.mockReset();
  });

  getHostingProviderTests.forEach((test) => {
    it(`should be output: ${test.output} for input: ${test.input} `, async () => {
      mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce(test.hello);
      mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce(test.info);

      const result = await getHostingProvider(
        mockStandaloneRedisClient,
        test.input,
      );

      expect(result).toEqual(test.output);
    });
  });
});
