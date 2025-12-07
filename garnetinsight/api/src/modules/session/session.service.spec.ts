import { TestingModule, Test } from '@nestjs/testing';
import {
  mockInitSession,
  mockSessionCustomData,
  mockSessionProvider,
  MockType,
} from 'src/__mocks__';
import { SessionService } from 'src/modules/session/session.service';
import { SessionProvider } from 'src/modules/session/providers/session.provider';

describe('SessionService', () => {
  let service: SessionService;
  let sessionProvider: MockType<SessionProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: SessionProvider,
          useFactory: mockSessionProvider,
        },
      ],
    }).compile();

    service = module.get(SessionService);
    sessionProvider = module.get(SessionProvider);
  });

  describe('getSession', () => {
    it('Should get session by id', async () => {
      const result = await service.getSession(mockInitSession.id);

      expect(result).toEqual(mockInitSession);
      expect(sessionProvider.getSession).toHaveBeenCalledWith(
        mockInitSession.id,
      );
    });
  });

  describe('createSession', () => {
    it('Should create new session by id', async () => {
      const result = await service.createSession(mockInitSession);

      expect(result).toEqual(mockInitSession);
      expect(sessionProvider.createSession).toHaveBeenCalledWith(
        mockInitSession,
      );
    });
  });

  describe('updateSessionData', () => {
    it('Should not affect existing data by id', async () => {
      const result = await service.updateSessionData(mockInitSession.id, {});

      expect(result).toEqual(mockInitSession);
      expect(sessionProvider.updateSessionData).toHaveBeenCalledWith(
        mockInitSession.id,
        {},
      );
    });
    it('Should update data by id', async () => {
      const result = await service.updateSessionData(
        mockInitSession.id,
        mockSessionCustomData,
      );

      expect(result).toEqual(mockInitSession);
      expect(sessionProvider.updateSessionData).toHaveBeenCalledWith(
        mockInitSession.id,
        mockSessionCustomData,
      );
    });
    it('Should merge data by id', async () => {
      sessionProvider.getSession.mockResolvedValueOnce({
        data: {
          some: 'data',
          custom: 'string',
        },
      });

      const result = await service.updateSessionData(
        mockInitSession.id,
        mockSessionCustomData,
      );

      expect(result).toEqual(mockInitSession);
      expect(sessionProvider.updateSessionData).toHaveBeenCalledWith(
        mockInitSession.id,
        {
          ...mockSessionCustomData,
          some: 'data',
        },
      );
    });
    it('Should return null when session was not found', async () => {
      sessionProvider.getSession.mockResolvedValueOnce(null);
      const result = await service.updateSessionData(mockInitSession.id, {});

      expect(result).toEqual(null);
      expect(sessionProvider.updateSessionData).not.toHaveBeenCalled();
    });
  });

  describe('deleteSession', () => {
    it('should delete session by id', async () => {
      await service.deleteSession(mockInitSession.id);
      expect(sessionProvider.deleteSession).toHaveBeenCalledWith(
        mockInitSession.id,
      );
    });
  });
});
