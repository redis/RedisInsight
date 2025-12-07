import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActionStatus } from 'src/common/models';
import { Expose } from 'class-transformer';

export class CreateSentinelDatabaseResponse {
  @ApiPropertyOptional({
    description: 'Database instance id.',
    type: String,
  })
  @Expose()
  id?: string;

  @ApiProperty({
    description: 'Sentinel master group name.',
    type: String,
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Add Sentinel Master status',
    default: ActionStatus.Success,
    enum: ActionStatus,
  })
  @Expose()
  status: ActionStatus;

  @ApiProperty({
    description: 'Message',
    type: String,
  })
  @Expose()
  message: string;

  @ApiPropertyOptional({
    description: 'Error',
  })
  @Expose()
  error?: string | object;
}
