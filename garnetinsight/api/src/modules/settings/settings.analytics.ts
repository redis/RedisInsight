import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { differenceWith, has, isEqual } from 'lodash';
import { AppAnalyticsEvents, TelemetryEvents } from 'src/constants';
import {
  getIsPipelineEnable,
  getRangeForNumber,
  SCAN_THRESHOLD_BREAKPOINTS,
} from 'src/utils';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { GetAppSettingsResponse } from 'src/modules/settings/dto/settings.dto';
import { SessionMetadata } from 'src/common/models';
import { ToggleAnalyticsReasonType } from 'src/modules/settings/constants/settings';

@Injectable()
export class SettingsAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendSettingsUpdatedEvent(
    sessionMetadata: SessionMetadata,
    newSettings: GetAppSettingsResponse,
    oldSettings: GetAppSettingsResponse,
  ): void {
    try {
      const dif = Object.fromEntries(
        differenceWith(
          Object.entries(newSettings),
          Object.entries(oldSettings),
          isEqual,
        ),
      );
      if (has(dif, 'scanThreshold')) {
        this.sendScanThresholdChanged(
          sessionMetadata,
          dif.scanThreshold,
          oldSettings.scanThreshold,
        );
      }
      if (has(dif, 'batchSize')) {
        this.sendWorkbenchPipelineChanged(
          sessionMetadata,
          dif.batchSize,
          oldSettings.batchSize,
        );
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  // Detect that analytics agreement was first established or changed
  sendAnalyticsAgreementChange(
    sessionMetadata: SessionMetadata,
    newAgreements: Map<string, boolean>,
    oldAgreements: Map<string, boolean> = new Map(),
    reason?: ToggleAnalyticsReasonType,
  ) {
    try {
      const newPermission = newAgreements.get('analytics');
      const oldPermission = oldAgreements.get('analytics');
      if (oldPermission !== newPermission) {
        this.eventEmitter.emit(AppAnalyticsEvents.Track, sessionMetadata, {
          event: TelemetryEvents.AnalyticsPermission,
          eventData: {
            state: newPermission ? 'enabled' : 'disabled',
            reason,
          },
          nonTracking: true,
        });
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  private sendScanThresholdChanged(
    sessionMetadata: SessionMetadata,
    currentValue: number,
    previousValue: number,
  ): void {
    this.sendEvent(
      sessionMetadata,
      TelemetryEvents.SettingsScanThresholdChanged,
      {
        currentValue,
        currentValueRange: getRangeForNumber(
          currentValue,
          SCAN_THRESHOLD_BREAKPOINTS,
        ),
        previousValue,
        previousValueRange: getRangeForNumber(
          previousValue,
          SCAN_THRESHOLD_BREAKPOINTS,
        ),
      },
    );
  }

  private sendWorkbenchPipelineChanged(
    sessionMetadata: SessionMetadata,
    newValue: number,
    currentValue: number,
  ): void {
    this.sendEvent(
      sessionMetadata,
      TelemetryEvents.SettingsWorkbenchPipelineChanged,
      {
        newValue: getIsPipelineEnable(newValue),
        newValueSize: newValue,
        currentValue: getIsPipelineEnable(currentValue),
        currentValueSize: currentValue,
      },
    );
  }
}
