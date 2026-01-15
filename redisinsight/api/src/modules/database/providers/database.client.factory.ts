import { Injectable, Logger } from '@nestjs/common';
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
import { RedisConnectionFailedException } from 'src/modules/redis/exceptions/connection';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseConnectionEvent } from 'src/modules/database/constants/events';
import { Database } from 'src/modules/database/models/database';
import {
  isAzureEntraIdAuth,
  AzureProviderDetails,
} from 'src/modules/database/models/provider-details';
import { AzureAuthService } from 'src/modules/azure/auth/azure-auth.service';
import { TOKEN_REFRESH_BUFFER_MS } from 'src/modules/azure/constants';

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
    private readonly azureAuthService: AzureAuthService,
  ) {}

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
      // Proactive token refresh for Azure Entra ID databases
      await this.ensureAzureTokenValid(clientMetadata, client);
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
   */
  async createClient(
    clientMetadata: ClientMetadata,
    options?: IRedisConnectionOptions,
  ): Promise<RedisClient> {
    this.logger.debug('Creating new redis client.', clientMetadata);
    let database = await this.databaseService.get(
      clientMetadata.sessionMetadata,
      clientMetadata.databaseId,
    );

    // Refresh Azure token before creating client if needed
    database = await this.refreshAzureTokenIfNeeded(clientMetadata, database);

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

  /**
   * Proactively refresh Azure Entra ID token if it's expiring soon.
   * This ensures seamless connection without authentication errors.
   */
  private async ensureAzureTokenValid(
    clientMetadata: ClientMetadata,
    client: RedisClient,
  ): Promise<void> {
    let database: Database;

    try {
      database = await this.databaseService.get(
        clientMetadata.sessionMetadata,
        clientMetadata.databaseId,
      );
    } catch {
      // Database not found, skip refresh
      return;
    }

    const providerDetails = database.providerDetails as
      | AzureProviderDetails
      | undefined;

    // Only process Azure Entra ID databases
    if (!isAzureEntraIdAuth(providerDetails)) {
      return;
    }

    const { tokenExpiresAt, azureAccountId } = providerDetails;

    // No expiry info or account ID, skip refresh
    if (!tokenExpiresAt || !azureAccountId) {
      return;
    }

    const expiresAt = new Date(tokenExpiresAt).getTime();
    const now = Date.now();
    const expiresIn = expiresAt - now;

    // Token still valid beyond buffer threshold
    if (expiresIn > TOKEN_REFRESH_BUFFER_MS) {
      return;
    }

    this.logger.log(
      `Azure token expiring soon for ${database.host}, refreshing...`,
    );

    try {
      const tokenResult =
        await this.azureAuthService.getRedisTokenByAccountId(azureAccountId);

      if (!tokenResult) {
        this.logger.warn(
          `Failed to refresh Azure token for ${database.host} - user may need to re-authenticate`,
        );
        return;
      }

      // Re-authenticate on existing connection
      await client.sendCommand(['AUTH', database.username, tokenResult.token]);

      // Update database record with new token and expiry
      await this.repository.update(
        clientMetadata.sessionMetadata,
        database.id,
        {
          password: tokenResult.token,
          providerDetails: {
            ...providerDetails,
            tokenExpiresAt: tokenResult.expiresOn.toISOString(),
          },
        },
      );

      this.logger.log(
        `Successfully refreshed Azure token for ${database.host}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Error refreshing Azure token for ${database.host}`,
        error?.message,
      );
      // Don't throw - let the operation proceed with the existing token
      // If it fails, the user will see an auth error
    }
  }

  /**
   * Refresh Azure Entra ID token if needed before creating a new client.
   * Returns the database with updated credentials if refresh was needed.
   */
  private async refreshAzureTokenIfNeeded(
    clientMetadata: ClientMetadata,
    database: Database,
  ): Promise<Database> {
    const providerDetails = database.providerDetails as
      | AzureProviderDetails
      | undefined;

    // Only process Azure Entra ID databases
    if (!isAzureEntraIdAuth(providerDetails)) {
      return database;
    }

    const { tokenExpiresAt, azureAccountId } = providerDetails;

    // No expiry info or account ID, skip refresh
    if (!tokenExpiresAt || !azureAccountId) {
      return database;
    }

    const expiresAt = new Date(tokenExpiresAt).getTime();
    const now = Date.now();
    const expiresIn = expiresAt - now;

    // Token still valid beyond buffer threshold
    if (expiresIn > TOKEN_REFRESH_BUFFER_MS) {
      return database;
    }

    this.logger.log(
      `Azure token expired or expiring soon for ${database.host}, refreshing before connection...`,
    );

    try {
      const tokenResult =
        await this.azureAuthService.getRedisTokenByAccountId(azureAccountId);

      if (!tokenResult) {
        this.logger.warn(
          `Failed to refresh Azure token for ${database.host} - user may need to re-authenticate`,
        );
        return database;
      }

      // Update database record with new token and expiry
      await this.repository.update(
        clientMetadata.sessionMetadata,
        database.id,
        {
          password: tokenResult.token,
          providerDetails: {
            ...providerDetails,
            tokenExpiresAt: tokenResult.expiresOn.toISOString(),
          },
        },
      );

      this.logger.log(
        `Successfully refreshed Azure token for ${database.host}`,
      );

      // Return database with updated password for client creation
      return {
        ...database,
        password: tokenResult.token,
        providerDetails: {
          ...providerDetails,
          tokenExpiresAt: tokenResult.expiresOn.toISOString(),
        },
      };
    } catch (error: any) {
      this.logger.error(
        `Error refreshing Azure token for ${database.host}`,
        error?.message,
      );
      // Return original database - connection may fail with expired token
      return database;
    }
  }
}
