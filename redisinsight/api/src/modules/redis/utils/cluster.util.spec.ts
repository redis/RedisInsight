import {
  mockRedisClusterFailInfoResponse,
  mockRedisClusterOkInfoResponse,
  mockStandaloneRedisClient,
  generateMockRedisClient,
} from 'src/__mocks__';
import { IRedisClusterNodeAddress, ReplyError } from 'src/models';
import { RedisClusterSlotsReply } from 'src/modules/redis/utils/reply.util';
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
  it('should return nodes in a defined format, using the ip when it is the preferred endpoint', async () => {
    const slots: RedisClusterSlotsReply = [
      [0, 5460, ['127.0.0.1', 30004, 'node-1']],
      [5461, 16383, ['127.0.0.1', 30001, 'node-2']],
    ];
    mockStandaloneRedisClient.sendCommand.mockResolvedValue(slots);

    const expected: IRedisClusterNodeAddress[] = [
      { host: '127.0.0.1', port: 30004 },
      { host: '127.0.0.1', port: 30001 },
    ];
    expect(await discoverClusterNodes(mockStandaloneRedisClient)).toEqual(
      expected,
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

  it('should use the announced hostname as root node address when it is the resolved preferred endpoint', async () => {
    // Reproduces https://github.com/redis/RedisInsight/issues/5393,
    // https://github.com/redis/RedisInsight/issues/3416 and
    // https://github.com/redis/RedisInsight/issues/3429: nodes behind
    // per-node load balancers / NAT announce a client-facing hostname
    // because their raw ip is not routable to RedisInsight, and the
    // server resolves `cluster-preferred-endpoint-type hostname` into
    // CLUSTER SLOTS' preferred-endpoint field.
    const slots: RedisClusterSlotsReply = [
      [0, 16383, ['node-1.redis.example.com', 7379, 'node-1']],
    ];
    mockStandaloneRedisClient.sendCommand.mockResolvedValue(slots);

    expect(await discoverClusterNodes(mockStandaloneRedisClient)).toEqual([
      { host: 'node-1.redis.example.com', port: 7379 },
    ]);
  });

  it('should use the ip, not an announced hostname, when the preferred endpoint type is ip', async () => {
    // Regression test for https://github.com/redis/RedisInsight/pull/6180#discussion_r3546234089:
    // a node can announce a hostname as metadata while
    // `cluster-preferred-endpoint-type` still resolves to `ip` - the raw ip
    // must be used in that case even though a hostname exists.
    const slots: RedisClusterSlotsReply = [
      [0, 16383, ['10.0.161.40', 7379, 'node-1']],
    ];
    mockStandaloneRedisClient.sendCommand.mockResolvedValue(slots);

    expect(await discoverClusterNodes(mockStandaloneRedisClient)).toEqual([
      { host: '10.0.161.40', port: 7379 },
    ]);
  });

  it('should fall back to the host used to connect when a node has an unknown (null) endpoint', async () => {
    const client = generateMockRedisClient(
      { databaseId: 'unknown-endpoint-test' },
      undefined,
      { host: '203.0.113.10', port: 6379 },
    );
    const slots: RedisClusterSlotsReply = [[0, 16383, [null, 6379, 'node-1']]];
    client.sendCommand = jest.fn().mockResolvedValue(slots);

    expect(await discoverClusterNodes(client)).toEqual([
      { host: '203.0.113.10', port: 6379 },
    ]);
  });

  it('should still discover nodes from a pre-4.0.0 cluster reply with no node id', async () => {
    // Regression test for https://github.com/redis/RedisInsight/pull/6180#discussion_r3551046293
    const slots = [
      [0, 5460, ['127.0.0.1', 30001]],
      [5461, 16383, ['127.0.0.1', 30002]],
    ] as unknown as RedisClusterSlotsReply;
    mockStandaloneRedisClient.sendCommand.mockResolvedValue(slots);

    expect(await discoverClusterNodes(mockStandaloneRedisClient)).toEqual([
      { host: '127.0.0.1', port: 30001 },
      { host: '127.0.0.1', port: 30002 },
    ]);
  });

  it('should skip a node whose endpoint is the "?" misconfigured marker', async () => {
    const slots: RedisClusterSlotsReply = [
      [
        0,
        16383,
        ['?', 6379, 'node-1'],
        ['node-2.redis.example.com', 6380, 'node-2'],
      ],
    ];
    mockStandaloneRedisClient.sendCommand.mockResolvedValue(slots);

    expect(await discoverClusterNodes(mockStandaloneRedisClient)).toEqual([
      { host: 'node-2.redis.example.com', port: 6380 },
    ]);
  });

  it('should fall back to the connection entrypoint when every node is the "?" misconfigured marker', async () => {
    // Regression test for https://github.com/redis/RedisInsight/pull/6180#discussion_r3629962716:
    // CLUSTER SLOTS omits unassigned-slot / '?' nodes entirely, so a
    // partially-configured cluster can resolve to an empty node list; keep
    // the discovery entrypoint as a seed instead of returning no root nodes.
    const client = generateMockRedisClient(
      { databaseId: 'all-misconfigured-test' },
      undefined,
      { host: '203.0.113.10', port: 6379 },
    );
    const slots: RedisClusterSlotsReply = [[0, 16383, ['?', 6379, 'node-1']]];
    client.sendCommand = jest.fn().mockResolvedValue(slots);

    expect(await discoverClusterNodes(client)).toEqual([
      { host: '203.0.113.10', port: 6379 },
    ]);
  });
});
