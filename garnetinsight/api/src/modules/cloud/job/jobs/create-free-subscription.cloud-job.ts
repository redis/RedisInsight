import {
  CloudJob,
  CloudJobOptions,
} from 'src/modules/cloud/job/jobs/cloud-job';
import { CloudTaskCapiService } from 'src/modules/cloud/task/cloud-task.capi.service';
import {
  CloudSubscription,
  CloudSubscriptionStatus,
  CloudSubscriptionType,
} from 'src/modules/cloud/subscription/models';
import { CloudSubscriptionCapiService } from 'src/modules/cloud/subscription/cloud-subscription.capi.service';
import { CloudDatabaseCapiService } from 'src/modules/cloud/database/cloud-database.capi.service';
import { WaitForTaskCloudJob } from 'src/modules/cloud/job/jobs/wait-for-task.cloud-job';
import { WaitForActiveSubscriptionCloudJob } from 'src/modules/cloud/job/jobs/wait-for-active-subscription.cloud-job';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { CloudJobStatus } from 'src/modules/cloud/job/models';
import {
  CloudDatabaseAlreadyExistsFreeException,
  CloudPlanNotFoundFreeException,
  CloudSubscriptionUnableToDetermineException,
  CloudTaskNoResourceIdException,
} from 'src/modules/cloud/job/exceptions';
import { SessionMetadata } from 'src/common/models';
import { CloudSubscriptionAlreadyExistsFreeException } from '../exceptions/cloud-subscription-already-exists-free.exception';

export class CreateFreeSubscriptionCloudJob extends CloudJob {
  protected name = CloudJobName.CreateFreeSubscription;

  constructor(
    readonly options: CloudJobOptions,
    private readonly data: {
      planId: number;
    },
    protected readonly dependencies: {
      cloudSubscriptionCapiService: CloudSubscriptionCapiService;
      cloudTaskCapiService: CloudTaskCapiService;
      cloudDatabaseCapiService: CloudDatabaseCapiService;
    },
  ) {
    super(options);
  }

  async iteration(
    sessionMetadata: SessionMetadata,
  ): Promise<CloudSubscription> {
    this.logger.debug('Ensure free cloud subscription');

    this.checkSignal();

    let freeSubscription: CloudSubscription;

    this.logger.debug('Fetching fixed subscriptions');

    const fixedSubscriptions =
      await this.dependencies.cloudSubscriptionCapiService.getSubscriptions(
        this.options.capiCredentials,
        CloudSubscriptionType.Fixed,
      );

    freeSubscription =
      CloudSubscriptionCapiService.findFreeSubscription(fixedSubscriptions);

    if (freeSubscription) {
      this.logger.debug('Fetching fixed subscription databases');

      const databases =
        await this.dependencies.cloudDatabaseCapiService.getDatabases(
          this.options.capiCredentials,
          {
            subscriptionId: freeSubscription.id,
            subscriptionType: CloudSubscriptionType.Fixed,
          },
        );

      if (databases?.length) {
        // throw specific error to be handled on FE side to ask user if he wants to import existing database
        throw new CloudDatabaseAlreadyExistsFreeException(undefined, {
          subscriptionId: freeSubscription.id,
          databaseId: databases[0].databaseId,
          region: freeSubscription?.region,
          provider: freeSubscription?.provider,
        });
      }

      // throw specific error to be handled on FE side to ask user if he wants to create new database
      // in the existing subscription
      throw new CloudSubscriptionAlreadyExistsFreeException(undefined, {
        subscriptionId: freeSubscription.id,
      });
    }

    // in case when no free subscriptions found we must create one
    if (!freeSubscription) {
      this.logger.debug('No free subscription found. Creating one');
      this.checkSignal();
      this.logger.debug('Fetching free plans');

      // Get available fixed plans
      const fixedPlans =
        await this.dependencies.cloudSubscriptionCapiService.getSubscriptionsPlans(
          this.options.capiCredentials,
          CloudSubscriptionType.Fixed,
        );

      const freePlan = CloudSubscriptionCapiService.findFreePlanById(
        fixedPlans,
        this.data.planId,
      );

      if (!freePlan) {
        throw new CloudPlanNotFoundFreeException();
      }

      this.logger.debug('Create free subscription');
      this.checkSignal();

      let createSubscriptionTask =
        await this.dependencies.cloudSubscriptionCapiService.createFreeSubscription(
          this.options.capiCredentials,
          freePlan.id,
        );

      this.logger.debug(
        'Create free subscription: cloud task created. Waiting...',
      );
      this.checkSignal();

      createSubscriptionTask = await this.runChildJob(
        sessionMetadata,
        WaitForTaskCloudJob,
        {
          taskId: createSubscriptionTask.taskId,
        },
        this.options,
      );

      const freeSubscriptionId = createSubscriptionTask?.response?.resourceId;

      if (!freeSubscriptionId) {
        throw new CloudTaskNoResourceIdException();
      }

      freeSubscription = {
        id: freeSubscriptionId,
      } as CloudSubscription;
    }

    if (!freeSubscription) {
      throw new CloudSubscriptionUnableToDetermineException();
    }

    this.checkSignal();

    if (freeSubscription.status !== CloudSubscriptionStatus.Active) {
      freeSubscription = await this.runChildJob(
        sessionMetadata,
        WaitForActiveSubscriptionCloudJob,
        {
          subscriptionId: freeSubscription.id,
          subscriptionType: CloudSubscriptionType.Fixed,
        },
        this.options,
      );
    }

    this.changeState({ status: CloudJobStatus.Finished });

    return freeSubscription;
  }
}
