import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { mockDatabase, mockSessionMetadata } from 'src/__mocks__';
import { TelemetryEvents } from 'src/constants';
import { Environment } from 'src/modules/database/entities/database.entity';
import { ProfilerAnalyticsService } from './profiler-analytics.service';

const productionDatabase = {
  ...mockDatabase,
  environment: Environment.Production,
};

describe('ProfilerAnalyticsService', () => {
  let service: ProfilerAnalyticsService;
  let sendEventSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfilerAnalyticsService, EventEmitter2],
    }).compile();

    service = module.get<ProfilerAnalyticsService>(ProfilerAnalyticsService);
    sendEventSpy = jest.spyOn(service as any, 'sendEvent');
  });

  describe('sendProfilerStartedEvent', () => {
    it('should emit ProfilerStarted event with databaseId and environment=unspecified', () => {
      service.sendProfilerStartedEvent(mockSessionMetadata, mockDatabase);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.ProfilerStarted,
        { databaseId: mockDatabase.id, environment: Environment.Unspecified },
      );
    });

    it('should emit environment=production when database is production', () => {
      service.sendProfilerStartedEvent(mockSessionMetadata, productionDatabase);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.ProfilerStarted,
        expect.objectContaining({ environment: Environment.Production }),
      );
    });
  });

  describe('sendLogDownloaded', () => {
    it('should emit ProfilerLogDownloaded with environment', () => {
      service.sendLogDownloaded(mockSessionMetadata, mockDatabase, 4242);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.ProfilerLogDownloaded,
        {
          databaseId: mockDatabase.id,
          fileSizeBytes: 4242,
          environment: Environment.Unspecified,
        },
      );
    });
  });

  describe('sendLogDeleted', () => {
    it('should emit ProfilerLogDeleted with environment', () => {
      service.sendLogDeleted(mockSessionMetadata, mockDatabase, 100);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.ProfilerLogDeleted,
        {
          databaseId: mockDatabase.id,
          fileSizeBytes: 100,
          environment: Environment.Unspecified,
        },
      );
    });
  });

  describe('getEventsEmitters', () => {
    it('should expose download and delete events on the map', () => {
      const map = service.getEventsEmitters();
      expect(map.has(TelemetryEvents.ProfilerLogDownloaded)).toBe(true);
      expect(map.has(TelemetryEvents.ProfilerLogDeleted)).toBe(true);
    });
  });
});
