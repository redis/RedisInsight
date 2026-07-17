export enum AgentMemoryServerUrl {
  WorkingMemory = 'v1/working-memory',
  LongTermMemorySearch = 'v1/long-term-memory/search',
}

export const AGENT_MEMORY_TIMEOUT = 30_000; // 30 sec
export const AGENT_MEMORY_IDLE_THRESHOLD = 10 * 60 * 1000; // 10 min
export const AGENT_MEMORY_SYNC_INTERVAL = 5 * 60 * 1000; // 5 min
// lastConnection is display-only (the endpoints table) - throttle its
// persistence so auto-refresh traffic doesn't write SQLite every request.
export const LAST_CONNECTION_UPDATE_INTERVAL = 60 * 1000; // 1 min

export const SESSIONS_LIST_LIMIT = 50;

// The Cloud service accepts only these event roles (no 'tool').
export const CLOUD_EVENT_ROLES = ['USER', 'ASSISTANT', 'SYSTEM'] as const;

// The OSS agent-memory-server stores long-term memories in Redis under
// this key prefix (RediSearch index `memory_idx`), e.g.
// `memory_idx:01KVT0WEE13EWMEE3PMNSWQDHE`.
export const LONG_TERM_MEMORY_KEY_PREFIX = 'memory_idx:';
export const LONG_TERM_MEMORY_SEARCH_LIMIT = 50;
export const DISCOVERY_SCAN_LIMIT = 100;

// Names given to the default views the workspace creates. Defaults are
// matched by group_by; the name is only a label shown in the UI.
export const SUMMARY_VIEW_NAMES = {
  userProfile: 'redisinsight:user-profile',
  sessionProfile: 'redisinsight:session-profile',
} as const;

export const AGENT_MEMORY_ERROR_MESSAGES = {
  INVALID_ENDPOINT_ID: 'Invalid agent memory endpoint id.',
  UNSUPPORTED_BACKEND: 'Unsupported agent memory backend type.',
} as const;
