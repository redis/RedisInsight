import { ApiProperty } from '@nestjs/swagger';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { Expose } from 'class-transformer';

export class CommandExecutionResult {
  @ApiProperty({
    description: 'Redis CLI command execution status',
    default: CommandExecutionStatus.Success,
    enum: CommandExecutionStatus,
  })
  @Expose()
  status: CommandExecutionStatus;

  @ApiProperty({
    type: String,
    description: 'Redis response',
  })
  @Expose()
  response: any;

  @ApiProperty({
    type: Boolean,
    description:
      'Flag showing if response was replaced with message notification about response size limit threshold',
  })
  @Expose()
  sizeLimitExceeded?: boolean;
}
