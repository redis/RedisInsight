import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { RedisEnterpriseDatabase } from 'src/modules/redis-enterprise/dto/cluster.dto';
import { RedisEnterpriseDatabaseStatus } from 'src/modules/redis-enterprise/models/redis-enterprise-database';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export class RedisEnterpriseAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendGetRedisSoftwareDbsSucceedEvent(
    sessionMetadata: SessionMetadata,
    databases: RedisEnterpriseDatabase[] = [],
  ): void {
    try {
      this.sendEvent(
        sessionMetadata,
        TelemetryEvents.RedisSoftwareDiscoverySucceed,
        {
          numberOfActiveDatabases: databases.filter(
            (db) => db.status === RedisEnterpriseDatabaseStatus.Active,
          ).length,
          totalNumberOfDatabases: databases.length,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendGetRedisSoftwareDbsFailedEvent(
    sessionMetadata: SessionMetadata,
    exception: HttpException,
  ) {
    this.sendFailedEvent(
      sessionMetadata,
      TelemetryEvents.RedisSoftwareDiscoveryFailed,
      exception,
    );
  }
}
