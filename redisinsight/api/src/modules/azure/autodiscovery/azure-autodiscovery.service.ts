import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PromisePool } from '@supercharge/promise-pool';
import { AzureAuthService } from '../auth/azure-auth.service';
import { AzureAutodiscoveryAnalytics } from './azure-autodiscovery.analytics';
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
import { DatabaseService } from 'src/modules/database/database.service';
import { ActionStatus, SessionMetadata } from 'src/common/models';
import { HostingProvider } from 'src/modules/database/entities/database.entity';
import { CloudProvider } from 'src/modules/database/models/provider-details';
import { ImportAzureDatabaseDto, ImportAzureDatabaseResponse } from './dto';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { AzureEntraIdTokenExpiredException } from '../exceptions';

@Injectable()
export class AzureAutodiscoveryService {
  private readonly logger = new Logger(AzureAutodiscoveryService.name);

  constructor(
    private readonly authService: AzureAuthService,
    private readonly databaseService: DatabaseService,
    private readonly analytics: AzureAutodiscoveryAnalytics,
  ) {}

  /**
   * Maps raw error messages to user-friendly messages
   */
  private getUserFriendlyErrorMessage(error: Error): string {
    const message = error?.message?.toLowerCase() || '';

    if (
      message.includes('wrongpass') ||
      message.includes('noauth') ||
      message.includes('please check the username or password')
    ) {
      return ERROR_MESSAGES.AZURE_ENTRA_ID_AUTH_FAILED;
    }

    if (message.includes('please check the ca or client certificate')) {
      return ERROR_MESSAGES.AZURE_TLS_CERTIFICATE_ERROR;
    }

    return error?.message || ERROR_MESSAGES.AZURE_UNEXPECTED_ERROR;
  }

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

  /**
   * Fetches all pages from a paginated Azure API endpoint.
   * Azure REST APIs return paginated results with a `nextLink` property when
   * there are more items than fit in a single response (typically 1000+ items).
   * @see https://learn.microsoft.com/en-us/rest/api/azure/#async-operations-throttling-and-paging
   */
  private async fetchAllPages<T>(
    client: AxiosInstance,
    initialUrl: string,
  ): Promise<T[]> {
    const allItems: T[] = [];
    let url: string | null = initialUrl;

    while (url) {
      const response = await client.get(url);
      allItems.push(...(response.data.value || []));
      url = response.data.nextLink || null;
    }

    return allItems;
  }

  async listSubscriptions(accountId: string): Promise<AzureSubscription[]> {
    const client = await this.getAuthenticatedClient(accountId);

    if (!client) {
      throw new BadRequestException('Failed to get authenticated client');
    }

    const subscriptions = await this.fetchAllPages<any>(
      client,
      AzureApiUrls.getSubscriptions(),
    );

    return subscriptions.map((sub: any) => ({
      subscriptionId: sub.subscriptionId,
      displayName: sub.displayName,
      state: sub.state,
    }));
  }

  async listDatabasesInSubscription(
    accountId: string,
    subscriptionId: string,
  ): Promise<AzureRedisDatabase[]> {
    if (!this.isValidSubscriptionId(subscriptionId)) {
      throw new BadRequestException(
        `Invalid subscription ID format: ${subscriptionId}`,
      );
    }

    const client = await this.getAuthenticatedClient(accountId);

    if (!client) {
      throw new BadRequestException('Failed to get authenticated client');
    }

    const results = await Promise.allSettled([
      this.fetchStandardRedis(client, subscriptionId),
      this.fetchEnterpriseRedis(client, subscriptionId),
    ]);

    const databases: AzureRedisDatabase[] = [];
    const errors: Error[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        databases.push(...result.value);
      } else {
        errors.push(result.reason);
      }
    });

    errors.forEach((error) => {
      this.logger.error('Failed to fetch some Azure databases', error);
    });

    if (databases.length === 0 && errors.length > 0) {
      throw errors[0];
    }

    return databases;
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

    // Use Entra ID authentication (Microsoft's recommended approach)
    // Access Keys support will be added in a future update with proper UX
    return this.getEntraIdConnectionDetails(accountId, database);
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
    const redisInstances = await this.fetchAllPages<any>(
      client,
      AzureApiUrls.getStandardRedisInSubscription(subscriptionId),
    );

    return redisInstances.map((redis: any) =>
      this.mapStandardRedis(redis, subscriptionId),
    );
  }

  private async fetchEnterpriseRedis(
    client: AxiosInstance,
    subscriptionId: string,
  ): Promise<AzureRedisDatabase[]> {
    const clusters = await this.fetchAllPages<any>(
      client,
      AzureApiUrls.getEnterpriseRedisInSubscription(subscriptionId),
    );

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

    try {
      const dbs = await this.fetchAllPages<any>(
        client,
        AzureApiUrls.getEnterpriseDatabases(
          subscriptionId,
          resourceGroup,
          cluster.name,
        ),
      );

      return dbs.map((db: any) => {
        const normalizedLocation = cluster.location
          .toLowerCase()
          .replace(/\s+/g, '');

        const host =
          cluster.hostName ||
          cluster.properties?.hostName ||
          (db.properties?.clusteringPolicy === 'EnterpriseCluster'
            ? `${cluster.name}.${normalizedLocation}.redisenterprise.cache.azure.net`
            : `${cluster.name}-${db.name}.${normalizedLocation}.redisenterprise.cache.azure.net`);

        return {
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
        };
      });
    } catch (error: any) {
      this.logger.warn(
        `Failed to list databases in cluster ${cluster.name}`,
        error?.message,
      );
      return [];
    }
  }

  private extractResourceGroup(resourceId: string): string {
    const match = resourceId.match(/resourceGroups\/([^/]+)/i);
    return match ? match[1] : '';
  }

  /**
   * Fetches the primary access key for an Azure Redis resource.
   * Works for both Standard and Enterprise Redis types.
   *
   * @param accountId - MSAL account ID for authentication
   * @param subscriptionId - Azure subscription ID
   * @param resourceGroup - Azure resource group name
   * @param resourceName - Redis cache name
   * @param resourceType - Standard or Enterprise Redis
   * @param clusterName - Required for Enterprise Redis databases
   * @returns The primary access key
   */
  async getAccessKey(
    accountId: string,
    subscriptionId: string,
    resourceGroup: string,
    resourceName: string,
    resourceType: AzureRedisType,
    clusterName?: string,
  ): Promise<string> {
    const client = await this.getAuthenticatedClient(accountId);

    if (!client) {
      throw new AzureEntraIdTokenExpiredException(
        'Azure session expired. Please re-authenticate with Azure to access this database.',
      );
    }

    const url =
      resourceType === AzureRedisType.Enterprise
        ? AzureApiUrls.postEnterpriseRedisKeys(
            subscriptionId,
            resourceGroup,
            clusterName!,
            resourceName,
          )
        : AzureApiUrls.postStandardRedisKeys(
            subscriptionId,
            resourceGroup,
            resourceName,
          );

    this.logger.debug(
      `Fetching access key for ${resourceType} Redis: ${resourceName}`,
    );

    const { data } = await client.post(url);

    // Both Standard and Enterprise Redis return: { primaryKey, secondaryKey }
    return data.primaryKey;
  }

  /**
   * Extracts the resource name and cluster name from an Azure database.
   * For Standard Redis: resourceName is the cache name
   * For Enterprise Redis: name is "clusterName/databaseName", so we extract both
   */
  private extractResourceNames(database: AzureRedisDatabase): {
    resourceName: string;
    clusterName?: string;
  } {
    if (database.type === AzureRedisType.Enterprise) {
      // Enterprise database names are in format "clusterName/databaseName"
      const parts = database.name.split('/');
      return {
        resourceName: parts[1] || 'default',
        clusterName: parts[0],
      };
    }
    return { resourceName: database.name };
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
    const { resourceName, clusterName } = this.extractResourceNames(database);

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
      resourceName,
      resourceType: database.type,
      clusterName,
    };
  }

  private getTlsPort(database: AzureRedisDatabase): number {
    // Standard Redis uses sslPort (6380) for TLS
    // Enterprise Redis uses port 10000 for BOTH TLS and non-TLS connections
    // See: https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/cache-tls-configuration
    if (database.type === AzureRedisType.Standard) {
      return database.sslPort || 6380;
    }
    return database.port || 10000;
  }

  /**
   * Get connection details for Access Key authentication.
   * Unlike Entra ID, this only requires database metadata - no Redis token needed.
   * The Access Key is fetched dynamically at connection time by the credential strategy.
   */
  private getAccessKeyConnectionDetails(
    accountId: string,
    database: AzureRedisDatabase,
  ): AzureConnectionDetails {
    const port = this.getTlsPort(database);
    const { resourceName, clusterName } = this.extractResourceNames(database);

    this.logger.debug(
      `Using Access Key auth for ${database.name} (type=${database.type}, port=${port})`,
    );

    return {
      host: database.host,
      port,
      tls: true,
      authType: AzureAuthType.AccessKey,
      azureAccountId: accountId,
      subscriptionId: database.subscriptionId,
      resourceGroup: database.resourceGroup,
      resourceId: database.id,
      resourceName,
      resourceType: database.type,
      clusterName,
    };
  }

  /**
   * Get connection details based on authentication type.
   * - Entra ID: Requires Redis token, returns null if unavailable
   * - Access Key: Only needs database metadata, never returns null
   */
  private async getConnectionDetailsForAuthType(
    accountId: string,
    database: AzureRedisDatabase,
    authType: AzureAuthType,
  ): Promise<AzureConnectionDetails | null> {
    if (authType === AzureAuthType.AccessKey) {
      return this.getAccessKeyConnectionDetails(accountId, database);
    }
    return this.getEntraIdConnectionDetails(accountId, database);
  }

  /**
   * Add Azure databases from autodiscovery
   * Fetches connection details and creates databases
   */
  async addDatabases(
    sessionMetadata: SessionMetadata,
    accountId: string,
    databases: ImportAzureDatabaseDto[],
  ): Promise<ImportAzureDatabaseResponse[]> {
    this.logger.debug(
      `Adding ${databases.length} Azure database(s) for account ${accountId}`,
    );

    return Promise.all(
      databases.map(async (dto): Promise<ImportAzureDatabaseResponse> => {
        let database: AzureRedisDatabase | null = null;

        // Use authType from DTO if provided, otherwise default to Entra ID
        const selectedAuthType = dto.authType || AzureAuthType.EntraId;

        try {
          this.logger.debug(`[${dto.id}] Fetching database details...`);

          database = await this.findDatabaseById(accountId, dto.id);

          if (!database) {
            this.logger.debug(`[${dto.id}] Database not found`);
            this.analytics.sendAzureDatabaseAddFailed(
              sessionMetadata,
              new BadRequestException(ERROR_MESSAGES.AZURE_DATABASE_NOT_FOUND),
              undefined,
              selectedAuthType,
            );
            return {
              id: dto.id,
              status: ActionStatus.Fail,
              message: ERROR_MESSAGES.AZURE_DATABASE_NOT_FOUND,
            };
          }

          const connectionDetails = await this.getConnectionDetailsForAuthType(
            accountId,
            database,
            selectedAuthType,
          );

          if (!connectionDetails) {
            this.logger.debug(
              `[${dto.id}] Failed to get connection details - no details returned`,
            );
            this.analytics.sendAzureDatabaseAddFailed(
              sessionMetadata,
              new BadRequestException(
                ERROR_MESSAGES.AZURE_FAILED_TO_GET_CONNECTION_DETAILS,
              ),
              database.type,
              selectedAuthType,
            );
            return {
              id: dto.id,
              status: ActionStatus.Fail,
              message: ERROR_MESSAGES.AZURE_FAILED_TO_GET_CONNECTION_DETAILS,
            };
          }

          this.logger.debug(
            `[${dto.id}] Connection details: host=${connectionDetails.host}, port=${connectionDetails.port}, tls=${connectionDetails.tls}, authType=${selectedAuthType}`,
          );

          const providerDetails = {
            provider: CloudProvider.Azure,
            authType: selectedAuthType,
            azureAccountId: connectionDetails.azureAccountId,
            subscriptionId: connectionDetails.subscriptionId,
            resourceGroup: connectionDetails.resourceGroup,
            resourceName: connectionDetails.resourceName,
            resourceType: connectionDetails.resourceType,
            clusterName: connectionDetails.clusterName,
          };

          const provider =
            database.type === AzureRedisType.Enterprise
              ? HostingProvider.AZURE_CACHE_REDIS_ENTERPRISE
              : HostingProvider.AZURE_CACHE;

          this.logger.debug(
            `[${dto.id}] Creating database: name=${database.name}, type=${database.type}, provider=${provider}`,
          );

          await this.databaseService.create(sessionMetadata, {
            host: connectionDetails.host,
            port: connectionDetails.port,
            name: database.name,
            nameFromProvider: database.name,
            username: connectionDetails.username,
            password: connectionDetails.password,
            tls: connectionDetails.tls,
            provider,
            providerDetails,
          });

          this.logger.debug(`[${dto.id}] Successfully added database`);
          this.analytics.sendAzureDatabaseAdded(
            sessionMetadata,
            database.type,
            selectedAuthType,
          );

          return {
            id: dto.id,
            status: ActionStatus.Success,
          };
        } catch (error) {
          this.logger.error(
            `[${dto.id}] Failed to add database: ${error.message}`,
          );
          this.analytics.sendAzureDatabaseAddFailed(
            sessionMetadata,
            new BadRequestException(this.getUserFriendlyErrorMessage(error)),
            database?.type,
            selectedAuthType,
          );
          return {
            id: dto.id,
            status: ActionStatus.Fail,
            message: this.getUserFriendlyErrorMessage(error),
          };
        }
      }),
    );
  }
}
