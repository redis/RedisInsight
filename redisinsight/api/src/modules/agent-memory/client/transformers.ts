import {
  AgentMemoryMessage,
  LongTermMemoryRecord,
  SummaryView,
  WorkingMemoryResponse,
} from 'src/modules/agent-memory/agent-memory.types';
import { LONG_TERM_MEMORY_KEY_PREFIX } from 'src/modules/agent-memory/constants';

// The memory server may tag a memory with the same topic/entity more than
// once - dedupe so consumers can key UI elements on the values.
const uniqueStrings = (values: unknown): string[] => [
  ...new Set(Array.isArray(values) ? values : []),
];

/**
 * OSS agent-memory-server (snake_case) -> normalized camelCase shapes.
 */

// The server marks messages already processed by long-term extraction
// with 't'/'f'. Absent flag -> null (unknown/unsupported).
const fromOssExtractedFlag = (flag: unknown): boolean | null => {
  if (flag === 't') return true;
  if (flag === 'f') return false;
  return null;
};

export const fromOssMessage = (
  message: Record<string, any>,
): AgentMemoryMessage => ({
  id: message?.id,
  role: message?.role ?? 'user',
  content: message?.content ?? '',
  createdAt: message?.created_at,
  persistedAt: message?.persisted_at,
  discreteMemoryExtracted: fromOssExtractedFlag(
    message?.discrete_memory_extracted,
  ),
});

export const fromOssWorkingMemory = (
  data: Record<string, any>,
): WorkingMemoryResponse => ({
  sessionId: data?.session_id,
  userId: data?.user_id ?? undefined,
  namespace: data?.namespace ?? undefined,
  messages: (data?.messages ?? []).map(fromOssMessage),
  // The server reports the auto-summarized conversation in `context`
  // (WorkingMemory.context) - there is no top-level `summary` field.
  summary:
    typeof data?.context === 'string' && data.context
      ? data.context
      : undefined,
  createdAt: data?.created_at ?? undefined,
  ttlSeconds: data?.ttl_seconds ?? undefined,
});

export const fromOssMemory = (
  memory: Record<string, any>,
): LongTermMemoryRecord => ({
  id: memory?.id,
  key: memory?.id ? `${LONG_TERM_MEMORY_KEY_PREFIX}${memory.id}` : undefined,
  text: memory?.text ?? '',
  memoryType: memory?.memory_type,
  userId: memory?.user_id ?? undefined,
  sessionId: memory?.session_id ?? undefined,
  namespace: memory?.namespace ?? undefined,
  topics: uniqueStrings(memory?.topics),
  entities: uniqueStrings(memory?.entities),
  createdAt: memory?.created_at,
  updatedAt: memory?.updated_at,
  score:
    typeof memory?.score === 'number'
      ? memory.score
      : typeof memory?.dist === 'number'
        ? memory.dist
        : undefined,
});

export const fromOssSummaryView = (view: Record<string, any>): SummaryView => ({
  id: view?.id,
  name: view?.name ?? '',
  groupBy: Array.isArray(view?.group_by) ? view.group_by : [],
  continuous:
    typeof view?.continuous === 'boolean' ? view.continuous : undefined,
});

/**
 * Redis Cloud agent memory (camelCase, different field names) -> normalized
 * camelCase shapes. Cloud has no namespace concept, no similarity scores and
 * no per-message extraction flag.
 */

export const fromCloudEvent = (
  event: Record<string, any>,
): AgentMemoryMessage => ({
  id: event?.eventId,
  role: (event?.role ?? 'user').toLowerCase(),
  content: event?.content?.[0]?.text ?? '',
  createdAt: event?.createdAt,
  discreteMemoryExtracted: null,
});

export const fromCloudSessionMemory = (
  data: Record<string, any>,
): WorkingMemoryResponse => ({
  sessionId: data?.sessionId,
  userId: data?.ownerId ?? undefined,
  namespace: undefined,
  messages: (data?.events ?? []).map(fromCloudEvent),
  summary:
    typeof data?.summary === 'string' && data.summary
      ? data.summary
      : undefined,
  // The session record carries no created_at - approximate from the
  // earliest event.
  createdAt:
    (data?.events ?? [])
      .map((event: Record<string, any>) => event?.createdAt)
      .filter(Boolean)
      .sort()[0] ?? undefined,
});

export const fromCloudMemory = (
  memory: Record<string, any>,
): LongTermMemoryRecord => ({
  id: memory?.id,
  text: memory?.text ?? '',
  memoryType: memory?.memoryType,
  userId: memory?.ownerId ?? undefined,
  sessionId: memory?.sessionId ?? undefined,
  namespace: undefined,
  topics: uniqueStrings(memory?.topics),
  entities: uniqueStrings(memory?.entities),
  createdAt: memory?.createdAt,
  updatedAt: memory?.updatedAt,
  score: undefined,
});
