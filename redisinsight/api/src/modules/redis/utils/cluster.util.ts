import { RedisClient } from 'src/modules/redis/client';
import {
  convertMultilineReplyToObject,
  parseNodesFromClusterInfoReply,
} from 'src/modules/redis/utils/reply.util';
import {
  IRedisClusterNodeAddress,
  RedisClusterNodeLinkState,
} from 'src/models';

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
 * Discover all cluster nodes for current connection
 * Prefers each node's announced hostname (Redis 7+, `cluster-announce-hostname`)
 * over its raw IP so that clusters behind per-node load balancers or NAT
 * (where the raw IP is not routable to clients) remain reachable. Falls back
 * to the IP when no hostname is announced, preserving behavior for standard
 * clusters.
 * @param client
 */
export const discoverClusterNodes = async (
  client: RedisClient,
): Promise<IRedisClusterNodeAddress[]> => {
  const nodes = parseNodesFromClusterInfoReply(
    (await client.sendCommand(['cluster', 'nodes'], {
      replyEncoding: 'utf8',
    })) as string,
  ).filter((node) => node.linkState === RedisClusterNodeLinkState.Connected);

  return nodes.map((node) => ({
    host: node.hostname || node.host,
    port: node.port,
  }));
};
