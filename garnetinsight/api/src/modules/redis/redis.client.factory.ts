import { Injectable, Logger } from '@nestjs/common';
import { Database } from 'src/modules/database/models/database';
import { cloneClassInstance } from 'src/utils';
import { ConnectionType } from 'src/modules/database/entities/database.entity';
import { ClientMetadata } from 'src/common/models';
import { RedisConnectionStrategy } from 'src/modules/redis/connection/redis.connection.strategy';
import { IoredisRedisConnectionStrategy } from 'src/modules/redis/connection/ioredis.redis.connection.strategy';
import { RedisClient } from 'src/modules/redis/client';
import { NodeRedisConnectionStrategy } from 'src/modules/redis/connection/node.redis.connection.strategy';
import serverConfig from 'src/utils/config';

const REDIS_CLIENTS_CONFIG = serverConfig.get('redis_clients');

export enum RedisClientLib {
  IOREDIS = 'ioredis',
  NODE_REDIS = 'node-redis',
}

export interface IRedisConnectionOptions {
  useRetry?: boolean;
  connectionName?: string;
  clientLib?: RedisClientLib;
  enableReadyCheck?: boolean;
}

@Injectable()
export abstract class RedisClientFactory {
  protected logger = new Logger('RedisClientFactory');

  protected defaultConnectionStrategy: RedisConnectionStrategy;

  protected constructor(
    protected readonly ioredisConnectionStrategy: IoredisRedisConnectionStrategy,
    protected readonly nodeRedisConnectionStrategy: NodeRedisConnectionStrategy,
  ) {
    this.defaultConnectionStrategy = ioredisConnectionStrategy;
  }

  /**
   * Initialize provider with default value(s).
   * Currently, set default client strategy based on feature flag
   */
  abstract init(): Promise<void>;

  /**
   * Get strategy to create connection with
   * Default strategy is set during class initialization (ioredis for now) and overwritten
   * by feature config on module init
   * @param strategy
   * @private
   */
  public getConnectionStrategy(
    strategy?: RedisClientLib,
  ): RedisConnectionStrategy {
    switch (strategy || REDIS_CLIENTS_CONFIG.forceStrategy) {
      case RedisClientLib.NODE_REDIS:
        return this.nodeRedisConnectionStrategy;
      case RedisClientLib.IOREDIS:
        return this.ioredisConnectionStrategy;
      default:
        return this.defaultConnectionStrategy;
    }
  }

  /**
   * Based on data fields (except connectionType) will try to create connection of proper type
   * @param clientMetadata
   * @param database
   * @param options
   */
  private async createClientAutomatically(
    clientMetadata: ClientMetadata,
    database: Database,
    options: IRedisConnectionOptions = {},
  ): Promise<RedisClient> {
    // Additional validation
    ClientMetadata.validate(clientMetadata);

    const opts = RedisClientFactory.prepareConnectionOptions(options);
    const connectionStrategy = this.getConnectionStrategy(opts.clientLib);

    // try sentinel connection
    if (database.sentinelMaster) {
      try {
        return connectionStrategy.createSentinelClient(
          clientMetadata,
          database,
          opts,
        );
      } catch (e) {
        // ignore error
      }
    }

    // try cluster connection
    try {
      return await connectionStrategy.createClusterClient(
        clientMetadata,
        database,
        opts,
      );
    } catch (e) {
      // ignore error
    }

    // Standalone in any other case
    return connectionStrategy.createStandaloneClient(
      clientMetadata,
      database,
      opts,
    );
  }

  /**
   * Create connection based on connectionType or try to determine connectionType automatically
   * @param clientMetadata
   * @param db
   * @param options
   */
  public async createClient(
    clientMetadata: ClientMetadata,
    db: Database,
    options: IRedisConnectionOptions = {},
  ): Promise<RedisClient> {
    // Additional validation
    ClientMetadata.validate(clientMetadata);

    const database = cloneClassInstance(db);

    Object.keys(database).forEach((key: string) => {
      if (database[key] === null) {
        delete database[key];
      }
    });

    const opts = RedisClientFactory.prepareConnectionOptions(options);
    const connectionStrategy = this.getConnectionStrategy(opts.clientLib);

    let client: RedisClient;

    switch (database.connectionType) {
      case ConnectionType.STANDALONE:
        client = await connectionStrategy.createStandaloneClient(
          clientMetadata,
          database,
          opts,
        );
        break;
      case ConnectionType.CLUSTER:
        if (database.forceStandalone) {
          this.logger.debug('Force standalone connection', {
            clientMetadata,
            database,
          });
          // if force standalone, ignore connectionType
          client = await connectionStrategy.createStandaloneClient(
            clientMetadata,
            database,
            opts,
          );
        } else {
          client = await connectionStrategy.createClusterClient(
            clientMetadata,
            database,
            opts,
          );
        }
        break;
      case ConnectionType.SENTINEL:
        client = await connectionStrategy.createSentinelClient(
          clientMetadata,
          database,
          opts,
        );
        break;
      default:
        // AUTO
        client = await this.createClientAutomatically(
          clientMetadata,
          database,
          opts,
        );
    }

    return client;
  }

  static prepareConnectionOptions(
    options: IRedisConnectionOptions = {},
  ): IRedisConnectionOptions {
    return {
      useRetry: true,
      // todo: generate connection name based on clientMetadata
      ...options,
    };
  }
}
