import {
  mockRedisClusterNodesResponse,
  mockRedisClusterNodesResponseIPv6,
  mockRedisServerInfoResponse,
} from 'src/__mocks__';
import { flatMap } from 'lodash';
import { IRedisClusterNode, RedisClusterNodeLinkState } from 'src/models';
import {
  convertArrayReplyToObject,
  convertMultilineReplyToObject,
  parseNodesFromClusterInfoReply,
} from './reply.util';

const mockRedisServerInfo = {
  redis_version: '6.0.5',
  redis_mode: 'standalone',
  os: 'Linux 4.15.0-1087-gcp x86_64',
  arch_bits: '64',
  tcp_port: '11113',
  uptime_in_seconds: '1000',
};

const mockRedisClusterNodes: IRedisClusterNode[] = [
  {
    id: '07c37dfeb235213a872192d90877d0cd55635b91',
    host: '127.0.0.1',
    port: 30004,
    replicaOf: 'e7d1eecce10fd6bb5eb35b9f99a514335d9ba9ca',
    linkState: RedisClusterNodeLinkState.Connected,
    slot: undefined,
  },
  {
    id: 'e7d1eecce10fd6bb5eb35b9f99a514335d9ba9ca',
    host: '127.0.0.1',
    port: 30001,
    replicaOf: undefined,
    linkState: RedisClusterNodeLinkState.Connected,
    slot: '0-16383',
  },
];

// IPv6 expected results
const mockRedisClusterNodesIPv6: IRedisClusterNode[] = [
  {
    id: '07c37dfeb235213a872192d90877d0cd55635b91',
    host: '2001:db8::1',
    port: 7001,
    replicaOf: 'e7d1eecce10fd6bb5eb35b9f99a514335d9ba9ca',
    linkState: RedisClusterNodeLinkState.Connected,
    slot: undefined,
  },
  {
    id: 'e7d1eecce10fd6bb5eb35b9f99a514335d9ba9ca',
    host: '2001:db8::2',
    port: 7002,
    replicaOf: undefined,
    linkState: RedisClusterNodeLinkState.Connected,
    slot: '0-16383',
  },
];

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

describe('parseNodesFromClusterInfoReply', () => {
  it('should return array object in a defined format', async () => {
    const result = parseNodesFromClusterInfoReply(
      mockRedisClusterNodesResponse,
    );

    expect(result).toEqual(mockRedisClusterNodes);
  });
  it('should return empty array when incorrect string passed', async () => {
    const result = parseNodesFromClusterInfoReply(mockIncorrectString);

    expect(result).toEqual([]);
  });
  it('should parse IPv6 addresses correctly', async () => {
    const result = parseNodesFromClusterInfoReply(
      mockRedisClusterNodesResponseIPv6,
    );

    expect(result).toEqual(mockRedisClusterNodesIPv6);
  });
});
