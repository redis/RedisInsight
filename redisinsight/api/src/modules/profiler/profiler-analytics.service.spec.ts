import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  mockDatabase,
  mockDatabaseRepository,
  MockType,
  mockSessionMetadata,
} from 'src/__mocks__';
import { TelemetryEvents } from 'src/constants';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { Environment } from 'src/modules/database/entities/database.entity';
import { ProfilerAnalyticsService } from './profiler-analytics.service';

const databaseId = mockDatabase.id;

describe('ProfilerAnalyticsService', () => {
  let service: ProfilerAnalyticsService;
  let sendEventSpy: jest.SpyInstance;
  let databaseRepository: MockType<DatabaseRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilerAnalyticsService,
        EventEmitter2,
        {
          provide: DatabaseRepository,
          useFactory: mockDatabaseRepository,
        },
      ],
    }).compile();

    service = module.get<ProfilerAnalyticsService>(ProfilerAnalyticsService);
    databaseRepository = module.get(DatabaseRepository);
    sendEventSpy = jest.spyOn(service as any, 'sendEvent');
  });

  describe('sendProfilerStartedEvent', () => {
    it('should emit ProfilerStarted event with databaseId and environment=unspecified', async () => {
      await service.sendProfilerStartedEvent(mockSessionMetadata, databaseId);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.ProfilerStarted,
        { databaseId, environment: Environment.Unspecified },
      );
    });

    it('should emit environment=production when database is production', async () => {
      databaseRepository.get.mockResolvedValueOnce({
        ...mockDatabase,
        environment: Environment.Production,
      });

      await service.sendProfilerStartedEvent(mockSessionMetadata, databaseId);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.ProfilerStarted,
        expect.objectContaining({ environment: Environment.Production }),
      );
    });

    it('should default environment to unspecified when lookup throws', async () => {
      databaseRepository.get.mockRejectedValueOnce(new Error('boom'));

      await service.sendProfilerStartedEvent(mockSessionMetadata, databaseId);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.ProfilerStarted,
        { databaseId, environment: Environment.Unspecified },
      );
    });
  });

  describe('sendLogDownloaded', () => {
    it('should emit ProfilerLogDownloaded with environment', async () => {
      await service.sendLogDownloaded(mockSessionMetadata, databaseId, 4242);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.ProfilerLogDownloaded,
        {
          databaseId,
          fileSizeBytes: 4242,
          environment: Environment.Unspecified,
        },
      );
    });
  });

  describe('sendLogDeleted', () => {
    it('should emit ProfilerLogDeleted with environment', async () => {
      await service.sendLogDeleted(mockSessionMetadata, databaseId, 100);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.ProfilerLogDeleted,
        {
          databaseId,
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
