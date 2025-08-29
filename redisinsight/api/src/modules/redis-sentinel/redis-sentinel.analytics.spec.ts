import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { mockSentinelMasterDto, mockSessionMetadata } from 'src/__mocks__';
import { InternalServerErrorException } from '@nestjs/common';
import { RedisSentinelAnalytics } from 'src/modules/redis-sentinel/redis-sentinel.analytics';
import { SentinelMasterStatus } from 'src/modules/redis-sentinel/models/sentinel-master';

describe('RedisSentinelAnalytics', () => {
  let service: RedisSentinelAnalytics;
  let sendEventMethod;
  let sendFailedEventMethod;
  const httpException = new InternalServerErrorException();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventEmitter2, RedisSentinelAnalytics],
    }).compile();

    service = await module.get<RedisSentinelAnalytics>(RedisSentinelAnalytics);
    sendEventMethod = jest.spyOn<RedisSentinelAnalytics, any>(
      service,
      'sendEvent',
    );
    sendFailedEventMethod = jest.spyOn<RedisSentinelAnalytics, any>(
      service,
      'sendFailedEvent',
    );
  });

  describe('sendGetSentinelMastersSucceedEvent', () => {
    it('should emit event with active master groups', () => {
      service.sendGetSentinelMastersSucceedEvent(mockSessionMetadata, [
        mockSentinelMasterDto,
        mockSentinelMasterDto,
      ]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.SentinelMasterGroupsDiscoverySucceed,
        {
          numberOfAvailablePrimaryGroups: 2,
          totalNumberOfPrimaryGroups: 2,
          totalNumberOfReplicas: 2,
        },
      );
    });
    it('should emit event with active and not active master groups', () => {
      service.sendGetSentinelMastersSucceedEvent(mockSessionMetadata, [
        mockSentinelMasterDto,
        {
          ...mockSentinelMasterDto,
          status: SentinelMasterStatus.Down,
          numberOfSlaves: 0,
        },
      ]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.SentinelMasterGroupsDiscoverySucceed,
        {
          numberOfAvailablePrimaryGroups: 1,
          totalNumberOfPrimaryGroups: 2,
          totalNumberOfReplicas: 1,
        },
      );
    });
    it('should emit event without active groups', () => {
      service.sendGetSentinelMastersSucceedEvent(mockSessionMetadata, [
        {
          ...mockSentinelMasterDto,
          status: SentinelMasterStatus.Down,
          numberOfSlaves: 0,
        },
        {
          ...mockSentinelMasterDto,
          numberOfSlaves: 0,
          status: SentinelMasterStatus.Down,
        },
      ]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.SentinelMasterGroupsDiscoverySucceed,
        {
          numberOfAvailablePrimaryGroups: 0,
          totalNumberOfPrimaryGroups: 2,
          totalNumberOfReplicas: 0,
        },
      );
    });
    it('should emit event for empty list', () => {
      service.sendGetSentinelMastersSucceedEvent(mockSessionMetadata, []);

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.SentinelMasterGroupsDiscoverySucceed,
        {
          numberOfAvailablePrimaryGroups: 0,
          totalNumberOfPrimaryGroups: 0,
          totalNumberOfReplicas: 0,
        },
      );
    });
    it('should emit event for undefined input value', () => {
      service.sendGetSentinelMastersSucceedEvent(
        mockSessionMetadata,
        undefined,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.SentinelMasterGroupsDiscoverySucceed,
        {
          numberOfAvailablePrimaryGroups: 0,
          totalNumberOfPrimaryGroups: 0,
          totalNumberOfReplicas: 0,
        },
      );
    });
    it('should not throw on error', () => {
      const input: any = {};

      expect(() =>
        service.sendGetSentinelMastersSucceedEvent(mockSessionMetadata, input),
      ).not.toThrow();
      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });

  describe('sendGetRedisCloudSubsFailedEvent', () => {
    it('should emit event', () => {
      service.sendGetSentinelMastersFailedEvent(
        mockSessionMetadata,
        httpException,
      );

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.SentinelMasterGroupsDiscoveryFailed,
        httpException,
      );
    });
  });
});
