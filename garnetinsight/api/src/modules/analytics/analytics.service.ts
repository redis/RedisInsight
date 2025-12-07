import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { get } from 'lodash';
import { Analytics } from '@segment/analytics-node';
import { AppAnalyticsEvents, TelemetryEvents } from 'src/constants';
import config, { Config } from 'src/utils/config';
import axios from 'axios';
import { SettingsService } from 'src/modules/settings/settings.service';
import { ConstantsProvider } from 'src/modules/constants/providers/constants.provider';
import { ServerService } from 'src/modules/server/server.service';
import { SessionMetadata } from 'src/common/models';
import { convertAnyStringToPositiveInteger } from 'src/utils';

export const NON_TRACKING_ANONYMOUS_ID = '00000000-0000-0000-0000-000000000001';

const SERVER_CONFIG = config.get('server') as Config['server'];
const ANALYTICS_CONFIG = config.get('analytics') as Config['analytics'];

export interface ITelemetryEvent {
  event: string;
  eventData: Object;
  nonTracking: boolean;
  traits?: Object;
}

export interface ITelemetryInitEvent {
  anonymousId?: string;
  sessionId?: number;
  appType: string;
  controlNumber: number;
  controlGroup: string;
  appVersion: string;
  firstStart?: boolean;
  sessionMetadata?: SessionMetadata;
}

export enum Telemetry {
  Enabled = 'enabled',
  Disabled = 'disabled',
}

@Injectable()
export class AnalyticsService {
  private anonymousId: string;

  private sessionId: number = -1;

  private appType: string = 'unknown';

  private controlNumber: number = -1;

  private controlGroup: string = '-1';

  private appVersion: string = '2.0.0';

  private analytics: Analytics;

  constructor(
    private readonly settingsService: SettingsService,
    private readonly constantsProvider: ConstantsProvider,
  ) {}

  /**
   * Returns default anonymous id if was set during service initialization
   * Otherwise sessionMetadata.userId will be returned or 'unknown' string
   *
   * If we want to have single anonymousId it should be set during initialization. E.g. init({ anonymousId: 'id' })
   * If we want to distinguish between several requests then sessionMetadata should have proper userId field, and
   * we shouldn't pass anonymousId during initialization
   *
   * @param sessionMetadata
   */
  public getAnonymousId(sessionMetadata?: SessionMetadata): string {
    return (
      this.anonymousId ?? this.constantsProvider.getAnonymousId(sessionMetadata)
    );
  }

  /**
   * Returns default sessionId if was set during service initialization
   * Otherwise sessionMetadata.sessionId will be returned or -1
   *
   * Behaves the same way as getAnonymousId.
   *
   * @param sessionMetadata
   */
  public getSessionId(sessionMetadata?: SessionMetadata): number {
    if (this.sessionId) {
      return this.sessionId;
    }

    if (sessionMetadata?.sessionId) {
      return convertAnyStringToPositiveInteger(sessionMetadata?.sessionId);
    }

    return -1;
  }

  public async init(initConfig: ITelemetryInitEvent) {
    const {
      anonymousId,
      sessionId,
      appType,
      controlNumber,
      controlGroup,
      appVersion,
      firstStart,
      sessionMetadata,
    } = initConfig;
    this.sessionId = sessionId;
    this.anonymousId = anonymousId;
    this.appType = appType;
    this.controlGroup = controlGroup;
    this.appVersion = appVersion;
    this.controlNumber = controlNumber;
    this.analytics = new Analytics({
      writeKey: ANALYTICS_CONFIG.writeKey,
      flushInterval: ANALYTICS_CONFIG.flushInterval,
      httpClient: (url, requestInit) =>
        axios.request({
          ...requestInit,
          url,
          data: requestInit.body,
        }),
    });

    if (ANALYTICS_CONFIG.startEvents && sessionMetadata) {
      this.sendEvent(sessionMetadata, {
        event: firstStart
          ? TelemetryEvents.ApplicationFirstStart
          : TelemetryEvents.ApplicationStarted,
        eventData: {
          appVersion: SERVER_CONFIG.appVersion,
          osPlatform: process.platform,
          buildType: SERVER_CONFIG.buildType,
          port: SERVER_CONFIG.port,
          packageType: ServerService.getPackageType(SERVER_CONFIG.buildType),
        },
        nonTracking: true,
      }).catch();
    }
  }

  @OnEvent(AppAnalyticsEvents.Track)
  async sendEvent(sessionMetadata: SessionMetadata, payload: ITelemetryEvent) {
    try {
      // The event is reported only if the user's permission is granted.
      // The anonymousId is also sent along with the event.
      //
      // The `nonTracking` argument can be set to True to mark an event that doesn't track the specific
      // user in any way. When `nonTracking` is True, the event is sent regardless of whether the user's permission
      // for analytics is granted or not.
      // If permissions not granted
      // anonymousId will includes "00000000-0000-0000-0000-000000000001" value without any user identifiers.
      const trackParams = await this.prepareEventData(sessionMetadata, payload);

      if (trackParams) {
        this.analytics.track({
          ...trackParams,
          event: payload.event,
        });
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  @OnEvent(AppAnalyticsEvents.Page)
  async sendPage(sessionMetadata: SessionMetadata, payload: ITelemetryEvent) {
    try {
      // The event is reported only if the user's permission is granted.
      // The anonymousId is also sent along with the event.
      //
      // The `nonTracking` argument can be set to True to mark an event that doesn't track the specific
      // user in any way. When `nonTracking` is True, the event is sent regardless of whether the user's permission
      // for analytics is granted or not.
      // If permissions not granted anonymousId includes "UNSET" value without any user identifiers.
      const pageParams = await this.prepareEventData(sessionMetadata, payload);

      if (pageParams) {
        this.analytics.page({
          ...pageParams,
          name: payload.event,
        });
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  private async prepareEventData(
    sessionMetadata: SessionMetadata,
    payload: ITelemetryEvent,
  ) {
    try {
      const { eventData, nonTracking, traits = {} } = payload;
      const isAnalyticsGranted =
        await this.checkIsAnalyticsGranted(sessionMetadata);

      if (isAnalyticsGranted || nonTracking) {
        return {
          anonymousId:
            !isAnalyticsGranted && nonTracking
              ? NON_TRACKING_ANONYMOUS_ID
              : this.getAnonymousId(sessionMetadata),
          integrations: {
            Amplitude: { session_id: this.getSessionId(sessionMetadata) },
          },
          context: {
            traits: {
              ...traits,
              telemetry: isAnalyticsGranted
                ? Telemetry.Enabled
                : Telemetry.Disabled,
            },
          },
          properties: {
            ...eventData,
            anonymousId: this.getAnonymousId(sessionMetadata),
            buildType: this.appType,
            controlNumber: this.controlNumber,
            controlGroup: this.controlGroup,
            appVersion: this.appVersion,
          },
        };
      }
    } catch (e) {
      // ignore errors
    }

    return null;
  }

  private async checkIsAnalyticsGranted(sessionMetadata: SessionMetadata) {
    return !!get(
      await this.settingsService.getAppSettings(sessionMetadata),
      'agreements.analytics',
      false,
    );
  }
}
