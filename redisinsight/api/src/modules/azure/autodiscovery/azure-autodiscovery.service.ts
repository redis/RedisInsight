import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PromisePool } from '@supercharge/promise-pool';
import { AzureAuthService } from '../auth/azure-auth.service';
import {
  AZURE_API_BASE,
  AUTODISCOVERY_MAX_CONCURRENT_REQUESTS,
  AZURE_SUBSCRIPTION_ID_REGEX,
  AzureApiUrls,
  AzureRedisType,
  AzureAuthType,
} from '../constants';
import {
  AzureSubscription,
  AzureRedisDatabase,
  AzureConnectionDetails,
} from '../models';

@Injectable()
export class AzureAutodiscoveryService {
  private readonly logger = new Logger(AzureAutodiscoveryService.name);

  constructor(private readonly authService: AzureAuthService) {}

  private isValidSubscriptionId(subscriptionId: string): boolean {
    return !!subscriptionId && AZURE_SUBSCRIPTION_ID_REGEX.test(subscriptionId);
  }

  private async getAuthenticatedClient(
    accountId: string,
  ): Promise<AxiosInstance | null> {
    const tokenResult =
      await this.authService.getManagementTokenByAccountId(accountId);

    if (!tokenResult) {
      this.logger.warn('No valid management token available');
      return null;
    }

    return axios.create({
      baseURL: AZURE_API_BASE,
      headers: {
        Authorization: `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async listSubscriptions(accountId: string): Promise<AzureSubscription[]> {
    const client = await this.getAuthenticatedClient(accountId);

    if (!client) {
      return [];
    }

    try {
      const response = await client.get(AzureApiUrls.getSubscriptions());

      return (response.data.value || []).map((sub: any) => ({
        subscriptionId: sub.subscriptionId,
        displayName: sub.displayName,
        state: sub.state,
      }));
    } catch (error: any) {
      this.logger.warn('Failed to list subscriptions', error?.message);
      return [];
    }
  }

  async listDatabasesInSubscription(
    accountId: string,
    subscriptionId: string,
  ): Promise<AzureRedisDatabase[]> {
    if (!this.isValidSubscriptionId(subscriptionId)) {
      this.logger.warn(`Invalid subscription ID format: ${subscriptionId}`);
      return [];
    }

    const client = await this.getAuthenticatedClient(accountId);

    if (!client) {
      return [];
    }

    const [standardDatabases, enterpriseDatabases] = await Promise.all([
      this.fetchStandardRedis(client, subscriptionId),
      this.fetchEnterpriseRedis(client, subscriptionId),
    ]);

    return [...standardDatabases, ...enterpriseDatabases];
  }

  async getConnectionDetails(
    accountId: string,
    databaseId: string,
  ): Promise<AzureConnectionDetails | null> {
    const database = await this.findDatabaseById(accountId, databaseId);

    if (!database) {
      this.logger.warn(`Database not found: ${databaseId}`);
      return null;
    }

    // Try Entra ID first
    const entraIdDetails = await this.getEntraIdConnectionDetails(
      accountId,
      database,
    );

    if (entraIdDetails) {
      return entraIdDetails;
    }

    // Fall back to Access Key
    this.logger.debug('Entra ID auth failed, falling back to Access Key');

    const client = await this.getAuthenticatedClient(accountId);

    if (!client) {
      return null;
    }

    return this.getAccessKeyConnectionDetails(client, database);
  }

  private async findDatabaseById(
    accountId: string,
    resourceId: string,
  ): Promise<AzureRedisDatabase | null> {
    if (!resourceId) {
      return null;
    }

    // Extract subscription ID from resource ID
    // Format: /subscriptions/{subscriptionId}/resourceGroups/...
    const subscriptionMatch = resourceId.match(/^\/subscriptions\/([^/]+)\//i);

    if (!subscriptionMatch) {
      this.logger.warn(`Invalid resource ID format: ${resourceId}`);
      return null;
    }

    const subscriptionId = subscriptionMatch[1];
    const databases = await this.listDatabasesInSubscription(
      accountId,
      subscriptionId,
    );

    // Azure resource IDs are case-insensitive
    const resourceIdLower = resourceId.toLowerCase();
    return (
      databases.find((db) => db.id.toLowerCase() === resourceIdLower) || null
    );
  }

  private async fetchStandardRedis(
    client: AxiosInstance,
    subscriptionId: string,
  ): Promise<AzureRedisDatabase[]> {
    try {
      const response = await client.get(
        AzureApiUrls.getStandardRedisInSubscription(subscriptionId),
      );

      return (response.data.value || []).map((redis: any) =>
        this.mapStandardRedis(redis, subscriptionId),
      );
    } catch (error: any) {
      this.logger.warn(
        `Failed to list standard Redis in subscription ${subscriptionId}`,
        error?.message,
      );
      return [];
    }
  }

  private async fetchEnterpriseRedis(
    client: AxiosInstance,
    subscriptionId: string,
  ): Promise<AzureRedisDatabase[]> {
    try {
      const response = await client.get(
        AzureApiUrls.getEnterpriseRedisInSubscription(subscriptionId),
      );

      const clusters = response.data.value || [];

      if (clusters.length === 0) {
        return [];
      }

      const { results } = await PromisePool.for(clusters)
        .withConcurrency(AUTODISCOVERY_MAX_CONCURRENT_REQUESTS)
        .handleError((error, cluster: any) => {
          this.logger.warn(
            `Failed to fetch databases for cluster ${cluster?.name}`,
            error?.message,
          );
        })
        .process((cluster: any) =>
          this.listEnterpriseDatabases(client, cluster, subscriptionId),
        );

      return results.flat();
    } catch (error: any) {
      this.logger.warn(
        `Failed to list enterprise Redis in subscription ${subscriptionId}`,
        error?.message,
      );
      return [];
    }
  }

  private mapStandardRedis(
    redis: any,
    subscriptionId: string,
  ): AzureRedisDatabase {
    const resourceGroup = this.extractResourceGroup(redis.id);

    return {
      id: redis.id,
      name: redis.name,
      subscriptionId,
      resourceGroup,
      location: redis.location,
      type: AzureRedisType.Standard,
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
    subscriptionId: string,
  ): Promise<AzureRedisDatabase[]> {
    const resourceGroup = this.extractResourceGroup(cluster.id);
    const databases: AzureRedisDatabase[] = [];

    try {
      const dbResponse = await client.get(
        AzureApiUrls.getEnterpriseDatabases(
          subscriptionId,
          resourceGroup,
          cluster.name,
        ),
      );

      for (const db of dbResponse.data.value || []) {
        const normalizedLocation = cluster.location
          .toLowerCase()
          .replace(/\s+/g, '');

        const host =
          cluster.hostName ||
          cluster.properties?.hostName ||
          (db.properties?.clusteringPolicy === 'EnterpriseCluster'
            ? `${cluster.name}.${normalizedLocation}.redisenterprise.cache.azure.net`
            : `${cluster.name}-${db.name}.${normalizedLocation}.redisenterprise.cache.azure.net`);

        databases.push({
          id: db.id,
          name: `${cluster.name}/${db.name}`,
          subscriptionId,
          resourceGroup,
          location: cluster.location,
          type: AzureRedisType.Enterprise,
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

  private async getAccessKeyConnectionDetails(
    client: AxiosInstance,
    database: AzureRedisDatabase,
  ): Promise<AzureConnectionDetails | null> {
    try {
      let keysUrl: string;

      if (database.type === AzureRedisType.Standard) {
        keysUrl = AzureApiUrls.postStandardRedisKeys(
          database.subscriptionId,
          database.resourceGroup,
          database.name,
        );
      } else {
        const [clusterName, databaseName = 'default'] =
          database.name.split('/');
        this.logger.debug(
          `Fetching enterprise keys for cluster=${clusterName}, database=${databaseName}`,
        );
        keysUrl = AzureApiUrls.postEnterpriseRedisKeys(
          database.subscriptionId,
          database.resourceGroup,
          clusterName,
          databaseName,
        );
      }

      const response = await client.post(keysUrl);
      const primaryKey =
        response.data.primaryKey || response.data.keys?.[0]?.value;

      if (!primaryKey) {
        this.logger.warn(
          `No access key found in response for ${database.name}`,
        );
        return null;
      }

      return {
        host: database.host,
        port: this.getTlsPort(database),
        password: primaryKey,
        tls: true,
        authType: AzureAuthType.AccessKey,
        subscriptionId: database.subscriptionId,
        resourceGroup: database.resourceGroup,
        resourceId: database.id,
      };
    } catch (error: any) {
      this.logger.warn(
        `Failed to get access keys for ${database.name}`,
        error?.message,
      );
      return null;
    }
  }

  private async getEntraIdConnectionDetails(
    accountId: string,
    database: AzureRedisDatabase,
  ): Promise<AzureConnectionDetails | null> {
    const tokenResult =
      await this.authService.getRedisTokenByAccountId(accountId);

    if (!tokenResult) {
      this.logger.debug(
        `No Redis token available for Entra ID auth on ${database.name}`,
      );
      return null;
    }

    const port = this.getTlsPort(database);
    this.logger.debug(
      `Using Entra ID auth for ${database.name} (type=${database.type}, port=${port})`,
    );

    return {
      host: database.host,
      port,
      username: tokenResult.account.localAccountId,
      tls: true,
      authType: AzureAuthType.EntraId,
      azureAccountId: accountId,
      subscriptionId: database.subscriptionId,
      resourceGroup: database.resourceGroup,
      resourceId: database.id,
    };
  }

  private getTlsPort(database: AzureRedisDatabase): number {
    // Standard Redis uses sslPort (6380) for TLS, Enterprise uses port (10000)
    if (database.type === AzureRedisType.Standard) {
      return database.sslPort || 6380;
    }
    return database.port;
  }
}
