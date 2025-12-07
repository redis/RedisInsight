import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  mockDatabaseImportFailedAnalyticsPayload,
  mockDatabaseImportPartialAnalyticsPayload,
  mockDatabaseImportResponse,
  mockDatabaseImportSucceededAnalyticsPayload,
  mockSessionMetadata,
} from 'src/__mocks__';
import { TelemetryEvents } from 'src/constants';
import { DatabaseImportAnalytics } from 'src/modules/database-import/database-import.analytics';
import {
  NoDatabaseImportFileProvidedException,
  SizeLimitExceededDatabaseImportFileException,
  UnableToParseDatabaseImportFileException,
} from 'src/modules/database-import/exceptions';

describe('DatabaseImportAnalytics', () => {
  let service: DatabaseImportAnalytics;
  let sendEventSpy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [EventEmitter2, DatabaseImportAnalytics],
    }).compile();

    service = await module.get(DatabaseImportAnalytics);
    sendEventSpy = jest.spyOn(service as any, 'sendEvent');
  });

  describe('sendImportResults', () => {
    it('should emit 2 events with success and failed results', () => {
      service.sendImportResults(
        mockSessionMetadata,
        mockDatabaseImportResponse,
      );

      expect(sendEventSpy).toHaveBeenNthCalledWith(
        1,
        mockSessionMetadata,
        TelemetryEvents.DatabaseImportSucceeded,
        mockDatabaseImportSucceededAnalyticsPayload,
      );

      expect(sendEventSpy).toHaveBeenNthCalledWith(
        2,
        mockSessionMetadata,
        TelemetryEvents.DatabaseImportFailed,
        mockDatabaseImportFailedAnalyticsPayload,
      );

      expect(sendEventSpy).toHaveBeenNthCalledWith(
        3,
        mockSessionMetadata,
        TelemetryEvents.DatabaseImportPartiallySucceeded,
        mockDatabaseImportPartialAnalyticsPayload,
      );
    });
  });

  describe('sendImportFailed', () => {
    it('should emit 1 event with "Error" cause', () => {
      service.sendImportFailed(mockSessionMetadata, Error());

      expect(sendEventSpy).toHaveBeenNthCalledWith(
        1,
        mockSessionMetadata,
        TelemetryEvents.DatabaseImportParseFailed,
        {
          error: 'Error',
        },
      );
    });
    it('should emit 1 event with "UnableToParseDatabaseImportFileException" cause', () => {
      service.sendImportFailed(
        mockSessionMetadata,
        new UnableToParseDatabaseImportFileException(),
      );

      expect(sendEventSpy).toHaveBeenNthCalledWith(
        1,
        mockSessionMetadata,
        TelemetryEvents.DatabaseImportParseFailed,
        {
          error: 'UnableToParseDatabaseImportFileException',
        },
      );
    });
    it('should emit 1 event with "NoDatabaseImportFileProvidedException" cause', () => {
      service.sendImportFailed(
        mockSessionMetadata,
        new NoDatabaseImportFileProvidedException(),
      );

      expect(sendEventSpy).toHaveBeenNthCalledWith(
        1,
        mockSessionMetadata,
        TelemetryEvents.DatabaseImportParseFailed,
        {
          error: 'NoDatabaseImportFileProvidedException',
        },
      );
    });
    it('should emit 1 event with "SizeLimitExceededDatabaseImportFileException" cause', () => {
      service.sendImportFailed(
        mockSessionMetadata,
        new SizeLimitExceededDatabaseImportFileException(),
      );

      expect(sendEventSpy).toHaveBeenNthCalledWith(
        1,
        mockSessionMetadata,
        TelemetryEvents.DatabaseImportParseFailed,
        {
          error: 'SizeLimitExceededDatabaseImportFileException',
        },
      );
    });
  });
});
