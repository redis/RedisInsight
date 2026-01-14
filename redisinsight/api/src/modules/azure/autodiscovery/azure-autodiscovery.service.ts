import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { AzureAuthService } from '../auth/azure-auth.service';
import {
  AZURE_API_BASE,
  API_VERSION_SUBSCRIPTIONS,
  API_VERSION_REDIS,
  API_VERSION_REDIS_ENTERPRISE,
} from '../constants';
import {
  AzureSubscription,
  AzureRedisDatabase,
  AzureConnectionDetails,
} from '../models/azure-resource.models';

const DEFAULT_SESSION_ID = 'default';

@Injectable()
export class AzureAutodiscoveryService {
  private readonly logger = new Logger(AzureAutodiscoveryService.name);

  constructor(private readonly authService: AzureAuthService) {}

  private async getAuthenticatedClient(): Promise<AxiosInstance | null> {
    const token =
      await this.authService.getValidAccessToken(DEFAULT_SESSION_ID);

    if (!token) {
      this.logger.warn('No valid access token available');
      return null;
    }

    return axios.create({
      baseURL: AZURE_API_BASE,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * List all Azure subscriptions
   */
  async listSubscriptions(): Promise<AzureSubscription[]> {
    const client = await this.getAuthenticatedClient();

    if (!client) {
      return [];
    }

    try {
      const response = await client.get(
        `/subscriptions?api-version=${API_VERSION_SUBSCRIPTIONS}`,
      );

      return (response.data.value || []).map((sub: any) => ({
        subscriptionId: sub.subscriptionId,
        displayName: sub.displayName,
        state: sub.state,
      }));
    } catch (error: any) {
      this.logger.error('Failed to list subscriptions', error?.message);
      return [];
    }
  }

  /**
   * List all Redis databases across all subscriptions
   */
  async listDatabases(): Promise<AzureRedisDatabase[]> {
    const subscriptions = await this.listSubscriptions();
    const databases: AzureRedisDatabase[] = [];

    for (const sub of subscriptions) {
      const subDatabases = await this.listDatabasesInSubscription(sub);
      databases.push(...subDatabases);
    }

    return databases;
  }

  /**
   * List Redis databases in a specific subscription
   */
  async listDatabasesInSubscription(
    subscription: AzureSubscription,
  ): Promise<AzureRedisDatabase[]> {
    const client = await this.getAuthenticatedClient();

    if (!client) {
      return [];
    }

    const databases: AzureRedisDatabase[] = [];

    // Fetch standard Azure Cache for Redis
    try {
      const standardResponse = await client.get(
        `/subscriptions/${subscription.subscriptionId}/providers/Microsoft.Cache/redis?api-version=${API_VERSION_REDIS}`,
      );

      for (const redis of standardResponse.data.value || []) {
        databases.push(this.mapStandardRedis(redis, subscription));
      }
    } catch (error: any) {
      this.logger.warn(
        `Failed to list standard Redis in ${subscription.displayName}`,
        error?.message,
      );
    }

    // Fetch Azure Managed Redis / Redis Enterprise
    try {
      const enterpriseResponse = await client.get(
        `/subscriptions/${subscription.subscriptionId}/providers/Microsoft.Cache/redisEnterprise?api-version=${API_VERSION_REDIS_ENTERPRISE}`,
      );

      for (const cluster of enterpriseResponse.data.value || []) {
        const clusterDatabases = await this.listEnterpriseDatabases(
          client,
          cluster,
          subscription,
        );
        databases.push(...clusterDatabases);
      }
    } catch (error: any) {
      this.logger.warn(
        `Failed to list enterprise Redis in ${subscription.displayName}`,
        error?.message,
      );
    }

    return databases;
  }

  private mapStandardRedis(
    redis: any,
    subscription: AzureSubscription,
  ): AzureRedisDatabase {
    const resourceGroup = this.extractResourceGroup(redis.id);

    return {
      id: redis.id,
      name: redis.name,
      subscriptionId: subscription.subscriptionId,
      subscriptionName: subscription.displayName,
      resourceGroup,
      location: redis.location,
      type: 'standard',
      host:
        redis.properties?.hostName || `${redis.name}.redis.cache.windows.net`,
      port: redis.properties?.port || 6379,
      sslPort: redis.properties?.sslPort || 6380,
      provisioningState: redis.properties?.provisioningState,
      sku: redis.properties?.sku,
    };
  }

  private async listEnterpriseDatabases(
    client: AxiosInstance,
    cluster: any,
    subscription: AzureSubscription,
  ): Promise<AzureRedisDatabase[]> {
    const resourceGroup = this.extractResourceGroup(cluster.id);
    const databases: AzureRedisDatabase[] = [];

    try {
      const dbResponse = await client.get(
        `/subscriptions/${subscription.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Cache/redisEnterprise/${cluster.name}/databases?api-version=${API_VERSION_REDIS_ENTERPRISE}`,
      );

      for (const db of dbResponse.data.value || []) {
        // Azure location needs to be normalized (lowercase, no spaces)
        const normalizedLocation = cluster.location
          .toLowerCase()
          .replace(/\s+/g, '');

        // Use hostName from cluster properties if available
        const host =
          cluster.hostName ||
          cluster.properties?.hostName ||
          (db.properties?.clusteringPolicy === 'EnterpriseCluster'
            ? `${cluster.name}.${normalizedLocation}.redisenterprise.cache.azure.net`
            : `${cluster.name}-${db.name}.${normalizedLocation}.redisenterprise.cache.azure.net`);

        databases.push({
          id: db.id,
          name: `${cluster.name}/${db.name}`,
          subscriptionId: subscription.subscriptionId,
          subscriptionName: subscription.displayName,
          resourceGroup,
          location: cluster.location,
          type: 'enterprise',
          host,
          port: db.properties?.port || 10000,
          provisioningState: db.properties?.provisioningState,
          sku: cluster.sku,
          accessKeysAuthentication: db.properties?.accessKeysAuthentication,
        });
      }
    } catch (error: any) {
      this.logger.warn(
        `Failed to list databases in cluster ${cluster.name}`,
        error?.message,
      );
    }

    return databases;
  }

  private extractResourceGroup(resourceId: string): string {
    const match = resourceId.match(/resourceGroups\/([^/]+)/i);
    return match ? match[1] : '';
  }

  /**
   * Get connection details for a database
   */
  async getConnectionDetails(
    database: AzureRedisDatabase,
  ): Promise<AzureConnectionDetails | null> {
    const client = await this.getAuthenticatedClient();

    if (!client) {
      return null;
    }

    // For enterprise with access keys disabled, use Entra ID
    if (
      database.type === 'enterprise' &&
      database.accessKeysAuthentication === 'Disabled'
    ) {
      return this.getEntraIdConnectionDetails(database);
    }

    // Otherwise, get access keys
    return this.getAccessKeyConnectionDetails(client, database);
  }

  private async getAccessKeyConnectionDetails(
    client: AxiosInstance,
    database: AzureRedisDatabase,
  ): Promise<AzureConnectionDetails | null> {
    try {
      let keysUrl: string;

      if (database.type === 'standard') {
        keysUrl = `/subscriptions/${database.subscriptionId}/resourceGroups/${database.resourceGroup}/providers/Microsoft.Cache/redis/${database.name}/listKeys?api-version=${API_VERSION_REDIS}`;
      } else {
        // Enterprise: extract cluster name and db name
        const [clusterName] = database.name.split('/');
        keysUrl = `/subscriptions/${database.subscriptionId}/resourceGroups/${database.resourceGroup}/providers/Microsoft.Cache/redisEnterprise/${clusterName}/databases/default/listKeys?api-version=${API_VERSION_REDIS_ENTERPRISE}`;
      }

      const response = await client.post(keysUrl);
      const primaryKey =
        response.data.primaryKey || response.data.keys?.[0]?.value;

      return {
        host: database.host,
        port:
          database.type === 'standard'
            ? database.sslPort || 6380
            : database.port,
        password: primaryKey,
        tls: true,
        authType: 'accessKey',
        subscriptionId: database.subscriptionId,
        subscriptionName: database.subscriptionName,
        resourceGroup: database.resourceGroup,
        resourceId: database.id,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to get access keys for ${database.name}`,
        error?.message,
      );
      return null;
    }
  }

  private async getEntraIdConnectionDetails(
    database: AzureRedisDatabase,
  ): Promise<AzureConnectionDetails | null> {
    const session = this.authService.getSession(DEFAULT_SESSION_ID);

    if (!session) {
      this.logger.error('No session found for Entra ID auth');
      return null;
    }

    const redisTokenResult =
      await this.authService.getRedisToken(DEFAULT_SESSION_ID);

    if (!redisTokenResult) {
      this.logger.error('Failed to get Redis token for Entra ID auth');
      return null;
    }

    return {
      host: database.host,
      port: database.port,
      password: redisTokenResult.token,
      username: session.user.oid,
      tls: true,
      authType: 'entraId',
      tokenExpiresAt: redisTokenResult.expiresOn.toISOString(),
      azureAccountId: session.user.homeAccountId,
      subscriptionId: database.subscriptionId,
      subscriptionName: database.subscriptionName,
      resourceGroup: database.resourceGroup,
      resourceId: database.id,
    };
  }
}
