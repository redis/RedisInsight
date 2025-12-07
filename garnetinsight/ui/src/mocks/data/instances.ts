export const MOCK_INFO_API_RESPONSE = {
  version: '7.4.0',
  usedMemory: 1234,
  connectedClients: 2,
  totalKeys: 123,
  stats: {
    uptime_in_days: '2',
    maxmemory_policy: 'allkeys-lru',
    instantaneous_ops_per_sec: 123,
    instantaneous_input_kbps: 123,
    instantaneous_output_kbps: 123,
    numberOfKeysRange: '0-123',
  },
}

export const MOCK_ADDITIONAL_INFO = {
  connected_clients: 2,
  instantaneous_input_kbps: 123,
  instantaneous_ops_per_sec: 123,
  instantaneous_output_kbps: 123,
  maxmemory_policy: 'allkeys-lru',
  numberOfKeysRange: '0-123',
  redis_version: '7.4.0',
  totalKeys: 123,
  uptime_in_days: '2',
  used_memory: 1234,
}
