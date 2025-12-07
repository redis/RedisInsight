import { RedisString } from 'src/common/constants';
import { RedisClient } from 'src/modules/redis/client';

export interface IntegersInSets {
  client: RedisClient;
  keyName: RedisString;
  databaseId: string;
  members: RedisString[];
}
