import { HttpException, Injectable } from '@nestjs/common';
import {
  SentinelMaster,
  SentinelMasterStatus,
} from 'src/modules/redis-sentinel/models/sentinel-master';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export class RedisSentinelAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendGetSentinelMastersSucceedEvent(
    sessionMetadata: SessionMetadata,
    groups: SentinelMaster[] = [],
  ) {
    try {
      this.sendEvent(
        sessionMetadata,
        TelemetryEvents.SentinelMasterGroupsDiscoverySucceed,
        {
          numberOfAvailablePrimaryGroups: groups.filter(
            (db) => db.status === SentinelMasterStatus.Active,
          ).length,
          totalNumberOfPrimaryGroups: groups.length,
          totalNumberOfReplicas: groups.reduce<number>(
            (sum, group) => sum + group.numberOfSlaves,
            0,
          ),
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendGetSentinelMastersFailedEvent(
    sessionMetadata: SessionMetadata,
    exception: HttpException,
  ) {
    this.sendFailedEvent(
      sessionMetadata,
      TelemetryEvents.SentinelMasterGroupsDiscoveryFailed,
      exception,
    );
  }
}
