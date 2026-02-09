import { countBy } from 'lodash';
import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { SessionMetadata } from 'src/common/models';
import { AzureSubscription, AzureRedisDatabase } from '../models';
import { AzureRedisType } from '../constants';

@Injectable()
export class AzureAutodiscoveryAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendAzureSubscriptionsDiscoverySucceeded(
    sessionMetadata: SessionMetadata,
    subscriptions: AzureSubscription[] = [],
  ) {
    try {
      this.sendEvent(
        sessionMetadata,
        TelemetryEvents.AzureSubscriptionsDiscoverySucceeded,
        {
          totalSubscriptions: subscriptions.length,
          activeSubscriptions: subscriptions.filter(
            (sub) => sub.state?.toLowerCase() === 'enabled',
          ).length,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendAzureSubscriptionsDiscoveryFailed(
    sessionMetadata: SessionMetadata,
    exception: HttpException,
  ) {
    this.sendFailedEvent(
      sessionMetadata,
      TelemetryEvents.AzureSubscriptionsDiscoveryFailed,
      exception,
    );
  }

  sendAzureDatabasesDiscoverySucceeded(
    sessionMetadata: SessionMetadata,
    databases: AzureRedisDatabase[] = [],
  ) {
    try {
      const typeCount = countBy(databases, 'type');

      this.sendEvent(
        sessionMetadata,
        TelemetryEvents.AzureDatabasesDiscoverySucceeded,
        {
          totalDatabases: databases.length,
          standardDatabases: typeCount[AzureRedisType.Standard] || 0,
          enterpriseDatabases: typeCount[AzureRedisType.Enterprise] || 0,
          activeDatabases: databases.filter(
            (db) => db.provisioningState?.toLowerCase() === 'succeeded',
          ).length,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendAzureDatabasesDiscoveryFailed(
    sessionMetadata: SessionMetadata,
    exception: HttpException,
  ) {
    this.sendFailedEvent(
      sessionMetadata,
      TelemetryEvents.AzureDatabasesDiscoveryFailed,
      exception,
    );
  }

  sendAzureDatabaseAdded(
    sessionMetadata: SessionMetadata,
    databaseType: AzureRedisType,
  ) {
    try {
      this.sendEvent(sessionMetadata, TelemetryEvents.AzureDatabaseAdded, {
        databaseType,
      });
    } catch (e) {
      // continue regardless of error
    }
  }

  sendAzureDatabaseAddFailed(
    sessionMetadata: SessionMetadata,
    exception: HttpException,
    databaseType?: AzureRedisType,
  ) {
    this.sendFailedEvent(
      sessionMetadata,
      TelemetryEvents.AzureDatabaseAddFailed,
      exception,
      { databaseType },
    );
  }
}
