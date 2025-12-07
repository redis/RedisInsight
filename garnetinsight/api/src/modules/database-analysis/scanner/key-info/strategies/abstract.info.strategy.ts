import { RedisString } from 'src/common/constants';
import { IKeyInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/key-info.strategy.interface';
import { RedisClient } from 'src/modules/redis/client';

export abstract class AbstractInfoStrategy implements IKeyInfoStrategy {
  abstract getLength(client: RedisClient, key: RedisString): Promise<number>;

  async getLengthSafe(client: RedisClient, key: RedisString): Promise<number> {
    try {
      return await this.getLength(client, key);
    } catch (e) {
      return null;
    }
  }
}
