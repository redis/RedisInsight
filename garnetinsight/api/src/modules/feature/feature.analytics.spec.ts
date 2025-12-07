import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppAnalyticsEvents, TelemetryEvents } from 'src/constants';
import { FeatureAnalytics } from 'src/modules/feature/feature.analytics';
import { mockSessionMetadata } from 'src/__mocks__';
import { UnableToFetchRemoteConfigException } from 'src/modules/feature/exceptions';
import { ValidationError } from 'class-validator';

describe('FeatureAnalytics', () => {
  let service: FeatureAnalytics;
  let eventEmitter: EventEmitter2;
  let sendEventSpy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureAnalytics,
        {
          provide: EventEmitter2,
          useFactory: () => ({
            emit: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = module.get(FeatureAnalytics);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    sendEventSpy = jest.spyOn(service as any, 'sendEvent');
  });

  describe('sendFeatureFlagConfigUpdated', () => {
    it('should emit FEATURE_FLAG_CONFIG_UPDATED telemetry event', async () => {
      service.sendFeatureFlagConfigUpdated(mockSessionMetadata, {
        configVersion: 7.78,
        oldVersion: 7.77,
        type: 'default',
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.FeatureFlagConfigUpdated,
          eventData: {
            configVersion: 7.78,
            oldVersion: 7.77,
            type: 'default',
          },
        },
      );
    });
    it('should not fail and do not send in case of any error', async () => {
      sendEventSpy.mockImplementationOnce(() => {
        throw new Error('some kind of an error');
      });

      service.sendFeatureFlagConfigUpdated(mockSessionMetadata, {} as any);

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('sendFeatureFlagRecalculated', () => {
    it('should emit FEATURE_FLAG_RECALCULATED telemetry event', async () => {
      service.sendFeatureFlagRecalculated(mockSessionMetadata, {
        configVersion: 7.78,
        features: {
          insightsRecommendations: {
            flag: true,
          },
          another_feature: {
            flag: false,
          },
        },
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.FeatureFlagRecalculated,
          eventData: {
            configVersion: 7.78,
            features: {
              insightsRecommendations: true,
              another_feature: false,
            },
          },
        },
      );
    });
    it('should not fail and do not send in case of an error', async () => {
      sendEventSpy.mockImplementationOnce(() => {
        throw new Error();
      });

      service.sendFeatureFlagRecalculated(mockSessionMetadata, {} as any);

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('sendFeatureFlagConfigUpdateError', () => {
    it('should emit telemetry event (common Error)', async () => {
      service.sendFeatureFlagConfigUpdateError(mockSessionMetadata, {
        configVersion: 7.78,
        type: 'default',
        error: new Error('some sensitive information'),
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.FeatureFlagConfigUpdateError,
          eventData: {
            configVersion: 7.78,
            type: 'default',
            reason: 'Error',
          },
        },
      );
    });
    it('should emit telemetry event (UnableToFetchRemoteConfigException)', async () => {
      service.sendFeatureFlagConfigUpdateError(mockSessionMetadata, {
        configVersion: 7.78,
        error: new UnableToFetchRemoteConfigException('some PII'),
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.FeatureFlagConfigUpdateError,
          eventData: {
            configVersion: 7.78,
            reason: 'UnableToFetchRemoteConfigException',
          },
        },
      );
    });
    it('should emit telemetry event (ValidationError)', async () => {
      service.sendFeatureFlagConfigUpdateError(mockSessionMetadata, {
        configVersion: 7.78,
        type: 'remote',
        error: new ValidationError(),
      } as any);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.FeatureFlagConfigUpdateError,
          eventData: {
            configVersion: 7.78,
            type: 'remote',
            reason: 'ValidationError',
          },
        },
      );
    });
    it('should emit telemetry event ([ValidationError] only first exception)', async () => {
      service.sendFeatureFlagConfigUpdateError(mockSessionMetadata, {
        configVersion: 7.78,
        type: 'remote',
        error: [
          new ValidationError(),
          new Error('2nd error which will be ignored'),
        ] as any[],
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.FeatureFlagConfigUpdateError,
          eventData: {
            configVersion: 7.78,
            type: 'remote',
            reason: 'ValidationError',
          },
        },
      );
    });
    it('should not fail and not send in case of an error', async () => {
      sendEventSpy.mockImplementationOnce(() => {
        throw new Error('some error');
      });

      service.sendFeatureFlagConfigUpdateError(mockSessionMetadata, {} as any);

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('sendFeatureFlagInvalidRemoteConfig', () => {
    it('should emit telemetry event (common Error)', async () => {
      service.sendFeatureFlagInvalidRemoteConfig(mockSessionMetadata, {
        configVersion: 7.78,
        type: 'default',
        error: new Error('some sensitive information'),
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.FeatureFlagInvalidRemoteConfig,
          eventData: {
            configVersion: 7.78,
            type: 'default',
            reason: 'Error',
          },
        },
      );
    });
    it('should emit telemetry event (UnableToFetchRemoteConfigException)', async () => {
      service.sendFeatureFlagInvalidRemoteConfig(mockSessionMetadata, {
        configVersion: 7.78,
        error: new UnableToFetchRemoteConfigException('some PII'),
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.FeatureFlagInvalidRemoteConfig,
          eventData: {
            configVersion: 7.78,
            reason: 'UnableToFetchRemoteConfigException',
          },
        },
      );
    });
    it('should emit telemetry event (ValidationError)', async () => {
      service.sendFeatureFlagInvalidRemoteConfig(mockSessionMetadata, {
        configVersion: 7.78,
        type: 'remote',
        error: new ValidationError() as any,
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.FeatureFlagInvalidRemoteConfig,
          eventData: {
            configVersion: 7.78,
            type: 'remote',
            reason: 'ValidationError',
          },
        },
      );
    });
    it('should emit telemetry event ([ValidationError] only first exception)', async () => {
      service.sendFeatureFlagInvalidRemoteConfig(mockSessionMetadata, {
        configVersion: 7.78,
        type: 'remote',
        error: [
          new ValidationError(),
          new Error('2nd error which will be ignored'),
        ] as any[],
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.FeatureFlagInvalidRemoteConfig,
          eventData: {
            configVersion: 7.78,
            type: 'remote',
            reason: 'ValidationError',
          },
        },
      );
    });
    it('should not fail and not send in case of an error', async () => {
      sendEventSpy.mockImplementationOnce(() => {
        throw new Error('some error');
      });

      service.sendFeatureFlagInvalidRemoteConfig(
        mockSessionMetadata,
        {} as any,
      );

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });
});
