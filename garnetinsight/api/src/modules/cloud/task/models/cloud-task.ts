import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CloudTaskStatus {
  Initialized = 'initialized',
  Received = 'received',
  ProcessingInProgress = 'processing-in-progress',
  ProcessingCompleted = 'processing-completed',
  ProcessingError = 'processing-error',
}

export class CloudTask {
  @ApiProperty({
    type: String,
  })
  taskId: string;

  @ApiProperty({
    type: String,
  })
  commandType: string;

  @ApiProperty({
    description: 'Current status of the task',
    enum: CloudTaskStatus,
  })
  status: CloudTaskStatus;

  @ApiProperty({
    type: Date,
  })
  timestamp: Date;

  @ApiPropertyOptional({
    description: 'Short info on what happened',
    type: String,
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional info',
  })
  response?: any;
}
