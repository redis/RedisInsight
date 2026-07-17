import {
  fromCloudEvent,
  fromCloudMemory,
  fromCloudSessionMemory,
  fromOssMemory,
  fromOssMessage,
  fromOssWorkingMemory,
} from 'src/modules/agent-memory/client/transformers';

describe('agent memory transformers', () => {
  describe('fromOssMessage', () => {
    it('should map snake_case fields and the extraction flag', () => {
      expect(
        fromOssMessage({
          id: 'msg-1',
          role: 'assistant',
          content: 'hello',
          created_at: '2026-01-01T00:00:00Z',
          discrete_memory_extracted: 't',
        }),
      ).toEqual({
        id: 'msg-1',
        role: 'assistant',
        content: 'hello',
        createdAt: '2026-01-01T00:00:00Z',
        discreteMemoryExtracted: true,
      });
    });

    it('should map "f" flag to false and missing flag to null', () => {
      expect(
        fromOssMessage({ discrete_memory_extracted: 'f' })
          .discreteMemoryExtracted,
      ).toEqual(false);
      expect(fromOssMessage({}).discreteMemoryExtracted).toBeNull();
    });
  });

  describe('fromOssWorkingMemory', () => {
    it('should normalize session shape and drop empty context', () => {
      const result = fromOssWorkingMemory({
        session_id: 's-1',
        user_id: 'u-1',
        namespace: 'demo',
        messages: [{ id: 'm-1', role: 'user', content: 'hi' }],
        context: '',
      });

      expect(result.sessionId).toEqual('s-1');
      expect(result.userId).toEqual('u-1');
      expect(result.namespace).toEqual('demo');
      expect(result.messages).toHaveLength(1);
      expect(result.summary).toBeUndefined();
    });

    it('should map the running summary from the context field', () => {
      const result = fromOssWorkingMemory({
        session_id: 's-1',
        context: 'User likes Redis and lives in Delhi.',
      });

      expect(result.summary).toEqual('User likes Redis and lives in Delhi.');
    });
  });

  describe('fromOssMemory', () => {
    it('should map memory fields including score', () => {
      const result = fromOssMemory({
        id: 'mem-1',
        text: 'likes redis',
        memory_type: 'semantic',
        user_id: 'u-1',
        session_id: 's-1',
        topics: ['databases'],
        entities: ['redis'],
        created_at: '2026-01-01T00:00:00Z',
        score: 0.42,
      });

      expect(result).toMatchObject({
        id: 'mem-1',
        text: 'likes redis',
        memoryType: 'semantic',
        userId: 'u-1',
        sessionId: 's-1',
        topics: ['databases'],
        entities: ['redis'],
        score: 0.42,
      });
    });

    it('should default topics/entities to empty arrays', () => {
      const result = fromOssMemory({ id: 'mem-2', text: 't' });

      expect(result.topics).toEqual([]);
      expect(result.entities).toEqual([]);
      expect(result.score).toBeUndefined();
    });
  });

  describe('fromCloudEvent', () => {
    it('should flatten content and lowercase the role', () => {
      expect(
        fromCloudEvent({
          eventId: 'e-1',
          role: 'ASSISTANT',
          content: [{ text: 'hello' }],
          createdAt: '2026-01-01T00:00:00Z',
        }),
      ).toEqual({
        id: 'e-1',
        role: 'assistant',
        content: 'hello',
        createdAt: '2026-01-01T00:00:00Z',
        discreteMemoryExtracted: null,
      });
    });
  });

  describe('fromCloudSessionMemory', () => {
    it('should map ownerId to userId and events to messages', () => {
      const result = fromCloudSessionMemory({
        sessionId: 's-1',
        ownerId: 'u-1',
        events: [{ eventId: 'e-1', role: 'USER', content: [{ text: 'hi' }] }],
      });

      expect(result.sessionId).toEqual('s-1');
      expect(result.userId).toEqual('u-1');
      expect(result.namespace).toBeUndefined();
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toEqual('hi');
    });
  });

  describe('fromCloudMemory', () => {
    it('should map cloud fields without score or namespace', () => {
      const result = fromCloudMemory({
        id: 'mem-1',
        text: 'likes redis',
        memoryType: 'semantic',
        ownerId: 'u-1',
        sessionId: 's-1',
        topics: ['databases'],
        createdAt: '2026-01-01T00:00:00Z',
      });

      expect(result).toMatchObject({
        id: 'mem-1',
        memoryType: 'semantic',
        userId: 'u-1',
        sessionId: 's-1',
        topics: ['databases'],
        entities: [],
      });
      expect(result.score).toBeUndefined();
      expect(result.namespace).toBeUndefined();
    });
  });
});
