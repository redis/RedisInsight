import { TestingModule, Test } from '@nestjs/testing';
import { mockInitSession, mockSessionStorage } from 'src/__mocks__';
import { SingleUserSessionProvider } from 'src/modules/session/providers/single-user.session.provider';
import { SessionStorage } from 'src/modules/session/providers/storage/session.storage';
import { DEFAULT_SESSION_ID } from 'src/common/constants';

describe('SingleUserSessionProvider', () => {
  let service: SingleUserSessionProvider;
  let sessionStorage: SessionStorage;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SingleUserSessionProvider,
        {
          provide: SessionStorage,
          useFactory: mockSessionStorage,
        },
      ],
    }).compile();

    service = module.get(SingleUserSessionProvider);
    sessionStorage = module.get(SessionStorage);
  });

  describe('getSession', () => {
    it('Should get session by hardcoded id', async () => {
      const result = await service.getSession();

      expect(result).toEqual(mockInitSession);
      expect(sessionStorage.getSession).toHaveBeenCalledWith(
        DEFAULT_SESSION_ID,
      );
    });
  });

  describe('createSession', () => {
    it('Should create new session by hardcoded id', async () => {
      const result = await service.createSession({
        ...mockInitSession,
        id: 'should be overwritten for single user approach',
      });

      expect(result).toEqual(mockInitSession);
      expect(sessionStorage.createSession).toHaveBeenCalledWith({
        ...mockInitSession,
        id: DEFAULT_SESSION_ID,
      });
    });
  });

  describe('updateSessionData', () => {
    it('Should not affect existing data  by hardcoded id', async () => {
      const result = await service.updateSessionData(
        'any id will be overwritten',
        {},
      );

      expect(result).toEqual(mockInitSession);
      expect(sessionStorage.updateSessionData).toHaveBeenCalledWith(
        DEFAULT_SESSION_ID,
        {},
      );
    });
  });

  describe('deleteSession', () => {
    it('should delete session by hardcoded id', async () => {
      await service.deleteSession();
      expect(sessionStorage.deleteSession).toHaveBeenCalledWith(
        DEFAULT_SESSION_ID,
      );
    });
  });
});
