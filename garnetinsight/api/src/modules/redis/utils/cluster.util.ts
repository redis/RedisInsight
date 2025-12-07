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
    host: node.host,
    port: node.port,
  }));
};
