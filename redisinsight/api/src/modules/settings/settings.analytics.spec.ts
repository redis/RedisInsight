import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppAnalyticsEvents, TelemetryEvents } from 'src/constants';
import { SettingsAnalytics } from 'src/modules/settings/settings.analytics';
import { GetAppSettingsResponse } from 'src/modules/settings/dto/settings.dto';
import { mockSessionMetadata } from 'src/__mocks__';

describe('SettingsAnalytics', () => {
  let service: SettingsAnalytics;
  let eventEmitter: EventEmitter2;
  let sendEventMethod;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventEmitter2, SettingsAnalytics],
    }).compile();

    service = module.get<SettingsAnalytics>(SettingsAnalytics);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    eventEmitter.emit = jest.fn();
    sendEventMethod = jest.spyOn<SettingsAnalytics, any>(service, 'sendEvent');
  });

  describe('sendAnalyticsAgreementChange', () => {
    it('should emit ANALYTICS_PERMISSION with state enabled on first app launch', async () => {
      service.sendAnalyticsAgreementChange(
        mockSessionMetadata,
        new Map([['analytics', true]]),
        undefined,
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.AnalyticsPermission,
          eventData: { state: 'enabled' },
          nonTracking: true,
        },
      );
    });
    it('should emit ANALYTICS_PERMISSION with state enabled and reason undefined', async () => {
      service.sendAnalyticsAgreementChange(
        mockSessionMetadata,
        new Map([['analytics', true]]),
        undefined,
        undefined,
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.AnalyticsPermission,
          eventData: { reason: undefined, state: 'enabled' },
          nonTracking: true,
        },
      );
    });
    it('should emit ANALYTICS_PERMISSION with state enabled and reason "sso"', async () => {
      service.sendAnalyticsAgreementChange(
        mockSessionMetadata,
        new Map([['analytics', true]]),
        undefined,
        'sso',
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.AnalyticsPermission,
          eventData: { reason: 'sso', state: 'enabled' },
          nonTracking: true,
        },
      );
    });
    it('should emit ANALYTICS_PERMISSION with state disabled on first app launch', async () => {
      service.sendAnalyticsAgreementChange(
        mockSessionMetadata,
        new Map([['analytics', false]]),
        undefined,
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.AnalyticsPermission,
          eventData: { state: 'disabled' },
          nonTracking: true,
        },
      );
    });
    it('should not emit ANALYTICS_PERMISSION if agreement did not changed', async () => {
      service.sendAnalyticsAgreementChange(
        mockSessionMetadata,
        new Map([['analytics', false]]),
        new Map([['analytics', false]]),
        'none',
      );

      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        {
          event: TelemetryEvents.AnalyticsPermission,
          eventData: expect.anything(),
          nonTracking: true,
        },
      );
    });
    it('should emit [ANALYTICS_PERMISSION] if agreement changed', async () => {
      service.sendAnalyticsAgreementChange(
        mockSessionMetadata,
        new Map([['analytics', false]]),
        new Map([['analytics', true]]),
        'none',
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.AnalyticsPermission,
          eventData: { state: 'disabled', reason: 'none' },
          nonTracking: true,
        },
      );
    });
  });

  describe('sendSettingsUpdatedEvent', () => {
    const defaultSettings: GetAppSettingsResponse = {
      acceptTermsAndConditionsOverwritten: false,
      agreements: null,
      scanThreshold: 10000,
      batchSize: 5,
      dateFormat: null,
      timezone: null,
      theme: null,
    };
    it('should emit [SETTINGS_KEYS_TO_SCAN_CHANGED] event', async () => {
      service.sendSettingsUpdatedEvent(
        mockSessionMetadata,
        { ...defaultSettings, scanThreshold: 100000 },
        { ...defaultSettings, scanThreshold: 10000 },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.SettingsScanThresholdChanged,
        {
          currentValue: 100000,
          currentValueRange: '50 001 - 100 000',
          previousValue: 10000,
          previousValueRange: '5 001 - 10 000',
        },
      );
    });
    it('should not emit [SETTINGS_KEYS_TO_SCAN_CHANGED] for the same value', async () => {
      service.sendSettingsUpdatedEvent(
        mockSessionMetadata,
        { ...defaultSettings, scanThreshold: 10000 },
        { ...defaultSettings, scanThreshold: 10000 },
      );

      expect(sendEventMethod).not.toHaveBeenCalled();
    });
    it('should not emit [SETTINGS_WORKBENCH_PIPELINE_CHANGED] for the same value', async () => {
      service.sendSettingsUpdatedEvent(
        mockSessionMetadata,
        { ...defaultSettings, batchSize: 5 },
        { ...defaultSettings, batchSize: 5 },
      );

      expect(sendEventMethod).not.toHaveBeenCalled();
    });
    it('should emit [SETTINGS_WORKBENCH_PIPELINE_CHANGED] event', async () => {
      service.sendSettingsUpdatedEvent(
        mockSessionMetadata,
        { ...defaultSettings, batchSize: 5 },
        { ...defaultSettings, batchSize: 10 },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.SettingsWorkbenchPipelineChanged,
        {
          newValue: true,
          newValueSize: 5,
          currentValue: true,
          currentValueSize: 10,
        },
      );
    });
    it('should not emit event on error', async () => {
      service.sendSettingsUpdatedEvent(
        mockSessionMetadata,
        { ...defaultSettings, scanThreshold: 10000 },
        undefined,
      );

      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });
});
