import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CliOutputFormatterTypes } from 'src/modules/cli/services/cli-business/output-formatter/output-formatter.interface';

export enum CommandExecutionStatus {
  Success = 'success',
  Fail = 'fail',
}

export interface ICliExecResultFromNode {
  host: string;
  port: number;
  response: any;
  status: CommandExecutionStatus;
  slot?: number;
  error?: any;
}

export class SendCommandDto {
  @ApiProperty({
    type: String,
    description: 'Redis CLI command',
  })
  @IsString()
  @IsNotEmpty()
  command: string;

  @ApiPropertyOptional({
    description: 'Define output format',
    default: CliOutputFormatterTypes.Raw,
    enum: CliOutputFormatterTypes,
  })
  @IsOptional()
  @IsEnum(CliOutputFormatterTypes, {
    message: `outputFormat must be a valid enum value. Valid values: ${Object.values(
      CliOutputFormatterTypes,
    )}.`,
  })
  outputFormat?: CliOutputFormatterTypes;
}

export class SendCommandResponse {
  @ApiProperty({
    type: String,
    description: 'Redis CLI response',
  })
  response: any;

  @ApiProperty({
    description: 'Redis CLI command execution status',
    default: CommandExecutionStatus.Success,
    enum: CommandExecutionStatus,
  })
  status: CommandExecutionStatus;
}

export class CreateCliClientResponse {
  @ApiProperty({
    type: String,
    description: 'Client uuid',
  })
  uuid: string;
}

export class DeleteClientResponse {
  @ApiProperty({
    description: 'Number of affected clients',
    type: Number,
  })
  affected: number;
}
