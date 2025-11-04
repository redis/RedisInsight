import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import {
  mockCreateFreeCloudSubscriptionDto,
  mockCapiUnauthorizedError,
  mockCloudCapiAuthDto,
  mockCloudCapiHeaders,
  mockCloudSubscription,
  mockCloudSubscriptionFixed,
  mockCloudTaskInit,
  mockFreeCloudSubscriptionPlan1,
} from 'src/__mocks__';
import { CloudSubscriptionCapiProvider } from 'src/modules/cloud/subscription/providers/cloud-subscription.capi.provider';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';
import { CloudCapiUnauthorizedException } from 'src/modules/cloud/common/exceptions';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);

describe('CloudSubscriptionApiProvider', () => {
  let service: CloudSubscriptionCapiProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudSubscriptionCapiProvider],
    }).compile();

    service = module.get(CloudSubscriptionCapiProvider);
  });

  describe('getSubscriptionsByType', () => {
    it('successfully get fixed cloud subscriptions', async () => {
      const response = {
        status: 200,
        data: { subscriptions: [mockCloudSubscriptionFixed] },
      };
      mockedAxios.get.mockResolvedValue(response);

      expect(
        await service.getSubscriptionsByType(
          mockCloudCapiAuthDto,
          CloudSubscriptionType.Fixed,
        ),
      ).toEqual([mockCloudSubscriptionFixed]);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/fixed/subscriptions',
        mockCloudCapiHeaders,
      );
    });
    it('successfully get flexible cloud subscriptions', async () => {
      const response = {
        status: 200,
        data: { subscriptions: [mockCloudSubscription] },
      };
      mockedAxios.get.mockResolvedValue(response);

      expect(
        await service.getSubscriptionsByType(
          mockCloudCapiAuthDto,
          CloudSubscriptionType.Flexible,
        ),
      ).toEqual([mockCloudSubscription]);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/fixed/subscriptions',
        mockCloudCapiHeaders,
      );
    });
    it('throw CloudCapiUnauthorizedException exception', async () => {
      mockedAxios.get.mockRejectedValue(mockCapiUnauthorizedError);

      await expect(
        service.getSubscriptionsByType(
          mockCloudCapiAuthDto,
          CloudSubscriptionType.Fixed,
        ),
      ).rejects.toThrow(CloudCapiUnauthorizedException);
    });
  });
  describe('getSubscriptionByType', () => {
    it('successfully get fixed cloud subscription', async () => {
      const response = {
        status: 200,
        data: mockCloudSubscriptionFixed,
      };
      mockedAxios.get.mockResolvedValue(response);

      expect(
        await service.getSubscriptionByType(
          mockCloudCapiAuthDto,
          mockCloudSubscriptionFixed.id,
          CloudSubscriptionType.Fixed,
        ),
      ).toEqual(mockCloudSubscriptionFixed);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `/fixed/subscriptions/${mockCloudSubscriptionFixed.id}`,
        mockCloudCapiHeaders,
      );
    });
    it('successfully get flexible cloud subscription', async () => {
      const response = {
        status: 200,
        data: mockCloudSubscription,
      };
      mockedAxios.get.mockResolvedValue(response);

      expect(
        await service.getSubscriptionByType(
          mockCloudCapiAuthDto,
          mockCloudSubscription.id,
          CloudSubscriptionType.Flexible,
        ),
      ).toEqual(mockCloudSubscription);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `/subscriptions/${mockCloudSubscription.id}`,
        mockCloudCapiHeaders,
      );
    });

    it('throw CloudCapiUnauthorizedException exception', async () => {
      mockedAxios.get.mockRejectedValue(mockCapiUnauthorizedError);

      await expect(
        service.getSubscriptionByType(
          mockCloudCapiAuthDto,
          mockCloudSubscription.id,
          CloudSubscriptionType.Fixed,
        ),
      ).rejects.toThrow(CloudCapiUnauthorizedException);
    });
  });
  describe('getSubscriptionsPlansByType', () => {
    it('successfully get fixed plans', async () => {
      const response = {
        status: 200,
        data: { plans: [mockFreeCloudSubscriptionPlan1] },
      };
      mockedAxios.get.mockResolvedValue(response);

      expect(
        await service.getSubscriptionsPlansByType(
          mockCloudCapiAuthDto,
          CloudSubscriptionType.Fixed,
        ),
      ).toEqual([mockFreeCloudSubscriptionPlan1]);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/fixed/plans',
        mockCloudCapiHeaders,
      );
    });
    it('throw CloudCapiUnauthorizedException exception', async () => {
      mockedAxios.get.mockRejectedValue(mockCapiUnauthorizedError);

      await expect(
        service.getSubscriptionsPlansByType(
          mockCloudCapiAuthDto,
          CloudSubscriptionType.Fixed,
        ),
      ).rejects.toThrow(CloudCapiUnauthorizedException);
    });
  });
  describe('createFreeSubscription', () => {
    it('successfully create task for free subscription creation', async () => {
      const response = {
        status: 200,
        data: mockCloudTaskInit,
      };
      mockedAxios.post.mockResolvedValue(response);

      expect(
        await service.createFreeSubscription(
          mockCloudCapiAuthDto,
          mockCreateFreeCloudSubscriptionDto,
        ),
      ).toEqual(mockCloudTaskInit);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/fixed/subscriptions',
        {
          name: mockCreateFreeCloudSubscriptionDto.name,
          paymentMethodId: null,
          planId: mockCreateFreeCloudSubscriptionDto.planId,
        },
        mockCloudCapiHeaders,
      );
    });
    it('throw CloudCapiUnauthorizedException exception', async () => {
      mockedAxios.post.mockRejectedValue(mockCapiUnauthorizedError);

      await expect(
        service.createFreeSubscription(
          mockCloudCapiAuthDto,
          mockCreateFreeCloudSubscriptionDto,
        ),
      ).rejects.toThrow(CloudCapiUnauthorizedException);
    });
  });
});
