import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCloudSession,
  mockCloudSessionService,
  mockInitSession,
  MockType,
} from 'src/__mocks__';
import { InSessionCloudUserRepository } from 'src/modules/cloud/user/repositories/in-session.cloud-user.repository';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';

describe('InSessionCloudUserRepository', () => {
  let service: InSessionCloudUserRepository;
  let sessionService: MockType<CloudSessionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InSessionCloudUserRepository,
        {
          provide: CloudSessionService,
          useFactory: mockCloudSessionService,
        },
      ],
    }).compile();

    service = module.get(InSessionCloudUserRepository);
    sessionService = module.get(CloudSessionService);
  });

  describe('get', () => {
    it('successfully get current user', async () => {
      expect(await service.get(mockInitSession.id)).toEqual(
        mockCloudSession.user,
      );
      expect(sessionService.getSession).toHaveBeenCalledWith(
        mockInitSession.id,
      );
    });
    it('should return null when there is no cloud session data', async () => {
      sessionService.getSession.mockResolvedValueOnce(null);

      expect(await service.get(mockInitSession.id)).toEqual(null);
      expect(sessionService.getSession).toHaveBeenCalledWith(
        mockInitSession.id,
      );
    });
  });

  describe('update', () => {
    it('successfully update current user data', async () => {
      await service.update(mockInitSession.id, {
        name: 'new name',
      });

      expect(sessionService.updateSessionData).toHaveBeenCalledWith(
        mockInitSession.id,
        {
          user: {
            ...mockCloudSession.user,
            name: 'new name',
          },
        },
      );
    });
    it('successfully update current user accounts (replace array data)', async () => {
      const account = {
        id: 9999,
        name: 'new name',
      };

      await service.update(mockInitSession.id, {
        accounts: [account],
      });

      expect(sessionService.updateSessionData).toHaveBeenCalledWith(
        mockInitSession.id,
        {
          user: {
            ...mockCloudSession.user,
            accounts: [account],
          },
        },
      );
    });
  });
});
