import {
  CloudJob,
  CloudJobOptions,
  WaitForTaskCloudJob,
} from 'src/modules/cloud/job/jobs';
import { CloudTaskCapiService } from 'src/modules/cloud/task/cloud-task.capi.service';
import {
  CloudSubscription,
  CloudSubscriptionType,
} from 'src/modules/cloud/subscription/models';
import { CloudSubscriptionCapiService } from 'src/modules/cloud/subscription/cloud-subscription.capi.service';
import { CloudDatabase } from 'src/modules/cloud/database/models';
import { CloudDatabaseCapiService } from 'src/modules/cloud/database/cloud-database.capi.service';
import { WaitForActiveDatabaseCloudJob } from 'src/modules/cloud/job/jobs/wait-for-active-database.cloud-job';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { CloudJobStatus, CloudJobStep } from 'src/modules/cloud/job/models';
import {
  CloudDatabaseEndpointInvalidException,
  CloudDatabaseImportForbiddenException,
  CloudJobUnexpectedErrorException,
  CloudTaskNoResourceIdException,
} from 'src/modules/cloud/job/exceptions';
import { DatabaseService } from 'src/modules/database/database.service';
import { HostingProvider } from 'src/modules/database/entities/database.entity';
import { Database } from 'src/modules/database/models/database';
import config from 'src/utils/config';
import { CloudDatabaseAnalytics } from 'src/modules/cloud/database/cloud-database.analytics';
import { CloudCapiKeyService } from 'src/modules/cloud/capi-key/cloud-capi-key.service';
import { BulkImportService } from 'src/modules/bulk-actions/bulk-import.service';
import { ClientContext, SessionMetadata } from 'src/common/models';
import { DatabaseInfoService } from 'src/modules/database/database-info.service';
import { FeatureService } from 'src/modules/feature/feature.service';
import { KnownFeatures } from 'src/modules/feature/constants';

const cloudConfig = config.get('cloud');

export class CreateFreeDatabaseCloudJob extends CloudJob {
  protected name = CloudJobName.CreateFreeDatabase;

  constructor(
    readonly options: CloudJobOptions,
    private readonly data: {
      subscriptionId: number;
    },
    protected readonly dependencies: {
      cloudDatabaseCapiService: CloudDatabaseCapiService;
      cloudSubscriptionCapiService: CloudSubscriptionCapiService;
      cloudTaskCapiService: CloudTaskCapiService;
      cloudDatabaseAnalytics: CloudDatabaseAnalytics;
      databaseService: DatabaseService;
      databaseInfoService: DatabaseInfoService;
      bulkImportService: BulkImportService;
      cloudCapiKeyService: CloudCapiKeyService;
      featureService: FeatureService;
    },
  ) {
    super(options);
  }

  async iteration(sessionMetadata: SessionMetadata): Promise<Database> {
    let freeSubscription: CloudSubscription;
    try {
      this.logger.debug('Create free database');

      this.checkSignal();

      this.changeState({ step: CloudJobStep.Database });

      this.logger.debug('Getting subscription metadata');

      freeSubscription =
        await this.dependencies.cloudSubscriptionCapiService.getSubscription(
          this.options.capiCredentials,
          this.data.subscriptionId,
          CloudSubscriptionType.Fixed,
        );
      let cloudDatabase: CloudDatabase;

      let createFreeDatabaseTask =
        await this.dependencies.cloudDatabaseCapiService.createFreeDatabase(
          this.options.capiCredentials,
          {
            subscriptionId: freeSubscription.id,
            subscriptionType: freeSubscription.type,
          },
        );

      this.checkSignal();

      createFreeDatabaseTask = await this.runChildJob(
        sessionMetadata,
        WaitForTaskCloudJob,
        {
          taskId: createFreeDatabaseTask.taskId,
        },
        this.options,
      );

      const freeDatabaseId = createFreeDatabaseTask?.response?.resourceId;

      if (!freeDatabaseId) {
        throw new CloudTaskNoResourceIdException();
      }

      cloudDatabase = {
        databaseId: freeDatabaseId,
      } as CloudDatabase;

      if (!cloudDatabase) {
        throw new CloudJobUnexpectedErrorException(
          'Unable to create free cloud database',
        );
      }

      this.checkSignal();

      cloudDatabase = await this.runChildJob(
        sessionMetadata,
        WaitForActiveDatabaseCloudJob,
        {
          databaseId: cloudDatabase.databaseId,
          subscriptionId: this.data.subscriptionId,
          subscriptionType: CloudSubscriptionType.Fixed,
        },
        this.options,
      );

      this.checkSignal();

      const isDatabaseManagementEnabled =
        await this.dependencies.featureService.isFeatureEnabled(
          sessionMetadata,
          KnownFeatures.DatabaseManagement,
        );

      if (!isDatabaseManagementEnabled) {
        throw new CloudDatabaseImportForbiddenException();
      }

      const { publicEndpoint, name, password } = cloudDatabase;

      if (!publicEndpoint) {
        throw new CloudDatabaseEndpointInvalidException();
      }

      const [host, port] = publicEndpoint.split(':');

      const database = await this.dependencies.databaseService.create(
        this.options.sessionMetadata,
        {
          host,
          port: parseInt(port, 10),
          name,
          nameFromProvider: name,
          password,
          provider: HostingProvider.REDIS_CLOUD,
          cloudDetails: {
            ...cloudDatabase?.cloudDetails,
            free: true,
          },
          timeout: cloudConfig.cloudDatabaseConnectionTimeout,
        },
      );

      try {
        const clientMetadata = {
          databaseId: database.id,
          sessionMetadata: this.options.sessionMetadata,
          context: ClientContext.Common,
          db: database.db,
        };
        const dbSize =
          await this.dependencies.databaseInfoService.getDBSize(clientMetadata);

        if (dbSize === 0) {
          this.dependencies.bulkImportService.importDefaultData(clientMetadata);
        }
      } catch (e) {
        this.logger.error(
          'Error when trying to feed the db with default data',
          e,
        );
      }

      this.result = {
        resourceId: database.id,
        region: freeSubscription?.region,
        provider: freeSubscription?.provider,
      };

      this.changeState({ status: CloudJobStatus.Finished });

      this.dependencies.cloudDatabaseAnalytics.sendCloudFreeDatabaseCreated(
        sessionMetadata,
        {
          region: freeSubscription?.region || '',
          provider: freeSubscription?.provider || '',
        },
      );

      return database;
    } catch (e) {
      this.dependencies.cloudDatabaseAnalytics.sendCloudFreeDatabaseFailed(
        sessionMetadata,
        e,
        {
          region: freeSubscription?.region,
          provider: freeSubscription?.provider,
        },
      );

      throw e;
    }
  }
}
