import {
  fromCloudEvent,
  fromCloudMemory,
  fromCloudSessionMemory,
} from 'src/modules/agent-memory/client/transformers';

describe('agent memory transformers', () => {
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
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toEqual('hi');
    });
  });

  describe('fromCloudMemory', () => {
    it('should map cloud fields to the normalized record shape', () => {
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
      });
    });
  });
});
