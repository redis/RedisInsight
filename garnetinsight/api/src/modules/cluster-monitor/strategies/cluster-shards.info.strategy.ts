import { chunk } from 'lodash';
import { AbstractInfoStrategy } from 'src/modules/cluster-monitor/strategies/abstract.info.strategy';
import {
  ClusterNodeDetails,
  NodeRole,
} from 'src/modules/cluster-monitor/models';
import { convertArrayReplyToObject } from 'src/modules/redis/utils';
import { RedisClient } from 'src/modules/redis/client';

export class ClusterShardsInfoStrategy extends AbstractInfoStrategy {
  async getClusterNodesFromRedis(client: RedisClient) {
    const resp = (await client.sendCommand(['cluster', 'shards'], {
      replyEncoding: 'utf8',
    })) as any[];

    return [].concat(
      ...resp.map((shardArray) => {
        const shard = convertArrayReplyToObject(shardArray);
        const slots = ClusterShardsInfoStrategy.calculateSlots(shard.slots);
        return ClusterShardsInfoStrategy.processShardNodes(shard.nodes, slots);
      }),
    );
  }

  static calculateSlots(slots: number[]): string[] {
    return chunk(slots, 2).map(([slot1, slot2]) => {
      if (slot1 === slot2) {
        return `${slot1}`;
      }

      return `${slot1}-${slot2}`;
    });
  }

  static processShardNodes(
    shardNodes: any[],
    slots: string[],
  ): Partial<ClusterNodeDetails>[] {
    let primary;
    const nodes = shardNodes.map((nodeArray) => {
      const nodeObj = convertArrayReplyToObject(nodeArray);
      const node = {
        id: nodeObj.id,
        host: nodeObj.ip,
        port: nodeObj.port || nodeObj['tls-port'],
        tlsPort: nodeObj['tls-port'],
        role: nodeObj.role === 'master' ? NodeRole.Primary : NodeRole.Replica,
        health: nodeObj.health,
      };

      if (node.role === 'primary') {
        primary = node.id;
        node['slots'] = slots;
      }

      return node;
    });

    return nodes
      .map((node) => {
        if (node.role !== NodeRole.Primary) {
          return {
            ...node,
            primary,
          };
        }

        return node;
      })
      .filter((node) => node.role === NodeRole.Primary); // tmp work with primary nodes only
  }
}
