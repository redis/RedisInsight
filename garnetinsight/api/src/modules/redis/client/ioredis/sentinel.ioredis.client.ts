import {
  RedisClientConnectionType,
  StandaloneIoredisClient,
} from 'src/modules/redis/client';

export class SentinelIoredisClient extends StandaloneIoredisClient {
  /**
   * @inheritDoc
   */
  getConnectionType(): RedisClientConnectionType {
    return RedisClientConnectionType.SENTINEL;
  }
}
