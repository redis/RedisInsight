import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCloudCapiAuthDto,
  mockCloudSubscription,
  mockCloudSubscriptionCapiProvider,
  mockCloudTaskInit,
  mockCreateFreeCloudSubscriptionDto,
  mockFreeCloudSubscriptionPlan1,
  MockType,
} from 'src/__mocks__';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';
import { CloudSubscriptionCapiProvider } from 'src/modules/cloud/subscription/providers/cloud-subscription.capi.provider';
import { CloudSubscriptionCapiService } from './cloud-subscription.capi.service';

describe('CloudSubscriptionCapiService', () => {
  let service: CloudSubscriptionCapiService;
  let capi: MockType<CloudSubscriptionCapiProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudSubscriptionCapiService,
        {
          provide: CloudSubscriptionCapiProvider,
          useFactory: mockCloudSubscriptionCapiProvider,
        },
      ],
    }).compile();

    service = module.get(CloudSubscriptionCapiService);
    capi = module.get(CloudSubscriptionCapiProvider);
  });

  describe('getSubscriptions', () => {
    it('successfully get cloud subscriptions', async () => {
      expect(
        await service.getSubscriptions(
          mockCloudCapiAuthDto,
          CloudSubscriptionType.Flexible,
        ),
      ).toEqual([mockCloudSubscription]);
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      capi.getSubscriptionsByType.mockRejectedValueOnce(
        new CloudApiUnauthorizedException(),
      );
      await expect(
        service.getSubscriptions(
          mockCloudCapiAuthDto,
          CloudSubscriptionType.Fixed,
        ),
      ).rejects.toThrow(CloudApiUnauthorizedException);
    });
  });
  describe('getSubscription', () => {
    it('successfully get cloud subscription', async () => {
      expect(
        await service.getSubscription(
          mockCloudCapiAuthDto,
          mockCloudSubscription.id,
          CloudSubscriptionType.Flexible,
        ),
      ).toEqual(mockCloudSubscription);
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      capi.getSubscriptionByType.mockRejectedValueOnce(
        new CloudApiUnauthorizedException(),
      );
      await expect(
        service.getSubscription(
          mockCloudCapiAuthDto,
          mockCloudSubscription.id,
          CloudSubscriptionType.Fixed,
        ),
      ).rejects.toThrow(CloudApiUnauthorizedException);
    });
  });
  describe('getSubscriptionsPlans', () => {
    it('successfully get cloud subscriptions plans', async () => {
      expect(
        await service.getSubscriptionsPlans(
          mockCloudCapiAuthDto,
          CloudSubscriptionType.Fixed,
        ),
      ).toEqual([mockFreeCloudSubscriptionPlan1]);
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      capi.getSubscriptionsPlansByType.mockRejectedValueOnce(
        new CloudApiUnauthorizedException(),
      );
      await expect(
        service.getSubscriptionsPlans(
          mockCloudCapiAuthDto,
          CloudSubscriptionType.Fixed,
        ),
      ).rejects.toThrow(CloudApiUnauthorizedException);
    });
  });
  describe('createFreeSubscription', () => {
    it('successfully initialize cloud subscription creation', async () => {
      expect(
        await service.createFreeSubscription(
          mockCloudCapiAuthDto,
          mockCreateFreeCloudSubscriptionDto.planId,
        ),
      ).toEqual(mockCloudTaskInit);
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      capi.createFreeSubscription.mockRejectedValueOnce(
        new CloudApiUnauthorizedException(),
      );
      await expect(
        service.createFreeSubscription(
          mockCloudCapiAuthDto,
          mockCreateFreeCloudSubscriptionDto.planId,
        ),
      ).rejects.toThrow(CloudApiUnauthorizedException);
    });
  });
});
