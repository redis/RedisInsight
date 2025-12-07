import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import {
  mockCapiUnauthorizedError,
  mockCloudApiCapiAccessKey,
  mockCloudApiCapiKey,
  mockCloudApiHeaders,
  mockCloudSession,
  mockCloudSessionService,
  mockCloudUser,
} from 'src/__mocks__';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudCapiKeyApiProvider } from 'src/modules/cloud/capi-key/cloud-capi-key.api.provider';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);

describe('CloudCapiKeyApiProvider', () => {
  let service: CloudCapiKeyApiProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudCapiKeyApiProvider,
        {
          provide: CloudSessionService,
          useFactory: mockCloudSessionService,
        },
      ],
    }).compile();

    service = module.get(CloudCapiKeyApiProvider);
  });

  describe('enableCapi', () => {
    it('successfully get capi access key', async () => {
      const response = {
        status: 200,
        data: { cloudApiAccessKey: mockCloudApiCapiAccessKey },
      };
      mockedAxios.post.mockResolvedValue(response);

      expect(await service.enableCapi(mockCloudSession)).toEqual(
        mockCloudApiCapiAccessKey.accessKey,
      );
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/accounts/cloud-api/cloudApiAccessKey',
        {},
        mockCloudApiHeaders,
      );
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      mockedAxios.post.mockRejectedValue(mockCapiUnauthorizedError);

      await expect(service.enableCapi(mockCloudSession)).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });

  describe('createCapiKey', () => {
    it('successfully create cpi key (secret)', async () => {
      const response = {
        status: 200,
        data: { cloudApiKey: mockCloudApiCapiKey },
      };
      mockedAxios.post.mockResolvedValue(response);

      expect(
        await service.createCapiKey(
          mockCloudSession,
          mockCloudUser.id,
          mockCloudApiCapiKey.name,
        ),
      ).toEqual(mockCloudApiCapiKey);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/accounts/cloud-api/cloudApiKeys',
        {
          cloudApiKey: {
            name: mockCloudApiCapiKey.name,
            user_account: mockCloudUser.id,
            ip_whitelist: [],
          },
        },
        mockCloudApiHeaders,
      );
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      mockedAxios.post.mockRejectedValue(mockCapiUnauthorizedError);

      await expect(
        service.createCapiKey(
          mockCloudSession,
          mockCloudUser.id,
          mockCloudApiCapiKey.name,
        ),
      ).rejects.toThrow(CloudApiUnauthorizedException);
    });
  });
});
