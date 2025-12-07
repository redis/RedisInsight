import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSentinelDatabaseDto {
  @ApiProperty({
    description:
      'The name under which the base will be saved in the application.',
    type: String,
  })
  @IsDefined()
  @IsString({ always: true })
  @IsNotEmpty()
  @MaxLength(500)
  alias: string;

  @ApiProperty({
    description: 'Sentinel master group name.',
    type: String,
  })
  @IsDefined()
  @IsString({ always: true })
  name: string;

  @ApiPropertyOptional({
    description:
      'The username, if your database is ACL enabled, otherwise leave this field empty.',
    type: String,
  })
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description:
      'The password, if any, for your Redis database. ' +
      'If your database doesn’t require a password, leave this field empty.',
    type: String,
  })
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    description: 'Logical database number.',
    type: Number,
    example: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  db?: number;
}
