import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import {
  mockCapiUnauthorizedError,
  mockCloudApiHeaders,
  mockCloudApiCloudRegions,
  mockCloudSession,
  mockCloudSessionService,
} from 'src/__mocks__';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import { CloudSubscriptionApiProvider } from './cloud-subscription.api.provider';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);

describe('CloudSubscriptionApiProvider', () => {
  let service: CloudSubscriptionApiProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudSubscriptionApiProvider,
        {
          provide: CloudSessionService,
          useFactory: mockCloudSessionService,
        },
      ],
    }).compile();

    service = module.get(CloudSubscriptionApiProvider);
  });

  describe('getCloudRegions', () => {
    it('successfully get cloud regions', async () => {
      const response = {
        status: 200,
        data: mockCloudApiCloudRegions,
      };
      mockedAxios.get.mockResolvedValue(response);

      expect(await service.getCloudRegions(mockCloudSession)).toEqual(
        mockCloudApiCloudRegions,
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/plans/cloud_regions',
        mockCloudApiHeaders,
      );
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      mockedAxios.get.mockRejectedValue(mockCapiUnauthorizedError);

      await expect(service.getCloudRegions(mockCloudSession)).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });
});
