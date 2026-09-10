import {
  AgentMemoryMessage,
  LongTermMemoryRecord,
  WorkingMemoryResponse,
} from 'src/modules/agent-memory/agent-memory.types';

// The memory server may tag a memory with the same topic more than once -
// dedupe so consumers can key UI elements on the values.
const uniqueStrings = (values: unknown): string[] => [
  ...new Set(Array.isArray(values) ? values : []),
];

/**
 * Redis Agent Memory (camelCase) -> normalized camelCase shapes.
 */

export const fromCloudEvent = (
  event: Record<string, any>,
): AgentMemoryMessage => ({
  id: event?.eventId,
  role: (event?.role ?? 'user').toLowerCase(),
  content: event?.content?.[0]?.text ?? '',
  createdAt: event?.createdAt,
});

export const fromCloudSessionMemory = (
  data: Record<string, any>,
): WorkingMemoryResponse => ({
  sessionId: data?.sessionId,
  userId: data?.ownerId ?? undefined,
  namespace: data?.namespace ?? undefined,
  messages: (data?.events ?? []).map(fromCloudEvent),
  summary:
    typeof data?.summary?.text === 'string' && data.summary.text
      ? {
          text: data.summary.text,
          updatedAt: data.summary.updatedAt ?? undefined,
          summarizedEvents: data.summary.summarizedEvents ?? undefined,
        }
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
  namespace: memory?.namespace ?? undefined,
  topics: uniqueStrings(memory?.topics),
  createdAt: memory?.createdAt,
  updatedAt: memory?.updatedAt,
});
