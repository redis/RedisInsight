import {
  mockRedisClusterFailInfoResponse,
  mockRedisClusterNodesResponse,
  mockRedisClusterNodesResponseWithHostname,
  mockRedisClusterOkInfoResponse,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import { IRedisClusterNodeAddress, ReplyError } from 'src/models';
import { isCluster, discoverClusterNodes } from './cluster.util';

describe('isCluster', () => {
  it('cluster connection ok', async () => {
    mockStandaloneRedisClient.sendCommand.mockResolvedValue(
      mockRedisClusterOkInfoResponse,
    );
    expect(await isCluster(mockStandaloneRedisClient)).toEqual(true);
  });

  it('cluster connection false', async () => {
    mockStandaloneRedisClient.sendCommand.mockResolvedValue(
      mockRedisClusterFailInfoResponse,
    );
    expect(await isCluster(mockStandaloneRedisClient)).toEqual(false);
  });
  it('cluster not supported', async () => {
    mockStandaloneRedisClient.sendCommand.mockRejectedValue({
      name: 'ReplyError',
      message: 'ERR This instance has cluster support disabled',
      command: 'CLUSTER',
    });
    expect(await isCluster(mockStandaloneRedisClient)).toEqual(false);
  });
});

describe('discoverClusterNodes', () => {
  const mockClusterNodeAddresses: IRedisClusterNodeAddress[] = [
    {
      host: '127.0.0.1',
      port: 30004,
    },
    {
      host: '127.0.0.1',
      port: 30001,
    },
  ];

  it('should return nodes in a defined format', async () => {
    mockStandaloneRedisClient.sendCommand.mockResolvedValue(
      mockRedisClusterNodesResponse,
    );
    expect(await discoverClusterNodes(mockStandaloneRedisClient)).toEqual(
      mockClusterNodeAddresses,
    );
  });
  it('cluster not supported', async () => {
    const replyError: ReplyError = {
      name: 'ReplyError',
      message: 'ERR This instance has cluster support disabled',
      command: 'CLUSTER',
    };
    mockStandaloneRedisClient.sendCommand.mockRejectedValue(replyError);

    try {
      await discoverClusterNodes(mockStandaloneRedisClient);
      fail('Should throw an error');
    } catch (err) {
      expect(err).toEqual(replyError);
    }
  });

  it('should use the announced hostname instead of the raw ip when present (Redis 7+)', async () => {
    // Reproduces https://github.com/redis/RedisInsight/issues/5393,
    // https://github.com/redis/RedisInsight/issues/3416 and
    // https://github.com/redis/RedisInsight/issues/3429: nodes behind
    // per-node load balancers / NAT announce a client-facing hostname
    // because their raw ip is not routable to RedisInsight.
    mockStandaloneRedisClient.sendCommand.mockResolvedValue(
      mockRedisClusterNodesResponseWithHostname,
    );

    expect(await discoverClusterNodes(mockStandaloneRedisClient)).toEqual([
      {
        host: 'node-1.redis.example.com',
        port: 7379,
      },
      {
        host: 'node-2.redis.example.com',
        port: 7379,
      },
    ]);
  });
});
