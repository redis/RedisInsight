import { ApiProperty } from '@nestjs/swagger';

export enum NodeRole {
  Primary = 'primary',
  Replica = 'replica',
}

export enum HealthStatus {
  Online = 'online',
  Offline = 'offline',
  Loading = 'loading',
}

export class ClusterNodeDetails {
  @ApiProperty({
    type: String,
    description: 'Node id',
    example: 'c33218e9ff2faf8749bfb6585ba1e6d40a4e94fb',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Redis version',
    example: '7.0.2',
  })
  version: string;

  @ApiProperty({
    type: String,
    description: 'Redis mode',
    example: 'cluster',
  })
  mode: string;

  @ApiProperty({
    type: String,
    description: 'Node IP address',
    example: '172.30.0.101',
  })
  host: string;

  @ApiProperty({
    type: Number,
    description: 'Node IP address',
    example: 6379,
  })
  port: number;

  @ApiProperty({
    type: String,
    enum: NodeRole,
    description: 'Node role in cluster',
  })
  role: NodeRole;

  @ApiProperty({
    type: String,
    description: 'ID of primary node (for replica only)',
    example: 'c33218e9ff2faf8749bfb6585ba1e6d40a4e94fb',
  })
  primary?: string;

  @ApiProperty({
    type: String,
    enum: HealthStatus,
    description: "Node's current health status",
  })
  health: HealthStatus;

  @ApiProperty({
    type: String,
    isArray: true,
    description:
      'Array of assigned slots or slots ranges. Shown for primary nodes only',
    example: ['0-5638', '11256'],
  })
  slots?: string[];

  @ApiProperty({
    type: Number,
    description: 'Total keys stored inside this node',
    example: 256478,
  })
  totalKeys: number;

  @ApiProperty({
    type: Number,
    description: 'Memory used by node. "memory.used_memory" from INFO command',
    example: 256478,
  })
  usedMemory: number;

  @ApiProperty({
    type: Number,
    description:
      'Current operations per second. "stats.instantaneous_ops_per_sec" from INFO command',
    example: 12569,
  })
  opsPerSecond: number;

  @ApiProperty({
    type: Number,
    description:
      'Total connections received by node. "stats.total_connections_received" from INFO command',
    example: 3256,
  })
  connectionsReceived: number;

  @ApiProperty({
    type: Number,
    description:
      'Currently connected clients. "clients.connected_clients" from INFO command',
    example: 3256,
  })
  connectedClients: number;

  @ApiProperty({
    type: Number,
    description:
      'Total commands processed by node. "stats.total_commands_processed" from INFO command',
    example: 32560000000,
  })
  commandsProcessed: number;

  @ApiProperty({
    type: Number,
    description:
      'Current input network usage in KB/s. "stats.instantaneous_input_kbps" from INFO command',
    example: 12000,
  })
  networkInKbps: number;

  @ApiProperty({
    type: Number,
    description:
      'Current output network usage in KB/s. "stats.instantaneous_output_kbps" from INFO command',
    example: 12000,
  })
  networkOutKbps: number;

  @ApiProperty({
    type: Number,
    description:
      'Ratio for cache hits and misses [0 - 1]. Ideally should be close to 1',
    example: 0.8,
  })
  cacheHitRatio?: number;

  @ApiProperty({
    type: Number,
    description:
      'The replication offset of this node. This information can be used to ' +
      'send commands to the most up to date replicas.',
    example: 12000,
  })
  replicationOffset: number;

  @ApiProperty({
    type: Number,
    description:
      'For replicas only. Determines on how much replica is behind of primary.',
    example: 0,
  })
  replicationLag?: number;

  @ApiProperty({
    type: Number,
    description: 'Current node uptime_in_seconds',
    example: 12000,
  })
  uptimeSec: number;

  @ApiProperty({
    type: () => ClusterNodeDetails,
    isArray: true,
    description: 'For primary nodes only. Replica node(s) details',
    example: [],
  })
  replicas?: ClusterNodeDetails[];
}
