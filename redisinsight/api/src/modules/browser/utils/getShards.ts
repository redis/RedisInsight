import {
  RedisClient,
  RedisClientConnectionType,
  RedisClientNodeRole,
} from 'src/modules/redis/client';

/**
 * Get array of shards (client per each master node).
 * For STANDALONE returns array with a single client.
 */
export async function getShards(client: RedisClient): Promise<RedisClient[]> {
  if (client.getConnectionType() === RedisClientConnectionType.CLUSTER) {
    return client.nodes(RedisClientNodeRole.PRIMARY);
  }

  return [client];
}
