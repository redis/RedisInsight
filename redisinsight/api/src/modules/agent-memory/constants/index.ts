export const AGENT_MEMORY_TIMEOUT = 30_000; // 30 sec
export const AGENT_MEMORY_IDLE_THRESHOLD = 10 * 60 * 1000; // 10 min
export const AGENT_MEMORY_SYNC_INTERVAL = 5 * 60 * 1000; // 5 min
// lastConnection is display-only (the endpoints table) - throttle its
// persistence so auto-refresh traffic doesn't write SQLite every request.
export const LAST_CONNECTION_UPDATE_INTERVAL = 60 * 1000; // 1 min

export const SESSIONS_LIST_LIMIT = 50;

// The Cloud service accepts only these event roles.
export const CLOUD_EVENT_ROLES = ['USER', 'ASSISTANT', 'SYSTEM'] as const;

export const LONG_TERM_MEMORY_SEARCH_LIMIT = 50;

export const AGENT_MEMORY_ERROR_MESSAGES = {
  INVALID_ENDPOINT_ID: 'Invalid agent memory endpoint id.',
  UNSUPPORTED_BACKEND: 'Unsupported agent memory backend type.',
} as const;
