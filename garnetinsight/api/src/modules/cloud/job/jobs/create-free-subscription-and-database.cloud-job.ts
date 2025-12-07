import { sortBy } from 'lodash';
import {
  CloudJob,
  CloudJobOptions,
  CreateFreeDatabaseCloudJob,
} from 'src/modules/cloud/job/jobs';
import { CloudTaskCapiService } from 'src/modules/cloud/task/cloud-task.capi.service';
import { CloudSubscriptionCapiService } from 'src/modules/cloud/subscription/cloud-subscription.capi.service';
import { CreateFreeSubscriptionCloudJob } from 'src/modules/cloud/job/jobs/create-free-subscription.cloud-job';
import { CloudDatabaseCapiService } from 'src/modules/cloud/database/cloud-database.capi.service';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { CloudJobStatus, CloudJobStep } from 'src/modules/cloud/job/models';
import { DatabaseService } from 'src/modules/database/database.service';
import { Database } from 'src/modules/database/models/database';
import { CloudDatabaseAnalytics } from 'src/modules/cloud/database/cloud-database.analytics';
import { CloudCapiKeyService } from 'src/modules/cloud/capi-key/cloud-capi-key.service';
import { CloudSubscription } from 'src/modules/cloud/subscription/models';
import { DatabaseInfoService } from 'src/modules/database/database-info.service';
import { BulkImportService } from 'src/modules/bulk-actions/bulk-import.service';
import { SessionMetadata } from 'src/common/models';
import { FeatureService } from 'src/modules/feature/feature.service';
import { CloudSubscriptionApiService } from '../../subscription/cloud-subscription.api.service';
import { CloudSubscriptionPlanResponse } from '../../subscription/dto';

export class CreateFreeSubscriptionAndDatabaseCloudJob extends CloudJob {
  protected name = CloudJobName.CreateFreeSubscriptionAndDatabase;

  constructor(
    readonly options: CloudJobOptions,

    private data: {
      planId?: number;
      isRecommendedSettings?: boolean;
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
      cloudSubscriptionApiService: CloudSubscriptionApiService;
      featureService: FeatureService;
    },
  ) {
    super(options);
  }

  async iteration(sessionMetadata: SessionMetadata): Promise<Database> {
    let planId = this.data?.planId;

    this.logger.debug('Create free subscription and database');

    this.checkSignal();

    this.changeState({ step: CloudJobStep.Subscription });

    this.logger.debug('Get or create free subscription');

    if (this.data?.isRecommendedSettings) {
      const plans =
        await this.dependencies.cloudSubscriptionApiService.getSubscriptionPlans(
          this.options.sessionMetadata,
        );

      planId = this.getRecommendedPlanId(plans);
    }

    const freeSubscription: CloudSubscription = await this.runChildJob(
      sessionMetadata,
      CreateFreeSubscriptionCloudJob,
      { planId },
      this.options,
    );

    this.logger.debug('Get free subscription databases');

    this.checkSignal();

    this.changeState({ step: CloudJobStep.Database });

    const database = await this.runChildJob(
      sessionMetadata,
      CreateFreeDatabaseCloudJob,
      {
        subscriptionId: freeSubscription.id,
      },
      this.options,
    );

    this.result = {
      resourceId: database.id,
      region: freeSubscription?.region,
      provider: freeSubscription?.provider,
    };

    this.changeState({ status: CloudJobStatus.Finished });

    return database;
  }

  private getRecommendedPlanId(plans: CloudSubscriptionPlanResponse[]) {
    const defaultPlan = sortBy(plans, ['details.displayOrder']);
    return defaultPlan[0]?.id;
  }
}
