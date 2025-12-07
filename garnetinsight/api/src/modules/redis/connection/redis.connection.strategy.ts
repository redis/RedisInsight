import { ClientMetadata } from 'src/common/models';
import { Database } from 'src/modules/database/models/database';
import { SshTunnelProvider } from 'src/modules/ssh/ssh-tunnel.provider';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { IRedisConnectionOptions } from 'src/modules/redis/redis.client.factory';
import { RedisClient } from 'src/modules/redis/client';
import { CONNECTION_NAME_GLOBAL_PREFIX, CustomErrorCodes } from 'src/constants';

@Injectable()
export abstract class RedisConnectionStrategy {
  protected logger = new Logger(this.constructor.name);

  protected connectionErrors: {};

  constructor(protected readonly sshTunnelProvider: SshTunnelProvider) {
    this.resetConnectionErrors();
  }

  /**
   * Try to create standalone redis connection
   * @param clientMetadata
   * @param database
   * @param options
   */
  abstract createStandaloneClient(
    clientMetadata: ClientMetadata,
    database: Database,
    options: IRedisConnectionOptions,
  ): Promise<RedisClient>;

  /**
   * Try to create redis cluster connection
   * @param clientMetadata
   * @param database
   * @param options
   */
  abstract createClusterClient(
    clientMetadata: ClientMetadata,
    database: Database,
    options: IRedisConnectionOptions,
  ): Promise<RedisClient>;

  /**
   * Try to create redis sentinel connection
   * @param clientMetadata
   * @param database
   * @param options
   */
  abstract createSentinelClient(
    clientMetadata: ClientMetadata,
    database: Database,
    options: IRedisConnectionOptions,
  ): Promise<RedisClient>;

  /**
   * Generates client name based on clientMetadata fields
   * garnetinsight-<context>-<databaseId>-[dbIndex]-[uniqueId]-[userId]-[sessionId]-[sessionUniqueId]
   * Examples:
   *  cli: garnetinsight-cli-658a47c1-0-fa32-de45-457a-5837
   *  browser: garnetinsight-browser-658a47c1-0--de45-457a-18db
   * @param clientMetadata
   */
  static generateRedisConnectionName(clientMetadata: ClientMetadata) {
    return [
      CONNECTION_NAME_GLOBAL_PREFIX,
      clientMetadata?.context || 'custom',
      clientMetadata?.databaseId || '',
      clientMetadata?.db >= 0 ? clientMetadata.db : '',
      clientMetadata?.uniqueId || '',
      clientMetadata?.sessionMetadata?.userId || '',
      clientMetadata?.sessionMetadata?.sessionId || '',
      clientMetadata?.sessionMetadata?.uniqueId || '',
    ]
      .join('-')
      .toLowerCase();
  }

  private resetConnectionErrors() {
    this.connectionErrors = {
      [CustomErrorCodes.RedisConnectionFailed]: 0,
      [CustomErrorCodes.RedisConnectionTimeout]: 0,
      [CustomErrorCodes.RedisConnectionUnauthorized]: 0,
      [CustomErrorCodes.RedisConnectionClusterNodesUnavailable]: 0,
      [CustomErrorCodes.RedisConnectionUnavailable]: 0,
    };
  }

  protected addConnectionError(error: HttpException) {
    const errorCode = error.getResponse?.()?.['errorCode'];

    if (this.connectionErrors[errorCode] !== undefined) {
      this.connectionErrors[errorCode] += 1;
    }
  }

  public getConnectionErrorsAndReset() {
    const connectionErrors = {
      ...this.connectionErrors,
    };

    this.resetConnectionErrors();

    return connectionErrors;
  }
}
