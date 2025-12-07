import { TestingModule, Test } from '@nestjs/testing';
import { mockInitSession, mockSessionService, MockType } from 'src/__mocks__';
import { SessionService } from 'src/modules/session/session.service';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import {
  mockCloudSession,
  mockCloudSessionRepository,
} from 'src/__mocks__/cloud-session';
import { CloudSessionRepository } from './repositories/cloud.session.repository';

describe('CloudSessionService', () => {
  let service: CloudSessionService;
  let sessionService: MockType<SessionService>;
  let cloudSessionRepository: MockType<CloudSessionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudSessionService,
        {
          provide: SessionService,
          useFactory: mockSessionService,
        },
        {
          provide: CloudSessionRepository,
          useFactory: mockCloudSessionRepository,
        },
      ],
    }).compile();

    service = module.get(CloudSessionService);
    sessionService = module.get(SessionService);
    cloudSessionRepository = module.get(CloudSessionRepository);
  });

  describe('getSession', () => {
    it('Should return null when there is no cloud data in user session', async () => {
      const result = await service.getSession(mockInitSession.id);

      expect(result).toEqual(null);
    });

    it('should take some additional data in repository if it is not in session', async () => {
      cloudSessionRepository.get.mockResolvedValueOnce({
        id: 1,
        data: { idpType: 'test' },
      });
      const result = await service.getSession(mockInitSession.id);
      expect(result.idpType).toBe('test');
    });

    it('should not fail if data in repository is null', async () => {
      cloudSessionRepository.get.mockResolvedValueOnce({ id: 1, data: null });
      const result = await service.getSession(mockInitSession.id);
      expect(result).toEqual(null);
    });

    it('Should return cloud data only', async () => {
      sessionService.getSession.mockResolvedValueOnce({
        data: {
          cloud: {
            ...mockCloudSession,
          },
        },
      });

      const result = await service.getSession(mockInitSession.id);

      expect(result).toEqual(mockCloudSession);
    });
  });

  describe('updateSessionData', () => {
    it('Should return null when there is nothing to update', async () => {
      await service.updateSessionData(mockInitSession.id, {});

      expect(sessionService.updateSessionData).toHaveBeenCalledWith(
        mockInitSession.id,
        { cloud: {} },
      );
    });
    it('Should update cloud data', async () => {
      await service.updateSessionData(mockInitSession.id, mockCloudSession);

      expect(sessionService.updateSessionData).toHaveBeenCalledWith(
        mockInitSession.id,
        {
          cloud: mockCloudSession,
        },
      );
    });

    it('Should update data in cloud sesssion repository when necessary fields included', async () => {
      sessionService.updateSessionData.mockResolvedValue({
        data: { cloud: mockCloudSession },
      });
      await service.updateSessionData(mockInitSession.id, mockCloudSession);

      expect(cloudSessionRepository.save).toHaveBeenCalled();
    });

    it('Should merge and update cloud data', async () => {
      sessionService.getSession.mockResolvedValueOnce({
        data: {
          cloud: {
            ...mockCloudSession,
          },
        },
      });

      const toUpdate = {
        accessToken: 'to-update-at',
        apiSessionId: 'to0update-session-id',
        user: {
          id: 'to-update-user-id',
          accounts: [
            {
              id: 99999,
              name: 'new account name',
            },
          ],
        },
      };

      await service.updateSessionData(mockInitSession.id, toUpdate);

      expect(sessionService.updateSessionData).toHaveBeenCalledWith(
        mockInitSession.id,
        {
          cloud: {
            ...mockCloudSession,
            ...toUpdate,
          },
        },
      );
    });
  });

  describe('deleteSession', () => {
    it('should delete cloud session data by id and clear cloud session repository data', async () => {
      await service.deleteSessionData(mockInitSession.id);
      expect(sessionService.updateSessionData).toHaveBeenCalledWith(
        mockInitSession.id,
        { cloud: null },
      );
      expect(cloudSessionRepository.save).toHaveBeenCalledWith({ data: null });
    });
  });

  describe('invalidateApiSession', () => {
    it('should invalidate cloud api session data by id', async () => {
      const spy = jest.spyOn(service, 'updateSessionData');

      await service.invalidateApiSession(mockInitSession.id);
      expect(spy).toHaveBeenCalledWith(mockInitSession.id, {
        csrf: null,
        apiSessionId: null,
        user: null,
      });
    });
  });
});
