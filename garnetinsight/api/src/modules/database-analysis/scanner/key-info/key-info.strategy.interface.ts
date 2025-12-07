import { RedisString } from 'src/common/constants';
import { RedisClient } from 'src/modules/redis/client';

export interface IKeyInfoStrategy {
  getLength(client: RedisClient, key: RedisString): Promise<number>;
  getLengthSafe(client: RedisClient, key: RedisString): Promise<number>;
}
