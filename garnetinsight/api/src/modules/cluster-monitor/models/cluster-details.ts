import { ApiProperty } from '@nestjs/swagger';
import { ClusterNodeDetails } from 'src/modules/cluster-monitor/models/cluster-node-details';

export class ClusterDetails {
  @ApiProperty({
    type: String,
    description: 'Redis version',
    example: '7.0.2',
  })
  version: string;

  @ApiProperty({
    type: String,
    description:
      'Redis mode. Currently one of: standalone, cluster or sentinel',
    example: 'cluster',
  })
  mode: string;

  @ApiProperty({
    type: String,
    description:
      'Username from the connection or undefined in case when connected with default user',
    example: 'user1',
  })
  user?: string;

  @ApiProperty({
    type: Number,
    description: 'Maximum value uptime_in_seconds from all nodes',
    example: 3600,
  })
  uptimeSec: number;

  @ApiProperty({
    type: String,
    description: 'cluster_state from CLUSTER INFO command',
    example: 'ok',
  })
  state: string;

  @ApiProperty({
    type: String,
    description: 'cluster_slots_assigned from CLUSTER INFO command',
    example: 16384,
  })
  slotsAssigned: number;

  @ApiProperty({
    type: String,
    description: 'cluster_slots_ok from CLUSTER INFO command',
    example: 16384,
  })
  slotsOk: number;

  @ApiProperty({
    type: String,
    description: 'cluster_slots_pfail from CLUSTER INFO command',
    example: 0,
  })
  slotsPFail: number;

  @ApiProperty({
    type: String,
    description: 'cluster_slots_fail from CLUSTER INFO command',
    example: 0,
  })
  slotsFail: number;

  @ApiProperty({
    type: String,
    description:
      'Calculated from (16384 - cluster_slots_assigned from CLUSTER INFO command)',
    example: 0,
  })
  slotsUnassigned: number;

  @ApiProperty({
    type: String,
    description: 'cluster_stats_messages_sent from CLUSTER INFO command',
    example: 2451,
  })
  statsMessagesSent: number;

  @ApiProperty({
    type: String,
    description: 'cluster_stats_messages_received from CLUSTER INFO command',
    example: 2451,
  })
  statsMessagesReceived: number;

  @ApiProperty({
    type: String,
    description: 'cluster_current_epoch from CLUSTER INFO command',
    example: 6,
  })
  currentEpoch: number;

  @ApiProperty({
    type: String,
    description: 'cluster_my_epoch from CLUSTER INFO command',
    example: 2,
  })
  myEpoch: number;

  @ApiProperty({
    type: String,
    description: 'Number of shards. cluster_size from CLUSTER INFO command',
    example: 3,
  })
  size: number;

  @ApiProperty({
    type: String,
    description:
      'All nodes number in the Cluster. cluster_known_nodes from CLUSTER INFO command',
    example: 9,
  })
  knownNodes: number;

  @ApiProperty({
    type: () => ClusterNodeDetails,
    isArray: true,
    description: 'Details per each node',
  })
  nodes: ClusterNodeDetails[];
}
