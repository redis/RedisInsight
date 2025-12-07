export const mockRedisServerInfoResponse: string =
  ' # Server\r\n' +
  'redis_version:6.0.5\r\n' +
  'redis_mode:standalone\r\n' +
  'os:Linux 4.15.0-1087-gcp x86_64\r\n' +
  'uptime_in_seconds:1000\r\n' +
  'arch_bits:64\r\n' +
  'tcp_port:11113\r\n';

export const mockRedisClientsInfoResponse: string =
  '# Clients\r\n' +
  'connected_clients:1\r\n' +
  'client_longest_output_list:0\r\n' +
  'client_biggest_input_buf:0\r\n' +
  'blocked_clients:0\r\n';

export const mockRedisKeyspaceInfoResponse: string =
  '# Keyspace\r\ndb0:keys=1,expires=0,avg_ttl=0\r\n';

export const mockRedisKeyspaceInfoResponseNoKeyspaceData: string =
  '# Keyspace\r\n \r\n';

export const mockRedisMemoryInfoResponse: string =
  '# Memory\r\n' +
  'used_memory:1000000\r\n' +
  'used_memory_human:1M\r\n' +
  'used_memory_rss:1000000\r\n' +
  'used_memory_peak:1000000\r\n' +
  'used_memory_peak_human:1M\r\n' +
  'used_memory_lua:37888\r\n' +
  'mem_fragmentation_ratio:1\r\n' +
  'mem_allocator:jemalloc-5.1.0\r\n';

export const mockRedisReplicationInfoResponse: string =
  '# Replication\r\n' +
  'role:master\r\n' +
  'connected_slaves:0\r\n' +
  'master_repl_offset:0\r\n' +
  'repl_backlog_active:0\r\n' +
  'repl_backlog_size:1000\r\n' +
  'repl_backlog_first_byte_offset:0\r\n' +
  'repl_backlog_histlen:0\r\n';

export const mockRedisStatsInfoResponse: string =
  '# Stats\r\nkeyspace_hits:1000\r\nkeyspace_misses:0\r\n';

export const mockRedisClusterOkInfoResponse: string =
  ' # Cluster\r\n' +
  'cluster_state:ok\r\n' +
  'cluster_slots_assigned:16384\r\n' +
  'cluster_slots_ok:16384\r\n' +
  'cluster_slots_pfail:0\r\n' +
  'cluster_slots_fail:0\r\n' +
  'cluster_known_nodes:6\r\n' +
  'cluster_size:3\r\n' +
  'cluster_current_epoch:6\r\n' +
  'cluster_my_epoch:2\r\n' +
  'cluster_current_epoch:6\r\n' +
  'cluster_slots_fail:0\r\n';

export const mockRedisClusterFailInfoResponse: string =
  ' # Cluster\r\n' +
  'cluster_state:fail\r\n' +
  'cluster_slots_assigned:16384\r\n' +
  'cluster_slots_ok:16384\r\n' +
  'cluster_slots_pfail:0\r\n' +
  'cluster_slots_fail:0\r\n' +
  'cluster_known_nodes:6\r\n' +
  'cluster_size:3\r\n' +
  'cluster_current_epoch:6\r\n' +
  'cluster_my_epoch:2\r\n' +
  'cluster_current_epoch:6\r\n' +
  'cluster_slots_fail:0\r\n';

export const mockRedisClusterDisabledInfoResponse: string =
  '# Cluster\r\ncluster_enabled:0\r\n';

export const mockSentinelMasterInOkState: string[] = [
  'name',
  'mymaster',
  'ip',
  '127.0.0.1',
  'port',
  '6379',
  'num-slaves',
  '1',
  'flags',
  'master',
];
export const mockSentinelMasterInDownState: string[] = [
  'name',
  'mymaster',
  'ip',
  '127.0.0.1',
  'port',
  '6379',
  'num-slaves',
  '1',
  'flags',
  's_down,masrer',
];

export const mockRedisSentinelMasterResponse: Array<string[]> = [
  mockSentinelMasterInOkState,
];

// eslint-disable-next-line max-len
export const mockRedisClusterNodesResponse: string =
  '07c37dfeb235213a872192d90877d0cd55635b91 127.0.0.1:30004@31004 slave e7d1eecce10fd6bb5eb35b9f99a514335d9ba9ca 0 1426238317239 4 connected\n' +
  'e7d1eecce10fd6bb5eb35b9f99a514335d9ba9ca 127.0.0.1:30001@31001 myself,master - 0 0 1 connected 0-16383';

// eslint-disable-next-line max-len
export const mockRedisClusterNodesResponseIPv6: string =
  '07c37dfeb235213a872192d90877d0cd55635b91 2001:db8::1:7001@17001 slave e7d1eecce10fd6bb5eb35b9f99a514335d9ba9ca 0 1426238317239 4 connected\n' +
  'e7d1eecce10fd6bb5eb35b9f99a514335d9ba9ca 2001:db8::2:7002@17002 myself,master - 0 0 1 connected 0-16383';

export const mockStandaloneRedisInfoReply: string = `${
  mockRedisServerInfoResponse
}\r\n${mockRedisClientsInfoResponse}\r\n${mockRedisMemoryInfoResponse}\r\n${
  mockRedisStatsInfoResponse
}\r\n${mockRedisReplicationInfoResponse}\r\n${
  mockRedisClusterDisabledInfoResponse
}\r\n${mockRedisKeyspaceInfoResponse}`;

export const mockWhitelistCommandsResponse = ['get', 'custom.command'];

export const mockRedisCommandReply: any[][] = [
  ['get', 0, ['readonly']],
  ['role', 0, ['readonly']],
  ['set', 0, ['write']],
  ['xread', 0, ['readonly']],
  ['custom.command', 0, ['readonly']],
];

export const mockPluginWhiteListCommandsResponse: string[] = [
  'get',
  'custom.command',
];
