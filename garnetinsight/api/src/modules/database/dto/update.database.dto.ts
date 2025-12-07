import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  Max,
  Min,
  ValidateNested,
  ValidateIf,
  IsString,
  MaxLength,
} from 'class-validator';
import { UpdateSshOptionsDto } from 'src/modules/ssh/dto/update.ssh-options.dto';
import { UpdateSentinelMasterDto } from 'src/modules/redis-sentinel/dto/update.sentinel.master.dto';
import { CreateDatabaseDto } from 'src/modules/database/dto/create.database.dto';

export class UpdateDatabaseDto extends PartialType(
  OmitType(CreateDatabaseDto, [
    'sshOptions',
    'timeout',
    'sentinelMaster',
  ] as const),
) {
  @ValidateIf((object, value) => value !== undefined)
  @IsString({ always: true })
  @MaxLength(500)
  name: string;

  @ValidateIf((object, value) => value !== undefined)
  @IsString({ always: true })
  host: string;

  @ValidateIf((object, value) => value !== undefined)
  @IsInt({ always: true })
  port: number;

  @ApiPropertyOptional({
    description: 'Updated ssh options fields',
  })
  @Expose()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(() => UpdateSshOptionsDto)
  @ValidateNested()
  sshOptions?: UpdateSshOptionsDto;

  @ApiPropertyOptional({
    description: 'Connection timeout',
    type: Number,
  })
  @Expose()
  @IsNotEmpty()
  @IsOptional()
  @Min(1_000)
  @Max(1_000_000_000)
  @IsInt({ always: true })
  timeout?: number;

  @ApiPropertyOptional({
    description: 'Updated sentinel master fields',
  })
  @Expose()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(() => UpdateSentinelMasterDto)
  @ValidateNested()
  sentinelMaster?: UpdateSentinelMasterDto;
}
