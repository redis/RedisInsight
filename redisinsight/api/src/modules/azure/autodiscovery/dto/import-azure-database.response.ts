import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActionStatus } from 'src/common/models';

export class ImportAzureDatabaseResponse {
  @ApiProperty({
    description: 'Azure resource ID',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Import Azure database status',
    default: ActionStatus.Success,
    enum: ActionStatus,
  })
  status: ActionStatus;

  @ApiPropertyOptional({
    description: 'Error message (only present when status is Fail)',
    type: String,
  })
  message?: string;
}
