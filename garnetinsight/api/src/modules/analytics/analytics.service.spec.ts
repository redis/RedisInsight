import { Test, TestingModule } from '@nestjs/testing';
import {
  mockAppSettings,
  mockAppSettingsWithoutPermissions,
  mockAppVersion,
  mockControlGroup,
  mockControlNumber,
  mockSessionMetadata,
  mockSettingsService,
  MockType,
} from 'src/__mocks__';
import { TelemetryEvents } from 'src/constants';
import { AppType } from 'src/modules/server/models/server';
import { SettingsService } from 'src/modules/settings/settings.service';
import { ConstantsProvider } from 'src/modules/constants/providers/constants.provider';
import { LocalConstantsProvider } from 'src/modules/constants/providers/local.constants.provider';
import { convertAnyStringToPositiveInteger } from 'src/utils';
import {
  AnalyticsService,
  Telemetry,
  NON_TRACKING_ANONYMOUS_ID,
} from './analytics.service';

let mockAnalyticsTrack;
let mockAnalyticsPage;
jest.mock('@segment/analytics-node', () => ({
  Analytics: jest.fn().mockImplementation(() => ({
    track: mockAnalyticsTrack,
    page: mockAnalyticsPage,
  })),
}));

const mockAnonymousId = 'a77b23c1-7816-4ea4-b61f-d37795a0f805';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let settingsService: MockType<SettingsService>;
  const sessionId = new Date().getTime();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: SettingsService,
          useFactory: mockSettingsService,
        },
        {
          provide: ConstantsProvider,
          useClass: LocalConstantsProvider,
        },
      ],
    }).compile();

    settingsService = module.get(SettingsService);
    service = module.get(AnalyticsService);
  });

  describe('init', () => {
    let sendEventSpy;

    beforeEach(() => {
      sendEventSpy = jest.spyOn(service, 'sendEvent');
    });

    it('should set anonymousId and send application started event', () => {
      service.init({
        anonymousId: mockAnonymousId,
        sessionId,
        appType: AppType.Electron,
        controlNumber: mockControlNumber,
        controlGroup: mockControlGroup,
        appVersion: mockAppVersion,
        firstStart: false,
        sessionMetadata: mockSessionMetadata,
      });

      const anonymousId = service.getAnonymousId();

      expect(anonymousId).toEqual(mockAnonymousId);
      expect(sendEventSpy).toHaveBeenCalledTimes(1);
      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        expect.objectContaining({
          event: TelemetryEvents.ApplicationStarted,
        }),
      );
    });
    it('should NOT send application started event since sessionMetadata was not provided', () => {
      service.init({
        anonymousId: mockAnonymousId,
        sessionId,
        appType: AppType.Electron,
        controlNumber: mockControlNumber,
        controlGroup: mockControlGroup,
        appVersion: mockAppVersion,
        firstStart: false,
      });

      const anonymousId = service.getAnonymousId();

      expect(anonymousId).toEqual(mockAnonymousId);
      expect(sendEventSpy).toHaveBeenCalledTimes(0);
    });
    it('should set anonymousId and send application first start event', () => {
      service.init({
        anonymousId: mockAnonymousId,
        sessionId,
        appType: AppType.Electron,
        controlNumber: mockControlNumber,
        controlGroup: mockControlGroup,
        appVersion: mockAppVersion,
        firstStart: true,
        sessionMetadata: mockSessionMetadata,
      });

      const anonymousId = service.getAnonymousId();

      expect(anonymousId).toEqual(mockAnonymousId);
      expect(sendEventSpy).toHaveBeenCalledTimes(1);
      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        expect.objectContaining({
          event: TelemetryEvents.ApplicationFirstStart,
        }),
      );
    });
  });

  describe('getAnonymousId', () => {
    it('should always return anonymousId defined with init', () => {
      service.init({
        anonymousId: mockAnonymousId,
        sessionId,
        appType: AppType.Electron,
        controlNumber: mockControlNumber,
        controlGroup: mockControlGroup,
        appVersion: mockAppVersion,
        firstStart: true,
      });

      expect(service.getAnonymousId()).toEqual(mockAnonymousId);
      expect(service.getAnonymousId(mockSessionMetadata)).toEqual(
        mockAnonymousId,
      );
    });
    it('should return anonymousId from sessionMetadata or "unknown"', () => {
      service.init({
        sessionId,
        appType: AppType.Electron,
        controlNumber: mockControlNumber,
        controlGroup: mockControlGroup,
        appVersion: mockAppVersion,
        firstStart: true,
      });

      expect(service.getAnonymousId()).toEqual('unknown');
      expect(service.getAnonymousId(mockSessionMetadata)).toEqual(
        mockSessionMetadata.userId,
      );
    });
  });

  describe('getSessionId', () => {
    it('should always return sessionId defined with init method', () => {
      service.init({
        sessionId,
        appType: AppType.Electron,
        controlNumber: mockControlNumber,
        controlGroup: mockControlGroup,
        appVersion: mockAppVersion,
        firstStart: true,
      });

      expect(service.getSessionId()).toEqual(sessionId);
      expect(service.getSessionId(mockSessionMetadata)).toEqual(sessionId);
    });
    it('should return sessionId from sessionMetadata or -1', () => {
      service.init({
        appType: AppType.Electron,
        controlNumber: mockControlNumber,
        controlGroup: mockControlGroup,
        appVersion: mockAppVersion,
        firstStart: true,
      });

      expect(service.getSessionId()).toEqual(-1);
      expect(service.getSessionId(mockSessionMetadata)).toEqual(
        convertAnyStringToPositiveInteger(mockSessionMetadata.sessionId),
      );
    });
  });

  describe('sendEvent', () => {
    beforeEach(() => {
      mockAnalyticsTrack = jest.fn();
      service.init({
        anonymousId: mockAnonymousId,
        sessionId,
        appType: AppType.Electron,
        controlNumber: mockControlNumber,
        controlGroup: mockControlGroup,
        appVersion: mockAppVersion,
      });
    });
    it('should send event with anonymousId if permission are granted', async () => {
      settingsService.getAppSettings.mockResolvedValue(mockAppSettings);

      await service.sendEvent(mockSessionMetadata, {
        event: TelemetryEvents.ApplicationStarted,
        eventData: {},
        nonTracking: false,
      });

      expect(mockAnalyticsTrack).toHaveBeenCalledWith({
        anonymousId: mockAnonymousId,
        integrations: { Amplitude: { session_id: sessionId } },
        event: TelemetryEvents.ApplicationStarted,
        context: {
          traits: {
            telemetry: Telemetry.Enabled,
          },
        },
        properties: {
          anonymousId: mockAnonymousId,
          buildType: AppType.Electron,
          controlNumber: mockControlNumber,
          controlGroup: mockControlGroup,
          appVersion: mockAppVersion,
        },
      });
    });
    it('should not send event if permission are not granted', async () => {
      settingsService.getAppSettings.mockResolvedValue(
        mockAppSettingsWithoutPermissions,
      );
      mockAnalyticsTrack.mockReset(); // reset invocation during init()

      await service.sendEvent(mockSessionMetadata, {
        event: 'SOME_EVENT',
        eventData: {},
        nonTracking: false,
      });

      expect(mockAnalyticsTrack).not.toHaveBeenCalled();
    });
    it('should send event for non tracking events event if permission are not granted', async () => {
      settingsService.getAppSettings.mockResolvedValue(
        mockAppSettingsWithoutPermissions,
      );
      mockAnalyticsTrack.mockReset(); // reset invocation during init()

      await service.sendEvent(mockSessionMetadata, {
        event: TelemetryEvents.ApplicationStarted,
        eventData: {},
        nonTracking: true,
      });

      expect(mockAnalyticsTrack).toHaveBeenCalledWith({
        anonymousId: NON_TRACKING_ANONYMOUS_ID,
        integrations: { Amplitude: { session_id: sessionId } },
        event: TelemetryEvents.ApplicationStarted,
        context: {
          traits: {
            telemetry: Telemetry.Disabled,
          },
        },
        properties: {
          anonymousId: mockAnonymousId,
          buildType: AppType.Electron,
          controlNumber: mockControlNumber,
          controlGroup: mockControlGroup,
          appVersion: mockAppVersion,
        },
      });
    });
    it('should send event for non tracking with regular payload', async () => {
      settingsService.getAppSettings.mockResolvedValue(mockAppSettings);
      mockAnalyticsTrack.mockReset(); // reset invocation during init()

      await service.sendEvent(mockSessionMetadata, {
        event: TelemetryEvents.ApplicationStarted,
        eventData: {},
        nonTracking: true,
      });

      expect(mockAnalyticsTrack).toHaveBeenCalledWith({
        anonymousId: mockAnonymousId,
        integrations: { Amplitude: { session_id: sessionId } },
        event: TelemetryEvents.ApplicationStarted,
        context: {
          traits: {
            telemetry: Telemetry.Enabled,
          },
        },
        properties: {
          anonymousId: mockAnonymousId,
          buildType: AppType.Electron,
          controlNumber: mockControlNumber,
          controlGroup: mockControlGroup,
          appVersion: mockAppVersion,
        },
      });
    });
  });

  describe('sendPage', () => {
    beforeEach(() => {
      mockAnalyticsPage = jest.fn();
      service.init({
        anonymousId: mockAnonymousId,
        sessionId,
        appType: AppType.Electron,
        controlNumber: mockControlNumber,
        controlGroup: mockControlGroup,
        appVersion: mockAppVersion,
      });
    });
    it('should send page with anonymousId if permission are granted', async () => {
      settingsService.getAppSettings.mockResolvedValue(mockAppSettings);

      await service.sendPage(mockSessionMetadata, {
        event: TelemetryEvents.ApplicationStarted,
        eventData: {},
        nonTracking: false,
        traits: {
          telemetry: 'will be overwritten',
          custom: 'trait',
        },
      });

      expect(mockAnalyticsPage).toHaveBeenCalledWith({
        anonymousId: mockAnonymousId,
        integrations: { Amplitude: { session_id: sessionId } },
        name: TelemetryEvents.ApplicationStarted,
        context: {
          traits: {
            telemetry: Telemetry.Enabled,
            custom: 'trait',
          },
        },
        properties: {
          anonymousId: mockAnonymousId,
          buildType: AppType.Electron,
          controlNumber: mockControlNumber,
          controlGroup: mockControlGroup,
          appVersion: mockAppVersion,
        },
      });
    });
    it('should not send page if permission are not granted', async () => {
      settingsService.getAppSettings.mockResolvedValue(
        mockAppSettingsWithoutPermissions,
      );

      await service.sendPage(mockSessionMetadata, {
        event: 'SOME_EVENT',
        eventData: {},
        nonTracking: false,
      });

      expect(mockAnalyticsPage).not.toHaveBeenCalled();
    });
    it('should send page for non tracking events event if permission are not granted', async () => {
      settingsService.getAppSettings.mockResolvedValue(
        mockAppSettingsWithoutPermissions,
      );

      await service.sendPage(mockSessionMetadata, {
        event: TelemetryEvents.ApplicationStarted,
        eventData: {},
        nonTracking: true,
      });

      expect(mockAnalyticsPage).toHaveBeenCalledWith({
        anonymousId: NON_TRACKING_ANONYMOUS_ID,
        integrations: { Amplitude: { session_id: sessionId } },
        name: TelemetryEvents.ApplicationStarted,
        context: {
          traits: {
            telemetry: Telemetry.Disabled,
          },
        },
        properties: {
          anonymousId: mockAnonymousId,
          buildType: AppType.Electron,
          controlNumber: mockControlNumber,
          controlGroup: mockControlGroup,
          appVersion: mockAppVersion,
        },
      });
    });
    it('should send page for non tracking events with regular payload', async () => {
      settingsService.getAppSettings.mockResolvedValue(mockAppSettings);

      await service.sendPage(mockSessionMetadata, {
        event: TelemetryEvents.ApplicationStarted,
        eventData: {},
        nonTracking: true,
      });

      expect(mockAnalyticsPage).toHaveBeenCalledWith({
        anonymousId: mockAnonymousId,
        integrations: { Amplitude: { session_id: sessionId } },
        name: TelemetryEvents.ApplicationStarted,
        context: {
          traits: {
            telemetry: Telemetry.Enabled,
          },
        },
        properties: {
          anonymousId: mockAnonymousId,
          buildType: AppType.Electron,
          controlNumber: mockControlNumber,
          controlGroup: mockControlGroup,
          appVersion: mockAppVersion,
        },
      });
    });
  });
});
