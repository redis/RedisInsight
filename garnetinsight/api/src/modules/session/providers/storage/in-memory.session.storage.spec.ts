import { TestingModule, Test } from '@nestjs/testing';
import { mockInitSession, mockSessionCustomData } from 'src/__mocks__';
import { InMemorySessionStorage } from 'src/modules/session/providers/storage/in-memory.session.storage';

describe('InMemorySessionStorage', () => {
  let service: InMemorySessionStorage;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InMemorySessionStorage],
    }).compile();

    service = module.get(InMemorySessionStorage);
  });

  describe('createSession', () => {
    it('Should create new session if not exists', async () => {
      expect(service['sessions'].size).toEqual(0);

      const result = await service.createSession(mockInitSession);

      expect(result).toEqual(mockInitSession);
      expect(service['sessions'].size).toEqual(1);
      expect(service['sessions'].get(mockInitSession.id)).toEqual(
        mockInitSession,
      );
    });

    it('Should create new session if not exists 2 times', async () => {
      expect(service['sessions'].size).toEqual(0);

      const session1 = await service.createSession(mockInitSession);
      const session2 = await service.createSession({
        ...mockInitSession,
        id: '_2',
      });

      expect(service['sessions'].size).toEqual(2);
      expect(session1).toEqual(mockInitSession);
      expect(session2).toEqual({ ...mockInitSession, id: '_2' });
      expect(service['sessions'].get(mockInitSession.id)).toEqual(
        mockInitSession,
      );
      expect(service['sessions'].get('_2')).toEqual({
        ...mockInitSession,
        id: '_2',
      });
    });
  });

  describe('updateSessionData', () => {
    it('Should not affect existing data', async () => {
      service['sessions'] = new Map([[mockInitSession.id, mockInitSession]]);

      const result = await service.updateSessionData(mockInitSession.id, {});

      expect(result).toEqual(mockInitSession);
    });
    it('Should add custom data', async () => {
      service['sessions'] = new Map([[mockInitSession.id, mockInitSession]]);

      const result = await service.updateSessionData(
        mockInitSession.id,
        mockSessionCustomData,
      );

      expect(result).toEqual({
        ...mockInitSession,
        data: mockSessionCustomData,
      });
    });
    it('Should return null if no session found and not affect existing sessions', async () => {
      service['sessions'] = new Map([[mockInitSession.id, mockInitSession]]);

      expect(service['sessions'].size).toEqual(1);
      expect(await service.getSession(mockInitSession.id)).toEqual(
        mockInitSession,
      );

      const result = await service.updateSessionData(
        '_2',
        mockSessionCustomData,
      );

      expect(result).toEqual(null);

      expect(service['sessions'].size).toEqual(1);
      expect(await service.getSession(mockInitSession.id)).toEqual(
        mockInitSession,
      );
    });
  });

  describe('deleteSession + getSession', () => {
    it('should delete session by id', async () => {
      service['sessions'] = new Map([
        [mockInitSession.id, mockInitSession],
        ['_2', { ...mockInitSession, id: '_2' }],
      ]);

      expect(service['sessions'].size).toEqual(2);

      expect(await service.getSession(mockInitSession.id)).toEqual(
        mockInitSession,
      );
      expect(await service.getSession('_2')).toEqual({
        ...mockInitSession,
        id: '_2',
      });
      await service.deleteSession(mockInitSession.id);

      expect(service['sessions'].size).toEqual(1);

      expect(await service.getSession(mockInitSession.id)).toEqual(null);
      expect(await service.getSession('_2')).toEqual({
        ...mockInitSession,
        id: '_2',
      });

      await service.deleteSession('_2');

      expect(service['sessions'].size).toEqual(0);

      expect(await service.getSession(mockInitSession.id)).toEqual(null);
      expect(await service.getSession('_2')).toEqual(null);
    });
  });
});
