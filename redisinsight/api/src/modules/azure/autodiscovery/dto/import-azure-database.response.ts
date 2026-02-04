import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty({
    description: 'Message',
    type: String,
  })
  message: string;
}
