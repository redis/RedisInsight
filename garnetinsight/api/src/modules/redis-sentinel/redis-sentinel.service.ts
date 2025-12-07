import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateSentinelDatabaseResponse } from 'src/modules/redis-sentinel/dto/create.sentinel.database.response';
import { CreateSentinelDatabasesDto } from 'src/modules/redis-sentinel/dto/create.sentinel.databases.dto';
import { Database } from 'src/modules/database/models/database';
import {
  ActionStatus,
  ClientContext,
  SessionMetadata,
} from 'src/common/models';
import { DatabaseService } from 'src/modules/database/database.service';
import { SentinelMaster } from 'src/modules/redis-sentinel/models/sentinel-master';
import { RedisSentinelAnalytics } from 'src/modules/redis-sentinel/redis-sentinel.analytics';
import { DatabaseFactory } from 'src/modules/database/providers/database.factory';
import { discoverSentinelMasterGroups } from 'src/modules/redis/utils';
import { RedisClientFactory } from 'src/modules/redis/redis.client.factory';
import { ConstantsProvider } from 'src/modules/constants/providers/constants.provider';

@Injectable()
export class RedisSentinelService {
  private logger = new Logger('RedisSentinelService');

  constructor(
    private readonly redisClientFactory: RedisClientFactory,
    private readonly databaseService: DatabaseService,
    private readonly databaseFactory: DatabaseFactory,
    private readonly redisSentinelAnalytics: RedisSentinelAnalytics,
    private readonly constantsProvider: ConstantsProvider,
  ) {}

  /**
   * Bulk create sentinel databases
   * Will not fail on connection or any other errors during adding each database
   * Returns statuses instead
   * todo: Handle unique certificate issue
   * @param sessionMetadata
   * @param dto
   */
  public async createSentinelDatabases(
    sessionMetadata: SessionMetadata,
    dto: CreateSentinelDatabasesDto,
  ): Promise<CreateSentinelDatabaseResponse[]> {
    this.logger.debug('Adding Sentinel masters.', sessionMetadata);
    const result: CreateSentinelDatabaseResponse[] = [];
    const { masters, ...connectionOptions } = dto;
    try {
      //
      // const client = await this.redisService.createStandaloneClient(
      //   connectionOptions as Database,
      //   AppTool.Common,
      //   false,
      // );
      //
      // const isOssSentinel = await this.redisConfBusinessService.checkSentinelConnection(
      //   client,
      // );

      // if (!isOssSentinel) {
      //   await client.disconnect();
      //   this.logger.error(
      //     `Failed to add Sentinel masters. ${ERROR_MESSAGES.WRONG_DATABASE_TYPE}.`,
      //   );
      //   const exception = new BadRequestException(
      //     ERROR_MESSAGES.WRONG_DATABASE_TYPE,
      //   );
      //   this.instancesAnalyticsService.sendInstanceAddFailedEvent(exception);
      //   return Promise.reject(exception);
      // }
      //

      await Promise.all(
        masters.map(async (master) => {
          const { alias, name, password, username, db } = master;
          try {
            const model = await this.databaseService.create(
              sessionMetadata,
              {
                ...connectionOptions,
                name: alias,
                db,
                sentinelMaster: {
                  name,
                  username,
                  password,
                },
              } as Database,
              undefined,
              { enableReadyCheck: false },
            );

            result.push({
              id: model.id,
              name,
              status: ActionStatus.Success,
              message: 'Added',
            });
          } catch (error) {
            result.push({
              name,
              status: ActionStatus.Fail,
              message: error?.response?.message,
              error: error?.response,
            });
          }
        }),
      );

      return result;
    } catch (error) {
      this.logger.error(
        'Failed to add Sentinel masters.',
        error,
        sessionMetadata,
      );
      throw error;
    }
  }

  /**
   * Check connection and get sentinel masters
   * @param sessionMetadata
   * @param dto
   */
  public async getSentinelMasters(
    sessionMetadata: SessionMetadata,
    dto: Database,
  ): Promise<SentinelMaster[]> {
    this.logger.debug(
      'Connection and getting sentinel masters.',
      sessionMetadata,
    );
    let result: SentinelMaster[];
    try {
      const database =
        await this.databaseFactory.createStandaloneDatabaseModel(dto);
      const client = await this.redisClientFactory
        .getConnectionStrategy()
        .createStandaloneClient(
          {
            sessionMetadata: this.constantsProvider.getSystemSessionMetadata(),
            databaseId: database.id || uuidv4(),
            context: ClientContext.Common,
          },
          database,
          { useRetry: false, enableReadyCheck: false },
        );
      result = await discoverSentinelMasterGroups(client);
      this.redisSentinelAnalytics.sendGetSentinelMastersSucceedEvent(
        sessionMetadata,
        result,
      );

      await client.disconnect();
    } catch (error) {
      this.redisSentinelAnalytics.sendGetSentinelMastersFailedEvent(
        sessionMetadata,
        error,
      );

      throw error;
    }
    return result;
  }
}
