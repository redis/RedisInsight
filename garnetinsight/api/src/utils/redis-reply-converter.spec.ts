import { mockStandaloneRedisInfoReply } from 'src/__mocks__';
import { convertRedisInfoReplyToObject } from './redis-reply-converter';

const mockRedisServerInfoDto = {
  redis_version: '6.0.5',
  redis_mode: 'standalone',
  os: 'Linux 4.15.0-1087-gcp x86_64',
  arch_bits: '64',
  tcp_port: '11113',
  uptime_in_seconds: '1000',
};

const mockStandaloneRedisInfoDto = {
  server: mockRedisServerInfoDto,
  clients: {
    connected_clients: '1',
    client_longest_output_list: '0',
    client_biggest_input_buf: '0',
    blocked_clients: '0',
  },
  memory: {
    used_memory: '1000000',
    used_memory_human: '1M',
    used_memory_rss: '1000000',
    used_memory_peak: '1000000',
    used_memory_peak_human: '1M',
    used_memory_lua: '37888',
    mem_fragmentation_ratio: '1',
    mem_allocator: 'jemalloc-5.1.0',
  },
  cluster: {
    cluster_enabled: '0',
  },
  keyspace: {
    db0: 'keys=1,expires=0,avg_ttl=0',
  },
  stats: {
    keyspace_hits: '1000',
    keyspace_misses: '0',
  },
  replication: {
    role: 'master',
    connected_slaves: '0',
    master_repl_offset: '0',
    repl_backlog_active: '0',
    repl_backlog_size: '1000',
    repl_backlog_first_byte_offset: '0',
    repl_backlog_histlen: '0',
  },
};

const mockIncorrectString = '$6\r\nfoobar\r\n';

describe('convertRedisReplyInfoToObject', () => {
  it('should return object in a defined format', async () => {
    const result = convertRedisInfoReplyToObject(mockStandaloneRedisInfoReply);

    expect(result).toEqual(mockStandaloneRedisInfoDto);
  });
  it('should return empty object when incorrect string passed', async () => {
    const result = convertRedisInfoReplyToObject(mockIncorrectString);

    expect(result).toEqual({});
  });
});
