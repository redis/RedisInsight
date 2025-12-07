import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CommandExecutionResult } from 'src/modules/workbench/models/command-execution-result';
import { Expose, Type } from 'class-transformer';
import { Default as DefaultDecorator } from 'src/common/decorators';

export enum RunQueryMode {
  Raw = 'RAW',
  ASCII = 'ASCII',
}

export enum ResultsMode {
  Default = 'DEFAULT',
  GroupMode = 'GROUP_MODE',
  Silent = 'SILENT',
}

export enum CommandExecutionType {
  Workbench = 'WORKBENCH',
  Search = 'SEARCH',
}

export class ResultsSummary {
  @ApiProperty({
    description: 'Total number of commands executed',
    type: Number,
  })
  @IsDefined()
  total: number;

  @ApiProperty({
    description: 'Total number of successful commands executed',
    type: Number,
  })
  @IsDefined()
  success: number;

  @ApiProperty({
    description: 'Total number of failed commands executed',
    type: Number,
  })
  @IsDefined()
  fail: number;
}

export class CommandExecution {
  @ApiProperty({
    description: 'Command execution id',
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Database id',
    type: String,
  })
  @Expose()
  databaseId: string;

  @ApiProperty({
    description: 'Redis command',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  command: string;

  @ApiPropertyOptional({
    description: 'Workbench mode',
    default: RunQueryMode.ASCII,
    enum: RunQueryMode,
  })
  @Expose()
  @IsOptional()
  @IsEnum(RunQueryMode, {
    message: `mode must be a valid enum value. Valid values: ${Object.values(
      RunQueryMode,
    )}.`,
  })
  @DefaultDecorator(RunQueryMode.ASCII)
  mode?: RunQueryMode;

  @ApiPropertyOptional({
    description: 'Workbench result mode',
    default: ResultsMode.Default,
    enum: ResultsMode,
  })
  @Expose()
  @IsOptional()
  @IsEnum(ResultsMode, {
    message: `resultsMode must be a valid enum value. Valid values: ${Object.values(
      ResultsMode,
    )}.`,
  })
  @DefaultDecorator(ResultsMode.Default)
  resultsMode?: ResultsMode;

  @ApiPropertyOptional({
    description: 'Workbench executions summary',
    type: () => ResultsSummary,
  })
  @Expose()
  summary?: ResultsSummary;

  @ApiProperty({
    description: 'Command execution result',
    type: () => CommandExecutionResult,
    isArray: true,
  })
  @Type(() => CommandExecutionResult)
  @Expose()
  result: CommandExecutionResult[];

  @ApiPropertyOptional({
    description: 'Result did not stored in db',
    type: Boolean,
  })
  @Expose()
  isNotStored?: boolean;

  @ApiProperty({
    description: 'Date of command execution',
    type: Date,
  })
  @Expose()
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Workbench command execution time',
    type: Number,
  })
  @Expose()
  executionTime?: number;

  @ApiPropertyOptional({
    description: 'Logical database number.',
    type: Number,
  })
  @Expose()
  @IsInt()
  @Min(0)
  @IsOptional()
  db?: number;

  @ApiPropertyOptional({
    description:
      'Command execution type. Used to distinguish between search and workbench',
    default: CommandExecutionType.Workbench,
    enum: CommandExecutionType,
  })
  @Expose()
  @IsOptional()
  @IsEnum(CommandExecutionType, {
    message: `type must be a valid enum value. Valid values: ${Object.values(
      CommandExecutionType,
    )}.`,
  })
  @DefaultDecorator(CommandExecutionType.Workbench)
  type?: CommandExecutionType;
}
