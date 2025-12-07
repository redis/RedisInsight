import { Test, TestingModule } from '@nestjs/testing';
import {
  mockAiQueryAuth,
  mockCloudUserApiService,
  mockSessionMetadata,
  MockType,
} from 'src/__mocks__';
import { LocalAiQueryAuthProvider } from 'src/modules/ai/query/providers/auth/local.ai-query-auth.provider';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import {
  CloudApiForbiddenException,
  CloudApiUnauthorizedException,
} from 'src/modules/cloud/common/exceptions';

const mockedResult = 'mockedResult';
const mockedFn = jest.fn().mockResolvedValue(mockedResult);

describe('LocalAiQueryAuthProvider', () => {
  let service: LocalAiQueryAuthProvider;
  let cloudUserApiService: MockType<CloudUserApiService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalAiQueryAuthProvider,
        {
          provide: CloudUserApiService,
          useFactory: mockCloudUserApiService,
        },
      ],
    }).compile();

    service = module.get(LocalAiQueryAuthProvider);
    cloudUserApiService = module.get(CloudUserApiService);
  });

  describe('getAuthData', () => {
    it('should get auth data', async () => {
      expect(await service.getAuthData(mockSessionMetadata)).toEqual(
        mockAiQueryAuth,
      );
    });

    it('throw CloudApiUnauthorizedException exception', async () => {
      cloudUserApiService.getUserSession.mockRejectedValueOnce(
        new CloudApiUnauthorizedException(),
      );

      await expect(service.getAuthData(mockSessionMetadata)).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });

  describe('callWithAuthRetry', () => {
    it('should return result from 1st attempt', async () => {
      expect(
        await service.callWithAuthRetry(mockSessionMetadata, mockedFn),
      ).toEqual(mockedResult);
      expect(cloudUserApiService.invalidateApiSession).toHaveBeenCalledTimes(0);
    });
    it('should not fail when session invalidation throw an error', async () => {
      mockedFn.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      cloudUserApiService.invalidateApiSession.mockRejectedValueOnce(
        new Error('Unable to invalidate'),
      );
      expect(
        await service.callWithAuthRetry(mockSessionMetadata, mockedFn),
      ).toEqual(mockedResult);
      expect(cloudUserApiService.invalidateApiSession).toHaveBeenCalledWith(
        mockSessionMetadata,
      );
      expect(cloudUserApiService.invalidateApiSession).toHaveBeenCalledTimes(1);
    });
    it('should throw an error from 1st attempt if not CloudApiUnauthorizedException (and keep session)', async () => {
      mockedFn.mockRejectedValueOnce(new CloudApiForbiddenException());
      await expect(
        service.callWithAuthRetry(mockSessionMetadata, mockedFn),
      ).rejects.toBeInstanceOf(CloudApiForbiddenException);
      expect(cloudUserApiService.invalidateApiSession).toHaveBeenCalledTimes(0);
    });
    it('should throw CloudApiForbiddenException error from 2nd attempt (by default)', async () => {
      mockedFn.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      mockedFn.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      await expect(
        service.callWithAuthRetry(mockSessionMetadata, mockedFn),
      ).rejects.toBeInstanceOf(CloudApiUnauthorizedException);
      expect(mockedFn).toHaveBeenCalledTimes(2);
      expect(cloudUserApiService.invalidateApiSession).toHaveBeenCalledTimes(1);
    });
    it('should throw CloudApiForbiddenException error from 3rd attempt (custom attempts)', async () => {
      mockedFn.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      mockedFn.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      mockedFn.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      await expect(
        service.callWithAuthRetry(mockSessionMetadata, mockedFn, 2),
      ).rejects.toBeInstanceOf(CloudApiUnauthorizedException);
      expect(mockedFn).toHaveBeenCalledTimes(3);
      expect(cloudUserApiService.invalidateApiSession).toHaveBeenCalledTimes(2);
    });
  });
});
