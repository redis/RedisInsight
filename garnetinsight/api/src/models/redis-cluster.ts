export interface IRedisClusterInfo {
  cluster_state: string;
  cluster_slots_assigned: string;
  cluster_slots_ok: string;
  cluster_slots_pfail: string;
  cluster_slots_fail: string;
  cluster_known_nodes: string;
  cluster_size: string;
  cluster_current_epoch: string;
  cluster_my_epoch: string;
  cluster_stats_messages_sent: string;
  cluster_stats_messages_received: string;
}
export interface IRedisClusterNodeAddress {
  host: string;
  port: number;
}

export interface IRedisClusterNode extends IRedisClusterNodeAddress {
  id: string;
  replicaOf: string;
  linkState: RedisClusterNodeLinkState;
  slot: string;
}

export enum RedisClusterNodeLinkState {
  Connected = 'connected',
  Disconnected = 'disconnected',
}
