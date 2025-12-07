import { Injectable, Logger } from '@nestjs/common';
import {
  CloudSubscription,
  CloudSubscriptionPlan,
  CloudSubscriptionPlanProvider,
  CloudSubscriptionType,
} from 'src/modules/cloud/subscription/models';
import { wrapHttpError } from 'src/common/utils';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import {
  parseCloudSubscriptionCapiResponse,
  parseCloudSubscriptionsCapiResponse,
  parseCloudSubscriptionsPlansCapiResponse,
} from 'src/modules/cloud/subscription/utils';
import { filter, find } from 'lodash';
import config from 'src/utils/config';
import { parseCloudTaskCapiResponse } from 'src/modules/cloud/task/utils';
import { CloudTask } from 'src/modules/cloud/task/models';
import { CloudSubscriptionCapiProvider } from './providers/cloud-subscription.capi.provider';

const cloudConfig = config.get('cloud');

@Injectable()
export class CloudSubscriptionCapiService {
  private logger = new Logger('CloudSubscriptionCapiService');

  constructor(private readonly capi: CloudSubscriptionCapiProvider) {}

  static findFreeSubscription(
    subscriptions: CloudSubscription[],
  ): CloudSubscription {
    const freeSubscriptions = filter(subscriptions, { price: 0 });

    return (
      find(freeSubscriptions, { name: cloudConfig.freeSubscriptionName }) ||
      freeSubscriptions[0]
    );
  }

  static findFreePlan(plans: CloudSubscriptionPlan[]): CloudSubscriptionPlan {
    const freePlans = filter(plans, { price: 0 });

    return (
      find(
        freePlans,
        (plan) =>
          plan.provider === CloudSubscriptionPlanProvider.AWS &&
          plan.region === cloudConfig.defaultPlanRegion &&
          plan.name.toLowerCase().includes('standard'),
      ) ||
      find(freePlans, {
        provider: CloudSubscriptionPlanProvider.AWS,
        region: cloudConfig.defaultPlanRegion,
      }) ||
      find(freePlans, { provider: CloudSubscriptionPlanProvider.AWS }) ||
      freePlans[0]
    );
  }

  static findFreePlanById(
    plans: CloudSubscriptionPlan[],
    planId: number,
  ): CloudSubscriptionPlan {
    const freePlans = filter(plans, { price: 0 });

    return find(freePlans, { id: planId });
  }

  /**
   * Get list of account subscriptions
   * @param authDto
   * @param type
   */
  async getSubscriptions(
    authDto: CloudCapiAuthDto,
    type: CloudSubscriptionType,
  ): Promise<CloudSubscription[]> {
    this.logger.debug(`Getting cloud ${type} subscriptions.`);
    try {
      const subscriptions = await this.capi.getSubscriptionsByType(
        authDto,
        type,
      );

      this.logger.debug(`Succeed to get cloud ${type} subscriptions.`);

      return parseCloudSubscriptionsCapiResponse(subscriptions, type);
    } catch (error) {
      this.logger.error(`Error getting ${type} subscriptions`, error);
      throw wrapHttpError(error);
    }
  }

  /**
   * Get subscription by id
   * @param authDto
   * @param id
   * @param type
   */
  async getSubscription(
    authDto: CloudCapiAuthDto,
    id: number,
    type: CloudSubscriptionType,
  ): Promise<CloudSubscription> {
    this.logger.debug(`Getting cloud ${type} subscription.`);
    try {
      const subscription = await this.capi.getSubscriptionByType(
        authDto,
        id,
        type,
      );

      this.logger.debug(`Succeed to get cloud ${type} subscription.`);

      return parseCloudSubscriptionCapiResponse(subscription, type);
    } catch (error) {
      this.logger.error(`Error getting ${type} subscription`, error);
      throw wrapHttpError(error);
    }
  }

  /**
   * Get list of subscription plans
   * @param authDto
   * @param type
   */
  async getSubscriptionsPlans(
    authDto: CloudCapiAuthDto,
    type: CloudSubscriptionType,
  ): Promise<CloudSubscriptionPlan[]> {
    this.logger.debug(`Getting cloud ${type} plans.`);
    try {
      const plans = await this.capi.getSubscriptionsPlansByType(authDto, type);

      this.logger.debug(`Succeed to get cloud ${type} plans.`);

      return parseCloudSubscriptionsPlansCapiResponse(plans, type);
    } catch (error) {
      this.logger.error('Error getting subscriptions plans', error);
      throw wrapHttpError(error);
    }
  }

  /**
   * Get list of account subscriptions
   * @param authDto
   * @param planId
   */
  async createFreeSubscription(
    authDto: CloudCapiAuthDto,
    planId: number,
  ): Promise<CloudTask> {
    this.logger.debug('Creating free subscription');
    try {
      const task = await this.capi.createFreeSubscription(authDto, {
        name: cloudConfig.freeSubscriptionName,
        planId,
        subscriptionType: CloudSubscriptionType.Fixed,
      });

      this.logger.debug('Task to creating free subscription was sent');

      return parseCloudTaskCapiResponse(task);
    } catch (error) {
      this.logger.error('Error when creating free subscription task', error);
      throw wrapHttpError(error);
    }
  }
}
