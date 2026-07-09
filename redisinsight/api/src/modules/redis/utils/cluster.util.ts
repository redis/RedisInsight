import { RedisClient } from 'src/modules/redis/client';
import {
  convertMultilineReplyToObject,
  parseNodesFromClusterSlotsReply,
  RedisClusterSlotsReply,
} from 'src/modules/redis/utils/reply.util';
import { IRedisClusterNodeAddress } from 'src/models';

/**
 * Check weather database is a cluster
 * Used to automatically determine db type when connected to a database with standalone client
 * In case when "cluster info" command will be not allowed by ACL or in case of any other error
 * we will handle this database as a non-cluster since "cluster info" command is required
 * to work properly in the next steps
 * @param client
 */
export const isCluster = async (client: RedisClient): Promise<boolean> => {
  try {
    const reply = (await client.sendCommand(['cluster', 'info'], {
      replyEncoding: 'utf8',
    })) as string;

    const clusterInfo = convertMultilineReplyToObject(reply);
    return clusterInfo.cluster_state === 'ok';
  } catch (e) {
    return false;
  }
};

/**
 * Discover all cluster nodes for current connection.
 *
 * Uses "CLUSTER SLOTS" rather than "CLUSTER NODES": each node's preferred
 * connection address there is already resolved server-side according to
 * the `cluster-preferred-endpoint-type` config (ip / hostname /
 * unknown-endpoint), so clusters behind per-node load balancers or NAT
 * (where the raw ip is not routable to clients) remain reachable without
 * the client re-deriving an ip-vs-hostname preference itself - which
 * "CLUSTER NODES" has no way to express correctly, since it only exposes
 * the announced hostname as unconditional metadata, not the server's
 * actual preference.
 * @param client
 */
export const discoverClusterNodes = async (
  client: RedisClient,
): Promise<IRedisClusterNodeAddress[]> => {
  const slots = (await client.sendCommand(['cluster', 'slots'], {
    replyEncoding: 'utf8',
  })) as RedisClusterSlotsReply;

  return parseNodesFromClusterSlotsReply(slots, client.options?.host);
};
