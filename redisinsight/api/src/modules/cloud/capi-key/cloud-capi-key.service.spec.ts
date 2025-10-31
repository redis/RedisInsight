import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CloudCapiKeyService } from 'src/modules/cloud/capi-key/cloud-capi-key.service';
import { CloudCapiKeyApiProvider } from 'src/modules/cloud/capi-key/cloud-capi-key.api.provider';
import { CloudCapiKeyRepository } from 'src/modules/cloud/capi-key/repository/cloud-capi-key.repository';
import {
  mockCloudCapiKey,
  mockCloudCapiKeyAnalytics,
  mockCloudSessionService,
  mockCloudUserApiService,
  mockServerService,
  mockSessionMetadata,
  mockCloudUser,
  mockUtm,
  MockType,
  mockCloudCapiKeyRepository,
  mockCloudApiCapiKey,
  mockServer,
  mockCloudApiCapiAccessKey,
  mockCloudSession,
} from 'src/__mocks__';
import { when, resetAllWhenMocks } from 'jest-when';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import { ServerService } from 'src/modules/server/server.service';
import { CloudCapiKeyAnalytics } from 'src/modules/cloud/capi-key/cloud-capi-key.analytics';
import {
  CloudApiBadRequestException,
  CloudCapiUnauthorizedException,
} from 'src/modules/cloud/common/exceptions';
import axios from 'axios';
import {
  CloudCapiKeyNotFoundException,
  CloudCapiKeyUnauthorizedException,
} from 'src/modules/cloud/capi-key/exceptions';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);

describe('CloudCapiKeyService', () => {
  let service: CloudCapiKeyService;
  let repository: MockType<CloudCapiKeyRepository>;
  let cloudUserApiService: MockType<CloudUserApiService>;
  let cloudSessionService: MockType<CloudSessionService>;
  let serverService: MockType<ServerService>;

  beforeEach(async () => {
    jest.clearAllMocks();
    resetAllWhenMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudCapiKeyService,
        CloudCapiKeyApiProvider,
        {
          provide: CloudCapiKeyRepository,
          useFactory: mockCloudCapiKeyRepository,
        },
        {
          provide: CloudUserApiService,
          useFactory: mockCloudUserApiService,
        },
        {
          provide: CloudSessionService,
          useFactory: mockCloudSessionService,
        },
        {
          provide: ServerService,
          useFactory: mockServerService,
        },
        {
          provide: CloudCapiKeyAnalytics,
          useFactory: mockCloudCapiKeyAnalytics,
        },
      ],
    }).compile();

    service = await module.get(CloudCapiKeyService);
    repository = await module.get(CloudCapiKeyRepository);
    cloudUserApiService = await module.get(CloudUserApiService);
    cloudSessionService = await module.get(CloudSessionService);
    serverService = await module.get(ServerService);

    when(mockedAxios.post)
      .calledWith(
        '/accounts/cloud-api/cloudApiKeys',
        expect.anything(),
        expect.anything(),
      )
      .mockResolvedValue({
        status: 200,
        data: { cloudApiKey: mockCloudApiCapiKey },
      });
    when(mockedAxios.post)
      .calledWith(
        '/accounts/cloud-api/cloudApiAccessKey',
        expect.anything(),
        expect.anything(),
      )
      .mockResolvedValue({
        status: 200,
        data: { cloudApiAccessKey: mockCloudApiCapiAccessKey },
      });
  });

  describe('generateName', () => {
    it('successfully generate capi key name', async () => {
      expect(
        await service['generateName'](mockSessionMetadata, mockCloudCapiKey),
      ).toEqual(mockCloudCapiKey.name);
      expect(serverService.getInfo).toHaveBeenCalledWith(mockSessionMetadata);
    });
    it('successfully generate capi key name when no createdAt field', async () => {
      expect(
        await service['generateName'](mockSessionMetadata, {
          ...mockCloudCapiKey,
          createdAt: undefined,
        }),
      ).toEqual(`RedisInsight-${mockServer.id.slice(0, 13)}-undefined`);
      expect(serverService.getInfo).toHaveBeenCalledWith(mockSessionMetadata);
    });
    it('successfully generate capi key name when no capi key was provided', async () => {
      expect(await service['generateName'](mockSessionMetadata, null)).toEqual(
        `RedisInsight-${mockServer.id.slice(0, 13)}-undefined`,
      );
      expect(serverService.getInfo).toHaveBeenCalledWith(mockSessionMetadata);
    });
  });

  describe('ensureCapiKeys', () => {
    it('Should return exist capi key', async () => {
      expect(
        await service['ensureCapiKeys'](mockSessionMetadata, mockUtm),
      ).toEqual(mockCloudUser.capiKey);
      expect(mockedAxios.post).toHaveBeenCalledTimes(0);
    });
    it('Should generate new capi key', async () => {
      repository.getByUserAccount.mockResolvedValueOnce(null);

      expect(
        await service['ensureCapiKeys'](mockSessionMetadata, mockUtm),
      ).toEqual(mockCloudUser.capiKey);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        1,
        '/accounts/cloud-api/cloudApiKeys',
        expect.anything(),
        expect.anything(),
      );
    });
    it('Should generate new capi key but enable CAPI before', async () => {
      repository.getByUserAccount.mockResolvedValueOnce(null);
      cloudUserApiService.getCloudUser.mockResolvedValueOnce({
        ...mockCloudUser,
        capiKey: undefined,
        accounts: [
          {
            ...mockCloudUser.accounts[0],
            capiKey: undefined,
          },
        ],
      });

      expect(
        await service['ensureCapiKeys'](mockSessionMetadata, mockUtm),
      ).toEqual(mockCloudUser.capiKey);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        1,
        '/accounts/cloud-api/cloudApiAccessKey',
        expect.anything(),
        expect.anything(),
      );
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        2,
        '/accounts/cloud-api/cloudApiKeys',
        expect.anything(),
        expect.anything(),
      );
    });
    it('Should throw CloudCapiKeyUnauthorizedException if capiKey is not valid', async () => {
      repository.getByUserAccount.mockResolvedValueOnce({
        ...mockCloudCapiKey,
        valid: false,
      });

      await expect(
        service['ensureCapiKeys'](mockSessionMetadata, mockUtm),
      ).rejects.toBeInstanceOf(CloudCapiKeyUnauthorizedException);
      expect(mockedAxios.post).toHaveBeenCalledTimes(0);
    });
    it('Should throw CloudApiBadRequestException', async () => {
      cloudUserApiService.getCloudUser.mockResolvedValue(null);
      CloudUserApiService.getCurrentAccount(null);
      await expect(
        service['ensureCapiKeys'](mockSessionMetadata, mockUtm),
      ).rejects.toThrowError(CloudApiBadRequestException);
    });
  });

  describe('getCapiCredentials', () => {
    it('Should generate new capi key', async () => {
      expect(await service.getCapiCredentials(mockSessionMetadata)).toEqual(
        mockCloudCapiKey,
      );
      expect(repository.update).toHaveBeenCalledWith(mockCloudCapiKey.id, {
        lastUsed: expect.any(Date),
      });
    });
  });

  describe('get', () => {
    it('Should get capi key', async () => {
      expect(await service.get(mockCloudCapiKey.id)).toEqual(mockCloudCapiKey);
    });
    it('Should throw CloudCapiKeyNotFoundException when there is no capi key', async () => {
      repository.get.mockReturnValueOnce(null);

      await expect(service.get(mockCloudCapiKey.id)).rejects.toBeInstanceOf(
        CloudCapiKeyNotFoundException,
      );
    });
    it('Should wrap an error in case of any', async () => {
      repository.get.mockRejectedValueOnce(new Error());

      await expect(service.get(mockCloudCapiKey.id)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('getByUserAccount', () => {
    it('Should get capi key', async () => {
      expect(
        await service.getByUserAccount(
          mockSessionMetadata,
          mockCloudUser.id,
          mockCloudUser.currentAccountId,
        ),
      ).toEqual(mockCloudCapiKey);
    });
    it('Should throw CloudCapiKeyNotFoundException when there is no capi key', async () => {
      repository.getByUserAccount.mockReturnValueOnce(null);

      await expect(
        service.getByUserAccount(
          mockSessionMetadata,
          mockCloudUser.id,
          mockCloudUser.currentAccountId,
        ),
      ).rejects.toBeInstanceOf(CloudCapiKeyNotFoundException);
    });
  });

  describe('list', () => {
    it('Should get list of capi keys', async () => {
      expect(await service.list(mockSessionMetadata)).toEqual([
        mockCloudCapiKey,
      ]);
    });
    it('Should wrap an error in case of any', async () => {
      repository.list.mockRejectedValueOnce(new Error());

      await expect(service.list(mockSessionMetadata)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('delete', () => {
    it('Should delete capi key', async () => {
      expect(
        await service.delete(mockSessionMetadata, mockCloudCapiKey.id),
      ).toEqual(undefined);
    });
    it('Should wrap an error in case of any', async () => {
      repository.delete.mockRejectedValueOnce(new Error());

      await expect(
        service.delete(mockSessionMetadata, mockCloudCapiKey.id),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('deleteAll', () => {
    it('Should delete all capi keys', async () => {
      expect(await service.deleteAll(mockSessionMetadata)).toEqual(undefined);
    });
    it('Should wrap an error in case of any', async () => {
      repository.deleteAll.mockRejectedValueOnce(new Error());

      await expect(
        service.deleteAll(mockSessionMetadata),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('handleCapiKeyUnauthorizedError', () => {
    it('should show BadRequestException error', async () => {
      const mockError = new BadRequestException('error');
      expect(
        await service.handleCapiKeyUnauthorizedError(
          mockError,
          mockSessionMetadata,
        ),
      ).toEqual(new BadRequestException('error'));
    });
    it('should throw CloudCapiKeyUnauthorizedException error and mark as invalid', async () => {
      cloudSessionService.getSession.mockResolvedValueOnce({
        ...mockCloudSession,
        user: { capiKey: mockCloudCapiKey },
      });
      const mockError = new CloudCapiUnauthorizedException();

      expect(
        await service.handleCapiKeyUnauthorizedError(
          mockError,
          mockSessionMetadata,
        ),
      ).toEqual(
        new CloudCapiKeyUnauthorizedException(undefined, {
          resourceId: mockCloudCapiKey.id,
        }),
      );
    });
    it('should throw CloudCapiUnauthorizedException if no key', async () => {
      cloudSessionService.getSession.mockResolvedValueOnce({
        ...mockCloudSession,
        user: { capiKey: null },
      });
      const mockError = new CloudCapiUnauthorizedException();

      expect(
        await service.handleCapiKeyUnauthorizedError(
          mockError,
          mockSessionMetadata,
        ),
      ).toEqual(mockError);
    });
    it('should throw CloudCapiUnauthorizedException if no user', async () => {
      cloudSessionService.getSession.mockResolvedValueOnce({
        ...mockCloudSession,
        user: null,
      });
      const mockError = new CloudCapiUnauthorizedException();

      expect(
        await service.handleCapiKeyUnauthorizedError(
          mockError,
          mockSessionMetadata,
        ),
      ).toEqual(mockError);
    });
  });
});
