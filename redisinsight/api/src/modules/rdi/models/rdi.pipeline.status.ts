import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export enum PipelineStatus {
  // V1 statuses
  Ready = 'ready',
  NotReady = 'not-ready',
  // V1/V2 intersection
  Stopped = 'stopped',
  // V2 statutes
  Started = 'started',
  Error = 'error',
  Creating = 'creating',
  Updating = 'updating',
  Deleting = 'deleting',
  Starting = 'starting',
  Stopping = 'stopping',
  Resetting = 'resetting',
  Pending = 'pending',
  Unknown = 'unknown',
}

export enum PipelineState {
  CDC = 'cdc',
  InitialSync = 'initial-sync',
  NotRunning = 'not-running',
}

export class ComponentStatus {
  @ApiProperty({ description: 'Component name', example: 'processor' })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Component type',
    example: 'stream-processor',
  })
  @Expose()
  type: string;

  @ApiProperty({ description: 'Component status', example: 'started' })
  @Expose()
  status: string;

  @ApiPropertyOptional({
    description: 'Component version',
    example: '0.0.202512301417',
  })
  @Expose()
  version: string;

  @ApiPropertyOptional({ description: 'Component errors', type: [String] })
  @Expose()
  errors: string[];
}

export class RdiPipelineStatus {
  @ApiProperty({
    description: 'Pipeline status',
    example: 'ready',
    enum: PipelineStatus,
  })
  @Expose()
  status: PipelineStatus;

  @ApiPropertyOptional({
    description: 'Pipeline state (used in api/v1 only)',
    example: 'cdc',
    enum: PipelineState,
  })
  @Expose()
  state?: PipelineState;

  @ApiPropertyOptional({
    description: 'Pipeline errors',
    type: [String],
  })
  @Expose()
  errors?: string[];

  @ApiPropertyOptional({
    description: 'Components statuses array',
    type: ComponentStatus,
    isArray: true,
  })
  @Expose()
  @Type(() => ComponentStatus)
  components?: ComponentStatus[];
}
