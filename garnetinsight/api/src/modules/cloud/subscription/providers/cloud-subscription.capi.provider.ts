import { Injectable } from '@nestjs/common';
import {
  CloudSubscriptionType,
  ICloudCapiSubscription,
  ICloudCapiSubscriptionPlan,
} from 'src/modules/cloud/subscription/models';
import { wrapCloudCapiError } from 'src/modules/cloud/common/exceptions';
import { CloudCapiProvider } from 'src/modules/cloud/common/providers/cloud.capi.provider';
import { ICloudCapiCredentials } from 'src/modules/cloud/common/models';
import { CreateFreeCloudSubscriptionDto } from 'src/modules/cloud/subscription/dto';
import { ICloudCapiTask } from 'src/modules/cloud/task/models';

@Injectable()
export class CloudSubscriptionCapiProvider extends CloudCapiProvider {
  /**
   * Get list of account subscriptions based on type
   * @param credentials
   * @param type
   */
  async getSubscriptionsByType(
    credentials: ICloudCapiCredentials,
    type: CloudSubscriptionType,
  ): Promise<ICloudCapiSubscription[]> {
    try {
      const { data } = await this.api.get(
        `${CloudCapiProvider.getPrefix(type)}/subscriptions`,
        CloudCapiProvider.getHeaders(credentials),
      );

      return data?.subscriptions;
    } catch (error) {
      throw wrapCloudCapiError(error);
    }
  }

  /**
   * Get subscription by id based on type
   * @param credentials
   * @param id
   * @param type
   */
  async getSubscriptionByType(
    credentials: ICloudCapiCredentials,
    id: number,
    type: CloudSubscriptionType,
  ): Promise<ICloudCapiSubscription> {
    try {
      const { data } = await this.api.get(
        `${CloudCapiProvider.getPrefix(type)}/subscriptions/${id}`,
        CloudCapiProvider.getHeaders(credentials),
      );

      return data;
    } catch (error) {
      throw wrapCloudCapiError(error);
    }
  }

  /**
   * Get list of available subscription plans
   * @param credentials
   * @param type
   */
  async getSubscriptionsPlansByType(
    credentials: ICloudCapiCredentials,
    type: CloudSubscriptionType,
  ): Promise<ICloudCapiSubscriptionPlan[]> {
    try {
      const { data } = await this.api.get(
        `${CloudCapiProvider.getPrefix(type)}/plans`,
        CloudCapiProvider.getHeaders(credentials),
      );

      return data?.plans;
    } catch (error) {
      throw wrapCloudCapiError(error);
    }
  }

  /**
   * Create free subscription
   * @param credentials
   * @param dto
   */
  async createFreeSubscription(
    credentials: ICloudCapiCredentials,
    dto: CreateFreeCloudSubscriptionDto,
  ): Promise<ICloudCapiTask> {
    try {
      const { data } = await this.api.post(
        `${CloudCapiProvider.getPrefix(CloudSubscriptionType.Fixed)}/subscriptions`,
        {
          name: dto.name,
          planId: dto.planId,
          paymentMethodId: null,
        },
        CloudCapiProvider.getHeaders(credentials),
      );

      return data;
    } catch (error) {
      throw wrapCloudCapiError(error);
    }
  }
}
