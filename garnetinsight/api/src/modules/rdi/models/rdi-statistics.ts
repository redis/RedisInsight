import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export enum RdiConnectionStatus {
  Good = 'good',
  Bad = 'bad',
}

class RdiConnection {
  @ApiProperty({
    description: 'Connection status',
    enum: RdiConnectionStatus,
  })
  @Expose()
  status: RdiConnectionStatus;

  @ApiProperty({
    description: 'Connection type',
    type: String,
  })
  @Expose()
  type: string;

  @ApiProperty({
    description: 'Connection host',
    type: String,
  })
  @Expose()
  host: string;

  @ApiProperty({
    description: 'Connection port',
    type: Number,
  })
  @Expose()
  port: number;

  @ApiProperty({
    description: 'Connection database',
    type: String,
  })
  @Expose()
  database: string;

  @ApiProperty({
    description: 'Connection user',
    type: String,
  })
  @Expose()
  user: string;
}

class RdiDataStream {
  @ApiProperty({
    description: 'Total',
    type: Number,
  })
  @Expose()
  total: number;

  @ApiProperty({
    description: 'Pending',
    type: Number,
  })
  @Expose()
  pending: number;

  @ApiProperty({
    description: 'Inserted',
    type: Number,
  })
  @Expose()
  inserted: number;

  @ApiProperty({
    description: 'Updated',
    type: Number,
  })
  @Expose()
  updated: number;

  @ApiProperty({
    description: 'Deleted',
    type: Number,
  })
  @Expose()
  deleted: number;

  @ApiProperty({
    description: 'Filtered',
    type: Number,
  })
  @Expose()
  filtered: number;

  @ApiProperty({
    description: 'Rejected',
    type: Number,
  })
  @Expose()
  rejected: number;

  @ApiProperty({
    description: 'Deduplicated',
    type: Number,
  })
  @Expose()
  deduplicated: number;

  @ApiProperty({
    description: 'Last arrival',
    type: String,
  })
  @Expose()
  lastArrival: string;
}

class ProcessingPerformance {
  @ApiProperty({
    description: 'Total batches',
    type: Number,
  })
  @Expose()
  totalBatches: number;

  @ApiProperty({
    description: 'Batch size average',
    type: Number,
  })
  @Expose()
  batchSizeAvg: number;

  @ApiProperty({
    description: 'Read time average',
    type: Number,
  })
  @Expose()
  readTimeAvg: number;

  @ApiProperty({
    description: 'Process time average',
    type: Number,
  })
  @Expose()
  processTimeAvg: number;

  @ApiProperty({
    description: 'Ack time average',
    type: Number,
  })
  @Expose()
  ackTimeAvg: number;

  @ApiProperty({
    description: 'Total time average',
    type: Number,
  })
  @Expose()
  totalTimeAvg: number;

  @ApiProperty({
    description: 'Records per second average',
    type: Number,
  })
  @Expose()
  recPerSecAvg: number;
}

class RdiPipelineStatus {
  @ApiProperty({
    description: 'Rdi version',
    type: String,
  })
  @Expose()
  rdiVersion: string;

  @ApiProperty({
    description: 'Address',
    type: String,
  })
  @Expose()
  address: string;

  @ApiProperty({
    description: 'Run status',
    type: String,
  })
  @Expose()
  runStatus: string;

  @ApiProperty({
    description: 'Sync mode',
    type: String,
  })
  @Expose()
  syncMode: string;
}

class Clients {
  @ApiProperty({
    description: 'Address',
    type: String,
  })
  @Expose()
  addr: string;

  @ApiProperty({
    description: 'Name',
    type: String,
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Age seconds',
    type: Number,
  })
  @Expose()
  ageSec: number;

  @ApiProperty({
    description: 'Idle seconds',
    type: Number,
  })
  @Expose()
  idleSec: number;

  @ApiProperty({
    description: 'User',
    type: String,
  })
  @Expose()
  user: string;
}

export class RdiStatisticsData {
  @ApiProperty({
    description: 'Connections dictionary',
  })
  @Expose()
  connections: Record<string, RdiConnection>;

  @ApiProperty({
    description: 'Data streams dictionary',
  })
  @Expose()
  dataStreams: Record<string, RdiDataStream>;

  @ApiProperty({
    description: 'Processing performance',
  })
  @Expose()
  processingPerformance: ProcessingPerformance;

  @ApiProperty({
    description: 'Rdi pipeline status',
  })
  @Expose()
  rdiPipelineStatus: RdiPipelineStatus;

  @ApiProperty({
    description: 'Clients dictionary',
  })
  @Expose()
  clients: Record<string, Clients>;
}

export enum RdiStatisticsStatus {
  Success = 'success',
  Fail = 'failed',
}

export class RdiStatisticsResult {
  status: RdiStatisticsStatus;

  data?: RdiStatisticsData;

  error?: string;
}
