import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { InternalServerErrorException } from '@nestjs/common';
import { CloudAutodiscoveryAnalytics } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.analytics';
import {
  mockCloudDatabase,
  mockCloudDatabaseFixed,
  mockCloudSubscription,
  mockSessionMetadata,
} from 'src/__mocks__';
import { CloudAutodiscoveryAuthType } from 'src/modules/cloud/autodiscovery/models';
import {
  CloudSubscriptionStatus,
  CloudSubscriptionType,
} from 'src/modules/cloud/subscription/models';
import { CloudDatabaseStatus } from 'src/modules/cloud/database/models';

describe('CloudAutodiscoveryAnalytics', () => {
  let service: CloudAutodiscoveryAnalytics;
  let sendEventMethod;
  let sendFailedEventMethod;
  const httpException = new InternalServerErrorException();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventEmitter2, CloudAutodiscoveryAnalytics],
    }).compile();

    service = await module.get(CloudAutodiscoveryAnalytics);
    sendEventMethod = jest.spyOn<CloudAutodiscoveryAnalytics, any>(
      service,
      'sendEvent',
    );
    sendFailedEventMethod = jest.spyOn<CloudAutodiscoveryAnalytics, any>(
      service,
      'sendFailedEvent',
    );
  });

  describe('sendGetRedisCloudSubsSucceedEvent', () => {
    it('should emit event with active subscriptions', () => {
      service.sendGetRedisCloudSubsSucceedEvent(
        mockSessionMetadata,
        [mockCloudSubscription, mockCloudSubscription],
        CloudSubscriptionType.Flexible,
        CloudAutodiscoveryAuthType.Credentials,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisCloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: 2,
          totalNumberOfSubscriptions: 2,
          type: CloudSubscriptionType.Flexible,
          authType: CloudAutodiscoveryAuthType.Credentials,
        },
      );
    });
    it('should emit event with active and not active subscription', () => {
      service.sendGetRedisCloudSubsSucceedEvent(
        mockSessionMetadata,
        [
          {
            ...mockCloudSubscription,
            status: CloudSubscriptionStatus.Error,
          },
          mockCloudSubscription,
        ],
        CloudSubscriptionType.Flexible,
        CloudAutodiscoveryAuthType.Sso,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisCloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: 1,
          totalNumberOfSubscriptions: 2,
          type: CloudSubscriptionType.Flexible,
          authType: CloudAutodiscoveryAuthType.Sso,
        },
      );
    });
    it('should emit event without active subscriptions', () => {
      service.sendGetRedisCloudSubsSucceedEvent(
        mockSessionMetadata,
        [
          {
            ...mockCloudSubscription,
            status: CloudSubscriptionStatus.Error,
          },
          {
            ...mockCloudSubscription,
            status: CloudSubscriptionStatus.Error,
          },
        ],
        CloudSubscriptionType.Flexible,
        CloudAutodiscoveryAuthType.Credentials,
      );
      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisCloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: 0,
          totalNumberOfSubscriptions: 2,
          type: CloudSubscriptionType.Flexible,
          authType: CloudAutodiscoveryAuthType.Credentials,
        },
      );
    });
    it('should emit GetRedisCloudSubsSucceedEvent event for empty list', () => {
      service.sendGetRedisCloudSubsSucceedEvent(
        mockSessionMetadata,
        [],
        CloudSubscriptionType.Flexible,
        CloudAutodiscoveryAuthType.Sso,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisCloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: 0,
          totalNumberOfSubscriptions: 0,
          type: CloudSubscriptionType.Flexible,
          authType: CloudAutodiscoveryAuthType.Sso,
        },
      );
    });
    it('should emit GetRedisCloudSubsSucceedEvent event for undefined input value', () => {
      service.sendGetRedisCloudSubsSucceedEvent(
        mockSessionMetadata,
        undefined,
        CloudSubscriptionType.Fixed,
        CloudAutodiscoveryAuthType.Credentials,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisCloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: 0,
          totalNumberOfSubscriptions: 0,
          type: CloudSubscriptionType.Fixed,
          authType: CloudAutodiscoveryAuthType.Credentials,
        },
      );
    });
    it('should not throw on error when sending GetRedisCloudSubsSucceedEvent event', () => {
      const input: any = {};

      expect(() =>
        service.sendGetRedisCloudSubsSucceedEvent(
          mockSessionMetadata,
          input,
          CloudSubscriptionType.Flexible,
          CloudAutodiscoveryAuthType.Credentials,
        ),
      ).not.toThrow();
      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });

  describe('sendGetRedisCloudSubsFailedEvent', () => {
    it('should emit GetRedisCloudSubsFailedEvent event', () => {
      service.sendGetRedisCloudSubsFailedEvent(
        mockSessionMetadata,
        httpException,
        CloudSubscriptionType.Fixed,
        CloudAutodiscoveryAuthType.Credentials,
      );

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisCloudSubscriptionsDiscoveryFailed,
        httpException,
        {
          type: CloudSubscriptionType.Fixed,
          authType: CloudAutodiscoveryAuthType.Credentials,
        },
      );
    });
  });

  describe('sendGetRedisCloudDbsSucceedEvent', () => {
    it('should emit event with active databases', () => {
      service.sendGetRedisCloudDbsSucceedEvent(
        mockSessionMetadata,
        [mockCloudDatabase, mockCloudDatabaseFixed],
        CloudAutodiscoveryAuthType.Credentials,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisCloudDatabasesDiscoverySucceed,
        {
          numberOfActiveDatabases: 2,
          numberOfFreeDatabases: 1,
          totalNumberOfDatabases: 2,
          fixed: 1,
          flexible: 1,
          authType: CloudAutodiscoveryAuthType.Credentials,
        },
      );
    });
    it('should emit event with active and not active database', () => {
      service.sendGetRedisCloudDbsSucceedEvent(
        mockSessionMetadata,
        [
          {
            ...mockCloudDatabase,
            status: CloudDatabaseStatus.Pending,
          },
          mockCloudDatabase,
        ],
        CloudAutodiscoveryAuthType.Sso,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisCloudDatabasesDiscoverySucceed,
        {
          numberOfActiveDatabases: 1,
          numberOfFreeDatabases: 0,
          totalNumberOfDatabases: 2,
          fixed: 0,
          flexible: 2,
          authType: CloudAutodiscoveryAuthType.Sso,
        },
      );
    });
    it('should emit event without active databases', () => {
      service.sendGetRedisCloudDbsSucceedEvent(
        mockSessionMetadata,
        [
          {
            ...mockCloudDatabase,
            status: CloudDatabaseStatus.Pending,
          },
        ],
        CloudAutodiscoveryAuthType.Credentials,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisCloudDatabasesDiscoverySucceed,
        {
          numberOfActiveDatabases: 0,
          numberOfFreeDatabases: 0,
          totalNumberOfDatabases: 1,
          fixed: 0,
          flexible: 1,
          authType: CloudAutodiscoveryAuthType.Credentials,
        },
      );
    });
    it('should emit event for empty list', () => {
      service.sendGetRedisCloudDbsSucceedEvent(
        mockSessionMetadata,
        [],
        CloudAutodiscoveryAuthType.Credentials,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisCloudDatabasesDiscoverySucceed,
        {
          numberOfActiveDatabases: 0,
          numberOfFreeDatabases: 0,
          totalNumberOfDatabases: 0,
          fixed: 0,
          flexible: 0,
          authType: CloudAutodiscoveryAuthType.Credentials,
        },
      );
    });
    it('should emit event for undefined input value', () => {
      service.sendGetRedisCloudDbsSucceedEvent(
        mockSessionMetadata,
        undefined,
        CloudAutodiscoveryAuthType.Credentials,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisCloudDatabasesDiscoverySucceed,
        {
          numberOfActiveDatabases: 0,
          numberOfFreeDatabases: 0,
          totalNumberOfDatabases: 0,
          fixed: 0,
          flexible: 0,
          authType: CloudAutodiscoveryAuthType.Credentials,
        },
      );
    });
    it('should not throw on error', () => {
      const input: any = {};

      expect(() =>
        service.sendGetRedisCloudDbsSucceedEvent(
          mockSessionMetadata,
          input,
          CloudAutodiscoveryAuthType.Credentials,
        ),
      ).not.toThrow();
      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });

  describe('sendGetRedisCloudDbsFailedEvent', () => {
    it('should emit event', () => {
      service.sendGetRedisCloudDbsFailedEvent(
        mockSessionMetadata,
        httpException,
        CloudAutodiscoveryAuthType.Credentials,
      );

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisCloudDatabasesDiscoveryFailed,
        httpException,
        {
          authType: CloudAutodiscoveryAuthType.Credentials,
        },
      );
    });
  });
});
