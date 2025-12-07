import { Injectable } from '@nestjs/common';
import { CloudCapiProvider } from 'src/modules/cloud/common/providers/cloud.capi.provider';
import {
  ICloudCapiDatabase,
  ICloudCapiSubscriptionDatabases,
  ICloudCapiDatabaseTag,
} from 'src/modules/cloud/database/models';
import { ICloudCapiCredentials } from 'src/modules/cloud/common/models';
import {
  CreateFreeCloudDatabaseDto,
  GetCloudSubscriptionDatabaseDto,
  GetCloudSubscriptionDatabasesDto,
} from 'src/modules/cloud/database/dto';
import { wrapCloudCapiError } from 'src/modules/cloud/common/exceptions';
import { ICloudCapiTask } from 'src/modules/cloud/task/models';

@Injectable()
export class CloudDatabaseCapiProvider extends CloudCapiProvider {
  /**
   * Get single database details
   * @param credentials
   * @param dto
   */
  async getDatabase(
    credentials: ICloudCapiCredentials,
    dto: GetCloudSubscriptionDatabaseDto,
  ): Promise<ICloudCapiDatabase> {
    try {
      const { subscriptionId, databaseId, subscriptionType } = dto;

      const { data } = await this.api.get(
        `${CloudCapiProvider.getPrefix(subscriptionType)}/subscriptions/${subscriptionId}/databases/${databaseId}`,
        CloudCapiProvider.getHeaders(credentials),
      );

      return data;
    } catch (e) {
      throw wrapCloudCapiError(e);
    }
  }

  /**
   * Get list of databases for subscription
   * @param credentials
   * @param dto
   */
  async getDatabases(
    credentials: ICloudCapiCredentials,
    dto: GetCloudSubscriptionDatabasesDto,
  ): Promise<ICloudCapiSubscriptionDatabases> {
    try {
      const { subscriptionId, subscriptionType } = dto;

      const { data } = await this.api.get(
        `${CloudCapiProvider.getPrefix(subscriptionType)}/subscriptions/${subscriptionId}/databases`,
        CloudCapiProvider.getHeaders(credentials),
      );

      return data;
    } catch (e) {
      throw wrapCloudCapiError(e);
    }
  }

  /**
   * Get single database details
   * @param credentials
   * @param dto
   */
  async createFreeDatabase(
    credentials: ICloudCapiCredentials,
    dto: CreateFreeCloudDatabaseDto,
  ): Promise<ICloudCapiTask> {
    try {
      const { subscriptionId, subscriptionType, ...createDto } = dto;

      const { data } = await this.api.post(
        `${CloudCapiProvider.getPrefix(subscriptionType)}/subscriptions/${subscriptionId}/databases`,
        createDto,
        CloudCapiProvider.getHeaders(credentials),
      );

      return data;
    } catch (e) {
      throw wrapCloudCapiError(e);
    }
  }

  /**
   * Get single database tags
   * @param credentials
   * @param dto
   */
  async getDatabaseTags(
    credentials: ICloudCapiCredentials,
    dto: GetCloudSubscriptionDatabaseDto,
  ): Promise<ICloudCapiDatabaseTag[]> {
    try {
      const { subscriptionId, databaseId, subscriptionType } = dto;

      const response = await this.api.get(
        `${CloudCapiProvider.getPrefix(subscriptionType)}/subscriptions/${subscriptionId}/databases/${databaseId}/tags`,
        CloudCapiProvider.getHeaders(credentials),
      );
      const tags: ICloudCapiDatabaseTag[] = response.data?.tags || [];

      return tags;
    } catch (e) {
      // failed to get tags
      return [];
    }
  }
}
