import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import {
  mockRedisEnterpriseDatabaseDto,
  mockSessionMetadata,
} from 'src/__mocks__';
import { RedisEnterpriseDatabaseStatus } from 'src/modules/redis-enterprise/models/redis-enterprise-database';
import { InternalServerErrorException } from '@nestjs/common';
import { RedisEnterpriseAnalytics } from 'src/modules/redis-enterprise/redis-enterprise.analytics';

describe('RedisEnterpriseAnalytics', () => {
  let service: RedisEnterpriseAnalytics;
  let sendEventMethod;
  let sendFailedEventMethod;
  const httpException = new InternalServerErrorException();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventEmitter2, RedisEnterpriseAnalytics],
    }).compile();

    service = module.get<RedisEnterpriseAnalytics>(RedisEnterpriseAnalytics);
    sendEventMethod = jest.spyOn<RedisEnterpriseAnalytics, any>(
      service,
      'sendEvent',
    );
    sendFailedEventMethod = jest.spyOn<RedisEnterpriseAnalytics, any>(
      service,
      'sendFailedEvent',
    );
  });

  describe('sendGetRedisSoftwareDbsSucceedEvent', () => {
    it('should emit event with active databases', () => {
      service.sendGetRedisSoftwareDbsSucceedEvent(mockSessionMetadata, [
        mockRedisEnterpriseDatabaseDto,
        mockRedisEnterpriseDatabaseDto,
      ]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisSoftwareDiscoverySucceed,
        {
          numberOfActiveDatabases: 2,
          totalNumberOfDatabases: 2,
        },
      );
    });
    it('should emit event with active and not active database', () => {
      service.sendGetRedisSoftwareDbsSucceedEvent(mockSessionMetadata, [
        {
          ...mockRedisEnterpriseDatabaseDto,
          status: RedisEnterpriseDatabaseStatus.Pending,
        },
        mockRedisEnterpriseDatabaseDto,
      ]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisSoftwareDiscoverySucceed,
        {
          numberOfActiveDatabases: 1,
          totalNumberOfDatabases: 2,
        },
      );
    });
    it('should emit event without active databases', () => {
      service.sendGetRedisSoftwareDbsSucceedEvent(mockSessionMetadata, [
        {
          ...mockRedisEnterpriseDatabaseDto,
          status: RedisEnterpriseDatabaseStatus.Pending,
        },
        {
          ...mockRedisEnterpriseDatabaseDto,
          status: RedisEnterpriseDatabaseStatus.Pending,
        },
      ]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisSoftwareDiscoverySucceed,
        {
          numberOfActiveDatabases: 0,
          totalNumberOfDatabases: 2,
        },
      );
    });
    it('should emit GetRedisSoftwareDbsSucceed event for empty list', () => {
      service.sendGetRedisSoftwareDbsSucceedEvent(mockSessionMetadata, []);

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisSoftwareDiscoverySucceed,
        {
          numberOfActiveDatabases: 0,
          totalNumberOfDatabases: 0,
        },
      );
    });
    it('should emit GetRedisSoftwareDbsSucceed event for undefined input value', () => {
      service.sendGetRedisSoftwareDbsSucceedEvent(
        mockSessionMetadata,
        undefined,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisSoftwareDiscoverySucceed,
        {
          numberOfActiveDatabases: 0,
          totalNumberOfDatabases: 0,
        },
      );
    });
    it('should not throw on error when sending GetRedisSoftwareDbsSucceed event', () => {
      const input: any = {};

      expect(() =>
        service.sendGetRedisSoftwareDbsSucceedEvent(mockSessionMetadata, input),
      ).not.toThrow();
      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });

  describe('sendGetRedisSoftwareDbsFailedEvent', () => {
    it('should emit GetRedisSoftwareDbsFailed event', () => {
      service.sendGetRedisSoftwareDbsFailedEvent(
        mockSessionMetadata,
        httpException,
      );

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisSoftwareDiscoveryFailed,
        httpException,
      );
    });
  });
});
