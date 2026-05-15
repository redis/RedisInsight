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
    it('should emit ProfilerStarted event with databaseId and isProduction=false', async () => {
      await service.sendProfilerStartedEvent(mockSessionMetadata, databaseId);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.ProfilerStarted,
        { databaseId, isProduction: 'false' },
      );
    });

    it('should emit isProduction=true when database is production', async () => {
      databaseRepository.get.mockResolvedValueOnce({
        ...mockDatabase,
        isProduction: true,
      });

      await service.sendProfilerStartedEvent(mockSessionMetadata, databaseId);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.ProfilerStarted,
        expect.objectContaining({ isProduction: 'true' }),
      );
    });

    it('should default isProduction to false when lookup throws', async () => {
      databaseRepository.get.mockRejectedValueOnce(new Error('boom'));

      await service.sendProfilerStartedEvent(mockSessionMetadata, databaseId);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.ProfilerStarted,
        { databaseId, isProduction: 'false' },
      );
    });
  });

  describe('sendLogDownloaded', () => {
    it('should emit ProfilerLogDownloaded with isProduction', async () => {
      await service.sendLogDownloaded(mockSessionMetadata, databaseId, 4242);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.ProfilerLogDownloaded,
        { databaseId, fileSizeBytes: 4242, isProduction: 'false' },
      );
    });
  });

  describe('sendLogDeleted', () => {
    it('should emit ProfilerLogDeleted with isProduction', async () => {
      await service.sendLogDeleted(mockSessionMetadata, databaseId, 100);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.ProfilerLogDeleted,
        { databaseId, fileSizeBytes: 100, isProduction: 'false' },
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
