import { Injectable, Logger } from '@nestjs/common';
import { DatabaseOverviewProvider } from 'src/modules/database/providers/database-overview.provider';
import { DatabaseOverview } from 'src/modules/database/models/database-overview';
import { RedisDatabaseInfoResponse } from 'src/modules/database/dto/redis-info.dto';
import { ClientMetadata } from 'src/common/models';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { RedisClient } from 'src/modules/redis/client';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { DatabaseService } from './database.service';
import { DatabaseOverviewKeyspace } from './constants/overview';

@Injectable()
export class DatabaseInfoService {
  private logger = new Logger('DatabaseInfoService');

  constructor(
    private readonly databaseClientFactory: DatabaseClientFactory,
    private readonly databaseOverviewProvider: DatabaseOverviewProvider,
    private readonly databaseInfoProvider: DatabaseInfoProvider,
    private readonly recommendationService: DatabaseRecommendationService,
    private readonly databaseService: DatabaseService,
  ) {}

  /**
   * Get database general info
   * @param clientMetadata
   */
  public async getInfo(
    clientMetadata: ClientMetadata,
  ): Promise<RedisDatabaseInfoResponse> {
    this.logger.debug(
      `Getting database info for: ${clientMetadata.databaseId}`,
      clientMetadata,
    );

    const client =
      await this.databaseClientFactory.getOrCreateClient(clientMetadata);

    return this.databaseInfoProvider.getRedisGeneralInfo(client);
  }

  /**
   * Get redis database overview
   *
   * @param clientMetadata
   * @param keyspace
   */
  public async getOverview(
    clientMetadata: ClientMetadata,
    keyspace: DatabaseOverviewKeyspace,
  ): Promise<DatabaseOverview> {
    this.logger.debug(
      `Getting database overview for: ${clientMetadata.databaseId}`,
      clientMetadata,
    );

    const client: RedisClient =
      await this.databaseClientFactory.getOrCreateClient({
        ...clientMetadata,
        db: undefined, // connect to default db index
      });

    return this.databaseOverviewProvider.getOverview(
      clientMetadata,
      client,
      keyspace,
    );
  }

  /**
   * Get redis database number of keys
   *
   * @param clientMetadata
   */
  async getDBSize(clientMetadata: ClientMetadata): Promise<number> {
    const client: RedisClient =
      await this.databaseClientFactory.getOrCreateClient(clientMetadata);

    return this.databaseInfoProvider.getRedisDBSize(client);
  }

  /**
   * Create connection to specified database index
   *
   * @param clientMetadata
   * @param db
   */
  public async getDatabaseIndex(
    clientMetadata: ClientMetadata,
    db: number,
  ): Promise<void> {
    this.logger.debug(`Connection to database index: ${db}`, clientMetadata);

    let client;
    const prevDb =
      clientMetadata.db ??
      (
        await this.databaseService.get(
          clientMetadata.sessionMetadata,
          clientMetadata.databaseId,
        )
      )?.db ??
      0;

    try {
      client = await this.databaseClientFactory.createClient({
        ...clientMetadata,
        db,
      });
      client?.disconnect?.();

      this.recommendationService.check(
        { ...clientMetadata, db },
        RECOMMENDATION_NAMES.AVOID_LOGICAL_DATABASES,
        { db, prevDb },
      );
      return undefined;
    } catch (e) {
      this.logger.error(
        `Unable to connect to logical database: ${db}`,
        e,
        clientMetadata,
      );
      client?.disconnect?.();
      throw e;
    }
  }
}
