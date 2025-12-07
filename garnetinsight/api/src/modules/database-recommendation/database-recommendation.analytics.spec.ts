import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  mockDatabase,
  mockDatabaseRecommendation,
  mockDatabaseWithTlsAuth,
  mockSessionMetadata,
} from 'src/__mocks__';
import { TelemetryEvents } from 'src/constants';
import { DatabaseRecommendationAnalytics } from './database-recommendation.analytics';

describe('DatabaseRecommendationAnalytics', () => {
  let service: DatabaseRecommendationAnalytics;
  let sendEventSpy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventEmitter2, DatabaseRecommendationAnalytics],
    }).compile();

    service = await module.get(DatabaseRecommendationAnalytics);
    sendEventSpy = jest.spyOn(service as any, 'sendEvent');
  });

  describe('sendInstanceAddedEvent', () => {
    it('should emit event with recommendationName and provider', () => {
      service.sendCreatedRecommendationEvent(
        mockSessionMetadata,
        mockDatabaseRecommendation,
        mockDatabaseWithTlsAuth,
      );

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.InsightsTipGenerated,
        {
          recommendationName: mockDatabaseRecommendation.name,
          databaseId: mockDatabase.id,
          provider: mockDatabaseWithTlsAuth.provider,
        },
      );
    });
  });
});
