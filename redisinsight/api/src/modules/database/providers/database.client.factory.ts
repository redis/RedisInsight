import { Injectable, Logger, Optional } from '@nestjs/common';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import { DatabaseService } from 'src/modules/database/database.service';
import { ConnectionType } from 'src/modules/database/entities/database.entity';
import { ClientMetadata } from 'src/common/models';
import { RedisClient } from 'src/modules/redis/client';
import {
  IRedisConnectionOptions,
  RedisClientFactory,
} from 'src/modules/redis/redis.client.factory';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';
import {
  RedisConnectionFailedException,
  RedisConnectionUnauthorizedException,
} from 'src/modules/redis/exceptions/connection';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseConnectionEvent } from 'src/modules/database/constants/events';
import { AzureAutodiscoveryService } from 'src/modules/azure/autodiscovery/azure-autodiscovery.service';
import { Database } from 'src/modules/database/models/database';

type IsClientConnectingMap = {
  [key: string]: boolean;
};

type PendingGetByClientIdMap = {
  [key: string]: {
    resolve: (value: RedisClient) => void;
    reject: (reason?: any) => void;
  }[];
};

@Injectable()
export class DatabaseClientFactory {
  private logger = new Logger('DatabaseClientFactory');

  private isConnecting: IsClientConnectingMap = {};

  private pendingGetClient: PendingGetByClientIdMap = {};

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly repository: DatabaseRepository,
    private readonly analytics: DatabaseAnalytics,
    private readonly redisClientStorage: RedisClientStorage,
    private readonly redisClientFactory: RedisClientFactory,
    private readonly eventEmitter: EventEmitter2,
    @Optional()
    private readonly azureAutodiscoveryService?: AzureAutodiscoveryService,
  ) {}

  /**
   * Check if host matches Azure Redis patterns
   */
  private isAzureHost(host: string): boolean {
    return (
      host.endsWith('.redis.cache.windows.net') ||
      host.endsWith('.redisenterprise.cache.azure.net') ||
      host.endsWith('.redis.azure.net')
    );
  }

  /**
   * Try to refresh Azure credentials for a database
   * Returns updated database if successful, null otherwise
   */
  private async tryRefreshAzureCredentials(
    clientMetadata: ClientMetadata,
    database: Database,
  ): Promise<Database | null> {
    if (!this.azureAutodiscoveryService || !this.isAzureHost(database.host)) {
      return null;
    }

    this.logger.warn(
      `Attempting to refresh Azure credentials for ${database.host}`,
    );

    try {
      // Find the database in Azure by host
      const azureDatabases =
        await this.azureAutodiscoveryService.listDatabases();
      const azureDb = azureDatabases.find((db) => db.host === database.host);

      if (!azureDb) {
        this.logger.warn(
          `Database ${database.host} not found in Azure subscriptions`,
        );
        return null;
      }

      // Get fresh connection details
      const connectionDetails =
        await this.azureAutodiscoveryService.getConnectionDetails(azureDb);

      if (!connectionDetails) {
        this.logger.warn(
          `Failed to get connection details for ${database.host}`,
        );
        return null;
      }

      // Update database with new credentials
      await this.repository.update(
        clientMetadata.sessionMetadata,
        database.id,
        {
          password: connectionDetails.password,
          username: connectionDetails.username,
        },
      );

      this.logger.log(
        `Successfully refreshed Azure credentials for ${database.host}`,
      );

      // Return updated database
      return {
        ...database,
        password: connectionDetails.password,
        username: connectionDetails.username,
      };
    } catch (error) {
      this.logger.error(
        `Failed to refresh Azure credentials for ${database.host}`,
        error,
      );
      return null;
    }
  }

  private async processGetClient(
    clientId: string,
    clientMetadata: ClientMetadata,
  ) {
    if (this.isConnecting[clientId]) {
      this.logger.debug(
        'Client already connecting. Queueing get client request',
        { clientId },
      );
      return;
    }
    if (!this.pendingGetClient[clientId].length) {
      return;
    }

    const { resolve, reject } = this.pendingGetClient[clientId].shift();
    this.isConnecting[clientId] = true;
    try {
      this.logger.debug('Creating new client', { clientId });
      const newClient = await this.createClient(clientMetadata);
      await this.redisClientStorage.set(newClient);

      resolve(newClient);

      // resolve pending gets
      while (this.pendingGetClient[clientId]?.length) {
        const next = this.pendingGetClient[clientId].shift();
        next?.resolve(newClient);
      }
    } catch (error) {
      reject(error);

      // reject pending gets
      while (this.pendingGetClient[clientId]?.length) {
        const next = this.pendingGetClient[clientId].shift();
        next?.reject(error);
      }
    } finally {
      delete this.pendingGetClient[clientId];
      delete this.isConnecting[clientId];
    }
  }

  /**
   * Gets existing database client by client metadata or
   * fetches database and create client new client for it
   * Also saves client to the clients pool to not create the same client in the future
   * Client from the pool of clients will be automatically deleted by idle time
   * @param clientMetadata
   */
  async getOrCreateClient(
    clientMetadata: ClientMetadata,
  ): Promise<RedisClient> {
    this.logger.debug('Trying to get existing redis client.', clientMetadata);

    const client = await this.redisClientStorage.getByMetadata(clientMetadata);

    if (client) {
      return client;
    }

    const clientId = RedisClient.generateId(
      RedisClient.prepareClientMetadata(clientMetadata),
    );

    // add promise to queue and then process queue immediately
    // in case another fetch is not already running
    return new Promise((resolve, reject) => {
      if (!this.pendingGetClient[clientId]) {
        this.pendingGetClient[clientId] = [];
      }
      this.pendingGetClient[clientId].push({ resolve, reject });
      this.processGetClient(clientId, clientMetadata);
    });
  }

  /**
   * Simply gets database and creates a client.
   * Will always return new client. There is no check for the same client already exists
   * Could be used to create temporary client for some purposes or to "isolate" client
   * for some business logic
   * ! Will be not automatically closed by idle time
   * @param clientMetadata
   * @param options
   * @param retryWithAzureRefresh - whether to retry with Azure credential refresh on auth failure
   */
  async createClient(
    clientMetadata: ClientMetadata,
    options?: IRedisConnectionOptions,
    retryWithAzureRefresh: boolean = true,
  ): Promise<RedisClient> {
    this.logger.debug('Creating new redis client.', clientMetadata);
    let database = await this.databaseService.get(
      clientMetadata.sessionMetadata,
      clientMetadata.databaseId,
    );

    try {
      const client = await this.redisClientFactory.createClient(
        clientMetadata,
        database,
        options,
      );

      if (database.connectionType === ConnectionType.NOT_CONNECTED) {
        await this.repository.update(
          clientMetadata.sessionMetadata,
          database.id,
          {
            connectionType:
              client.getConnectionType() as unknown as ConnectionType,
          },
        );
      }

      return client;
    } catch (error) {
      this.logger.error('Failed to create database client', error);

      // If auth failed and it's an Azure host, try to refresh credentials
      const isUnauthorized =
        error instanceof RedisConnectionUnauthorizedException;
      const isAzure = this.isAzureHost(database.host);
      this.logger.warn(
        `Azure token refresh check: retryWithAzureRefresh=${retryWithAzureRefresh}, isUnauthorized=${isUnauthorized}, isAzure=${isAzure}, host=${database.host}`,
      );

      if (retryWithAzureRefresh && isUnauthorized && isAzure) {
        this.logger.warn(
          'Auth failed for Azure database, attempting credential refresh',
        );

        const updatedDatabase = await this.tryRefreshAzureCredentials(
          clientMetadata,
          database,
        );

        if (updatedDatabase) {
          // Retry connection with refreshed credentials (but don't retry again)
          this.logger.warn(
            'Retrying connection with refreshed Azure credentials',
          );
          return this.createClient(clientMetadata, options, false);
        }
      }

      if (error instanceof RedisConnectionFailedException) {
        this.eventEmitter.emit(
          DatabaseConnectionEvent.DatabaseConnectionFailed,
          clientMetadata,
        );
      }

      this.analytics.sendConnectionFailedEvent(
        clientMetadata.sessionMetadata,
        database,
        error,
      );

      throw error;
    }
  }

  /**
   * Delete existing database client by client metadata.
   * @param clientMetadata
   */
  async deleteClient(clientMetadata: ClientMetadata): Promise<number> {
    this.logger.debug('Trying to delete existing redis client.');

    const client = await this.redisClientStorage.getByMetadata(clientMetadata);
    return this.redisClientStorage.remove(client?.id);
  }
}
