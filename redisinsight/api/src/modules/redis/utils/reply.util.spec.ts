import { mockRedisServerInfoResponse } from 'src/__mocks__';
import { flatMap } from 'lodash';
import {
  convertArrayReplyToObject,
  convertMultilineReplyToObject,
  parseNodesFromClusterSlotsReply,
  RedisClusterSlotsReply,
  resolvePreferredEndpoint,
  UNKNOWN_ENDPOINT_MARKER,
} from './reply.util';

const mockRedisServerInfo = {
  redis_version: '6.0.5',
  redis_mode: 'standalone',
  os: 'Linux 4.15.0-1087-gcp x86_64',
  arch_bits: '64',
  tcp_port: '11113',
  uptime_in_seconds: '1000',
};

const mockIncorrectString = '$6\r\nfoobar\r\n';

describe('convertArrayReplyToObject', () => {
  it('should return appropriate value', () => {
    const input = ['key1', 'value1', 'key2', 'value2'];

    const output = convertArrayReplyToObject(input);

    expect(flatMap(Object.entries(output))).toEqual(input);
  });
  it('should return empty object', () => {
    const output = convertArrayReplyToObject([]);

    expect({}).toEqual(output);
  });
});

describe('convertMultilineReplyToObject', () => {
  it('should return object in a defined format', async () => {
    const result = convertMultilineReplyToObject(mockRedisServerInfoResponse);

    expect(result).toEqual(mockRedisServerInfo);
  });
  it('should return empty object in case of incorrect string', async () => {
    const result = convertMultilineReplyToObject(mockIncorrectString);

    expect(result).toEqual({});
  });
  it('should return empty object in case of an error', async () => {
    const result = convertMultilineReplyToObject({} as string);

    expect(result).toEqual({});
  });
});

describe('resolvePreferredEndpoint', () => {
  it('should use the preferred endpoint as-is when it is a normal ip', () => {
    expect(resolvePreferredEndpoint('172.31.100.211', 'fallback')).toEqual(
      '172.31.100.211',
    );
  });
  it('should use the preferred endpoint as-is when it is a normal hostname', () => {
    expect(
      resolvePreferredEndpoint('node-1.redis.example.com', 'fallback'),
    ).toEqual('node-1.redis.example.com');
  });
  it('should fall back to the command host when endpoint is null (unknown endpoint)', () => {
    expect(resolvePreferredEndpoint(null, '10.0.0.1')).toEqual('10.0.0.1');
  });
  it('should fall back to the command host when endpoint is an empty string', () => {
    expect(resolvePreferredEndpoint('', '10.0.0.1')).toEqual('10.0.0.1');
  });
  it('should return undefined when endpoint is null and there is no fallback host', () => {
    expect(resolvePreferredEndpoint(null, undefined)).toBeUndefined();
  });
  it('should return undefined for the "?" misconfigured-node marker, ignoring the fallback host', () => {
    expect(
      resolvePreferredEndpoint(UNKNOWN_ENDPOINT_MARKER, '10.0.0.1'),
    ).toBeUndefined();
  });
});

describe('parseNodesFromClusterSlotsReply', () => {
  it('should use the ip as-is when cluster-preferred-endpoint-type is ip (default)', () => {
    const slots: RedisClusterSlotsReply = [
      [0, 5460, ['172.31.100.211', 6379, 'node-1']],
      [5461, 10922, ['172.31.100.212', 6379, 'node-2']],
    ];

    expect(parseNodesFromClusterSlotsReply(slots)).toEqual([
      { host: '172.31.100.211', port: 6379 },
      { host: '172.31.100.212', port: 6379 },
    ]);
  });

  it('should use the announced hostname when it is the resolved preferred endpoint', () => {
    const slots: RedisClusterSlotsReply = [
      [0, 16383, ['node-1.redis.example.com', 7379, 'node-1']],
    ];

    expect(parseNodesFromClusterSlotsReply(slots)).toEqual([
      { host: 'node-1.redis.example.com', port: 7379 },
    ]);
  });

  it('should use the ip even when the node also announces a hostname, when the preferred endpoint is the ip', () => {
    // Regression test for https://github.com/redis/RedisInsight/pull/6180#discussion_r3546234089:
    // `cluster-announce-hostname` alone does not mean hostname is preferred -
    // `cluster-preferred-endpoint-type` decides that, and CLUSTER SLOTS'
    // first field already reflects the resolved decision. A node can
    // announce a hostname purely as metadata while the preferred endpoint
    // (what we must actually use) stays the ip.
    const slots: RedisClusterSlotsReply = [
      [0, 16383, ['10.0.161.40', 7379, 'node-1']],
    ];

    expect(parseNodesFromClusterSlotsReply(slots)).toEqual([
      { host: '10.0.161.40', port: 7379 },
    ]);
  });

  it('should fall back to the command host for an unknown (null) endpoint', () => {
    const slots: RedisClusterSlotsReply = [[0, 16383, [null, 6379, 'node-1']]];

    expect(parseNodesFromClusterSlotsReply(slots, '203.0.113.10')).toEqual([
      { host: '203.0.113.10', port: 6379 },
    ]);
  });

  it('should fall back to the command host for an unknown (empty string) endpoint', () => {
    const slots: RedisClusterSlotsReply = [[0, 16383, ['', 6379, 'node-1']]];

    expect(parseNodesFromClusterSlotsReply(slots, '203.0.113.10')).toEqual([
      { host: '203.0.113.10', port: 6379 },
    ]);
  });

  it('should skip a node whose endpoint is the "?" misconfigured marker', () => {
    const slots: RedisClusterSlotsReply = [
      [
        0,
        16383,
        [UNKNOWN_ENDPOINT_MARKER, 6379, 'node-1'],
        ['node-2.redis.example.com', 6380, 'node-2'],
      ],
    ];

    expect(parseNodesFromClusterSlotsReply(slots)).toEqual([
      { host: 'node-2.redis.example.com', port: 6380 },
    ]);
  });

  it('should deduplicate the same node id across non-contiguous slot ranges', () => {
    const slots: RedisClusterSlotsReply = [
      [0, 400, ['node-1.redis.example.com', 7379, 'node-1']],
      [900, 900, ['node-1.redis.example.com', 7379, 'node-1']],
      [1800, 6000, ['node-1.redis.example.com', 7379, 'node-1']],
    ];

    expect(parseNodesFromClusterSlotsReply(slots)).toEqual([
      { host: 'node-1.redis.example.com', port: 7379 },
    ]);
  });

  it('should include replica nodes in addition to the master for each slot range', () => {
    const slots: RedisClusterSlotsReply = [
      [
        0,
        16383,
        ['node-1.redis.example.com', 7379, 'master-1'],
        ['node-2.redis.example.com', 7380, 'replica-1'],
      ],
    ];

    expect(parseNodesFromClusterSlotsReply(slots)).toEqual([
      { host: 'node-1.redis.example.com', port: 7379 },
      { host: 'node-2.redis.example.com', port: 7380 },
    ]);
  });

  it('should return empty array in case of an error', () => {
    expect(
      parseNodesFromClusterSlotsReply(
        null as unknown as RedisClusterSlotsReply,
      ),
    ).toEqual([]);
  });
});
