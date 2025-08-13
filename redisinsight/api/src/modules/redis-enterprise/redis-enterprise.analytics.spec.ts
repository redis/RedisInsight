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

  describe('sendGetREClusterDbsSucceedEvent', () => {
    it('should emit event with active databases', () => {
      service.sendGetREClusterDbsSucceedEvent(mockSessionMetadata, [
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
      service.sendGetREClusterDbsSucceedEvent(mockSessionMetadata, [
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
      service.sendGetREClusterDbsSucceedEvent(mockSessionMetadata, [
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
    it('should emit GetREClusterDbsSucceed event for empty list', () => {
      service.sendGetREClusterDbsSucceedEvent(mockSessionMetadata, []);

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisSoftwareDiscoverySucceed,
        {
          numberOfActiveDatabases: 0,
          totalNumberOfDatabases: 0,
        },
      );
    });
    it('should emit GetREClusterDbsSucceed event for undefined input value', () => {
      service.sendGetREClusterDbsSucceedEvent(mockSessionMetadata, undefined);

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisSoftwareDiscoverySucceed,
        {
          numberOfActiveDatabases: 0,
          totalNumberOfDatabases: 0,
        },
      );
    });
    it('should not throw on error when sending GetREClusterDbsSucceed event', () => {
      const input: any = {};

      expect(() =>
        service.sendGetREClusterDbsSucceedEvent(mockSessionMetadata, input),
      ).not.toThrow();
      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });

  describe('sendGetREClusterDbsFailedEvent', () => {
    it('should emit GetREClusterDbsFailed event', () => {
      service.sendGetREClusterDbsFailedEvent(
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
