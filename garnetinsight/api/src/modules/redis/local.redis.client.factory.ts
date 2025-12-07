import { Injectable, Logger } from '@nestjs/common';
import { RedisConnectionStrategy } from 'src/modules/redis/connection/redis.connection.strategy';
import { IoredisRedisConnectionStrategy } from 'src/modules/redis/connection/ioredis.redis.connection.strategy';
import { FeatureService } from 'src/modules/feature/feature.service';
import { NodeRedisConnectionStrategy } from 'src/modules/redis/connection/node.redis.connection.strategy';
import { KnownFeatures } from 'src/modules/feature/constants';
import { ConstantsProvider } from 'src/modules/constants/providers/constants.provider';
import { RedisClientFactory } from 'src/modules/redis/redis.client.factory';

@Injectable()
export class LocalRedisClientFactory extends RedisClientFactory {
  protected logger = new Logger('LocalRedisClientFactory');

  protected defaultConnectionStrategy: RedisConnectionStrategy;

  constructor(
    protected readonly ioredisConnectionStrategy: IoredisRedisConnectionStrategy,
    protected readonly nodeRedisConnectionStrategy: NodeRedisConnectionStrategy,
    private readonly featureService: FeatureService,
    private readonly constantsProvider: ConstantsProvider,
  ) {
    super(ioredisConnectionStrategy, nodeRedisConnectionStrategy);
  }

  /**
   * @inheritDoc
   * In case of an error or unsupported strategy default config will stay the same (ioredis for now)
   */
  async init() {
    try {
      const feature = await this.featureService.getByName(
        // todo: [USER_CONTEXT] revise
        this.constantsProvider.getSystemSessionMetadata(),
        KnownFeatures.RedisClient,
      );
      this.defaultConnectionStrategy = this.getConnectionStrategy(
        feature?.data?.strategy,
      );
    } catch (e) {
      this.logger.warn(
        'Unable to setup default strategy from the feature config',
      );
    }
  }
}
