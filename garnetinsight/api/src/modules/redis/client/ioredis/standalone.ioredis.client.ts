import Redis from 'ioredis';
import {
  IoredisClient,
  RedisClient,
  RedisClientConnectionType,
} from 'src/modules/redis/client';

export class StandaloneIoredisClient extends IoredisClient {
  protected readonly client: Redis;

  /**
   * @inheritDoc
   */
  getConnectionType(): RedisClientConnectionType {
    return RedisClientConnectionType.STANDALONE;
  }

  async nodes(): Promise<RedisClient[]> {
    return [this];
  }
}
