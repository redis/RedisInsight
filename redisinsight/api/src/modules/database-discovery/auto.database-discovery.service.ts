import { v4 as uuidv4 } from 'uuid';
import { Injectable, Logger } from '@nestjs/common';
import { getAvailableEndpoints } from 'src/modules/database-discovery/utils/autodiscovery.util';
import { Database } from 'src/modules/database/models/database';
import { DatabaseService } from 'src/modules/database/database.service';
import {
  ClientContext,
  ClientMetadata,
  SessionMetadata,
} from 'src/common/models';
import { RedisClientFactory } from 'src/modules/redis/redis.client.factory';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AutoDatabaseDiscoveryService {
  private logger = new Logger('AutoDatabaseDiscoveryService');

  constructor(
    private redisClientFactory: RedisClientFactory,
    private databaseService: DatabaseService,
  ) {}

  /**
   * Try to add standalone databases without auth from processes running on the host machine listening on TCP4
   * Database alias will be "host:port"
   */
  async discover(sessionMetadata: SessionMetadata) {
    try {
      // additional check for existing databases
      // We should not start auto discover if any database already exists
      if ((await this.databaseService.list(sessionMetadata)).length) {
        return;
      }

      const endpoints = await getAvailableEndpoints();

      // Add redis databases or resolve after 1s to not block app startup for a long time
      await Promise.race([
        Promise.all(
          endpoints.map((endpoint) =>
            this.addRedisDatabase(sessionMetadata, endpoint),
          ),
        ),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
    } catch (e) {
      this.logger.warn('Unable to discover redis database', e);
    }
  }

  /**
   * Add standalone database without credentials using host and port only
   * @param sessionMetadata
   * @param endpoint
   * @private
   */
  private async addRedisDatabase(
    sessionMetadata: SessionMetadata,
    endpoint: { host: string; port: number },
  ) {
    try {
      const client = await this.redisClientFactory.createClient(
        {
          databaseId: uuidv4(),
          context: ClientContext.Common,
          sessionMetadata,
        } as ClientMetadata,
        plainToInstance(Database, endpoint),
        { useRetry: false, connectionName: 'redisinsight-auto-discovery' },
      );

      const info = await client.getInfo();

      if (info?.server?.redis_mode === 'standalone') {
        await this.databaseService.create(sessionMetadata, {
          name: `${endpoint.host}:${endpoint.port}`,
          ...endpoint,
        } as Database);
      }
    } catch (e) {
      // ignore error
    }
  }
}
